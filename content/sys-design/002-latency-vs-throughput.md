---
title: Latency vs Throughput
description: The difference between speed and capacity, why latency explodes near saturation, Little's law and queueing intuition, and how to measure tail latency without lying to yourself.
order: 2
---

**Latency** is how long one operation takes. **Throughput** is how many operations complete per unit time. They are related, but optimising one can destroy the other.

A highway analogy:

- **Latency** = how long your trip takes.
- **Throughput** = how many cars pass per hour.

Adding lanes increases throughput; it does not make your destination closer. At rush hour, throughput stays high while latency explodes.

## Units and what they hide

| Measure | Typical unit | What it answers |
|---|---|---|
| Latency | ms / µs | how long one request takes |
| Throughput | req/s, MB/s, events/s | how much work completes |
| Concurrency | in-flight requests | how much work is admitted at once |
| Utilization | % of capacity | how close to saturation |

A system at 100,000 RPS with p99 = 4 s may be "high throughput" and still unusable. A system at 100 RPS with p99 = 8 ms may be perfect for its job.

Always state latency with a percentile and a workload: **p99 under 2,000 RPS with 1 KB payloads**, not "fast".

## Little's law

For a stable system:

```
L = λ × W
```

- `L` = average number of items in the system (concurrency)
- `λ` = arrival rate (throughput)
- `W` = average time in the system (latency, including queueing)

Two practical uses:

**Size concurrency.** If you want 5,000 RPS at 40 ms latency, you need `5,000 × 0.04 = 200` concurrent requests. A thread-per-request server needs 200 threads (plus headroom); an async runtime needs 200 in-flight operations.

**Diagnose queueing.** If concurrency is fixed at 200 and latency rises to 400 ms, throughput can only be `200 / 0.4 = 500 RPS`. The queue is the system.

## Why latency explodes near saturation

Utilization `ρ = λ / μ` (arrival rate / service capacity). Queueing delay grows non-linearly:

```
W_queue ≈ ρ / (1 - ρ) × service_time
```

| Utilization | Relative queue delay |
|---|---|
| 50% | 1× |
| 80% | 4× |
| 90% | 9× |
| 95% | 19× |
| 99% | 99× |

This is the hockey stick. Running a service at 95% CPU "for efficiency" means p99 latencies are ~20× the service time, and any burst tips it into collapse.

Practical target: **60–70% utilization** for latency-sensitive services; higher only with fast, predictable work and good load shedding.

## Throughput techniques and their latency cost

| Technique | Throughput | Latency | Note |
|---|---|---|---|
| Batching | ↑↑ | ↑ | wait for a batch or size threshold |
| Pipelining | ↑ | ↑ slightly | more in flight, head-of-line blocking |
| Connection reuse | ↑ | ↓ | avoid handshakes |
| Compression | ↑ (bytes) | ↑ CPU | better for large payloads |
| Async I/O | ↑↑ | ↓ under load | complexity, backpressure needed |
| More replicas | ↑ | flat | only if the bottleneck is not shared |
| Caching | ↑↑ | ↓↓ | staleness, invalidation |
| Precomputation | ↑↑ | ↓↓ | data freshness, write amplification |

Batching is the canonical trade: 1,000 individual inserts may take 1,000 round trips; one multi-row insert takes one. Latency per record goes up (waiting for the batch), throughput goes up dramatically.

## Tail latency is the user experience

Averages hide the pain. If 1% of requests take 2 s, a page that makes 100 requests has a **63% chance** of hitting at least one slow request:

```
P(at least one slow) = 1 - (1 - 0.01)^100 ≈ 0.63
```

This is why fan-out amplifies tails. Mitigations:

- **Hedged requests**: send a second copy after p95, take the first response.
- **Timeouts and budgets**: cap total time per request, not per hop.
- **Load shedding**: reject early rather than queue forever.
- **Reduce fan-out**: aggregate on the server, cap parallel calls.
- **Isolate slow dependencies**: separate pools/threads so one slow call does not block everything.

### Coordinated omission

A benchmark that sends the next request only after the previous one completes **hides queueing**. When the system slows, the load generator slows too, so latency looks fine and throughput drops silently.

Use open-loop load (fixed arrival rate) or HdrHistogram-style corrected measurements. In production, measure latency **from the client's intended send time**, not from when the server dequeued the request.

## A latency budget

For a 300 ms p99 API target:

| Hop | Budget |
|---|---|
| DNS + TLS + edge | 40 ms |
| Auth / gateway | 15 ms |
| Service compute | 80 ms |
| Database (2 queries) | 60 ms |
| Downstream calls (parallel) | 70 ms |
| Serialization / network | 35 ms |
| **Total** | **300 ms** |

If one hop is 400 ms, no amount of tuning elsewhere saves the request. Budgets force the conversation about which dependency is allowed to be slow.

## Throughput capacity planning

```
required_nodes = peak_RPS / per_node_capacity / target_utilization
```

If a node handles 400 RPS at 65% utilization: `10,000 / 400 / 0.65 ≈ 39` nodes. Add headroom for deploys, AZ failure, and bursts.

Do not size by CPU alone: check connections, memory, IOPS, and downstream quotas. The first exhausted resource defines capacity.

## Failure modes

- **Unbounded queues** turn latency into memory growth, then OOM. Bound queues and reject.
- **Retry amplification** doubles load during an incident; use budgets and jitter.
- **Thread-pool saturation** blocks health checks, so the orchestrator kills a healthy-but-busy instance.
- **Metrics at the server only** miss network and client-side queueing.
- **Averages** hide the tail that users feel.

## Interview drill

**1. "p50 is 20 ms but p99 is 2 s. Where do you look?"**
- **Cover:** utilization/queueing, GC pauses, lock contention, slow dependency tails, fan-out amplification; per-hop budgets and traces.
- **Follow-up:** "How do you reproduce it?" (load test at target utilization, not closed-loop).
- **Common miss:** tuning the average instead of the tail.

**2. "How many threads/connections for 5k RPS at 50 ms?"**
- **Cover:** Little's law: 250 in flight; headroom for bursts; async vs thread-per-request; pool limits; downstream capacity.
- **Follow-up:** "What if p99 is 500 ms?" (concurrency explodes; queueing dominates).
- **Common miss:** sizing by CPU while ignoring in-flight requests.

**3. "Batch size 1,000 or 10?"**
- **Cover:** throughput vs added latency and wait time; batch timeout; failure unit; memory; tail behaviour.
- **Follow-up:** "How would you measure the trade-off?" (latency budget vs records/s).
- **Common miss:** optimizing throughput only, then missing the SLO.

## Checklist

- [ ] Latency targets are percentiles tied to a workload.
- [ ] Throughput and latency are both measured, not inferred.
- [ ] Utilization is kept below the latency cliff (or load shedding exists).
- [ ] Concurrency is sized with Little's law.
- [ ] Fan-out and tail amplification are considered.
- [ ] Queues are bounded and reject load explicitly.
- [ ] Benchmarks avoid coordinated omission.

Next: [The CAP Theorem](/sys-design/003-cap-theorem) — what you actually choose when the network splits.
