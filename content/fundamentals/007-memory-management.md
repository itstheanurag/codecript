---
title: Memory Management
description: Virtual memory, paging and the TLB, stack vs heap, allocators, garbage collection, ownership, fragmentation, and the memory failures that kill production.
order: 7
---

Memory is the resource most likely to turn a small bug into an outage. Understanding the layers separates "restart it" from a real fix.

## Virtual memory

Each process sees a private virtual address space mapped to physical pages (typically 4 KB, sometimes 2 MB/1 GB huge pages) by the MMU.

- **Page table** maps virtual → physical.
- **TLB** caches recent translations; a TLB miss costs extra memory accesses.
- **Page fault** occurs when a page is not resident; the OS loads it (or the process crashes if invalid).
- **Swap** moves pages to disk; heavy swapping destroys latency.

Virtual size ≠ resident memory. A process can reserve terabytes of address space and use megabytes of RAM.

```bash
ps -o pid,rss,vsz,cmd -p <pid>
cat /proc/<pid>/status | grep -E 'VmRSS|VmSwap|VmSize'
```

- **RSS** = resident set (physical pages).
- **VSZ** = virtual size.
- **VmSwap** = swapped out (bad sign).

## Stack and heap

- **Stack**: per-thread, LIFO, fast allocation, fixed size (often 1–8 MB). Overflow → crash.
- **Heap**: dynamic allocation via `malloc`/`new`/GC. Slower, shared, prone to fragmentation.

Stack frames hold locals and return addresses; heap objects can outlive a function and are managed by the runtime.

## Allocators

General-purpose allocators (glibc malloc, jemalloc, mimalloc, tcmalloc) manage arenas and size classes to reduce contention and fragmentation.

Key concepts:

- **Arena** per thread reduces lock contention.
- **Size classes** round allocations; small objects waste less.
- **Free lists** reuse blocks; fragmentation grows when free blocks do not fit new sizes.
- **Fragmentation**: RSS grows while live objects stay flat — a classic long-running-service problem.

## Garbage collection

| Strategy | How | Trade-off |
|---|---|---|
| Mark-sweep | trace reachable objects, free the rest | pauses, fragmentation |
| Generational | young/old generations, minor GCs | write barriers, promotion |
| Copying/compacting | move live objects, free whole regions | memory overhead, movement |
| Reference counting | free at zero refs | cycles, atomic overhead |
| Ownership (Rust) | compile-time lifetimes | learning curve, no GC pauses |

GC pauses show up as **tail latency**. Tune heap size, generation sizes, and allocation rate; sometimes the fix is allocating less.

## Common failure modes

| Failure | Symptom | Cause |
|---|---|---|
| Memory leak | RSS climbs, OOM later | retained references, caches without eviction, listeners |
| Use-after-free | crash/corruption | manual memory bug |
| Double free | abort/corruption | ownership bug |
| Fragmentation | RSS high, live heap low | mixed allocation sizes |
| Heap growth | GC pressure, pauses | allocation rate, large graphs |
| Stack overflow | crash | deep recursion, huge frames |
| OOM kill | container restart (137) | limit exceeded; page cache vs heap |
| Swap thrash | extreme latency | overcommitted host |

In containers, the **cgroup limit** matters, not host RAM. The kernel OOM killer sends SIGKILL; the app cannot clean up.

## Locality and performance

- **Cache lines** (64 B) mean adjacent data is fast; pointer-chasing is slow.
- **False sharing**: two threads write different variables on the same cache line → ping-pong.
- **NUMA**: memory attached to another socket is slower; pin threads/allocate locally for latency-sensitive work.
- **Huge pages** reduce TLB misses for large working sets.
- **Data layout** (arrays of structs vs structs of arrays) can beat algorithmic tweaks.

## Measuring memory

```bash
pmap -x <pid>            # mappings
smem -p                  # proportional set size
valgrind --leak-check=full ./app
heaptrack ./app          # allocation profiling
node --inspect           # heap snapshots (JS)
jcmd <pid> GC.heap_info  # JVM
```

Track:

- live heap vs RSS over time,
- allocation rate,
- GC pause percentiles,
- page faults and swap,
- container limit headroom.

## Reducing memory

- Bound every cache (size + TTL).
- Stream instead of buffering (files, responses, query results).
- Reuse buffers/pools; avoid per-request large allocations.
- Prefer compact representations (ids over objects, typed arrays).
- Fix leaks: remove listeners, close resources, clear references.
- Cap concurrency: each in-flight request holds memory.

## Safety models

- **Manual (C/C++)**: maximum control, highest risk.
- **GC (Java/Go/JS/Python)**: safety, pauses, overhead.
- **Ownership (Rust)**: safety without GC, compile-time discipline.
- **Arena/region**: free everything at once; great for request-scoped work.
- **Reference counting (Swift/ObjC)**: deterministic but cycle-prone.

## Interview prompts

1. "RSS grows but the heap profile is flat. What is it?" → native memory, fragmentation, page cache, thread stacks, mmap.
2. "A container is OOM-killed at 512 MB. Where do you look?" → live heap, allocation spikes, caches, GC overhead, thread count.
3. "Why does the JIT/GC cause p99 spikes?" → stop-the-world pauses, deopt, allocation bursts.

## Checklist

- [ ] I know RSS, virtual size, and the container limit.
- [ ] Caches have size and TTL bounds.
- [ ] Streams are used for large data.
- [ ] Concurrency is bounded to bound memory.
- [ ] GC/heap metrics are monitored, not just host RAM.
- [ ] Leaks are diagnosed with profiles, not guesses.
- [ ] Hot data layout and NUMA/locality are considered.
- [ ] OOM behaviour (exit code, restart) is understood.
