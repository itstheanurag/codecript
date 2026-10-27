---
title: Modern Concurrency Models
description: Event loops, promises and cancellation, CSP channels, actors and supervision, structured concurrency, and how to choose a model that fits the failure modes.
order: 4
---

Language runtimes have converged on a few models. Each makes a different trade-off between **shared state, scheduling, and failure handling**.

## The event loop

A single thread runs tasks; I/O is non-blocking and completions are queued.

```
call stack → microtasks (promises) → macrotasks (timers, I/O) → render (browser)
```

Rules:

- Never block the loop: CPU-heavy work goes to a worker/process.
- Microtasks (resolved promises, `queueMicrotask`) run before the next macrotask; a microtask chain can starve timers and I/O.
- One slow request blocks all requests on that loop.

```ts
setTimeout(() => console.log("macrotask"), 0);
Promise.resolve().then(() => console.log("microtask")); // runs first
```

The model is excellent for high-connection I/O servers (Node, Deno, browsers) and terrible for CPU-bound work unless you offload it.

## Async/await, done properly

`async` functions are syntactic sugar over promises. Correctness issues are usually about **concurrency control**, not syntax.

### Sequential vs parallel

```ts
// Sequential: total = sum of latencies
const a = await fetchA();
const b = await fetchB();

// Parallel: total ≈ max(latency)
const [a, b] = await Promise.all([fetchA(), fetchB()]);
```

### Bounded parallelism

`Promise.all` over 10,000 items opens 10,000 operations. Use a pool:

```ts
async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;

  async function worker() {
    while (true) {
      const index = next++;
      if (index >= items.length) return;
      results[index] = await fn(items[index]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}
```

### Error handling

- `Promise.all` rejects on the first error; the others keep running (no implicit cancellation).
- `Promise.allSettled` returns all outcomes — use it when partial success is meaningful.
- Always attach a handler; unhandled rejections can crash Node.

### Cancellation

Pass an `AbortSignal` through every layer:

```ts
async function withTimeout<T>(fn: (signal: AbortSignal) => Promise<T>, ms: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fn(controller.signal);
  } finally {
    clearTimeout(timer);
  }
}
```

Without cancellation, a timed-out request keeps consuming resources.

## CSP and channels (Go)

"Don't communicate by sharing memory; share memory by communicating."

```go
jobs := make(chan Job, 100)
results := make(chan Result, 100)

for i := 0; i < 8; i++ {
    go func() {
        for job := range jobs {
            results <- process(job)
        }
    }()
}
```

Strengths:

- ownership moves through channels;
- `select` handles multiple channels/timeouts;
- pipelines and worker pools are natural.

Pitfalls:

- **goroutine leaks** (blocked forever on send/receive);
- closing a channel twice, or sending on a closed channel;
- unbounded channels hiding backpressure;
- deadlock when producers/consumers wait on each other.

```go
select {
case results <- r:
case <-ctx.Done():
    return
}
```

Always give blocking operations a cancellation path.

## Actors

An actor has private state and a mailbox; it processes one message at a time and can create other actors.

```
actor Counter {
  var value = 0
  on Increment(n) { value += n; sender ! value }
}
```

Strengths:

- no shared mutable state by construction;
- per-actor ordering;
- supervision trees isolate failures (Erlang/Elixir, Akka).

Pitfalls:

- mailbox overload (unbounded queue = OOM);
- distributed actors add network partitions and message loss;
- request/response patterns can still deadlock (two actors awaiting each other);
- debugging async message flows is harder than stacks.

## Structured concurrency

The idea: concurrent tasks are scoped, like blocks. No task outlives its parent; cancellation and errors propagate.

```swift
try await withThrowingTaskGroup(of: Data.self) { group in
  group.addTask { try await fetchUsers() }
  group.addTask { try await fetchOrders() }
  var results: [Data] = []
  for try await result in group { results.append(result) }
  return results
}
```

```kotlin
coroutineScope {
  val users = async { fetchUsers() }
  val orders = async { fetchOrders() }
  users.await() + orders.await()
}
```

Benefits:

- no orphan tasks/leaks;
- failure cancels siblings;
- timeouts apply to the whole scope.

Java's `StructuredTaskScope` and Kotlin/Swift runtimes make this the modern default.

## Work stealing and virtual threads

- **Work stealing** (Go, Java ForkJoin, Tokio): idle workers steal tasks from busy queues, improving utilization.
- **Virtual threads** (Java 21+): many cheap threads multiplexed on carriers; blocking code scales without callback hell. Watch for pinning (blocking in `synchronized`, native calls) and unbounded thread creation.

These reduce the cost of concurrency, not the need to bound it.

## Choosing

| Need | Model |
|---|---|
| Many I/O connections, simple code | event loop / async-await |
| CPU-bound parallel work | worker threads/processes, work stealing |
| Pipeline with backpressure | channels/CSP, queues |
| Stateful services, fault isolation | actors + supervision |
| Scoped task trees, cancellation | structured concurrency |
| Existing blocking code at scale | virtual threads |

## Failure modes across models

| Model | Typical failure |
|---|---|
| Event loop | blocked loop, unhandled rejection, unbounded microtasks |
| Promises | missing await, unbounded `Promise.all`, no cancellation |
| CSP | goroutine leak, closed-channel panic, blocked send |
| Actors | mailbox overflow, deadlock on request/response, poison message |
| Structured | cancellation swallowed, scope too wide |
| Virtual threads | pinning, thread-per-task without limits |

## Checklist

- [ ] The model matches the workload (I/O vs CPU vs stateful).
- [ ] Concurrency is bounded everywhere.
- [ ] Every long-running task has cancellation.
- [ ] Errors propagate to an owner that can act.
- [ ] Queues have limits and backpressure.
- [ ] Shutdown cancels/awaits tasks and releases resources.
- [ ] The team can debug the model (traces, logs, task ids).
- [ ] No task outlives the request/scope that created it.

> "The best concurrency model is the one whose failure modes your team can recognise at 3 a.m."
