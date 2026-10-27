---
title: Joins in Depth
order: 5
description: Inner, left, right, full outer, cross and self joins explained with cardinality, anti-joins, the ON-vs-WHERE trap, fan-out, and how the planner executes them.
---

Normalised data lives in several tables. **A join reassembles it**: it pairs rows from two inputs according to a condition, then keeps or drops pairs depending on the join type.

Almost every "the numbers are wrong" bug in application SQL is a join problem — wrong type, wrong condition, or a cardinality nobody checked. This chapter covers all of it.

## 1. What a join really is

Conceptually, a join is two steps:

1. **Build candidate pairs** — the Cartesian product of the two tables (every row × every row).
2. **Filter pairs** — keep those where the `ON` condition is true.

No real database materialises the product; it uses indexes and hash tables to find matches directly. But this mental model explains the two things people get wrong:

- The `ON` clause is a **filter on pairs**, not "the join direction".
- The number of output rows is determined by **how many pairs match** — the *cardinality*.

```sql
FROM orders AS o
JOIN users  AS u ON u.id = o.user_id
```

If `orders` has 180 rows and every order has exactly one user, the result has 180 rows. If each user had three matching rows in the other table, the result would have 540. Joins **multiply**, they don't merge.

### Cardinality vocabulary

| Relationship | Example | Effect on row count |
|---|---|---|
| 1:1 | `users.id = users_profile.user_id` | unchanged |
| 1:N | `users.id = orders.user_id` | one row per child |
| N:M | `orders ↔ products` via `order_items` | one row per pair |

Before writing a join, state the relationship. If you cannot, you do not yet know what the query returns.

## 2. The join types at a glance

Take `A` (left) and `B` (right), joined on a condition:

| Type | Rows kept | SQL |
|---|---|---|
| **INNER** | only pairs that match | `A JOIN B ON ...` |
| **LEFT** | all of `A`; matching `B` or NULLs | `A LEFT JOIN B ON ...` |
| **RIGHT** | all of `B`; matching `A` or NULLs | `A RIGHT JOIN B ON ...` |
| **FULL OUTER** | all of `A` and all of `B` | `A FULL JOIN B ON ...` |
| **CROSS** | every pair (no condition) | `A CROSS JOIN B` |

`LEFT JOIN` and `RIGHT JOIN` are the same operation with the arguments swapped. That is why experienced engineers write **everything as `LEFT JOIN`**: you read top-to-bottom ("keep users, attach their orders") instead of having to reverse your thinking. `RIGHT JOIN` is not wrong — just harder to review.

## 3. INNER JOIN — the default

Keeps only rows with a match on both sides. This is what plain `JOIN` means.

```sql run
SELECT o.id AS order_id,
       u.full_name,
       o.status,
       o.total_cents / 100.0 AS total
FROM orders AS o
INNER JOIN users AS u ON u.id = o.user_id
WHERE o.status = 'delivered'
ORDER BY o.placed_at DESC
LIMIT 10;
```

**Use it when:** the child row is meaningless without the parent ("orders always have a user"). Rows with no match are *supposed* to vanish.

**Watch out:** an `INNER JOIN` silently drops orphans. If a foreign key is missing or nullable, you may lose data you expected to see. When in doubt, `LEFT JOIN` and inspect the NULLs.

```sql run
-- How many orders point at a missing user? (Should be zero with a FK.)
SELECT COUNT(*) AS orphan_orders
FROM orders AS o
LEFT JOIN users AS u ON u.id = o.user_id
WHERE u.id IS NULL;
```

## 4. LEFT JOIN — keep the left side

Keeps **every row from the left table**, attaching matches from the right. When there is no match, right-side columns are `NULL`.

```sql run
SELECT u.id,
       u.full_name,
       COUNT(o.id) AS order_count
FROM users AS u
LEFT JOIN orders AS o ON o.user_id = u.id
GROUP BY u.id, u.full_name
ORDER BY order_count ASC, u.id
LIMIT 15;
```

### The COUNT trap

`COUNT(*)` counts rows, and an unmatched `LEFT JOIN` still produces **one row** — full of NULLs. So `COUNT(*)` reports `1` for a user with zero orders. Count a right-side column instead, because aggregates ignore NULLs:

```sql run
SELECT COUNT(*)          AS wrong_count,
       COUNT(o.id)       AS right_count
FROM users AS u
LEFT JOIN orders AS o ON o.user_id = u.id
WHERE u.id = 51;
```

**Use it when:** "all X, plus their Y if any" — dashboards, "customers with no orders", optional relationships.

### LEFT JOIN ... IS NULL = anti-join

The unmatched rows are exactly the ones with a NULL key on the right:

```sql run
SELECT u.id, u.full_name, u.created_at
FROM users AS u
LEFT JOIN orders AS o ON o.user_id = u.id
WHERE o.id IS NULL
ORDER BY u.id;
```

This is an **anti-join** ("rows in A with no match in B"). The `NOT EXISTS` form in §9 is usually clearer and optimises at least as well.

## 5. RIGHT JOIN — the mirror image

Keeps every row from the **right** table. It is `LEFT JOIN` with the tables swapped:

```sql run
SELECT p.name, oi.order_id
FROM order_items AS oi
RIGHT JOIN products AS p ON p.id = oi.product_id
WHERE oi.id IS NULL
ORDER BY p.name;
```

The query above finds products that have never been ordered. It is correct, and most reviewers would prefer:

```sql run
SELECT p.name
FROM products AS p
LEFT JOIN order_items AS oi ON oi.product_id = p.id
WHERE oi.id IS NULL
ORDER BY p.name;
```

Same result, same plan, easier to read. Use `RIGHT JOIN` only when the "driving" table genuinely belongs on the right for readability of a complex query.

## 6. FULL OUTER JOIN — reconciliation

Keeps unmatched rows from **both** sides. The classic use case is comparing two datasets: production vs. staging, this month vs. last month, two sources of truth.

```sql run
-- Compare the line items total with the cached order total.
WITH item_totals AS (
  SELECT order_id, SUM(quantity * unit_price_cents) AS computed_cents
  FROM order_items
  GROUP BY order_id
)
SELECT o.id AS order_id,
       o.total_cents     AS stored_cents,
       it.computed_cents AS computed_cents
FROM orders AS o
FULL OUTER JOIN item_totals AS it ON it.order_id = o.id
WHERE o.total_cents IS DISTINCT FROM it.computed_cents
ORDER BY o.id
LIMIT 10;
```

`IS DISTINCT FROM` is required here — a plain `<>` returns unknown when either side is NULL, hiding exactly the mismatches you are hunting.

> [!NOTE]
> MySQL has no `FULL OUTER JOIN`. Emulate it with `LEFT JOIN ... UNION ALL ... RIGHT JOIN ...` (or `UNION` on the two anti-joins). SQL Server, PostgreSQL, Oracle and SQLite 3.39+ support it.

**Use it when:** reconciling two sources; almost never in application CRUD.

## 7. CROSS JOIN — every combination

No condition: each left row pairs with each right row. `n × m` rows. It is the tool for **generating** data rather than finding relationships:

```sql run
-- Every user × every status: the complete grid, including zero counts.
SELECT u.id, s.status
FROM users AS u
CROSS JOIN (VALUES ('pending'), ('paid'), ('shipped')) AS s(status)
WHERE u.id <= 3
ORDER BY u.id, s.status;
```

Also used for date spines (every day × region) and matrix reports. A missing join condition is also a cross join — which is why a forgotten `ON` clause is so dangerous:

```sql
-- 180 orders × 60 users = 10,800 rows. Probably not what you meant.
SELECT COUNT(*) FROM orders CROSS JOIN users;
```

## 8. SELF JOIN — a table joined to itself

Hierarchies ("employee → manager"), comparisons ("same city as"), and consecutive rows are self joins. Aliases are mandatory, because the table appears twice.

```sql run
SELECT e.full_name AS employee,
       e.department,
       m.full_name AS manager
FROM employees AS e
LEFT JOIN employees AS m ON m.id = e.manager_id
ORDER BY e.department, e.full_name;
```

`LEFT JOIN` matters: the CEO has `manager_id IS NULL` and would disappear with an inner join. Chapter 7 shows the recursive-CTE version for whole reporting chains.

## 9. Anti-joins and semi-joins

Two patterns deserve names, because they express intent better than the "shape" of the SQL.

### Semi-join: "does at least one match exist?"

```sql run
SELECT u.id, u.full_name
FROM users AS u
WHERE EXISTS (
  SELECT 1
  FROM orders AS o
  WHERE o.user_id = u.id AND o.status = 'cancelled'
);
```

`EXISTS` stops at the first match, does not duplicate rows, and is NULL-safe. `IN (SELECT ...)` is the other semi-join spelling; `IN` de-duplicates the subquery and can behave badly if the inner column is nullable.

**Never** write `SELECT DISTINCT ... JOIN ...` just to express existence — `EXISTS` says what you mean and lets the planner stop early.

### Anti-join: "no match exists"

```sql run
SELECT u.id, u.full_name
FROM users AS u
WHERE NOT EXISTS (
  SELECT 1 FROM orders AS o WHERE o.user_id = u.id
);
```

Equivalent forms:

| Form | NULL-safe? | Notes |
|---|---|---|
| `NOT EXISTS (...)` | Yes | preferred; planner turns it into a hash/merge anti-join |
| `LEFT JOIN ... WHERE right.id IS NULL` | Yes | fine, but only if the `IS NULL` column is `NOT NULL` in the right table |
| `NOT IN (SELECT nullable_col ...)` | No | returns **zero rows** if any value is NULL |
| `COUNT(*) = 0` per group | Yes | slow, unreadable |

The `NOT IN` failure mode is worth burning into memory. If the subquery returns any NULL, the whole predicate is unknown and no row passes — no error, just silence.

## 10. The `ON` vs `WHERE` trap

With an **outer** join, `ON` and `WHERE` are not interchangeable:

- `ON` decides which pairs match. Unmatched left rows survive with NULLs.
- `WHERE` filters the **final** rows — including the NULL-extended ones.

```sql run
-- Every user is kept: cancelled orders simply appear as NULL.
SELECT u.id, o.id AS order_id
FROM users AS u
LEFT JOIN orders AS o
       ON o.user_id = u.id
      AND o.status = 'cancelled'
WHERE u.id <= 5
ORDER BY u.id;

-- Only users who actually have a cancelled order are kept.
SELECT u.id, o.id AS order_id
FROM users AS u
LEFT JOIN orders AS o ON o.user_id = u.id
WHERE u.id <= 5
  AND o.status = 'cancelled'
ORDER BY u.id;
```

With an `INNER JOIN` the two produce the same rows, which is why the bug only appears after someone changes `JOIN` to `LEFT JOIN`.

**Rule:** filter the *right table's* attributes in `ON` when the left side must survive; filter *final* results in `WHERE`.

## 11. Compound, non-equi, and post-join joins

Joins are not limited to `id = id`.

```sql run
-- Compound key: an order "contains" a product once.
SELECT oi.order_id, oi.product_id, oi.quantity
FROM order_items AS oi
JOIN products AS p
  ON p.id = oi.product_id
 AND p.in_stock
LIMIT 10;
```

```sql run
-- Non-equi (inequality) join: who earns less than their department manager?
SELECT e.full_name, e.salary_cents / 100.0 AS salary,
       m.full_name AS manager, m.salary_cents / 100.0 AS manager_salary
FROM employees AS e
JOIN employees AS m
  ON m.id = e.manager_id
 AND e.salary_cents < m.salary_cents
ORDER BY e.salary_cents DESC;
```

Range joins (`BETWEEN`, `<`, `>=`) are common for time windows and price bands, but they cannot use a plain B-tree equality lookup — expect a nested-loop or hash plan, and keep inputs small.

`LATERAL` (PostgreSQL, MySQL 8.0.14+, SQL Server via `CROSS APPLY`, Oracle via `CROSS APPLY`) is a join whose right side may reference the left row — the tool for "top 3 orders per user" without window functions. See [chapter 3](/databases/sql/003-set-operations-and-subqueries).

## 12. Fan-out: the duplicate factory

A **1:N** join multiplies the left row. If you then aggregate the left side's column, you count it once per child:

```sql run
-- Wrong: the order total is repeated once per line item.
SELECT SUM(o.total_cents) / 100.0 AS inflated_revenue
FROM orders AS o
JOIN order_items AS oi ON oi.order_id = o.id;

-- Right: aggregate each table at its own grain, then combine.
SELECT (SELECT SUM(total_cents) FROM orders) / 100.0 AS order_revenue,
       (SELECT SUM(quantity * unit_price_cents) FROM order_items) / 100.0 AS item_revenue;
```

The same fan-out explains:

- `COUNT(*)` larger than the number of parents.
- `AVG` skewed toward parents with more children (weighted average instead of row average).
- `DISTINCT` sprinkled everywhere to "fix" duplicates — that hides the bug and costs a sort.

**Diagnostic:** run `SELECT COUNT(*)` on each input and on the joined result. If the join output is larger than the "one row per parent" count, you have fan-out. Decide whether you want per-parent aggregation (`GROUP BY parent.id`) or pre-aggregated subqueries.

## 13. How the planner executes a join

You write one join; the planner picks an algorithm per join:

| Algorithm | How it works | Good when |
|---|---|---|
| **Nested loop** | For each outer row, look up matches in the inner table (ideally an index) | small outer side, indexed inner side, `LIMIT` queries |
| **Hash join** | Build a hash table on the smaller input, probe it with the larger | large unsorted inputs, equality joins |
| **Merge join** | Sort both inputs on the key, then zip them | both inputs already sorted / index order, large data |

Consequences:

- An index on the **join key** (`orders.user_id`) turns a nested loop into a fast lookup; without it, you get repeated sequential scans.
- The planner chooses the **build side** of a hash join based on statistics — stale `ANALYZE` data leads to bad choices.
- Join order is not your `FROM` order. The planner reorders inner joins freely; `JOIN` order only constrains `LEFT`/`RIGHT` semantics.

Chapter 10 shows how to read this in `EXPLAIN ANALYZE`.

## 14. Choosing the join type

| Question | Answer |
|---|---|
| Must a match exist? | `JOIN` (inner) |
| Must every left row survive? | `LEFT JOIN` |
| Must every right row survive? | `RIGHT JOIN`, or swap to `LEFT JOIN` |
| Must both survive (reconciliation)? | `FULL OUTER JOIN` |
| Do I need all combinations? | `CROSS JOIN` |
| Do I need existence, not columns? | `EXISTS` / `NOT EXISTS` |
| Does the right side depend on the left row? | `JOIN LATERAL` |
| Same table twice? | self join with aliases |

## 15. Practice

Try these in the [playground](/playground) before reading the solutions — they combine everything above.

1. List every user with their number of delivered orders, including users with zero.
2. Find products that have never appeared in `order_items`.
3. For each order, show the user's country and the number of distinct products in the order.
4. Show every employee and their manager's manager (two self joins).
5. Why can the following query return fewer rows than `SELECT COUNT(*) FROM users`?
   ```sql
   SELECT COUNT(*) FROM users JOIN orders ON orders.user_id = users.id;
   ```

> [!TIP]
> **ELI5: Joins are introductions**
> `INNER JOIN` is a party where you only talk to people you already know. `LEFT JOIN` is you standing at the door greeting *everyone* on the guest list and writing "didn't show" for the no-shows. `FULL OUTER JOIN` is comparing two guest lists after the party to find both no-shows and crashers. `CROSS JOIN` is introducing every guest to every other guest — and is exactly why the room gets crowded.

## 16. Checklist

- [ ] I can name the grain of the result ("one row per …").
- [ ] I know the cardinality of each join (1:1 / 1:N / N:M).
- [ ] Outer-join right-table filters are in `ON`, not `WHERE`.
- [ ] `COUNT(*)` on a `LEFT JOIN` is intentional; otherwise `COUNT(right.id)`.
- [ ] Existence checks use `EXISTS`, not `DISTINCT` or `COUNT(*) > 0`.
- [ ] No `NOT IN` against a nullable column.
- [ ] Join keys are indexed and have fresh statistics.
- [ ] The result row count matches my expectation before I aggregate it.
