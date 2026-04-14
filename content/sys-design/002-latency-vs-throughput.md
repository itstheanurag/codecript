---
title: Latency vs Throughput
order: 2
---

In system design, performance is primarily evaluated using two key metrics:

- **Latency** → How fast a single request is processed
- **Throughput** → How many requests the system can handle

Understanding the relationship between these two is critical for designing systems that meet **SLAs (Service Level Agreements)** and **user expectations**.

---

## Latency

Latency is the **time taken to process a single request** from start to finish.

It includes:

- Network delay (request travel time)
- Processing time (CPU, DB queries)
- Queueing delays
- Response transmission time

---

### Characteristics

- **Measured in**:
  - milliseconds (ms)
  - microseconds (μs)
- **Goal**:
  - Minimize latency for better user experience
- **User-facing impact**:
  - Directly affects perceived performance

---

### Types of Latency

#### Network Latency

- Time taken for data to travel across the network
- Affected by:
  - Distance
  - Bandwidth
  - Routing

#### Processing Latency

- Time taken by servers to process the request
- Includes:
  - Application logic
  - Database queries
  - Cache lookups

#### Disk I/O Latency

- Time taken to read/write from disk
- HDD >> SSD >> In-memory (Redis)

#### Queueing Latency

- Time spent waiting before being processed
- Happens during traffic spikes

---

### Percentile Latency (Very Important in Interviews)

Instead of averages, we use percentiles:

- **P50 (Median)** → Typical latency
- **P95** → 95% of requests are faster than this
- **P99** → Tail latency (critical for reliability)

 Real systems optimize for **P95/P99**, not averages.

---

## Throughput

Throughput is the **number of requests a system can process per unit time**.

---

### Characteristics

- **Measured in**:
  - Requests per second (RPS)
  - Queries per second (QPS)
  - Transactions per second (TPS)
  - Bits per second (bps)

- **Goal**:
  - Maximize system capacity

---

### What Affects Throughput?

- Number of servers
- CPU cores
- Parallelism (multi-threading, async processing)
- Database performance
- Caching efficiency

---

### Throughput Formula (Little’s Law - Simplified Insight)

A useful mental model:

> Throughput ≈ Concurrency / Latency

- If latency increases → throughput decreases (for fixed resources)
- If concurrency increases → throughput increases

---

## The Relationship (Pipeline Analogy)

Think of a system as a pipe:

- **Latency** → Time taken for one drop to pass
- **Throughput** → Number of drops per second

```mermaid
graph LR
    A[Request Start] -->|Latency (Time)| B[Response End]

    subgraph "Throughput (Parallel Requests)"
        R1[Req 1]
        R2[Req 2]
        R3[Req 3]
        R4[Req 4]
    end
```
