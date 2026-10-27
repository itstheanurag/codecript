---
title: System Design
description: A practical path through scalable system design — requirements, estimates, consistency, failure, caching, queues, and the trade-offs interviewers actually probe.
order: 0
---

**System design is the discipline of making trade-offs explicit.** There is no "correct" architecture; there is an architecture that meets a stated workload, consistency, latency, cost, and failure budget — and one that does not.

This section is written for two audiences:

- engineers who need to reason about production systems without cargo-culting;
- candidates who need to survive a 45–60 minute design interview with structure and depth.

## What interviewers actually test

Not whether you know what Kafka is. They test whether you can:

1. **Clarify** an ambiguous problem before designing.
2. **Estimate** load, storage, and bandwidth so the design is grounded.
3. **Choose** consistency and availability trade-offs deliberately.
4. **Identify bottlenecks** before they are pointed out.
5. **Explain failure** — what breaks, what the user sees, how it recovers.
6. **Communicate** a design at two zoom levels: the box diagram and the critical path.

A design that names technologies but cannot answer "what happens when this node dies?" is not a design.

## The method

### 1. Requirements (5–8 minutes)

Write down, and confirm out loud:

- **Functional**: the 3–5 core use cases, explicitly out of scope for the rest.
- **Non-functional**: scale (DAU, QPS, peak factor), latency target (p50/p99), durability, availability, consistency, retention, geography, budget.
- **Read/write ratio** and payload sizes.
- **Consistency needs per feature** — not "strong everywhere".

### 2. Back-of-the-envelope estimates

Orders of magnitude only; precision is a trap.

| Quantity | Formula / anchor |
|---|---|
| Requests per second | `DAU × actions/day ÷ 86,400`, then × peak factor (2–10) |
| Storage/day | `writes/day × bytes/record × replication factor` |
| Bandwidth | `QPS × payload size` |
| Cache working set | hot fraction (often 10–20%) × dataset |
| Nodes | `peak QPS ÷ per-node capacity`, then add headroom (30–50%) |

Useful anchors: 1 day ≈ 86,400 s (round to 10⁵), 1 M requests/day ≈ 12 RPS average, SSD random read ≈ 100 µs, same-DC round trip ≈ 0.5 ms, cross-region ≈ 50–150 ms.

### 3. API and data model

Define the few endpoints that matter and the access patterns they imply:

```
POST /orders              -> create order (write-heavy, idempotent)
GET  /orders/{id}         -> read by id (cacheable)
GET  /users/{id}/orders   -> list, paginated (index by user_id + created_at)
```

The access patterns determine the primary keys, indexes, and partition key — more than any diagram does.

### 4. High-level design

Draw the critical path with boundaries: client → edge → service → data. Mark where state lives, where it is replicated, and where it is cached.

### 5. Deep dive

Pick 1–2 components the interviewer cares about (usually the hard part: fan-out, consistency, hot keys, ordering, idempotency, search). Go deeper than the diagram.

### 6. Bottlenecks and failure

For each component, answer:

- What is the first thing to saturate? (CPU, connections, IOPS, hot partition, lock)
- What happens at 10× load?
- What happens when a node, AZ, or region fails?
- What is the recovery path, and how long does it take?

## Reading paths

### Foundations

1. [Scalability](/sys-design/001-scalability)
2. [Latency vs Throughput](/sys-design/002-latency-vs-throughput)
3. [CAP Theorem](/sys-design/003-cap-theorem)
4. [Consistency Models](/sys-design/004-consistency-models)
5. [Availability](/sys-design/005-availability)
6. [Fault Tolerance](/sys-design/006-fault-tolerance)
7. [Handling Failures](/sys-design/033-handling-failures)

### Edge and traffic

- [CDN](/sys-design/008-cdn)
- [Load Balancing](/sys-design/009-load-balancing)
- [API Gateway](/sys-design/021-api-gateway)
- [Rate Limiting](/sys-design/028-rate-limiting)
- [Auto-scaling](/sys-design/034-auto-scaling)

### Storage and data distribution

- [Blob Storage](/sys-design/014-blob-storage)
- [Distributed File Systems](/sys-design/015-distributed-file-systems)
- [Data Partitioning](/sys-design/032-data-partitioning)
- [Denormalization](/sys-design/035-denormalization)

### Architecture styles

- [Monolith vs Microservices](/sys-design/016-monolith-vs-microservices)
- [SOA](/sys-design/017-service-oriented-architecture-soa)
- [Event-Driven Architecture](/sys-design/018-event-driven-architecture)
- [Pub/Sub](/sys-design/019-pub-sub-systems)
- [Message Queues](/sys-design/020-message-queues)
- [Streaming](/sys-design/026-streaming)

### Distributed coordination

- [Idempotency](/sys-design/027-idempotency)
- [Distributed Locking](/sys-design/029-distributed-locking)
- [Leader Election](/sys-design/030-leader-election-heartbeats)
- [Consensus](/sys-design/031-consensus-algorithms)
- [AuthN vs AuthZ](/sys-design/036-authn-vs-authz)
- [Observability](/sys-design/039-observability)

### Interview craft

- [System Design Interview Strategy](/sys-design/044-interview-strategy)

## The depth checklist

For every design, you should be able to answer:

- [ ] What is the **unit of load** (request, message, row, byte) and its peak rate?
- [ ] Where does **state** live, and what is the replication factor?
- [ ] What is the **consistency model** for each read path?
- [ ] What is the **latency budget** end to end, and which hop dominates?
- [ ] What is the **failure domain** of each component?
- [ ] What is the **degraded mode** when a dependency is slow (not down)?
- [ ] What is **idempotent**, and what happens on retry/duplicate?
- [ ] What is **partitioned**, by what key, and what is the hot-key risk?
- [ ] What is **monitored**, and what alert fires first?
- [ ] What would you cut for v1, and what would you defer?

> "Anyone can draw boxes. The design is in the arrows: what is synchronous, what is replicated, and what happens when an arrow breaks."
