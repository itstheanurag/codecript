---
title: ACID & Transactions
order: 5
---

# ACID and Database Transactions

A transaction is a single logical unit of work that accesses and possibly modifies the contents of a database. To ensure data integrity, every transaction must follow the **ACID** properties.

## 1. Atomicity (All or Nothing)

A transaction must be completed in its entirety. If any part of the transaction fails, the whole transaction fails and the database is rolled back to its previous state.

- **Example**: In a bank transfer, if the "subtract" succeeds but the "add" fails, the subtract must be undone.

## 2. Consistency (Valid State)

A transaction must move the database from one valid state to another. It ensures that all data follows all defined rules (constraints, cascades, triggers).

- **Example**: If a bank account cannot have a negative balance, a transaction that would result in a negative balance must fail.

## 3. Isolation (Independence)

Transactions occur independently of each other. If multiple transactions are running at the same time, the result should be the same as if they were running sequentially.

- **Issue**: Concurrent transactions can cause **Diry Reads**, **Non-repeatable Reads**, or **Phantom Reads**.
- **Isolation Levels**:
  - `Read Uncommitted`: Lowest, allows dirty reads.
  - `Read Committed`: Prevents dirty reads.
  - `Repeatable Read`: Prevents non-repeatable reads.
  - `Serializable`: Highest, prevents all issues by locking data.

## 4. Durability (Persistence)

Once a transaction is committed, it remains committed even in the event of a system failure (e.g., power outage).

- **Example**: The database writes the transaction to a non-volatile log (**Write-Ahead Log** or WAL) before acknowledging success to the user.

---

## Distributed Transactions: The CAP Theorem

In distributed systems, it's difficult to maintain ACID properties. The CAP Theorem states that a distributed system can only provide two of the following three guarantees:

1. **Consistency**: Every read receives the most recent write or an error.
2. **Availability**: Every request receives a (non-error) response, without the guarantee that it contains the most recent write.
3. **Partition Tolerance**: The system continues to operate despite an arbitrary number of messages being dropped or delayed by the network between nodes.

> **Interview Summary**: For a local database, talk about **ACID**. For a distributed system, talk about **BASE** (Basically Available, Soft state, Eventual consistency) and the tradeoffs in the **CAP Theorem**.
