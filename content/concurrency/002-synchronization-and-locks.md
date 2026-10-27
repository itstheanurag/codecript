---
title: Synchronization & Locks
description: Mutexes, read-write locks, semaphores, condition variables, atomics, memory visibility, and the performance cost of contention.
order: 2
---

Synchronisation exists to protect **invariants across interleavings**. If two threads can observe or mutate the same state at the same time, the rule "balance never goes negative" or "the queue is never read while being resized" can break.

## Critical sections

A critical section is code that must not interleave with another operation on the same state:

```ts
// Broken: check-then-act across an interleaving
if (account.balance >= amount) {
  await delay();                 // another withdrawal can run here
  account.balance -= amount;
}
```

The fix is atomicity — either a lock or a single atomic operation:

```ts
mutex.runExclusive(() => {
  if (account.balance < amount) throw new InsufficientFunds();
  account.balance -= amount;
});
```

## Primitives

| Primitive | Semantics | Use for |
|---|---|---|
| **Mutex** | one owner at a time | protecting mutable state |
| **Spinlock** | busy-wait until acquired | very short critical sections, kernel/embedded |
| **Read-write lock** | many readers or one writer | read-heavy state |
| **Semaphore** | N permits | bounding concurrency, resource pools |
| **Condition variable** | wait/signal on a predicate | producer/consumer queues |
| **Atomic** | indivisible read-modify-write | counters, flags, lock-free structures |

### Mutex

The default choice:

```ts
class Counter {
  private value = 0;
  private readonly mutex = new Mutex();

  async increment(): Promise<number> {
    return this.mutex.runExclusive(() => ++this.value);
  }
}
```

Rules:

- keep the section **short**;
- never `await` I/O while holding a lock (see deadlocks);
- document what the lock protects; name it after the state (`ordersLock`), not the code.

### Read-write lock

Many readers, one writer. Useful for caches and configuration that is read often and updated rarely.

```ts
await rwLock.withRead(() => cache.get(key));
await rwLock.withWrite(() => cache.set(key, value));
```

Caveats: writer starvation, complexity, and often worse performance than a plain mutex for short reads. Measure before choosing.

### Semaphore

Bounds concurrency rather than protecting state:

```ts
const dbPool = new Semaphore(20);

async function query(sql: string) {
  await dbPool.acquire();
  try {
    return await db.query(sql);
  } finally {
    dbPool.release();
  }
}
```

This is how you prevent 10,000 requests from opening 10,000 connections.

### Condition variables

Wait for a predicate without busy-waiting:

```ts
// Producer/consumer sketch
while (queue.length === 0) await notEmpty.wait();
const item = queue.shift();
```

Always re-check the predicate in a loop (spurious wakeups, multiple consumers). The lock must be held while checking and while waiting.

### Atomics

Hardware-level indivisible operations (`fetch_add`, `compare_exchange`) avoid locks for single-word state:

```ts
// Atomic counter (Rust/C++/Java style)
counter.fetch_add(1, Ordering::Relaxed);
```

Use them for counters, flags, and lock-free queues — not for multi-field invariants. Composing two atomics is not atomic.

## Memory visibility

Locks do two jobs: **mutual exclusion** and **memory ordering**. Without a happens-before relationship, one thread may not see another's writes, even after the write "completed".

- A mutex acquire/release establishes ordering.
- Atomics require explicit memory ordering (`relaxed`, `acquire`, `release`, `seq_cst`).
- In JavaScript, the event loop gives you a single thread, so data races on plain objects do not occur **within one thread**, but shared memory across workers (`SharedArrayBuffer`) and `Atomics` has the same rules.

## Contention and performance

| Effect | What happens |
|---|---|
| **Contention** | threads queue for the lock; latency grows |
| **Convoying** | one slow holder delays everyone |
| **False sharing** | independent variables on the same cache line ping-pong |
| **Priority inversion** | low-priority holder blocks a high-priority thread |

Mitigations:

- reduce the critical section (compute outside, mutate inside);
- shard locks (per-account, per-shard) instead of one global lock;
- use lock-free/atomic paths for hot counters;
- batch operations;
- avoid holding locks across I/O or user code.

> [!WARNING]
> "Just add a lock" is how single-threaded throughput becomes a queue. Measure contention (wait time, queue length) before and after.

## Locks in async code

JavaScript has no preemption, but `await` yields control, so interleavings happen at every suspension point:

```ts
// Two concurrent calls can both pass the check.
async function assignSeat(seat: Seat): Promise<void> {
  if (seat.taken) throw new Error("taken");
  await db.save(seat.id, { taken: true });
}
```

Fix options:

- a per-key async mutex,
- a conditional database update (`UPDATE ... WHERE taken = false`),
- a unique constraint,
- an atomic reservation with expiry.

```ts
const seatLocks = new KeyedMutex();

await seatLocks.runExclusive(seat.id, async () => {
  const current = await db.get(seat.id);
  if (current.taken) throw new Error("taken");
  await db.save(seat.id, { taken: true });
});
```

Prefer database-level atomicity for correctness across processes; in-process locks only protect a single instance.

## Choosing

1. Single writer, short critical section → mutex.
2. Read-mostly, expensive reads → RW lock (measure).
3. Bound concurrency → semaphore.
4. Wait for a condition → condition variable.
5. Single counter/flag → atomic.
6. Cross-process correctness → database/consensus, not process locks.

## Checklist

- [ ] Every shared mutable invariant has an owner or a lock.
- [ ] Critical sections are short and contain no I/O.
- [ ] The lock is named after the state it protects.
- [ ] Lock order is documented (deadlock prevention).
- [ ] Concurrency is bounded with a semaphore/pool.
- [ ] Atomics are used only for single-word invariants.
- [ ] Cross-instance correctness relies on the database, not local locks.
- [ ] Contention is measured, not assumed.

Next: [Deadlocks & Race Conditions](/concurrency/003-deadlocks-and-race-conditions) — the failure modes that survive code review.
