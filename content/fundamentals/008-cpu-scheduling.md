---
title: CPU Scheduling
description: How the OS decides what runs next — run queues, time slices, CFS/EEVDF, priorities, affinity, cgroup throttling, CPU steal, and the scheduling causes of p99 latency.
order: 8
---

CPU scheduling decides **which runnable thread gets a core, and for how long**. It is the source of many "the code is fine but latency is not" incidents.

## Thread states

| State | Meaning |
|---|---|
| Running | on a CPU |
| Runnable | waiting for a CPU (run queue) |
| Sleeping | waiting on I/O, lock, timer |
| Stopped/zombie | suspended/exited but not reaped |

Only **runnable** threads compete for CPU. A service with low CPU utilization but long run-queue waits is still CPU-scheduled poorly (few cores, cgroup quota, steal).

## Context switching

The scheduler saves registers/stack and switches to another thread:

- direct cost ~1–5 µs,
- indirect cost: cache/TLB pollution,
- too many runnable threads → thrashing.

Async/event-loop runtimes reduce switches by multiplexing many tasks on one thread, but a single blocking call stalls everything.

## Scheduling policies

### Linux CFS / EEVDF

Modern Linux uses **EEVDF** (since 6.6) derived from fair scheduling: tasks get a virtual runtime and are picked to keep CPU time fair, weighted by `nice` and cgroup shares.

- `nice -20..19`: higher priority gets more CPU weight.
- No hard time slices; the scheduler preempts based on latency targets.
- **Real-time** policies (`SCHED_FIFO`, `SCHED_RR`) can starve everything else; use only for small, bounded work.

### Multicore and affinity

- The scheduler load-balances across cores.
- **Affinity** pins threads to cores (latency-sensitive, NUMA).
- **NUMA**: accessing another socket's memory costs more; pinning + local allocation helps.
- **SMT/hyperthreads** share execution units; CPU-bound siblings halve each other's throughput.

## cgroups: quotas vs shares

Containers are scheduled by the kernel through cgroups:

| Control | Meaning | Behaviour |
|---|---|---|
| `cpu.max` (quota/period) | hard cap (e.g., 1 CPU per 100 ms) | **throttling** when exceeded |
| `cpu.weight` (shares) | relative share under contention | no cap when idle |
| `cpuset` | allowed cores | isolation/affinity |

Kubernetes `limits.cpu` maps to quota → throttling; `requests.cpu` maps to weight. A container can be throttled while the node has idle CPUs if the quota is exhausted within a period. That shows up as p99 spikes and `nr_throttled`.

## Latency vs throughput

- **Throughput** wants long timeslices, batching, fewer switches.
- **Latency** wants immediate preemption and short queues.

At high utilization, a runnable thread waits in the run queue; wait time is part of response latency. Little's law applies to CPU queues too: more concurrency does not create cores.

## Measuring

```bash
uptime                      # load average (runnable + uninterruptible)
vmstat 1                    # r, b, us, sy, id, wa, st
mpstat -P ALL 1             # per-core utilization
pidstat -u -w 1             # per-process CPU + switches
cat /proc/pressure/cpu      # PSI: some/full stall time
perf sched latency          # scheduler latency
cat /sys/fs/cgroup/cpu.stat # nr_throttled, throttled_usec
```

Signals:

- **high `r`** → run-queue contention,
- **high `st`** → CPU steal (noisy hypervisor),
- **high `wa`** → I/O wait (not CPU),
- **PSI full** → real stalls, not just utilization.

## Failure modes

| Failure | Symptom | Cause |
|---|---|---|
| CPU throttling | periodic p99 spikes | cgroup quota too low |
| Noisy neighbour | variable latency | shared host, steal, SMT |
| Run-queue wait | high latency at high CPU | too few cores / too many threads |
| Priority inversion | high-priority task blocked | lock held by low-priority thread |
| Real-time starvation | system hangs | SCHED_FIFO busy loop |
| Excessive switching | low throughput | too many runnable threads |
| NUMA miss | bandwidth/latency loss | remote memory access |
| Thundering herd | CPU spike on wake | many threads wake at once |

## Tuning guidance

- Size CPU **requests/limits** from measured usage, not guesses.
- Keep utilization below ~70% for latency-sensitive services.
- Bound thread pools and async concurrency; unbounded concurrency increases queueing.
- Pin latency-critical threads; avoid mixing batch and interactive work on the same cores.
- Prefer fewer, longer-lived workers over per-request threads at high QPS.
- Watch PSI and throttling, not just average CPU.

## Interview prompts

1. "CPU is at 40% but latency is high. How?" → throttling, run-queue waits, steal, I/O wait, lock contention.
2. "Why does p99 spike every 100 ms?" → cgroup quota period throttling.
3. "What is CPU steal?" → the hypervisor scheduled another VM; your vCPU was not runnable.

## Checklist

- [ ] CPU requests/limits match measured demand.
- [ ] Throttling (`nr_throttled`) is monitored.
- [ ] Run-queue and PSI are watched, not just utilization.
- [ ] Thread/task concurrency is bounded.
- [ ] Latency-critical work is isolated (cpuset/affinity).
- [ ] CPU steal and noisy neighbours are visible.
- [ ] NUMA/locality is considered for large services.
- [ ] Batch work cannot starve interactive traffic.
