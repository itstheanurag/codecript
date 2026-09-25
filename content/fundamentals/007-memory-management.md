---
title: Memory Management
description: Learn virtual memory, page tables, page faults, stack vs heap, and why OOM and memory leaks show up the way they do.
order: 7
---

Processes do not get a pile of raw RAM chips. They get **virtual addresses**. The OS and CPU translate those to physical frames, isolate programs from each other, and pretend you have more memory than you do (until you do not).

If you do not know this, "the container was OOMKilled" and "we leaked 4GB" are the same sentence. They are not.

> [!TIP]
> **ELI5: Valet parking**
> The app holds a ticket (virtual address), not a parking-spot number. The valet (OS) keeps a ledger (**page table**): ticket → spot (**frame**). If the lot is full, a car goes to the overflow garage on disk (**swap**). Fetching it back is slow (**page fault**). If the garage is also full and everyone keeps swapping, nobody parks — **thrashing**.

## 1. Virtual memory and page tables

Each process has its own virtual address space (on 64-bit, a huge sparse range). The same virtual address `0x400000` in process A and B maps to **different** physical pages. That is isolation: A cannot write B's heap by guessing pointers.

The CPU's **MMU** walks (or caches in the **TLB**) the **page table**: virtual page number → physical frame + flags (present, writable, user/kernel, executable).

Pages are fixed size (commonly 4 KiB; huge pages exist for big mappings). Alignment to pages is why mmap and file caches work the way they do.

## 2. Page faults and swap

Accessing a virtual page that is not in RAM:

1. Hardware **page fault**, kernel takes over.
2. Maybe the page is in the file (your binary, mmap) or in **swap**.
3. Kernel picks a victim frame (if needed), writes it out if dirty, reads the needed page in, updates the table, resumes the process.

A **minor** fault is cheap (page already in cache, just map it). A **major** fault hits disk. Databases hate major faults on their working set — that is why they want RAM and why they call `mlock` / advise the kernel.

**Thrashing:** the working set of *runnable* processes is larger than RAM. The machine is busy paging, not computing. Adding CPUs does not help. Adding RAM or fewer processes does.

**OOM killer:** Linux, when truly out of reclaimable memory, **SIGKILLs** a process (often the fattest). From the app's view it "crashed." `dmesg` says `Out of memory`. In Kubernetes this is `OOMKilled` when the **cgroup limit** is hit, even if the node has RAM left.

## 3. Stack vs heap (inside one process)

```text
high addresses
  stack  ↓ grows down   (frames: args, return addr, locals)
  ...
  heap   ↑ grows up     (malloc / new / GC objects)
  BSS / data            (globals)
  text                  (machine code)
low addresses
```

**Stack**

- Per thread. Function call = push a frame; return = pop.
- Fast. Size is limited (often 1–8 MB per thread). Deep recursion or huge local arrays → **stack overflow**.
- Lifetime is the function. Do not return a pointer to a local in C.

**Heap**

- `malloc` / `new` / runtime allocators. Lives until `free` or GC.
- Fragmentation, locks in the allocator, GC pause — this is where "memory problems" usually live.
- **Leak:** you still have a reference (or forgot `free`), so the GC/OS cannot reclaim. In GC languages leaks are *reachable* junk (a growing cache, a global list of listeners), not "lost pointers" only.

```javascript
// classic JS leak: listeners never removed
window.addEventListener("resize", handler); // handler closes over a big object
```

## 4. What application engineers actually do

- **Set container memory limits** you have tested. The limit *is* the machine from the kernel's point of view.
- **Do not treat swap as capacity** for latency-sensitive services. Swap turns a memory bug into a latency bug.
- **Measure RSS vs heap.** RSS includes code and caches. A profiler (pprof, clinic, heap snapshot) tells you if it is *your* objects.
- **Native addons / CGO** can leak outside the GC's knowledge.

> [!WARNING]
> `free -h` on a Linux host with a full page cache looks like "no memory." The cache is reclaimable. `available` is the column that matters. Killing caches to "free RAM" often just makes the next disk read slow.

## What to remember

- Virtual addresses + page tables isolate processes and enable swap.
- Page faults are how the illusion is maintained; too many major faults is thrashing.
- Stack is bounded and automatic; heap is dynamic and where leaks live.
- OOM is the kernel (or cgroup) killing you. It is not a Java exception unless the runtime caught it first.
