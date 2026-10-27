---
title: Deadlocks & Race Conditions
description: The four Coffman conditions, prevention vs detection, data races versus race conditions, TOCTOU in async code, and the tools that actually find these bugs.
order: 3
---

Two different bugs, often conflated:

- **Data race**: two threads access the same memory concurrently, at least one writes, without synchronisation. Undefined behaviour in C/C++/Go's model; in JS, plain objects are single-threaded unless shared memory is used.
- **Race condition**: the program's correctness depends on interleaving, even with "safe" operations. A data-race-free program can still have race conditions (check-then-act).

Example of a race condition with no data race:

```ts
if (!(await bookings.exists(roomId, date))) {
  await bookings.create(roomId, date);   // another request can interleave here
}
```

Both requests see "free", both create — double booking.

## Deadlock

Four conditions must hold simultaneously (Coffman):

1. **Mutual exclusion** — a resource is held exclusively.
2. **Hold and wait** — a thread holds one resource and waits for another.
3. **No preemption** — resources cannot be forcibly taken.
4. **Circular wait** — a cycle of waiting threads.

Break any one and deadlock is impossible.

### The classic

```
Thread A: lock(order)   ... lock(inventory)
Thread B: lock(inventory) ... lock(order)
```

If both acquire their first lock before either takes the second, each waits forever.

### Prevention

| Technique | Breaks | Cost |
|---|---|---|
| **Global lock order** | circular wait | discipline, documentation |
| **Try-lock with timeout** | hold-and-wait (bounded) | retries, livelock risk |
| **Single lock** | hold-and-wait | contention |
| **Lock-free/optimistic** | mutual exclusion | complexity, retries |
| **Resource ordering by id** | circular wait | requires stable order |

The most practical rule: **always acquire locks in a documented global order** (e.g., sort account ids ascending). This works for database rows too:

```sql
BEGIN;
SELECT * FROM accounts WHERE id IN (1, 2) ORDER BY id FOR UPDATE;
-- same order everywhere
```

### Detection and recovery

Databases detect deadlocks with a wait-for graph and abort a victim:

```
ERROR: deadlock detected (SQLSTATE 40P01)
```

Application-level lock managers can do the same: track owners/waits, break cycles, return an error. Detection is a fallback; prevention is cheaper.

### Livelock and starvation

- **Livelock**: threads keep retrying and never progress (both back off identically).
- **Starvation**: a low-priority thread never gets the lock (unfair lock, reader preference).

Fixes: jittered backoff, fair locks, priority inheritance, bounded queues.

## Race conditions in async code

`await` is a yield point. Every `await` between a read and a write is a possible interleaving.

### TOCTOU (time-of-check to time-of-use)

```ts
// Broken across instances and even within one instance.
const account = await db.get(id);
if (account.balance >= amount) {
  await db.set(id, { balance: account.balance - amount });
}
```

Two concurrent withdrawals both read the same balance.

Fixes:

- atomic SQL: `UPDATE accounts SET balance = balance - $1 WHERE id = $2 AND balance >= $1 RETURNING balance`;
- row lock: `SELECT ... FOR UPDATE` inside a transaction;
- optimistic version: `WHERE version = $n` and retry on conflict;
- idempotency keys for retries.

### Double-checked locking

```ts
if (!cache.has(key)) {
  const value = await load(key);   // two callers both load
  cache.set(key, value);
}
```

Fixes: single-flight/`Promise` cache, per-key mutex, or accept duplicate work if it is cheap.

### Unawaited promises

```ts
items.forEach(async (item) => {
  await process(item);   // errors are lost, no backpressure
});
```

Use `for...of` for sequencing, `Promise.allSettled` with a concurrency cap for parallelism, and always handle rejections.

### Lost updates

Read-modify-write across requests:

```
T1 reads {count: 5}
T2 reads {count: 5}
T1 writes 6
T2 writes 6   // one increment lost
```

Fix with atomic increments, version checks, or serialised updates.

## Deadlocks in async/JS

JavaScript's single thread removes memory-level deadlocks, but not logical ones:

- awaiting a promise that can only resolve after the current task completes;
- a mutex held across `await` that another task needs;
- a bounded queue where the producer awaits while holding the consumer's lock;
- two per-key locks acquired in different orders.

The same ordering discipline applies.

## Finding these bugs

| Tool/technique | Finds |
|---|---|
| ThreadSanitizer (TSan), Go `-race`, Rust borrow checker | data races |
| Stress tests with many concurrent clients | race conditions, deadlocks |
| Deterministic schedulers / model checkers (Loom, Jepsen-style) | interleavings |
| Database deadlock logs | lock-order problems |
| Code review with lock-order documentation | circular waits |
| Load tests with contention | starvation/livelock |

A race that reproduces once a week will not be found by a unit test. Design for it, and instrument retries/deadlocks in production.

## A practical checklist for critical sections

```
1. What invariant is protected?
2. Which locks are needed, in what order?
3. Is any I/O or user code inside the lock?  -> move it out
4. Can this be a single atomic statement instead?
5. What happens on timeout/retry?          -> idempotency
6. Does it work across multiple instances? -> database/consensus
```

## Interview drill

**1. "Two transfers deadlock. How do you fix it?"**
- **Cover:** global lock ordering; short transactions; single atomic statement; retry on `40P01`; detect vs prevent.
- **Follow-up:** "How do you stop it recurring?" (documented order, code review, deadlock metrics).
- **Common miss:** catching the deadlock error and silently continuing.

**2. "How do you prevent double booking?"**
- **Cover:** DB unique/exclusion constraint or conditional update; optimistic version; row lock; idempotency; hold expiry.
- **Follow-up:** "What about high contention?" (queue/serialise per key, backoff).
- **Common miss:** check-then-act in application code.

**3. "A race only appears under load. How do you debug it?"**
- **Cover:** race detector/stress tests; narrow shared state; versioned logs; deterministic repro; production instrumentation.
- **Follow-up:** "What do you ship as a mitigation?" (idempotency, constraints, retries).
- **Common miss:** adding sleeps instead of removing the race.

## Checklist

- [ ] Lock acquisition order is documented and enforced.
- [ ] Critical sections contain no network/disk I/O.
- [ ] Check-then-act is replaced by atomic operations or locks that span both steps.
- [ ] Cross-instance invariants are enforced in the database.
- [ ] Retries are idempotent and bounded.
- [ ] Concurrent async paths are tested under stress.
- [ ] Deadlock/contention metrics are monitored.
- [ ] Every `await` between read and write is examined for interleaving.

Next: [Modern Concurrency Models](/concurrency/004-modern-concurrency-models) — event loops, actors, CSP, structured concurrency, and how to choose.
