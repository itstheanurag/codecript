---
title: Load Balancing
description: Layer 4 vs layer 7, balancing algorithms that handle real traffic, health checks and draining, consistent hashing, and the tail-latency traps that break naive routing.
order: 9
---

A load balancer distributes requests across instances. Done well, it improves availability and capacity. Done naively, it sends traffic to unhealthy or slow instances and turns a small failure into a latency incident.

## L4 vs L7

| | Layer 4 (TCP/UDP) | Layer 7 (HTTP) |
|---|---|---|
| Sees | IP + port | method, path, headers, cookies |
| Routing | connection-level | request-level |
| Cost | very fast, low CPU | more CPU, richer features |
| Features | basic health checks, NAT | path routing, TLS termination, retries, auth |
| Use for | databases, TCP services, extreme throughput | APIs, web apps, canaries, multi-service routing |

Many stacks use both: an L4 balancer at the edge for throughput, L7 gateways behind it for routing and policy.

## Algorithms

| Algorithm | How it works | Best for | Watch out |
|---|---|---|---|
| Round robin | rotate in order | homogeneous, short requests | ignores load and latency |
| Weighted RR | proportional to weight | heterogeneous instances | weights drift from reality |
| Least connections | route to fewest in-flight | long-lived or variable work | connection ≠ work |
| Least response time / EWMA | combine latency and in-flight | mixed latency | needs good metrics, reacts to noise |
| Random | pick uniformly | huge fleets, simple | variance; use power-of-two choices |
| Power of two choices | pick two at random, choose the less loaded | large fleets, low overhead | still needs health signals |
| Consistent hashing | hash key → ring | sticky caches, sharding | rebalancing, hot keys |
| Sticky sessions | cookie/IP affinity | legacy stateful apps | uneven load, failover pain |

**Power of two choices** is a strong default: two random instances, pick the one with fewer in-flight requests. It avoids both the herd behaviour of round robin and the overhead of global least-connections.

## Health checks that help

- **Liveness**: process is alive (do not include dependencies — otherwise a slow DB kills all instances).
- **Readiness**: instance can serve traffic (warm caches, migrations, dependency circuit closed).
- **Passive checks**: eject instances with elevated 5xx/latency based on real traffic.

Operational rules:

- **Draining**: stop sending new requests before shutdown, finish in-flight ones, then exit. Without this, every deploy produces 5xx.
- **Slow start**: ramp traffic to a new instance so caches and JIT warm up.
- **Outlier ejection**: temporarily remove an instance with abnormal error/timeout rates, then probe it back.
- **Hysteresis**: require N failures to eject and M successes to re-add, to avoid flapping.

```yaml
# Conceptual readiness
ready: last_health_ok < 5s
  and not draining
  and db_pool_available > 0
  and warmup_complete
```

Never route on a check that calls every downstream synchronously; one slow dependency would remove the entire fleet.

## Sticky sessions and state

Prefer stateless services. If you must use affinity:

- cookie-based (> IP-based, which breaks behind NAT/proxies),
- with a fallback when the node dies,
- with a bounded lifetime,
- and a plan to migrate to shared state.

Consistent hashing is better for cache affinity: the same key maps to the same node, and adding a node moves only `1/N` of keys (with virtual nodes). It does not solve hot keys.

## Global traffic management

- **DNS-based** global load balancing: cheap, TTL-bound, coarse.
- **Anycast**: same IP announced from many locations; routing follows BGP. Fast failover, but hard to control precisely.
- **Geo-routing**: send users to the nearest healthy region; requires data replication strategy.
- **Active-passive failover**: simple, but failover time and capacity must be tested.

Global load balancing is a **data problem** as much as a routing problem: the second region must have the data and the capacity.

## Connection handling

- **Keep-alive** between LB and instances reduces handshake cost; tune idle timeouts above upstream timeouts.
- **Connection pooling** at the app/DB layer is separate from LB connections; the multiplication matters (instances × pool size).
- **HTTP/2 or gRPC** multiplexing can reduce connection count but introduces head-of-line blocking on a single connection.
- **Timeouts** must be consistent: client > LB > service > dependency, each with headroom.

## Tail latency and routing

Round robin sends 1/N of requests to the slowest instance. If p99 is 10× p50, a fraction of users feel it constantly. Mitigations:

- outlier ejection,
- least-latency/EWMA routing,
- hedged requests for idempotent calls,
- **request budgets** so a slow hop cannot consume the whole deadline.

## Failure modes

| Failure | Cause | Symptom |
|---|---|---|
| Thundering herd | retries or connection storms after a blip | cascading 5xx |
| Hot instance | sticky sessions, cache affinity | one node at 100% |
| Health-check flapping | dependency in readiness | capacity oscillates |
| Draining missing | deploys kill in-flight requests | 502/504 during releases |
| LB as SPOF | single LB/AZ | total outage |
| Connection exhaustion | keep-alive + no pooling | timeouts under load |
| Retry amplification | LB and client both retry | 3–9× traffic |

## Interview drill

**1. "How do you route traffic across three AZs?"**
- **Cover:** multi-AZ load balancers; health checks; N+1 capacity; failover; draining.
- **Follow-up:** "What happens when one AZ loses capacity?" (headroom, rerouting, backpressure).
- **Common miss:** a single load balancer or AZ.

**2. "One instance is slow but healthy. What does your LB do?"**
- **Cover:** outlier ejection; EWMA/least-latency; hedged requests for idempotent calls; passive health signals.
- **Follow-up:** "How do you avoid ejecting healthy instances?" (hysteresis, slow start).
- **Common miss:** round robin, which keeps feeding the slow node.

**3. "How do you deploy without dropping requests?"**
- **Cover:** readiness vs liveness; draining; keep-alive coordination; canary; rollback.
- **Follow-up:** "What about long-lived WebSocket connections?" (connection draining + reconnect).
- **Common miss:** killing instances with in-flight requests.

## Checklist

- [ ] L4/L7 choice matches the routing and feature needs.
- [ ] Algorithm handles heterogeneous latency, not just connection counts.
- [ ] Liveness and readiness are separate and dependency-aware.
- [ ] Draining and slow start are configured.
- [ ] LB and AZ failure domains are redundant.
- [ ] Timeouts and keep-alives are consistent across hops.
- [ ] Sticky sessions (if any) have failover and expiry.
- [ ] Retry policy exists in one layer with a budget.

Next: [Rate Limiting](/sys-design/028-rate-limiting) — protecting the system from too much of a good thing.
