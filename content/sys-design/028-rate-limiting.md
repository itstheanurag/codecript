---
title: Rate Limiting
description: Fixed windows, sliding logs, token buckets, and distributed limiters that actually hold under load — placement, headers, fairness, and fail-open vs fail-closed.
order: 28
---

Rate limiting caps how much work a client may do in a time window. It protects:

- **availability** — one client cannot exhaust shared capacity,
- **fairness** — noisy neighbours do not starve everyone else,
- **cost** — third-party APIs, egress, compute,
- **security** — credential stuffing, scraping, abuse.

It is not the same as **load shedding** (drop excess when the system is saturated) or **concurrency limiting** (cap in-flight work). They complement each other.

## Algorithms

| Algorithm | Bursts | Memory | Accuracy | Notes |
|---|---|---|---|---|
| Fixed window | up to 2× limit at boundary | tiny | coarse | simplest, boundary burst |
| Sliding log | exact | O(requests) | exact | expensive at scale |
| Sliding window counter | small burst | small | approximate | good default |
| **Token bucket** | configured burst | tiny | exact | rate + burst separately |
| Leaky bucket | smooth output | tiny | exact | queues/shapes traffic |

### Fixed window

Count per `[minute)` bucket. A client can send `limit` at 00:59 and `limit` again at 01:00 — **2× the intended rate** at the boundary. Fine for coarse protection, not for strict quotas.

### Sliding window counter

Weight the previous window:

```
estimated = prev_count × (1 - elapsed_fraction) + current_count
```

Cheap, avoids most boundary bursts, approximate. Many gateways use this.

### Token bucket

The most expressive model:

- bucket capacity = **burst**,
- refill rate = **sustained RPS**,
- each request removes one token (or N for weighted cost).

```ts
class TokenBucket {
  private tokens: number;
  private lastRefill = Date.now();

  constructor(
    private readonly capacity: number,
    private readonly refillPerSecond: number,
  ) {
    this.tokens = capacity;
  }

  tryConsume(cost = 1): boolean {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(
      this.capacity,
      this.tokens + elapsed * this.refillPerSecond,
    );
    this.lastRefill = now;

    if (this.tokens >= cost) {
      this.tokens -= cost;
      return true;
    }
    return false;
  }

  retryAfterSeconds(cost = 1): number {
    return Math.max(0, (cost - this.tokens) / this.refillPerSecond);
  }
}
```

Token bucket allows short bursts up to `capacity` while enforcing the long-run rate. This matches how real clients behave (idle, then a page load with parallel requests).

## Distributed limiting

A per-instance limiter with 10 instances allows `10 × limit`. For global limits you need shared state or a coordination scheme.

### Redis with an atomic script

```lua
-- KEYS[1] = bucket key
-- ARGV: capacity, refill_per_ms, now_ms, cost
local capacity = tonumber(ARGV[1])
local refill = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local cost = tonumber(ARGV[4])

local bucket = redis.call('HMGET', KEYS[1], 'tokens', 'ts')
local tokens = tonumber(bucket[1]) or capacity
local ts = tonumber(bucket[2]) or now

tokens = math.min(capacity, tokens + (now - ts) * refill)
local allowed = tokens >= cost
if allowed then tokens = tokens - cost end

redis.call('HMSET', KEYS[1], 'tokens', tokens, 'ts', now)
redis.call('PEXPIRE', KEYS[1], math.ceil(capacity / refill))
return allowed and 1 or 0
```

Why Lua: read-modify-write must be atomic, otherwise concurrent requests overshoot.

### Local + global (two-tier)

For very high QPS, a pure Redis limiter becomes a bottleneck and a SPOF. Common pattern:

1. **Local token bucket** per instance for fast rejection.
2. **Global limiter** (Redis/gateway) for the authoritative quota.
3. Periodically sync/allocate a share of the global budget to each instance.

The local tier absorbs bursts; the global tier enforces fairness across instances.

## Placement

| Layer | What it protects | Limits by |
|---|---|---|
| Edge/CDN | DDoS, scraping | IP, ASN, geo |
| API gateway | shared API capacity | API key, user, tenant |
| Service | downstream dependencies | operation, tenant |
| Database | connections/queries | pool, query budget |

Limit as close to the client as possible (cheap rejection), and again at the resource you are protecting. Do not rely on a single layer.

## Responses and headers

- **HTTP 429 Too Many Requests** with `Retry-After`.
- Standard headers: `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` (or provider-specific).
- Tell the client whether the limit is per-second or per-minute and which key it applies to.
- For APIs, document limits and provide a way to request increases (otherwise clients hard-code workarounds).

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 12
RateLimit-Limit: 100
RateLimit-Remaining: 0
RateLimit-Reset: 12
```

## Fairness

"1000 RPS total" is not fair if one tenant sends 990. Prefer:

- **per-tenant quotas** with borrowing from a shared pool,
- **weighted fair queueing** for expensive endpoints,
- **concurrency limits** per tenant for long-running work,
- **separate pools** for interactive vs batch traffic.

Weighted cost matters: a search request may cost 50× a health check. Limit *work*, not just request count.

## Failure modes

| Failure | Result | Mitigation |
|---|---|---|
| Limiter down → fail closed | total outage | fail open with local fallback for non-security limits |
| Limiter down → fail open | abuse passes | local emergency limit + alert |
| Clock skew across nodes | wrong windows | use Redis server time |
| Hot key | one tenant's bucket overloads a shard | shard by key hash, per-tenant isolation |
| Over-limiting | legitimate users blocked | per-key dashboards, gradual rollout |
| 429 without headers | clients retry immediately | `Retry-After`, backoff guidance |
| Rate limit vs retry storm | amplification | jitter, client budgets, idempotency |

> [!WARNING]
> A rate limiter that fails closed on a shared Redis outage can take down the entire product. Decide per limit: security limits may fail closed; availability limits should fail open with a conservative local cap.

## Choosing values

1. Measure normal per-key traffic (p50/p99).
2. Set the sustained limit comfortably above normal peaks.
3. Set burst capacity to the largest legitimate burst (page load × parallel requests).
4. Add a **global** limit sized to downstream capacity, not to customer demand.

## Interview drill

**1. "Design rate limiting for a public API."**
- **Cover:** key scope (IP/user/tenant); token bucket (rate + burst); Redis Lua atomicity; edge + service placement; 429 headers; fail-open/closed policy.
- **Follow-up:** "How does it work at 1M RPS?" (local buckets + periodic global sync).
- **Common miss:** per-instance limits with no global coordination.

**2. "A tenant's batch job starves interactive users. Fix it."**
- **Cover:** separate queues/pools; weighted fairness; concurrency limits; per-operation cost weights.
- **Follow-up:** "How do you measure fairness?" (latency by tenant, queue age).
- **Common miss:** one global RPS limit for all traffic types.

**3. "Your limiter adds 20 ms to every request. Alternatives?"**
- **Cover:** local token buckets; async quota sync; approximate global limits; shard Redis; cache decisions.
- **Follow-up:** "What accuracy do you lose?" (bounded overshoot per instance).
- **Common miss:** a synchronous Redis round trip in the hot path.

## Checklist

- [ ] Limits are defined per key (IP, user, tenant, API key) and per operation.
- [ ] Algorithm matches burst semantics (token bucket for bursts, sliding for smooth quotas).
- [ ] Distributed updates are atomic (Lua/compare-and-set).
- [ ] Placement covers both abuse (edge) and resource protection (service/database).
- [ ] 429 responses include `Retry-After` and standard headers.
- [ ] Fail-open/fail-closed behaviour is explicit per limit.
- [ ] Fairness and weighted cost are considered for multi-tenant systems.
- [ ] Limits are monitored and tuned from real traffic, not guessed once.

Next: [The Interview Strategy](/sys-design/044-interview-strategy) — turning these building blocks into a coherent 45-minute design.
