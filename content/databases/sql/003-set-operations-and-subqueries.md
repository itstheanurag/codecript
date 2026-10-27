---
title: Set Operations & Subqueries
order: 6
description: UNION vs UNION ALL, INTERSECT and EXCEPT, scalar and correlated subqueries, IN vs EXISTS, derived tables, and LATERAL joins.
---

Joins combine **columns** from two tables side by side. Set operations and subqueries solve different problems:

- **Set operations** stack rows from two queries vertically.
- **Subqueries** embed one query inside another — to produce a value, a list, a table, or a yes/no test.

They are how you turn a multi-step question into one statement, and how SQL stays composable.

## 1. Set operations: stacking result sets

| Operator | Meaning | Duplicates |
|---|---|---|
| `UNION` | rows in A **or** B | removed |
| `UNION ALL` | rows in A **or** B | kept |
| `INTERSECT` | rows in **both** A and B | removed |
| `EXCEPT` | rows in A **not** in B | removed |

Rules that trip people up:

- Both sides must have the **same number of columns**, with compatible types, in the same order. Column names come from the **first** query.
- `ORDER BY` applies to the **whole result** and goes at the very end. It cannot appear inside a branch.
- `INTERSECT` binds tighter than `UNION`/`EXCEPT`; parenthesise if you mean otherwise.
- Only `UNION`/`INTERSECT`/`EXCEPT` support `ALL` in PostgreSQL (`UNION ALL`, `INTERSECT ALL`, `EXCEPT ALL`); MySQL supports only `UNION [ALL]`.

```sql run
-- One list of "people involved in this order", with no duplicate customers.
SELECT u.full_name AS person, 'customer' AS role
FROM users AS u
WHERE u.id <= 5

UNION

SELECT e.full_name AS person, 'employee' AS role
FROM employees AS e
WHERE e.department = 'Operations'

ORDER BY person;
```

### Prefer `UNION ALL` unless you need de-duplication

`UNION` must sort or hash the entire result to remove duplicates. If you know the branches are disjoint (or duplicates are acceptable), `UNION ALL` is strictly faster:

```sql run
-- Count orders by fabricating two disjoint buckets.
SELECT 'large' AS bucket, COUNT(*) AS n FROM orders WHERE total_cents >= 50000
UNION ALL
SELECT 'small' AS bucket, COUNT(*) AS n FROM orders WHERE total_cents <  50000;
```

Only reach for `UNION` when you genuinely need set semantics.

### `EXCEPT` is the anti-join of sets

```sql run
-- Users who have never placed an order.
SELECT id FROM users
EXCEPT
SELECT user_id FROM orders;
```

This is tidy, but note the behaviours: it de-duplicates both sides (extra sort), and unlike `NOT IN`, `EXCEPT` **does** treat NULL correctly as a value. For large tables, `NOT EXISTS` is usually cheaper and more index-friendly.

## 2. The four subquery shapes

| Shape | Returns | Appears in | Example |
|---|---|---|---|
| **Scalar** | exactly one row, one column | `SELECT`, `WHERE`, `SET` | `(SELECT MAX(total_cents) FROM orders)` |
| **Row** | one row, several columns | `WHERE (a,b) = (...)` | `(status, user_id) = ('paid', 7)` |
| **Table** | any number of rows/columns | `FROM`, `JOIN`, `IN` | `FROM (SELECT ...) AS t` |
| **Correlated** | depends on the outer row | `WHERE`, `SELECT` | `WHERE o.user_id = u.id` |

### Scalar subqueries

```sql run
SELECT id,
       total_cents,
       total_cents - (SELECT AVG(total_cents) FROM orders) AS diff_from_avg
FROM orders
ORDER BY total_cents DESC
LIMIT 5;
```

If a scalar subquery returns **more than one row**, PostgreSQL raises an error; if it returns **no rows**, the value is `NULL` (not an error). That silent NULL is a common source of wrong math — wrap it in `COALESCE` when "missing" should mean zero.

### Table subqueries (derived tables)

A query in `FROM` must be aliased. This is how you filter the result of an aggregate or window function:

```sql run
SELECT country, orders
FROM (
  SELECT u.country, COUNT(o.id) AS orders
  FROM users AS u
  LEFT JOIN orders AS o ON o.user_id = u.id
  GROUP BY u.country
) AS per_country
WHERE orders > 20
ORDER BY orders DESC;
```

Chapters 5 and 7 replace many derived tables with window functions and CTEs — but the concept (query as a table) is the same.

## 3. `IN`, `EXISTS`, `ANY`, `ALL`

All four test membership or existence. They are not interchangeable in cost or in NULL behaviour.

```sql
-- Semi-join with IN: list of values
SELECT * FROM users WHERE id IN (1, 2, 3);

-- Semi-join with a subquery
SELECT * FROM users WHERE id IN (SELECT user_id FROM orders);

-- Existence test (usually the best choice)
SELECT * FROM users AS u
WHERE EXISTS (SELECT 1 FROM orders AS o WHERE o.user_id = u.id);

-- ANY / ALL are the explicit forms of IN / NOT IN
SELECT * FROM users WHERE id = ANY (SELECT user_id FROM orders);
SELECT * FROM orders WHERE total_cents > ALL (SELECT total_cents FROM orders WHERE status = 'pending');
```

Guidance:

- **`EXISTS` / `NOT EXISTS`** — best default for correlated existence; NULL-safe; can stop at the first match.
- **`IN (subquery)`** — fine for small, non-nullable sets; PostgreSQL can turn it into a semi-join. With NULLs it degrades to unknown (see below).
- **`IN (literal list)`** — fine, but a list of thousands of values is a smell; use a `VALUES` join or a temporary table instead.
- **`NOT IN`** — avoid when the subquery column is nullable. `NOT IN (1, NULL)` is never true.
- **`ANY`/`ALL`** — precise, but rarely read as easily as `EXISTS` or an aggregate comparison.

> [!WARNING]
> `NOT IN` + NULL = empty result, no error. If you must use it, add `WHERE col IS NOT NULL` inside the subquery, or switch to `NOT EXISTS`.

## 4. Correlated subqueries

A correlated subquery references a column from the outer query, so conceptually it runs **per outer row**:

```sql run
SELECT u.id, u.full_name,
       (SELECT COUNT(*) FROM orders AS o WHERE o.user_id = u.id) AS orders
FROM users AS u
ORDER BY orders DESC, u.id
LIMIT 10;
```

This is readable, and the planner often rewrites it into a join or a hash aggregate. But it is not guaranteed — with a non-indexed correlation column you can get a nested loop with a full scan per row (the SQL version of N+1). Chapter 10 shows how to check.

The join formulation is usually the safer default when you need several correlated values:

```sql run
SELECT u.id, u.full_name,
       COUNT(o.id) AS orders,
       COALESCE(SUM(o.total_cents), 0) / 100.0 AS revenue
FROM users AS u
LEFT JOIN orders AS o ON o.user_id = u.id
GROUP BY u.id, u.full_name
ORDER BY orders DESC, u.id
LIMIT 10;
```

## 5. `LATERAL`: the join that sees the row

A normal subquery in `FROM` cannot see the tables to its left. `LATERAL` lifts that restriction, so it works like a `foreach` loop in the query:

```sql run
-- Top 2 most expensive orders per user.
SELECT u.id, u.full_name, top.id AS order_id, top.total_cents / 100.0 AS total
FROM users AS u
CROSS JOIN LATERAL (
  SELECT o.id, o.total_cents
  FROM orders AS o
  WHERE o.user_id = u.id
  ORDER BY o.total_cents DESC
  LIMIT 2
) AS top
ORDER BY u.id, top.total_cents DESC
LIMIT 20;
```

`CROSS JOIN LATERAL` drops users with no orders; `LEFT JOIN LATERAL ... ON true` keeps them with NULLs. Most databases spell this `CROSS APPLY` / `OUTER APPLY`.

Use it when:

- You need the **top N per group** and prefer not to window (see chapter 5).
- The right side is a function call that takes the left row (`generate_series`, a set-returning function).
- You want "the most recent row per parent" with an index on `(parent_id, created_at DESC)` — a lateral `LIMIT 1` can be extremely fast.

Do **not** use it to hide a join: if the subquery has no `LIMIT` and no aggregate, it is probably just a join.

## 6. Choosing between the forms

| Need | Use |
|---|---|
| Combine rows from two different queries | `UNION ALL` (or `UNION` if dedupe needed) |
| "Is there at least one match?" | `EXISTS` |
| "No match exists" | `NOT EXISTS` |
| One value from another table | Scalar subquery, or `JOIN` + aggregate |
| A list of ids to filter by | `IN` / `ANY` (watch NULLs) |
| A query used as a table | Derived table or CTE |
| Per-row top-N / set-returning function | `LATERAL` |
| Readability for a long pipeline | CTE (chapter 7) |

## 7. Practice

1. Produce one list of user emails and employee names with a `role` column, no duplicates.
2. Find users who have ordered products from every category (hint: `GROUP BY user, category` + `HAVING COUNT(DISTINCT category)`).
3. Rewrite `SELECT * FROM users WHERE id NOT IN (SELECT user_id FROM orders)` so it cannot silently return nothing.
4. Write a query that returns each user's most recent order using `LEFT JOIN LATERAL`.
5. Explain why the scalar subquery `(SELECT SUM(total_cents) FROM orders)` is computed once, but `(SELECT SUM(o.total_cents) FROM orders o WHERE o.user_id = u.id)` is conceptually computed per user.

> [!TIP]
> **ELI5: Subqueries are questions inside questions**
> "Give me the customers (*who have ordered something*)" — the part in italics is a subquery. `EXISTS` asks "yes or no?", `IN` asks "is it in this list?", and `LATERAL` asks the same question *once per customer*, which is why it can be slower if the list is long.

## 8. Checklist

- [ ] `UNION ALL` unless de-duplication is required.
- [ ] Both sides of a set operation have matching column counts and types.
- [ ] `ORDER BY` is at the end, never inside a set branch.
- [ ] `NOT IN` subqueries filter out NULLs (or use `NOT EXISTS`).
- [ ] Scalar subqueries are guaranteed to return at most one row.
- [ ] Correlated subqueries are checked in `EXPLAIN` for repeated scans.
- [ ] Derived tables have aliases and meaningful column names.
- [ ] `LATERAL` is used for top-N per group, not as a disguised join.
