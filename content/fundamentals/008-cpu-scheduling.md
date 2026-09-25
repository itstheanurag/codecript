---
title: CPU Scheduling
description: Learn how an OS shares CPU cores among processes: preemption, time slices, context switches, and why Linux uses CFS.
order: 8
---

A core executes **one instruction stream at a time**. Your laptop has hundreds of processes "running." The **scheduler** picks who gets the core next, for how long, and who gets interrupted.

If the scheduler is unfair, the UI stutters while a compile hogs the machine. If it switches too often, the machine spends its life saving registers instead of doing work.

> [!TIP]
> **ELI5: One cashier, many carts**
> The CPU is a cashier. **FCFS** is a single line — a full cart blocks gum. **SJF** serves the smallest cart first — gum wins, the turkey shopper starves. **Round robin** scans five items then rotates. **Linux CFS** tries to give everyone a fair share of cashier-time, with a boost for the person who just clicked a mouse (interactive).

## 1. Preemption and the time slice

**Non-preemptive:** once a process has the CPU, it keeps it until it blocks (I/O) or exits. One infinite loop freezes the machine. Old batch systems could live with this. Your phone cannot.

**Preemptive:** the kernel can interrupt after a **quantum** (time slice) or when a more important thread wakes. Modern desktops, servers, and phones are preemptive.

A process also **blocks** on purpose: waiting on disk, a lock, a network packet. That is not a failure; it is how the scheduler finds someone else to run.

## 2. Context switch (the tax)

When the kernel switches from process A to B it must:

- Save A's registers and program counter.
- Load B's.
- Switch address space (page tables / TLB) if they are different processes.

That costs microseconds and cache warmth. A 1ms quantum with 50µs switches wastes 5% of the core. A 100ms quantum feels laggy for typing. Scheduling is this trade-off.

Threads in the **same process** still context-switch CPU state but share the address space — cheaper than switching processes, not free.

## 3. Textbook algorithms (and their failure mode)

**FCFS (first-come, first-served).** Simple. **Convoy effect:** a long CPU hog at the head of the queue delays everyone.

**SJF (shortest job first).** Ideal average wait if you magically know burst lengths. You do not. **Starvation:** a long job waits forever if short jobs keep arriving.

**Round robin.** Ready queue is a ring. Each thread runs for a quantum. Fair-ish. Quantum too short → switch storm. Too long → interactive lag.

**Priority.** High priority runs first. Without **aging** (priority slowly rises while waiting), low priority **starves**. Priority inversion (low holds a lock high needs) is a real bug; priority inheritance is the usual fix.

## 4. What Linux actually does (enough to be useful)

Linux's default is **CFS** (Completely Fair Scheduler): it tracks how much CPU time each runnable task has gotten and runs the one that is most "behind," using a red-black tree, not a simple queue. Interactive tasks that sleep a lot look "behind" when they wake, so they get the core quickly — that is why typing stays snappy during a compile.

You will also meet:

- **`nice`** values: a hint, not a hard real-time guarantee.
- **cgroups / containers:** a container's CPU limit is the scheduler's fairness applied to a group. This is how Kubernetes `cpu: 100m` is enforced.
- **Real-time policies** (`SCHED_FIFO`) on specialized systems. Do not put your Node app there.

```bash
top          # STAT: R running, S sleeping, D uninterruptible I/O
ps -eo pid,ni,pri,cmd | head
```

If a process is always `D`, you do not have a scheduling problem — you have disk or lock I/O.

## 5. Why application engineers care

- **Busy loops** steal the fair share from everyone on the core (and burn cloud money).
- **Too many threads** (10,000 blocked in the kernel) explode context-switch and memory costs. Thread pools exist for this.
- **Latency vs throughput:** a huge quantum is great for a batch job, terrible for p99 API latency on a shared host.
- **Noisy neighbor** on a VM: another tenant's steal time. You will see it in metrics as `steal` / `ready` time, not as "our code got slower."

## What to remember

- Cores are multiplexed by preemption and blocking; the scheduler picks the next runnable thread.
- Context switches are not free; quantum size is a latency/overhead trade.
- FCFS, SJF, RR are interview models. Linux CFS is "fair share + interactive boost."
- Starvation and priority inversion are the failure modes of naive priority schemes.
