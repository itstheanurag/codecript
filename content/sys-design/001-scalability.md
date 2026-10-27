---
title: Scalability
description: What scalability actually means, vertical vs horizontal limits, the Universal Scalability Law, stateless vs stateful scaling, and the bottlenecks that make "add more servers" fail.
order: 1
---

Scalability is **the ability to handle increased load by adding resources, without a disproportionate increase in latency or cost.**

It is not "handles a lot of traffic". A system is scalable relative to a specific load axis:

- **requests per second** (API traffic)
- **concurrent connections** (WebSocket, long polling)
- **data volume** (rows, objects, events retained)
- **fan-out** (one write → millions of notifications)
- **tenants** (per-tenant isolation and noisy neighbours)

Each axis saturates a different resource. Adding app servers does nothing for a write-bound database; adding replicas does nothing for a hot partition.

## Vertical vs horizontal

| | Vertical (scale up) | Horizontal (scale out) |
|---|---|---|
| Unit | bigger machine | more machines |
| Ceiling | hardware/pricing limit | coordination and partition limits |
| Failure | single point of failure | partial failure, but complex |
| Code changes | usually none | requires statelessness, routing, sharding |
| Cost curve | non-linear at the top end | roughly linear until coordination dominates |
| Best for | databases with strong consistency, early stage | stateless services, read scaling, batch work |

Vertical scaling is underrated: a single 64-core, 512 GB machine with NVMe can carry a surprisingly large product, and it avoids distributed-systems failure modes. Start vertically; go horizontal when the failure domain or cost curve forces it.

## Why "add more servers" stops helping

Two laws explain the curve.

**Amdahl's law** — the serial fraction bounds total speedup:

```
speedup(N) = 1 / (s + (1 - s) / N)
```

If 10% of the work is serial (a global lock, a single-threaded queue, one leader), the maximum speedup is 10×, no matter how many nodes you add.

**The Universal Scalability Law (USL)** adds **coherency** cost (nodes must coordinate):

```
C(N) = N / (1 + α(N - 1) + βN(N - 1))
```

- `α` = contention (shared lock, hot row, single leader)
- `β` = coherency (cross-node gossip, distributed transactions, cache invalidation)

With `β > 0`, throughput **peaks and then decreases** as you add nodes. This is why some clusters get slower with more replicas: every write must be acknowledged and invalidated everywhere.

Practical implication: find `α` and `β` before scaling out.

- Contention: hot rows, global sequences, a single writer, lock queues.
- Coherency: synchronous replication, distributed locks per request, chatty service calls, cache invalidation storms.

## Stateless vs stateful

**Stateless services** scale horizontally with a load balancer: any instance can serve any request.

```ts
// State in the request or an external store, not in the process.
app.get("/orders/:id", async (req, res) => {
  const order = await orders.findById(req.params.id);
  res.json(order);
});
```

Rules for statelessness:

- no in-memory sessions (use a signed token or shared store);
- no local file uploads (object storage + pre-signed URLs);
- no in-process caches that must be coherent (or accept staleness);
- no sticky routing unless there is a measured reason.

**Stateful services** (databases, queues, caches, WebSocket gateways) need ownership and placement:

- partitioning (which node owns which key),
- replication (how many copies, sync vs async),
- rebalancing (what happens when a node joins/leaves),
- routing (where does a client send the request?).

The hard part of scaling is almost always the stateful tier.

## The usual bottleneck order

1. **The database write path.** One primary, one disk, one lock. Fix: batch writes, queue, partition, or change the model.
2. **Hot keys/partitions.** One celebrity user, one tenant, one sequential id. Fix: key salting, isolation, per-key rate limits.
3. **Connection pools.** 500 app instances × 20 connections = 10,000 database connections. Fix: pooler (PgBouncer), smaller pools, timeouts.
4. **Synchronous fan-out.** One request → 30 downstream calls. Fix: async, batching, parallel limits.
5. **Shared caches.** Invalidation storms and thundering herds. Fix: jitter, single-flight, versioned keys.
6. **The load balancer / DNS / TLS termination** at extreme QPS. Fix: anycast, multiple edges.
7. **Serial coordination** (locks, leader election, global sequences). Fix: per-shard sequences, leases, idempotency keys.

> [!WARNING]
> Scaling the stateless tier to compensate for a saturated database is the most common architectural mistake. It increases concurrency against the bottleneck and makes tail latency worse.

## Techniques, and what they cost

| Technique | Helps | Cost |
|---|---|---|
| Read replicas | read-heavy workloads | replication lag; stale reads |
| Caching | repeated reads | invalidation, memory, cold-start stampede |
| Sharding | write/storage scale | cross-shard queries, rebalancing |
| Async queues | burst absorption, decoupling | eventual consistency, duplicates, ops |
| Batching | throughput per unit work | added latency, bigger failure units |
| Denormalization | read latency | write amplification, drift |
| CDN/edge | static/global latency | cache invalidation, cost |
| Compression | bandwidth | CPU |
| Connection pooling | DB connection limits | queueing semantics |

Every technique buys one property by spending another. Write the trade-off down.

## A worked estimate

Target: 10 million DAU, each opening the app 10 times/day, 20 reads per open, 1 write per 50 opens. Peak factor 3.

```
reads/day  = 10M × 10 × 20 = 2B
writes/day = 10M × 10 / 50 = 2M
avg read   = 2B / 86,400 ≈ 23,000 RPS
peak read  ≈ 69,000 RPS
peak write ≈ 70 RPS (tiny!)
```

The design is **read-dominated**. Before sharding writes, consider:

- cache hit ratio (90% cache → 6,900 RPS to the database),
- read replicas (N replicas divide read load),
- CDN for static and cacheable responses,
- payload size and serialization cost.

At 70 write RPS, a single well-indexed Postgres primary is not the problem. The problem is likely cache stampedes, connection pools, or fan-out.

## Failure modes at scale

- **Retry storms.** A dependency slows, clients retry, load doubles. Fix: budgets, exponential backoff with jitter, circuit breakers.
- **Thundering herd.** A popular key expires and 10,000 requests hit the database. Fix: single-flight, stale-while-revalidate, jittered TTLs.
- **Autoscaling lag.** Instances take 2–5 minutes to boot; traffic spikes in 10 seconds. Fix: pre-scaling, queue-based smoothing, load shedding.
- **Hot partition.** A new key distribution sends 40% of traffic to one shard. Fix: better key, salting, split the shard.
- **Coordination collapse.** Adding nodes increases gossip and slows the cluster. Fix: reduce chatty coordination, batch replication.

## Interview drill

**1. "Design a read-heavy feed for 10M DAU."**
- **Cover:** read/write ratio and peak math; cache hit ratio and stampede protection; fan-out on write vs read; replica lag; hot keys.
- **Follow-up:** "What changes at 100× traffic?" (partitioning, cache tiering, fan-out model).
- **Common miss:** sizing the database before estimating reads and cache hit rate.

**2. "Database CPU is at 90% and p99 is 2 s. What do you do?"**
- **Cover:** measure query mix, pool saturation, locks, replication lag; slow-query log; cache hit rate; indexes; batching; read replicas; load shedding.
- **Follow-up:** "How do you know it is not the cache?" (miss rate, origin QPS, stampede).
- **Common miss:** adding application servers, which increases pressure on the bottleneck.

**3. "We doubled the servers and throughput went down."**
- **Cover:** USL contention/coherency; shared database or lock; chatty coordination; retry storms; connection-pool limits.
- **Follow-up:** "Which metric tells you first?" (lock wait, pool queue, cross-node traffic).
- **Common miss:** assuming linear scaling and blaming traffic.

## Checklist

- [ ] The load axis and peak rate are quantified.
- [ ] The first saturated resource is identified, not guessed.
- [ ] Stateless services are actually stateless.
- [ ] Stateful tiers have ownership, replication, and rebalancing stories.
- [ ] Contention and coherency costs are considered before scaling out.
- [ ] Each scaling technique has a named cost and a rollback plan.
- [ ] Retries, hot keys, and cache stampedes have explicit mitigations.

Next: [Latency vs Throughput](/sys-design/002-latency-vs-throughput) — why the fastest system is often not the one with the most capacity.
