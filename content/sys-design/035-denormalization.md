---
title: Denormalization
order: 35
---

In traditional database design (RDBMS), we focus on **Normalization**. We split data into multiple tables to avoid duplication and ensure data integrity.

However, as systems scale, **Joins** become expensive and slow.

**Denormalization** is the process of intentionally adding redundant data to a database to speed up read operations.

---

## Why Denormalize?

-   **Performance**: Avoid complex JOINS across multiple large tables.
-   **Read Efficiency**: Fetch all the data you need for a UI component in a single query.
-   **Scalability**: Distributed databases (like NoSQL) often *require* denormalization because they don't support efficient joins across nodes.

---

## Example: Social Media Post

### Normalized (Pure SQL)
- `Users` table (id, name, avatar)
- `Posts` table (id, user_id, content)

To show a feed, you must JOIN `Posts` with `Users` for every single post to get the author's name and avatar.

### Denormalized
- `Posts` table (id, user_id, content, **user_name**, **user_avatar**)

Now, you can show the feed by querying *only* the `Posts` table. No joins required.

---

## The Trade-off (The Data Integrity Cost)

Denormalization is not "free". You pay for it with:

1.  **Storage Space**: You are storing the same data (user name) in thousands of post records.
2.  **Write Complexity**: If a user changes their name, you must update it in the `Users` table AND all their `Posts` records.
3.  **Inconsistency**: If the update fails halfway, some posts will show the old name and some the new name (**Eventual Consistency**).

---

## When to Use It?

-   **High Read-to-Write Ratio**: If data is read 1,000 times for every 1 time it's updated, denormalization is a great win.
-   **Massive Scale**: When joins are simply too slow to meet your P99 latency targets.
-   **NoSQL Environments**: In DynamoDB or Cassandra, you "design your data around your queries."

---

## Key Takeaways

-   **Normalization** optimizes for **Storage** and **Integrity**.
-   **Denormalization** optimizes for **Read Speed**.
-   In modern system design, we almost always prefer **Read Speed** over storage costs.

> Don't be afraid of duplicating data. At scale, disk space is cheap, but user waiting time is expensive.
