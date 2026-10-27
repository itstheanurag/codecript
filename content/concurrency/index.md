---
title: Concurrency & Multithreading
description: A practical model of concurrency — processes, threads, async runtimes, locks, races, deadlocks, and the modern models that make concurrent code survivable.
order: 0
---

Concurrency is **doing multiple things at the same time**; parallelism is **doing them simultaneously on multiple cores**. Concurrency is about structure and interleaving; parallelism is about hardware.

You need concurrency to:

- keep a server responsive while waiting on I/O;
- use multiple cores for CPU work;
- handle many connections/requests/tasks;
- coordinate shared state safely.

Almost every production incident in this area comes from one of four mistakes:

1. **Unprotected shared mutable state** (data race).
2. **Assuming an operation is atomic when it is not** (check-then-act).
3. **Holding a lock while doing I/O** (contention, deadlock).
4. **Unbounded concurrency** (thread/connection/memory exhaustion).

## The models

| Model | Unit | Shared state | Best for | Danger |
|---|---|---|---|---|
| Processes | OS process | no (IPC only) | isolation, CPU-bound, crash containment | IPC cost, memory |
| Threads | OS thread | yes | CPU-bound work, blocking I/O | races, locks, context switches |
| Event loop | callbacks/promises | single-threaded | I/O-heavy servers, UIs | blocking the loop |
| Green threads / goroutines | runtime tasks | yes (channels help) | high concurrency, simple code | leaks, unbounded spawn |
| Actors | isolated state + mailbox | no shared memory | distributed/stateful services | mailbox overload, ordering |
| CSP / channels | tasks + queues | ownership via messages | pipelines, pipelines of workers | deadlock on channel use |

Languages pick a default: Node/Python asyncio are event-loop-first; Go/Java 21 virtual threads favour many lightweight tasks; Rust makes shared-state rules explicit; Erlang/Elixir use actors.

## The two fundamental questions

Before writing concurrent code, answer:

1. **What state is shared, and who may mutate it?**
2. **What is the maximum number of operations allowed in flight?**

If you cannot answer both, the design is not ready. Most "concurrency bugs" are actually ownership bugs.

## Reading order

1. [Processes vs. Threads](/concurrency/001-processes-vs-threads)
2. [Synchronization & Locks](/concurrency/002-synchronization-and-locks)
3. [Deadlocks & Race Conditions](/concurrency/003-deadlocks-and-race-conditions)
4. [Modern Concurrency Models](/concurrency/004-modern-concurrency-models)

## A checklist for any concurrent design

- [ ] Shared mutable state is explicitly owned (single writer) or protected.
- [ ] Every lock has a documented order and scope.
- [ ] No lock is held across network/file I/O.
- [ ] Concurrency is bounded (pool/queue/semaphore).
- [ ] Tasks have timeouts and cancellation.
- [ ] Blocking calls are kept off the event loop.
- [ ] Backpressure exists when producers outrun consumers.
- [ ] Shutdown drains in-flight work and releases resources.
- [ ] Tests exercise interleavings where feasible (stress, race detector).

> "Concurrency is not hard because threads are hard. It is hard because shared state plus time is hard."
