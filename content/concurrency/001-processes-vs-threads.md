---
title: Processes vs. Threads
description: Memory isolation, context switching, IPC, scheduling, and how processes, threads, and event loops differ in cost and failure behaviour.
order: 1
---

A process is an isolated address space with its own resources. A thread is an execution stream **inside** a process that shares memory with its siblings. That single difference drives isolation, cost, and bug classes.

## Process

- Own virtual address space, file descriptors, heap, globals.
- Crash usually kills only that process.
- Communication via IPC: pipes, sockets, shared memory, files.
- Creation is relatively expensive (page tables, address space).
- Scheduling unit for the OS; can use multiple cores.

```ts
import { fork } from "node:child_process";

const child = fork("./worker.js");
child.send({ job: "resize", id: 42 });
child.on("message", (result) => console.log(result));
```

Use processes when:

- you need **crash isolation** (one tenant/job cannot corrupt another);
- you want to use multiple cores in a runtime with a GIL or single-threaded loop;
- memory leaks should be reclaimable by killing the process;
- security boundaries matter (`seccomp`, separate users, containers).

Cost: IPC serialisation, duplicated memory, slower startup, more operational overhead.

## Thread

- Shares heap and globals with other threads in the process.
- Has its own stack, registers, and program counter.
- Context switches are cheaper than process switches, but not free.
- A crash/segfault can take down the entire process.
- Needs synchronisation for shared mutable state.

```ts
import { Worker, isMainThread, parentPort } from "node:worker_threads";

if (isMainThread) {
  const worker = new Worker(new URL(import.meta.url));
  worker.on("message", (msg) => console.log("result", msg));
  worker.postMessage({ n: 40 });
} else {
  parentPort!.on("message", ({ n }) => {
    parentPort!.postMessage(fib(n)); // CPU-bound work off the main loop
  });
}
```

Threads are ideal for **CPU-bound** work that must not block the event loop, or for languages whose concurrency model is thread-per-request with blocking I/O.

Danger: shared mutable state. Without a lock or ownership discipline, you get data races that are timing-dependent and hard to reproduce.

## Context switching

The OS saves/restores registers and switches stacks; the CPU cache may be invalidated. Costs:

| Switch | Approx. cost | Notes |
|---|---|---|
| Same-core thread switch | ~1–5 µs | cache effects dominate |
| Cross-core thread switch | higher | cache migration, TLB |
| Process switch | higher still | address space switch (TLB flush) |
| Async task switch (event loop) | ~100s ns | no kernel involvement |

At 100,000 switches/s, even 2 µs each is 20% of a core. This is why thread-per-connection collapses at high concurrency and why async runtimes exist.

## Scheduling

The OS scheduler preempts threads based on priority and fairness. You cannot rely on execution order across threads. Implications:

- "Thread A usually runs first" is not a guarantee;
- busy-waiting starves others;
- priority inversion can occur with locks;
- CPU affinity can help latency-sensitive workloads but narrows scheduling options.

## IPC

| Mechanism | Direction | Notes |
|---|---|---|
| Pipe | one-way byte stream | simple, local |
| Unix domain socket | bidirectional | fast, permissioned via filesystem |
| TCP socket | bidirectional | works across hosts |
| Shared memory | bidirectional | fastest, requires synchronisation |
| Message queue | async | decouples producers/consumers |
| RPC | request/response | adds stubs/serialisation |

Prefer copying messages over shared memory unless profiling proves the copy is the bottleneck. Shared memory reintroduces every race condition processes were meant to avoid.

## Event loop (single-threaded concurrency)

Node.js and browsers run JavaScript on one thread. Concurrency comes from non-blocking I/O and the event loop:

```ts
async function handle(req: Request): Promise<Response> {
  const [user, orders] = await Promise.all([
    users.find(req.userId),      // I/O
    orders.list(req.userId),     // I/O
  ]);
  return json({ user, orders });
}
```

Rules:

- **Never block the loop** with CPU-heavy work (hashing, image processing, large JSON) — move it to a worker/process.
- Async/await does not create threads; it interleaves tasks on one thread.
- All callbacks share one thread: a slow handler delays everyone.

## Green threads and goroutines

Runtimes can multiplex many lightweight tasks onto few OS threads (Go goroutines, Java virtual threads, Erlang processes). Benefits:

- cheap creation (KB-scale stacks),
- blocking-style code without one OS thread per task,
- runtime scheduler handles I/O readiness.

Costs:

- still shared memory in Go/Java → races remain;
- goroutine leaks (blocked forever) are a real failure mode;
- debugging stack traces across thousands of tasks is harder.

```go
func main() {
    var wg sync.WaitGroup
    for i := 0; i < 1000; i++ {
        wg.Add(1)
        go func(n int) {
            defer wg.Done()
            process(n)
        }(i)
    }
    wg.Wait()
}
```

## Choosing

| Workload | Choice |
|---|---|
| I/O-heavy API server (Node/Python) | event loop + worker threads for CPU |
| CPU-bound batch jobs | process pool / worker threads |
| Crash-isolated plugins/tenants | processes or containers |
| Massive concurrent connections | event loop, goroutines, or virtual threads |
| Shared cache/graph in memory | threads with locks, or actors |
| Untrusted code | separate process/container |

## Failure modes

- **Goroutine/thread leak**: tasks block forever (missing timeout/cancel).
- **Unbounded spawning**: one task per request without a pool → memory/FD exhaustion.
- **Blocking the event loop**: p99 spikes for all requests.
- **Process-per-request**: startup cost dominates.
- **Shared memory without locks**: silent corruption.
- **Copying large payloads over IPC**: throughput collapse.

## Interview drill

**1. "Why is Node single-threaded, and how does it handle 10k connections?"**
- **Cover:** event loop + non-blocking I/O; one thread for JS; worker threads/processes for CPU; backpressure; connection caps.
- **Follow-up:** "What happens with a CPU-heavy request?" (blocks everyone; offload it).
- **Common miss:** confusing non-blocking I/O with multithreading.

**2. "Threads or processes for untrusted plugins?"**
- **Cover:** process/container isolation; crash containment; resource limits; IPC cost; shared cache implications.
- **Follow-up:** "How do you pass data between them?" (serialised IPC, not shared memory).
- **Common miss:** running untrusted code in threads of the main process.

**3. "What is a context switch and why does it matter at scale?"**
- **Cover:** register/stack switch, cache/TLB effects; cost × rate; async tasks cheaper; measure switches and latency.
- **Follow-up:** "How would you detect switch overhead?" (perf/scheduler stats, throughput vs concurrency).
- **Common miss:** assuming more threads always mean more throughput.

## Checklist

- [ ] The unit (process/thread/task) matches isolation and CPU needs.
- [ ] CPU-heavy work is off the event loop.
- [ ] Concurrency is bounded by pools/limits.
- [ ] Shared memory is protected or avoided.
- [ ] IPC payloads are sized and serialised deliberately.
- [ ] Tasks have timeouts/cancellation and cannot leak.
- [ ] Shutdown drains in-flight work.

Next: [Synchronization & Locks](/concurrency/002-synchronization-and-locks) — the primitives and their costs.
