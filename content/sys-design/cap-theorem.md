---
title: CAP Theorem
order: 3
---

The CAP theorem states that a distributed system can only guarantee two of three properties simultaneously.

## The Three Properties

- **Consistency** — every read returns the most recent write
- **Availability** — every request gets a response (success or failure)
- **Partition Tolerance** — the system continues despite network partitions

## Why You Can't Have All Three

Network partitions will happen in any distributed system. When they do, you must choose:

- **CP (Consistency + Partition Tolerance)** — reject requests if you can't guarantee consistency. Example: HBase, MongoDB (in certain configs).
- **AP (Availability + Partition Tolerance)** — serve potentially stale data rather than rejecting requests. Example: Cassandra, DynamoDB.

## In Practice

Most real systems don't fit neatly into CP or AP. They make nuanced trade-offs:

- **PACELC** extends CAP: even when there's no partition, you trade off between latency and consistency
- Many systems let you tune consistency per-query (e.g., Cassandra's consistency levels)

## Key Takeaway

CAP is a framework for thinking about trade-offs, not a strict classification system. Understand what your application needs most and design accordingly.
