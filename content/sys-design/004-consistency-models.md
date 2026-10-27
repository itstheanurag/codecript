---
title: Consistency Models
description: Linearizable, sequential, causal, read-your-writes, monotonic reads, and eventual consistency — what each guarantees, which anomalies they prevent, and how to choose per read path.
order: 4
---

"Consistent" means different things to a database, a distributed system, and a user. The useful question is:

> **What anomalies am I willing to let a user observe, and for how long?**

Consistency models are answers to that question, ordered from strongest (most expensive) to weakest (cheapest).

## The spectrum

| Model | Guarantee | Typical cost |
|---|---|---|
| **Linearizable** | every operation appears instantaneous, in real-time order | coordination, quorum/leader per operation |
| **Sequential** | all clients see the same total order, not necessarily real-time | global ordering |
| **Causal** | causally related operations are seen in order; concurrent ones may differ | vector clocks/version vectors |
| **Read-your-writes** | a client sees its own writes | sticky routing or version tokens |
| **Monotonic reads** | a client never goes backwards in time | replicate selection per session |
| **Eventual** | replicas converge if writes stop | async replication, conflict resolution |

Strong → expensive; weak → requires the product to tolerate anomalies.

## Linearizability (strong consistency)

Real-time, single-copy illusion:

```
write(x=1) completes at t1
read(x) starting after t1 must return 1
```

Used by: single-node databases, etcd/ZooKeeper, quorum reads+writes with proper ordering, Google Spanner (with TrueTime).

Costs:

- coordination per operation (leader or quorum),
- unavailability during partitions (CP),
- higher tail latency across regions.

Use when: money movement, inventory decrement, unique username claim, distributed locks.

## Sequential consistency

All clients observe the same order of operations, but that order need not match real time. A read may return an older value even after a later write completed elsewhere, as long as everyone agrees on the sequence.

Rarely a product requirement by itself; appears in shared-memory models and some replicated logs.

## Causal consistency

If operation A **happened before** B (same client, or B read A's result), every client sees A before B. Concurrent operations may be seen in different orders.

Example: a comment appears only after the post it replies to.

Why it matters: causal order is the minimum most humans expect; violating it makes conversations incomprehensible. Causal+ (with convergence) is used by systems like Cassandra's causal sessions and CRDTs.

## Session guarantees (client-centric)

These are cheap to implement and often enough:

| Guarantee | User-visible rule |
|---|---|
| **Read-your-writes** | after you post, you see your post |
| **Monotonic reads** | you never see an older version after a newer one |
| **Monotonic writes** | your writes are applied in the order you made them |
| **Writes-follow-reads** | you do not write based on a state that then disappears |

Implementation patterns:

- route a session to the same replica,
- carry a **version token** (commit LSN, timestamp) and require replicas to be at least that fresh,
- read from primary after a write for a short window,
- client-side optimistic UI with reconciliation.

Read-your-writes is usually non-negotiable in UX. Monotonic reads prevents the "refresh and my message vanished" bug.

## Eventual consistency

Replicas converge if writes stop. There is no bound on staleness unless the system provides one (e.g., "typically < 1 s, p99 < 5 s").

Anomalies you must design for:

- **Stale reads** — the feed is a few seconds behind.
- **Non-monotonic reads** — two replicas, two different states, refresh flips.
- **Lost updates** — last-write-wins overwrites a concurrent edit.
- **Phantoms** — a list misses an item that exists.

Mitigations:

- version vectors / logical clocks to detect conflicts,
- CRDTs for counters, sets, maps (commutative merges),
- last-write-wins with server timestamps (accepting loss),
- application-level merge UI ("someone else edited this"),
- read repair and anti-entropy.

## Choosing per operation

| Operation | Reasonable model |
|---|---|
| Transfer money / decrement stock | linearizable (or idempotent with reservations) |
| Create order | read-your-writes for the user; eventual for analytics |
| Feed / timeline | eventual + monotonic reads |
| Profile edit | read-your-writes; eventual for others |
| Like count | eventual/CRDT |
| Unique username | linearizable uniqueness constraint |
| Search index | eventual with a freshness SLO |
| Audit log | append-only, causal order, durable |

The design sentence to write down:

> "Writes are linearizable on the primary. Feeds are eventually consistent with p99 staleness < 2 s and read-your-writes for the author."

## Replication in practice

- **Single-leader, async replicas**: simple, stale reads, failover may lose writes.
- **Single-leader, sync replicas**: stronger, higher write latency, availability depends on quorum.
- **Multi-leader**: low write latency, conflicts require resolution.
- **Leaderless quorums**: tunable `R/W`; needs versioning to avoid returning older data.
- **Consensus (Raft/Paxos)**: linearizable, leader-based, unavailable without quorum.

Replication lag is not an implementation detail; it is the consistency model your users experience unless you hide it.

## Seeing anomalies in code

```ts
// Bug: read-your-writes violated by routing to any replica.
await primary.query("UPDATE users SET name = $1 WHERE id = $2", [name, id]);
const user = await replica.query("SELECT name FROM users WHERE id = $1", [id]);
// user.name may still be the old value.
```

Fix options:

```ts
// 1. Read from the primary for this user's session briefly.
// 2. Carry a version and wait for the replica to catch up.
const { lsn } = await primary.query("UPDATE ... RETURNING pg_current_wal_lsn() AS lsn");
await replica.waitForLsn(lsn);
```

## Testing consistency

- **Jepsen-style** fault injection: partitions, clock skew, process pauses.
- **History checking**: record operations, verify the observed order is a valid linearization.
- **Lag injection**: make replicas deliberately slow; assert the product still behaves.
- **Property tests for CRDTs**: commutativity, idempotence, convergence.

Most teams do not need Jepsen, but every team should test the **failover path** with real lag.

## Interview drill

**1. "A user updates their profile and sees the old value on refresh."**
- **Cover:** read-your-writes; session token/LSN; primary read window; monotonic reads; replica routing.
- **Follow-up:** "How does this work on mobile with multiple devices?" (session/version per client).
- **Common miss:** routing reads to a random replica and hoping.

**2. "Two users edit the same document offline."**
- **Cover:** version vectors/logical clocks; CRDT vs LWW; merge UX; deterministic conflict semantics.
- **Follow-up:** "What if both delete it?" (tombstones, delete-wins policy).
- **Common miss:** server timestamps as the only conflict resolution.

**3. "Can we use async replicas for balances?"**
- **Cover:** RPO and failover loss window; CP vs availability choice; sync quorum cost; user messaging.
- **Follow-up:** "How much loss is acceptable?" (make the product decision explicit).
- **Common miss:** choosing availability without stating the data-loss consequence.

## Checklist

- [ ] Each read path has a named consistency guarantee.
- [ ] The staleness bound (if eventual) is measurable and monitored.
- [ ] Session guarantees (read-your-writes, monotonic reads) are implemented where users notice.
- [ ] Conflict resolution is defined for concurrent writes.
- [ ] Failover data-loss window is understood.
- [ ] Tests exercise replication lag and failover, not just the happy path.

Next: [Availability](/sys-design/005-availability) — the math of nines, redundancy, and graceful degradation.
