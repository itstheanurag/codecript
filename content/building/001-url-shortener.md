---
title: URL Shortener (Scale & Build)
description: Designing and building a URL shortener — ID generation without collisions, redirect latency, caching, abuse prevention, analytics, and the capacity math.
order: 1
---

A URL shortener looks simple: store a long URL, return a short code, redirect. At scale, the hard parts are **ID generation**, **redirect latency**, and **abuse**.

## Scope

**In scope**

- `POST /links` with a long URL → short code.
- `GET /{code}` → `301/302` redirect.
- Custom aliases (optional).
- Expiry.
- Click analytics (aggregate, not per-click real-time).

**Out of scope for v1**

- Full analytics dashboards.
- Per-user teams/permissions.
- Malware scanning at scale (use a provider).
- Internationalised domains.

## Estimates

Assume 100M new links/day and 10B redirects/day (100:1 read/write? adjust):

```
writes: 100M/day ≈ 1,160 RPS avg, ~3,500 peak
reads:  10B/day  ≈ 115,000 RPS avg, ~350,000 peak
storage: 100M × (500 B URL + 100 B metadata) ≈ 60 GB/day + indexes
code space: 62^7 ≈ 3.5 trillion → 7 base62 chars is enough for decades
```

Reads dominate by ~100×. Cache aggressively; the database is the backing store, not the hot path.

## ID generation

| Approach | Pros | Cons |
|---|---|---|
| Random 7-char base62 | simple, unguessable | collision check on insert |
| Counter + base62 | compact, ordered | predictable, single point of coordination |
| Snowflake-style (time+node+seq) | distributed, roughly ordered | longer codes, clock sensitivity |
| Hash of URL | deterministic (no duplicate links) | collisions, leaks URL patterns |

Recommended: **random 7-char base62 with a unique constraint**, retry on conflict (collision probability is negligible at this length). Use a CSPRNG, not `Math.random`, if enumeration is a concern.

```ts
const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function code(length = 7): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}
```

For custom aliases, validate format, reserve profanity/trademark lists, and enforce uniqueness.

## Data model

```sql
CREATE TABLE links (
  code        text PRIMARY KEY,
  long_url    text NOT NULL,
  owner_id    uuid,
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz,
  disabled    boolean NOT NULL DEFAULT false,
  custom      boolean NOT NULL DEFAULT false
);

CREATE INDEX links_owner_created_idx ON links (owner_id, created_at DESC);
```

Why `code` as the primary key: the redirect query is a single point lookup by code. `owner_id` index supports listing a user's links.

For analytics, never write per click to the primary:

```
redirect → fire-and-forget event (queue) → batch insert/aggregate
```

Use a columnar store or daily rollups; the redirect path must not wait on analytics.

## Redirect path

1. Edge/CDN or app receives `GET /{code}`.
2. Check an in-process cache (LRU) → Redis → database.
3. Validate: not expired, not disabled, not blocked.
4. Respond `301` (permanent, cacheable) or `302` (temporary, analytics-friendly).
5. Emit a click event asynchronously.

**301 vs 302**: `301` is cached by browsers; subsequent clicks may not reach you (bad for analytics, good for load). Most shorteners use `302` (or `307`) to keep control and count clicks. State the trade-off in the product.

Latency budget for the redirect:

| Hop | Target |
|---|---|
| Edge | 5 ms |
| Cache lookup | 1–2 ms |
| DB on miss | 5–10 ms |
| Response | < 50 ms p99 |

## Caching

- **Negative caching** for unknown codes (short TTL) to stop scanning.
- **Hot links** in an LRU with TTL; invalidate on disable/expiry.
- **Redis** as a shared L2; the database is L3.
- Never cache a redirect without validating expiry/disabled state.

A popular link can receive millions of redirects; it must be served from memory/edge, not the database.

## Abuse and safety

- Rate limit creation per IP/account.
- Block private/internal URL targets (SSRF: `169.254.169.254`, `localhost`, RFC1918).
- Scan long URLs against a safe-browsing provider; quarantine suspicious links.
- CAPTCHA for anonymous creation at scale.
- Expire anonymous links; require accounts for custom aliases.
- Protect against enumeration if links are private (signed short codes).

## Availability and failure modes

| Failure | Behaviour | Mitigation |
|---|---|---|
| Redis down | redirects hit DB | bound DB QPS, local LRU, load shed |
| DB primary down | new links fail; redirects cached | read replicas for redirects |
| Analytics queue down | clicks lost | buffer locally, best-effort |
| Hot link | one key saturates a shard | local cache/edge, per-key limits |
| Malicious scanning | DB load | negative cache, rate limits, WAF |

Redirects are more important than creation: degrade creation first.

## Build order

1. Schema + create/read API + collision-safe codes.
2. Redirect with 302 and a small in-memory cache.
3. Redis cache + negative caching.
4. Expiry/disable + validation.
5. Analytics event pipeline (async).
6. Rate limits + SSRF/abuse checks.
7. Custom aliases.
8. Load test at 100k RPS reads.

## Review questions

- What happens on a code collision?
- How do you prevent open redirects/SSRF?
- Is the redirect path allowed to touch the database on every request?
- What is the cache hit ratio and what happens at 0%?
- Can a disabled/expired link still resolve from cache?
- How do you stop enumeration/scraping?

## Checklist

- [ ] Codes are random, unique (constraint), and URL-safe.
- [ ] Redirects are cached with correct invalidation.
- [ ] 301 vs 302 is a deliberate product decision.
- [ ] Analytics is asynchronous and bounded.
- [ ] Creation is rate-limited and targets are validated.
- [ ] Expired/disabled links cannot be served from cache.
- [ ] The redirect path has a latency budget and a fallback.
