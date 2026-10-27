---
title: Fault Tolerance
description: Designing for failure instead of pretending it away — failure domains, redundancy, timeouts, retries, circuit breakers, bulkheads, and what actually happens during an AZ loss.
order: 6
---

**Fault tolerance is the ability to keep serving correctly when components fail.** Not "if" — when. Disks fail, instances are preempted, networks partition, dependencies slow down, deploys break.

Availability is the outcome; fault tolerance is the mechanism.

## Faults, errors, failures

| Term | Meaning | Example |
|---|---|---|
| **Fault** | a defect or event | a disk dies, a packet is dropped |
| **Error** | incorrect internal state caused by a fault | a replica misses a write |
| **Failure** | the service stops meeting its contract | requests return 500 |

The goal is to stop faults from becoming failures — through detection, containment, and recovery.

## Failure domains and blast radius

A **failure domain** is the set of components that can fail together. Real domains are correlated:

- a process,
- an instance,
- a rack,
- an availability zone,
- a region,
- a shared dependency (database, DNS, IAM),
- a deployment pipeline,
- a configuration change.

Blast radius questions for every design:

1. If this component dies, what else dies with it?
2. Can the failure spread (retries, queue backlog, cache stampede)?
3. Is the failure **independent** of the replicas (different AZ, different provider)?
4. How long until detection, and how long until recovery?

Replicas in the same AZ share power, network, and often the same host failure. That is not redundancy; it is decoration.

## Redundancy and isolation

| Technique | Protects against | Does not protect against |
|---|---|---|
| Multiple instances | process/instance crash | shared DB, bad deploy |
| Multi-AZ | datacenter failure | region-wide config error |
| Multi-region | region outage | data conflicts, split brain |
| Read replicas | read load, primary death (with failover) | replication lag, write loss |
| Queue + workers | bursts, worker crashes | poison messages, ordering |
| Bulkheads (separate pools) | one dependency starving others | total dependency outage |
| Shuffling shards | correlated hot spots | key skew |

**Isolation** is as important as replication: separate connection pools, thread pools, queues, and sometimes deployments per tenant tier. One tenant's batch job must not consume the pool used by checkout.

## Timeouts: the first line of defence

Every network call needs a timeout. Without one, a slow dependency becomes an infinite queue of stuck requests.

Rules:

- timeouts shorter than the caller's deadline (a service should not wait 30 s when the user's budget is 2 s);
- propagate deadlines (gRPC deadlines / context cancellation);
- include connection, read, and total timeouts;
- jitter timeouts slightly to avoid synchronized retry waves.

```ts
const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), 300);
try {
  return await fetch(url, { signal: controller.signal });
} finally {
  clearTimeout(timer);
}
```

## Retries: only with a budget

Retries improve availability for **transient** faults and amplify outages when done blindly.

Requirements:

1. **Idempotency** — retrying a non-idempotent write can double-charge.
2. **Bounded attempts** (e.g., 3) with **exponential backoff + jitter**.
3. **Retry budget** — e.g., retries may not exceed 10% of total requests.
4. **Retry only safe classes** — timeouts/5xx/connection resets; not 400/401/409.
5. **Do not retry at every layer** — three layers × three retries = 27 attempts.

```ts
async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isRetryable(error)) throw error;
      const delay = Math.min(1_000, 50 * 2 ** attempt) * (0.5 + Math.random());
      await sleep(delay);
    }
  }
  throw lastError;
}
```

## Circuit breakers, bulkheads, load shedding

- **Circuit breaker**: after N consecutive failures, stop calling the dependency for a cooldown. Fail fast instead of queueing.
- **Bulkhead**: cap concurrency per dependency/tenant so one saturation does not consume all workers.
- **Load shedding**: reject excess work early (429/503) with `Retry-After`, before queues grow unbounded.
- **Rate limiting**: protect the system from abusive or accidental traffic (see [Rate Limiting](/sys-design/028-rate-limiting)).

These are not library decorations; they encode the decision "it is better to fail some requests than to fail all of them".

## Graceful degradation

For every dependency, write the degraded mode:

| Dependency | Degraded behaviour |
|---|---|
| Recommendations | return empty list |
| Search | fall back to prefix index / cached results |
| Redis | read from DB with tighter rate limits |
| Email provider | enqueue for later, show "will be sent" |
| Payment provider | queue intent, retry, never mark paid optimistically |
| Primary DB | read-only mode with a clear banner; writes rejected |

A degraded mode must be **tested**. An untested fallback is a hope.

## Data durability

Fault tolerance also covers losing data:

- **Replication** (sync vs async) with a stated loss window;
- **Backups** that are restored regularly (a backup you cannot restore is not a backup);
- **Checksums** and scrubbing for silent corruption;
- **Point-in-time recovery** for accidental deletes;
- **Outbox/ledger** for events that must not be lost;
- **Fencing** so an old primary cannot accept writes after failover.

## Failure scenarios to rehearse

1. **Instance crash** — LB removes it; in-flight requests fail; retries succeed.
2. **AZ loss** — remaining AZs absorb traffic; capacity headroom must exist (N+1 or 2N).
3. **Primary DB failover** — writes fail for 30–90 s; clients retry idempotently; reads serve stale.
4. **Dependency slow (not down)** — timeouts and breakers trip; degraded mode activates.
5. **Bad deploy** — canary catches it; rollback is one command; the old version stays warm.
6. **Queue backlog** — consumers scale; producers shed or delay; poison messages go to a DLQ.
7. **DNS/IAM outage** — control-plane dependency; pre-resolved endpoints, cached credentials, multi-provider DNS.

Run **game days** and chaos experiments on the real system: kill a node, add latency, fail a dependency. The first time you discover a broken failover should not be during an incident.

## A design-review template

For each component:

```
Component: Payments adapter
Failure domain: one AZ, shared with API
Detection: 5xx rate + p99 > 1s for 2 min
Containment: circuit breaker, bulkhead (20 conns), 800ms timeout
Degraded mode: queue payment intents, show "processing"
Recovery: replay queue with idempotency keys
Data loss: none (intent persisted before call)
```

If you cannot fill this in, the component is a single point of failure.

## Interview drill

**1. "What happens if an AZ goes down?"**
- **Cover:** N+1 capacity; multi-AZ load balancing; DB failover; stateful session handling; replica independence.
- **Follow-up:** "How long until recovery, and what do users see?" (RTO + degraded mode).
- **Common miss:** replicas that share the same AZ or dependency.

**2. "A service is slow, not down. What does your system do?"**
- **Cover:** deadline propagation; breaker; bulkhead; bounded queues; degradation; load shedding.
- **Follow-up:** "What if the slow dependency is auth?" (cache decisions, fail closed/open per risk).
- **Common miss:** infinite timeouts and unbounded queues.

**3. "How do you avoid retry storms?"**
- **Cover:** retry budgets; jitter; one retry layer; idempotency; 429 + `Retry-After`; circuit breakers.
- **Follow-up:** "How do you detect one in production?" (retry rate vs request rate, pool queues).
- **Common miss:** retries at every layer multiplying load.

## Checklist

- [ ] Failure domains are mapped, including shared dependencies.
- [ ] Replicas are independent (AZ/region/provider).
- [ ] Every network call has a timeout and a deadline.
- [ ] Retries are bounded, jittered, idempotent, and budgeted.
- [ ] Circuit breakers, bulkheads, and load shedding exist on critical paths.
- [ ] Each dependency has a tested degraded mode.
- [ ] Failover is automated, fenced, and rehearsed.
- [ ] Backups are restored in drills; RPO/RTO are stated.

Next: [CDN](/sys-design/008-cdn) — pushing correctness and latency to the edge.
