---
title: Availability
description: The math of nines, SLOs and error budgets, serial vs parallel dependencies, failover, blast radius, and designing degraded modes instead of binary outages.
order: 5
---

Availability is the fraction of time a system is able to serve its users **correctly**.

```
availability = uptime / (uptime + downtime)
```

Two qualifiers matter:

- **correctly** — a 200 response with stale or wrong data is not availability for a payment.
- **for whom** — 99.99% globally can still mean a total outage for one region or tenant.

## The nines

| Availability | Downtime per year | Per month | Per day |
|---|---|---|---|
| 99% | 3.65 days | 7.3 h | 14.4 min |
| 99.9% | 8.77 h | 43.8 min | 1.44 min |
| 99.95% | 4.38 h | 21.9 min | 43 s |
| 99.99% | 52.6 min | 4.38 min | 8.6 s |
| 99.999% | 5.26 min | 26.3 s | 0.86 s |

Each additional nine multiplies cost and coordination. Do not claim 99.99% without a design that can survive a zone failure, a deploy, and a dependency outage.

## SLI, SLO, SLA, error budget

| Term | Meaning | Example |
|---|---|---|
| **SLI** | measured indicator | % of requests with status < 500 and p99 < 300 ms |
| **SLO** | internal target | 99.9% over 28 days |
| **SLA** | contractual promise with consequences | 99.9%, credits below |
| **Error budget** | 1 − SLO | 0.1% of 28 days ≈ 40 min |

The error budget turns reliability into a decision tool: if the budget is burned, freeze risky changes and fix reliability; if not, ship.

Measure SLIs at the **user boundary** (load balancer or client), not just inside a service. A service that returns 200 while its database is down is "up" by a naive probe and useless to users.

## Serial vs parallel availability

Dependencies in series multiply:

```
A_serial = A1 × A2 × ... × An
```

Five dependencies at 99.9% each → `0.999^5 ≈ 99.5%` (≈ 3.6 h/month). Every synchronous hop lowers end-to-end availability.

In parallel (redundant replicas), unavailability multiplies:

```
A_parallel = 1 - (1 - A1)(1 - A2)
```

Two independent 99% replicas → `1 - 0.01 × 0.01 = 99.99%`.

Caveats:

- replicas are only independent if they do not share a dependency (same AZ, same database, same DNS);
- failover time counts as downtime;
- correlated failures (a bad deploy, a config push) break the math.

## Redundancy that actually helps

| Layer | Redundancy | Watch out |
|---|---|---|
| Compute | multiple instances across AZs | shared DB, shared cache |
| Load balancer | multi-AZ, health checks | health check flapping |
| Database | sync replica + automated failover | failover duration, split brain |
| Object storage | provider replication | eventual consistency |
| DNS | multiple providers / anycast | TTL caching |
| Region | active-active or active-passive | data replication, conflict resolution |

A second region is not availability if failover is manual and untested. **RTO** (time to recover) and **RPO** (acceptable data loss) quantify it.

## Single points of failure

Walk the critical path and ask "what if this dies?":

- one NAT gateway,
- one load balancer,
- one primary database,
- one DNS provider,
- one shared Redis,
- one config service,
- one deploy pipeline (yes, it counts),
- one engineer who knows the runbook.

SPOFs in the control plane (DNS, IAM, CI) are often missed and cause the longest outages.

## Fail fast, degrade gracefully

An unavailable dependency should not take down the service. Patterns:

- **Timeouts** on every network call; short, with jitter.
- **Circuit breakers** to stop hammering a failing dependency.
- **Bulkheads**: separate pools/queues per dependency so one saturation does not starve others.
- **Load shedding**: reject excess requests early with 429/503 instead of queueing.
- **Graceful degradation**: serve cached/stale data, hide non-critical features, disable write paths with a clear message.
- **Retries with budgets** (never unbounded), and only for idempotent operations.

```ts
const breaker = new CircuitBreaker({
  timeoutMs: 300,
  errorThreshold: 0.5,
  resetAfterMs: 10_000,
});

async function recommendations(userId: string): Promise<Item[]> {
  try {
    return await breaker.execute(() => recommender.forUser(userId));
  } catch {
    return []; // non-critical feature degrades to empty, page still renders
  }
}
```

State the **degraded mode** for every critical dependency in the design review.

## Health checks and failover

- **Liveness**: is the process alive? (do not depend on downstreams)
- **Readiness**: should it receive traffic? (dependencies + warmup)
- **Deep health**: full dependency check, for dashboards, not for routing.

Common failure: readiness depends on a flaky dependency, so every instance is removed from rotation and the service "fails healthy".

Failover needs:

- detection (heartbeat/timeout),
- election/leader change (consensus or orchestrator),
- client reconnection/rerouting,
- **fencing** (old leader must stop writing),
- a tested runbook.

## Worked example

Goal: 99.95% (≈ 22 min/month).

Critical path: CDN → LB → API (3 AZs) → Postgres primary + sync replica → Redis cache.

Serial estimate (rough):

- CDN 99.99%
- LB 99.99%
- API fleet 99.95% (3 AZ)
- DB 99.95% (managed failover, 60 s)
- Redis optional (degrade to DB with rate limiting)

`0.9999 × 0.9999 × 0.9995 × 0.9995 ≈ 99.88%` — below target. To reach 99.95%:

- make Redis failures non-fatal (remove from critical path),
- reduce DB failover time,
- add a read-only/degraded mode during DB failover,
- avoid synchronous calls to non-critical services.

Availability is a **path property**, not a component property.

## Interview drill

**1. "How do you get 99.99% with one primary database?"**
- **Cover:** serial availability math; automated failover; degraded reads; async writes; multi-AZ; RTO/RPO.
- **Follow-up:** "What does the error budget allow per month?" (≈4.4 min).
- **Common miss:** counting only the application tier and ignoring DB failover time.

**2. "A dependency is slow but not down. What happens?"**
- **Cover:** timeouts/deadlines; circuit breaker; bulkhead; graceful degradation; load shedding.
- **Follow-up:** "How do you test it?" (latency injection in staging/game day).
- **Common miss:** retries, which turn slowness into an outage.

**3. "Your deploy takes 10 minutes. How does that affect availability?"**
- **Cover:** rolling/canary deploys; draining; rollback; error-budget impact; capacity during rollout.
- **Follow-up:** "What about a database migration?" (expand/contract, no long locks).
- **Common miss:** ignoring deploys and config changes as failure sources.

## Checklist

- [ ] SLIs are measured at the user boundary.
- [ ] SLO, error budget, and alerting are defined.
- [ ] Each synchronous dependency is counted in the availability math.
- [ ] SPOFs (including DNS, CI, and shared caches) are identified.
- [ ] Failover is automated **and tested**; RTO/RPO are known.
- [ ] Timeouts, breakers, bulkheads, and load shedding exist.
- [ ] Every critical dependency has a documented degraded mode.
- [ ] Deploys cannot take down all capacity at once.

Next: [Fault Tolerance](/sys-design/006-fault-tolerance) — designing for components that fail while the system keeps serving.
