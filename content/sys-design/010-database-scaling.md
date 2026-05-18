---
title: Database Scaling
order: 10
---

As your application grows, the database will almost always become the bottleneck before your web servers do. Web servers are stateless and easily scaled horizontally. Databases store state, making them notoriously difficult to scale.

## 1. Vertical Scaling (Scaling Up)

The easiest way to scale a database is to just buy a bigger server.

> [!TIP]
> **ELI5: The Moving Truck**
> *   **Vertical Scaling:** You have a pickup truck. You need to move more furniture. You sell the pickup and buy a massive 18-wheeler semi-truck. It's conceptually easy (just one driver, one truck), but eventually, there is no bigger truck you can buy.
> *   **Horizontal Scaling:** Instead of buying one massive semi-truck, you buy a fleet of 50 normal pickup trucks.

*   **Pros:** Requires zero changes to your application code. Maintains strict ACID transactions easily.
*   **Cons:** Expensive. Has a hard physical limit. Does not provide high availability (if the one big server crashes, the site goes down).

## 2. Read Replicas (Scaling Reads)

Most web applications are extremely read-heavy (e.g., Twitter: 1 person writes a tweet, 10,000 people read it). You can offload these reads to secondary servers.

```mermaid
architecture-beta
    group dbcluster(cloud)[Database Cluster]
    
    service master(database)[Master DB (Writes)] in dbcluster
    service slave1(database)[Read Replica 1] in dbcluster
    service slave2(database)[Read Replica 2] in dbcluster
    
    master:B --> T:slave1
    master:B --> T:slave2
```

1.  **Master Node:** Receives all `INSERT`, `UPDATE`, and `DELETE` queries.
2.  **Replication:** The Master asynchronously copies the new data to the Slave nodes.
3.  **Read Replicas (Slaves):** Receive all `SELECT` queries. 

*   **The Catch (Eventual Consistency):** Because replication is asynchronous, a user might update their profile on the Master, and immediately refresh the page. The read query hits a Slave that hasn't synced yet, showing the old profile.

## 3. Sharding (Scaling Writes Horizontally)

When a single Master database can no longer handle the sheer volume of write requests, you must partition the data across multiple independent database servers. This is called Sharding.

> [!TIP]
> **ELI5: The Phonebook**
> Imagine trying to print the phonebook for the entire world into one giant, 5,000-pound book. It's impossible to carry or search quickly.
> **Sharding** is printing a separate, normal-sized phonebook for every single city. If you need a number in Chicago, you just grab the Chicago book (the Chicago Shard).

### How to Shard (The Partition Key)
You must choose a logic (a Shard Key) to determine which server gets which data.
*   **Range-Based:** Users A-M go to Shard 1. Users N-Z go to Shard 2. (Danger: If 80% of your users start with 'A', Shard 1 will crash while Shard 2 sits empty).
*   **Hash-Based:** Run a mathematical hash on the `user_id` to distribute users perfectly evenly across all shards.

### The Dangers of Sharding
*   **Complex Queries:** You can no longer run a simple `JOIN` across users if User A is on Shard 1 and User B is on Shard 5. 
*   **Resharding:** If you need to add a new shard later, rebalancing the data across the new servers is incredibly complex and risky.

> [!WARNING]
> Do not shard a relational database until it is absolutely necessary. It introduces massive operational and architectural complexity. Explore caching, read replicas, and vertical scaling first.
