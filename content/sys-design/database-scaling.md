---
title: Database Scaling
order: 2
---

As your application grows, a single database instance becomes a bottleneck. There are two fundamental approaches to scaling.

## Vertical Scaling (Scale Up)

Add more CPU, RAM, or disk to the existing machine. Simple but has hard limits.

## Horizontal Scaling (Scale Out)

Distribute data across multiple machines. More complex but virtually unlimited.

### Replication

- **Primary-Replica** — one primary handles writes, replicas handle reads
- Improves read throughput and provides failover
- Introduces replication lag (eventual consistency)

### Sharding

Split data across multiple databases based on a shard key.

- **Range-based** — shard by ranges of a key (e.g., user IDs 1-1M, 1M-2M)
- **Hash-based** — hash the key and distribute evenly
- **Directory-based** — a lookup table maps keys to shards

### Sharding Challenges

- **Cross-shard queries** are expensive
- **Resharding** is painful when you need to add or remove shards
- **Hotspots** occur when data distribution is uneven
