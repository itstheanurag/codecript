---
title: SQL Fundamentals
order: 3
---

Structured Query Language (SQL) is the standard language for communicating with Relational Databases.

## 1. Core DML Statements

Data Manipulation Language (DML) is used to interact with the data stored within tables.

### SELECT (Read)
```sql
SELECT id, email, created_at 
FROM users 
WHERE status = 'active' 
ORDER BY created_at DESC 
LIMIT 10;
```

### INSERT (Create)
```sql
INSERT INTO users (username, email, password_hash)
VALUES ('alice123', 'alice@example.com', 'hashed_pw')
RETURNING id;
```

### UPDATE (Update)
**Always ensure you have a `WHERE` clause** to avoid updating the entire table!
```sql
UPDATE users 
SET status = 'suspended', updated_at = NOW()
WHERE id = 451;
```

### DELETE (Delete)
Like `UPDATE`, **always use a `WHERE` clause**.
```sql
DELETE FROM sessions 
WHERE expires_at < NOW();
```

## 2. Joins: Combining Data

Relational databases store data across multiple normalized tables. Joins allow you to retrieve related data in a single query.

> [!TIP]
> **ELI5: Visualizing JOINs with Venn Diagrams**
> Think of two tables as overlapping circles. 
> *   **INNER JOIN:** Only the overlapping middle part (Users who *have* placed Orders).
> *   **LEFT JOIN:** The entire left circle, plus the overlap (ALL Users, and their orders *if* they have any; otherwise, the order details are blank/NULL).

### INNER JOIN
Returns records that have matching values in **both** tables.

```sql
SELECT orders.id, users.email, orders.total
FROM orders
INNER JOIN users ON orders.user_id = users.id;
```

### LEFT JOIN
Returns all records from the left table (`users`), and the matched records from the right table (`orders`). If there is no match, the result is `NULL` from the right side.

```sql
SELECT users.username, orders.id
FROM users
LEFT JOIN orders ON users.id = orders.user_id;
```

### RIGHT JOIN and FULL OUTER JOIN
*   **RIGHT JOIN** keeps every row from the right table (the mirror image of `LEFT JOIN`).
*   **FULL OUTER JOIN** keeps unmatched rows from **both** sides — the tool for reconciling two datasets.

```sql
-- Products that have never been ordered
SELECT p.name
FROM products AS p
LEFT JOIN order_items AS oi ON oi.product_id = p.id
WHERE oi.id IS NULL;

-- Every user and every order, including both kinds of mismatch
SELECT u.id, o.id
FROM users AS u
FULL OUTER JOIN orders AS o ON o.user_id = u.id;
```

> [!WARNING]
> With an outer join, a filter on the right table belongs in `ON`, not `WHERE`. In `WHERE`, `o.status = 'paid'` silently turns your `LEFT JOIN` back into an `INNER JOIN`.


## 3. Aggregation and Grouping

When analyzing data, you often need to calculate summaries (count, sum, average) across groups of records.

### GROUP BY
Groups rows that have the same values into summary rows.

```sql
SELECT department, COUNT(id) as total_employees
FROM employees
GROUP BY department;
```

### HAVING
The `HAVING` clause was added to SQL because the `WHERE` keyword cannot be used with aggregate functions. It filters the grouped results.

```sql
SELECT department, AVG(salary) as average_salary
FROM employees
GROUP BY department
HAVING AVG(salary) > 80000;
```

## 4. Advanced: CTEs and Window Functions

### Common Table Expressions (CTEs)
A CTE creates a temporary result set that you can reference within another statement. It drastically improves the readability of complex, nested queries.

```sql
WITH ActiveHighValueUsers AS (
    SELECT id, username FROM users WHERE lifetime_value > 1000
)
SELECT u.username, COUNT(o.id) as order_count
FROM ActiveHighValueUsers u
JOIN orders o ON u.id = o.user_id
GROUP BY u.username;
```

### Window Functions
Window functions perform calculations across a set of related rows *without* collapsing them into a single row like `GROUP BY` does.

```sql
-- Rank employees by salary within their department
SELECT 
    name, 
    department, 
    salary,
    RANK() OVER (PARTITION BY department ORDER BY salary DESC) as rank
FROM employees;
```

## 5. Going deeper

This page is the map, not the territory. Each topic has a full chapter with edge cases, performance notes, and runnable examples:

- **[How SQL Actually Runs](/databases/sql/001-sql-execution-model)** — logical clause order and NULL semantics.
- **[Joins in Depth](/databases/sql/002-joins-in-depth)** — every join type, anti-joins, fan-out, join algorithms.
- **[Aggregation & Grouping](/databases/sql/004-aggregation-and-grouping)** — `COUNT` traps, `FILTER`, `ROLLUP`, top-N per group.
- **[Window Functions](/databases/sql/005-window-functions)** — frames, ranking, running totals, de-duplication.
- **[CTEs & Recursive Queries](/databases/sql/007-ctes-and-recursive-queries)** — readable pipelines and hierarchies.
- **[Indexes & Query Plans](/databases/sql/010-indexes-and-query-plans)** — why some queries ignore your index.

Run any of them yourself in the [SQL Playground](/playground).

```sql run
SELECT department,
       COUNT(*)                          AS people,
       ROUND(AVG(salary_cents) / 100.0)  AS avg_salary
FROM employees
GROUP BY department
ORDER BY avg_salary DESC;
```
