---
title: Fault Tolerance
description: Learn how to keep serving when parts fail: redundancy, graceful degradation, timeouts, retries, and circuit breakers — versus high availability.
order: 6
---

**Fault tolerance** means the *system* keeps a useful promise when a *part* fails. Disks die. Zones go dark. A dependency returns 500 for three minutes. If that equals "the product is down," you did not design for failure; you hoped.

In a fleet of a few thousand machines, something is always broken. The design question is whether users notice.

> [!TIP]
> **ELI5: The twin-engine plane**
> One engine failing is a **fault**. A plane that can still fly is **fault tolerant**. A plane that glides to a nearby airport with a scare is **highly available** with failover. A single-engine plane that falls out of the sky is neither. Netflix hiding "Because you watched" when the recs service dies is flying on one engine — **graceful degradation**.

## 1. Fault tolerance vs high availability

| | Fault tolerance | High availability (HA) |
| :--- | :--- | :--- |
| Goal | Keep working **through** a failure | Keep **uptime** high; fail over if needed |
| User sees | Little or no interruption | Maybe a blip (reconnect, retry) |
| Typical | RAID-1, dual power, active-active, quorum writes | Active-passive DB, Kubernetes reschedule |
| Cost | Extra copies **while healthy** | Extra copies, plus failover machinery |

HA is "we come back fast." FT is "we did not go down." Real systems mix them: three replicas (FT for reads) plus a failover story (HA for a primary).

**Durability** (S3's 11 nines) is "we did not lose the bytes." That is not the same as "GET succeeded just now" (**availability**).

## 2. Redundancy, done on purpose

Copies only help if they **fail independently**. Three containers on one node is a replica count, not a fault domain. Spread across **racks / AZs / regions** depending on the blast radius you care about.

- **Active-active:** all copies serve. Need to reason about [consistency](./004-consistency-models).
- **Active-passive:** spare is idle until failover. Simpler consistency, wasted capacity, failover time.

**Synchronous** replication: the write is on two nodes before you ack the user. Safer, slower. **Asynchronous:** fast ack, window of data loss if the primary dies. Pick in the open; do not discover it in an incident.

## 3. Graceful degradation

Rank features. When inventory is down:

- **Must work:** cart, pay, "we received the order."
- **Should hide:** recommendations, "people also bought."
- **Must not do:** fail checkout because recs timed out.

That is a **code** decision: timeouts + fallbacks, not a slogan. If every page `await`s recs with no deadline, you do not have degradation; you have a distributed monolith.

## 4. Timeouts, retries, circuit breakers

Failure handling is mostly **time**.

- **Timeouts:** every outbound call. No timeout = a dead dependency holds your threads forever.
- **Retries:** only on **idempotent** or explicitly safe calls. Retrying `POST /charge` without a key double-bills. Retry with **backoff and jitter** or you DDoS the recovering service (retry storm).
- **Circuit breaker:** after N failures, **stop calling** for a cooldown; fail fast or use a fallback. Gives the dependency room to heal. Half-open probe before full traffic.

```text
Closed (normal) → too many errors → Open (fail fast)
Open → sleep → Half-open (let one trial through)
Half-open success → Closed; failure → Open
```

Bulkheads: isolate pools (checkout's HTTP client is not the same as recs'). Recs melting should not steal checkout's threads.

## 5. Checkpointing

Long jobs (train a model, transcode, ETL) should **save progress**. On kill, resume, do not start at 0. For user-facing request/response, the analog is **idempotency keys** and durable outbox, not a 40-minute in-memory loop.

## 6. What to draw in an interview

1. Name the **failure** (instance, AZ, dependency, poison message).
2. Name the **domain** (does the user lose money, or a widget?).
3. Mechanism: replica + health check, timeout + fallback, queue + retry + DLQ, multi-AZ DB.
4. Cost: extra 2× compute, slightly higher latency, weaker consistency.

> [!WARNING]
> Retries without idempotency and without a circuit breaker turn a 1-minute outage into a 20-minute self-DDoS. "We retry 5 times immediately" is not fault tolerance.

## What to remember

- FT = useful service despite a failed part. HA = we fail over and keep the SLO. Durability = we did not lose data.
- Independent fault domains, or your replicas are theater.
- Timeouts, jittered retries, circuit breakers, bulkheads are the request-path toolkit.
- Degrade features on purpose; do not let a decoration sink the transaction.
