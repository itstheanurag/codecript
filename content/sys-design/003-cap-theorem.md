---
title: The CAP Theorem
description: What CAP actually says, why "pick two" is misleading, how quorums behave during partitions, PACELC, and how to reason about real systems.
order: 3
---

CAP is the most quoted and least usefully applied theorem in system design. Stated precisely:

> In the presence of a **network partition**, a distributed system cannot simultaneously guarantee **linearizable consistency** and **availability** for every request.

Three words matter:

- **Partition** — messages between nodes are lost or delayed. In any real network, this *will* happen.
- **Consistency** — here, *linearizability*: every read sees the latest completed write, as if there were one copy.
- **Availability** — every request to a non-failed node receives a non-error response (in bounded time).

It is a statement about behaviour **during a partition**, not a permanent category.

## "Pick two" is misleading

Since partitions are not optional, the real choice is:

- **CP**: refuse/block some requests to stay consistent.
- **AP**: answer with possibly stale data to stay available.

You do not choose "CA" for a distributed system; you can only be CA when there is no partition (i.e., not a distributed system — a single node).

| System | Typical posture during partition | Notes |
|---|---|---|
| PostgreSQL primary + sync replica | CP | writes block without quorum |
| DynamoDB / Cassandra (tunable) | AP by default | quorum reads/writes tune consistency |
| etcd / Consul / ZooKeeper | CP | leader-based consensus |
| Redis (single primary) | CP-ish | loses availability on failover, can lose writes |
| S3 | AP for most operations | read-after-write caveats historically |

The posture can also vary **per operation**: a "like count" can be AP; the "bank balance" must be CP.

## Quorums: how the choice becomes tunable

With `N` replicas, `W` write acknowledgements, and `R` read responses:

```
if R + W > N  →  reads and writes overlap at least one node  →  strong-ish consistency
```

Example: `N=3`.

| W | R | Behaviour |
|---|---|---|
| 3 | 1 | slow writes, fast reads; write survives one node loss |
| 2 | 2 | balanced; survives one node loss; strong overlap |
| 1 | 1 | fast, available; stale reads possible; write can be lost |

Details that bite:

- **Sloppy quorum + hinted handoff** (Dynamo-style) improves availability but relaxes the guarantee.
- **Read repair** makes subsequent reads consistent, but not the first one.
- **Quorum is per-key**, and hot keys can have different effective behaviour under load.
- **R+W>N does not give linearizability** without extra rules (e.g., write ordering, leader, read-your-writes handling).

## PACELC: the latency dimension

CAP says nothing about normal operation. PACELC extends it:

> **If Partition: choose Availability or Consistency. Else (normal operation): choose Latency or Consistency.**

Even with a healthy network, **synchronous replication costs latency**. A write acknowledged by a quorum across three AZs pays at least one cross-AZ round trip (~1–2 ms) plus queueing; across regions, 50–150 ms.

| Choice | Example | Consequence |
|---|---|---|
| Strong consistency | quorum write before ack | higher write latency, lower availability on failure |
| Latency | async replica ack | possible stale reads / data loss window |

This is why "we need strong consistency" should always be followed by "on which operations, and at what p99?".

## A partition walkthrough

A service writes to a primary in `us-east-1` and replicates asynchronously to `eu-west-1`.

1. The cross-region link fails.
2. Writes in `us-east-1` continue locally, ack immediately (available).
3. Reads in `eu-west-1` serve stale data (AP for reads).
4. If a regional failover promotes `eu-west-1`, the writes not yet replicated are lost.

If the business cannot lose those writes:

- use synchronous quorum replication (higher write latency, writes fail without quorum),
- or accept unavailability during the partition,
- or redesign the operation (idempotent, reconcilable, e.g. append-only ledger).

There is no free option; there is a business decision.

## Common misconceptions

| Myth | Reality |
|---|---|
| "CA systems exist in the cloud" | CA only when there is no partition; partitions happen |
| "AP means eventual consistency everywhere" | AP is a partition-time availability choice; normal-operation consistency is separate (PACELC) |
| "CAP is about latency" | CAP is about partitions; PACELC covers the latency/consistency trade |
| "Strong consistency is always safer" | It can make the system unavailable or slow; use it per operation |
| "We use quorum, so we are consistent" | Only with correct read/write overlap, versioning, and conflict rules |

> [!WARNING]
> "We chose AP" is not a design. You must state what happens on a **read-after-write**, two conflicting writes, and a failover with unreplicated data.

## How to apply it in a design review

1. **List operations**, not systems: read balance, append event, update profile, count likes.
2. For each, decide the **partition behaviour**:
   - fail the request (CP),
   - serve stale (AP),
   - merge later (CRDT/conflict resolution),
   - queue for later (outbox).
3. Decide the **normal-operation** trade (PACELC): sync vs async replication, quorum size.
4. Write the **failure story**: what is lost, for how long, and who notices.

## Interview drill

**1. "Your payment ledger is replicated across regions. A partition happens. What do you do?"**
- **Cover:** CP for balance-changing operations; quorum requirements; idempotency keys; fail writes without quorum; reconciliation after heal.
- **Follow-up:** "What does the user see during the partition?" (explicit failure vs queued intent).
- **Common miss:** claiming AP and silently losing or double-applying money.

**2. "A like counter is stale for 5 seconds. Acceptable?"**
- **Cover:** AP by default; CRDTs or commutative increments; monotonic reads; a staleness SLO; conflict-free merge.
- **Follow-up:** "How do you reconcile after a partition?" (operation log, anti-entropy).
- **Common miss:** applying linearizability to vanity metrics, paying latency for nothing.

**3. "R=1, W=1, N=3. Are reads consistent?"**
- **Cover:** no guaranteed overlap; stale reads possible; sloppy quorum/read repair caveats; PACELC latency trade.
- **Follow-up:** "What would you choose for a balance read?" (R+W>N or a leader).
- **Common miss:** assuming quorum alone equals linearizability.

## Checklist

- [ ] Consistency is defined per operation, not per company.
- [ ] Partition behaviour is explicit: fail, stale, merge, or queue.
- [ ] Normal-operation latency trade-offs (PACELC) are stated.
- [ ] Quorum parameters and failure tolerance are documented.
- [ ] Failover data-loss windows are known and accepted.
- [ ] Conflict resolution exists for concurrent writes.
- [ ] The design does not claim "CA" for a distributed system.

Next: [Consistency Models](/sys-design/004-consistency-models) — the spectrum between linearizable and eventual, and the guarantees your users actually notice.
