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
