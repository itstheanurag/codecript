---
title: SQL Query Optimization
order: 4
---

# SQL Query Optimization

Writing SQL that returns the correct result is only step one. Writing SQL that executes *efficiently* under load is what separates junior engineers from seniors. 

## 1. Indexing Strategy

Indexes are the single most effective tool for query optimization.

> [!TIP]
> **ELI5: The Cookbook Index**
> Imagine trying to find the recipe for "Chocolate Cake" in a 1,000-page cookbook without an index. You would have to flip through every single page from beginning to end (**Full Table Scan**).
> 
> Instead, you go to the back of the book, look at the alphabetical index (**B-Tree Index**), find "Chocolate Cake: pg 402", and jump directly there (**Index Scan**). It takes 2 seconds instead of 2 hours.

### When to Index
*   Columns frequently used in `WHERE` clauses.
*   Columns used for `JOIN` conditions (Foreign Keys).
*   Columns used for sorting (`ORDER BY`).

### The Cost of Indexes
Indexes are not free. Every time a row is `INSERT`ed, `UPDATE`d, or `DELETE`d, all corresponding indexes must be synchronously updated. Too many indexes will kill write performance.

## 2. The N+1 Query Problem

The most common performance killer in applications using ORMs (Object-Relational Mappers).

> [!TIP]
> **ELI5: The Waiter and the Kitchen**
> You have a table of 10 people who all ordered soup. 
> *   **N+1 Problem:** The waiter walks to the kitchen, gets ONE bowl of soup, walks back to the table, gives it to person 1. Walks back to the kitchen, gets bowl 2... doing this 10 separate times (10 slow network trips).
> *   **The Solution (Eager Loading/Joins):** The waiter carries a massive tray, gets all 10 bowls at once in the kitchen, and makes exactly ONE trip to the table.

**The Problem in Code:**
Fetching a list of posts, and then looping through them to fetch the author for each post.

```javascript
// BAD (N+1 scenario in Node.js)
const posts = await db.query("SELECT * FROM posts LIMIT 10"); // 1 query

for (const post of posts) {
    // We execute N more queries inside the loop! Very slow!
    const author = await db.query(`SELECT * FROM authors WHERE id = ${post.author_id}`); 
    post.authorName = author.name;
}
```

**The Solution:**
Fetch everything in a single query using a `JOIN`, or use an `IN` clause to batch fetch the authors.

```javascript
// GOOD (Using a JOIN)
const postsWithAuthors = await db.query(`
    SELECT p.*, a.name as author_name 
    FROM posts p
    JOIN authors a ON p.author_id = a.id
    LIMIT 10
`); // Exactly 1 query executed
```

## 3. Common Performance Pitfalls

### Avoid `SELECT *`
Only request the columns you actually need. `SELECT *` increases memory usage and network payload.

### Avoid Non-SARGable Queries
SARGable stands for "Search Argument Able". A query is non-SARGable if it prevents the database from utilizing an index, forcing a full table scan.

*   **BAD (Functions on indexed columns):**
    `SELECT * FROM users WHERE YEAR(created_at) = 2023;` (Cannot use an index).
*   **GOOD:**
    `SELECT * FROM users WHERE created_at >= '2023-01-01' AND created_at < '2024-01-01';` (Can use an index).

### Keyset Pagination (Cursor Pagination)
Standard `OFFSET / LIMIT` pagination becomes exponentially slower as you go deeper into pages. `OFFSET 100000 LIMIT 10` requires the database to read and discard 100,000 rows.

**Solution: Keyset Pagination**
Instead of relying on offset, remember the last seen ID and query starting from there.

```sql
-- Keyset Pagination (Extremely Fast, uses index)
SELECT * FROM users 
WHERE id > 100000 
ORDER BY id ASC 
LIMIT 10;
```
