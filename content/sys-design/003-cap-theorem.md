---
title: The CAP Theorem
order: 3
---

When building distributed systems (where data is stored across multiple independent servers), network failures are not a possibility; they are a mathematical certainty. The CAP Theorem dictates the hard limits of what you can achieve when those network failures happen.

```mermaid
architecture-beta
    group cap(cloud)[The CAP Theorem]
    
    service c(database)[Consistency (C)] in cap
    service a(database)[Availability (A)] in cap
    service p(database)[Partition Tolerance (P)] in cap
    
    c:R -- L:a
    a:B -- T:p
    p:L -- R:c
```

The theorem states that a distributed data store can guarantee at most **two** of the following three properties simultaneously:

## 1. The Three Properties

### Consistency (C)
Every read receives the most recent write, or an error. If a user updates their password on Server A, and immediately requests to log in on Server B, Server B *must* know about the new password. 

### Availability (A)
Every request receives a (non-error) response, without the guarantee that it contains the most recent write. The system will always give you data, even if it might be slightly stale.

### Partition Tolerance (P)
The system continues to operate despite an arbitrary number of messages being dropped (or delayed) by the network connecting the nodes.

> [!WARNING]
> You cannot choose to ignore Partition Tolerance. In the real world, network cables get cut, routers fail, and packets drop. Therefore, your system *must* be Partition Tolerant. **This means the CAP theorem is actually a choice between Consistency and Availability during a network failure.**

## 2. CP vs. AP Systems

> [!TIP]
> **ELI5: The Twin Telemarketers**
> Imagine two identical twins, Alice and Bob, acting as your "database" taking phone orders.
> *   **Network Partition (P):** A storm hits, and the phones between Alice and Bob go down. They can't talk to each other to sync their order books.
> *   **CP (Choosing Consistency):** A customer calls Alice to buy the last pair of shoes. Alice knows Bob might have just sold them 5 seconds ago. Because she cannot check with Bob, she tells the customer, "Sorry, our system is down, please call back later." She guarantees no overselling (Consistency), but sacrifices Availability.
> *   **AP (Choosing Availability):** A customer calls Alice. She accepts the order, assuming it's fine. Bob also accepts an order for the same shoes. They remain Available, but when the storm passes and they sync books, they realize they oversold the shoes (Inconsistent). 

### CP Systems (Consistency & Partition Tolerance)
*   **When to use:** When inaccurate data is catastrophic. (e.g., Financial transactions, bank account balances).
*   **Examples:** Traditional relational databases (PostgreSQL, MySQL) configured for synchronous replication; MongoDB, HBase.

### AP Systems (Availability & Partition Tolerance)
*   **When to use:** When it's better to show slightly outdated data than to show an error page. (e.g., Social media feeds, YouTube like counts, product reviews).
*   **Examples:** Cassandra, DynamoDB, CouchDB.

## 3. PACELC: The Modern Extension

The CAP theorem only describes what happens *during a network failure*. PACELC extends this to describe what happens during normal operation.

**PACELC** stands for:
If there is a **P**artition, how does the system trade off **A**vailability and **C**onsistency?
**E**lse (during normal operation), how does the system trade off **L**atency and **C**onsistency?

For example, DynamoDB is a **PA/EL** system. During a partition, it chooses Availability. During normal operation, it chooses low Latency (by not forcing every read to instantly sync across all nodes, accepting Eventual Consistency).
