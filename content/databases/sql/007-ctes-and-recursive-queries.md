---
title: CTEs & Recursive Queries
order: 10
description: WITH clauses for readable query pipelines, CTE materialisation rules, data-modifying CTEs, and recursive queries for hierarchies and graphs.
---

A **Common Table Expression (CTE)** is a named query you can reference inside a larger statement. It is the closest SQL has to "let me define a variable", and it does two very different jobs:

1. **Readability** — turn a nested query into a top-to-bottom pipeline.
2. **Recursion** — walk hierarchies and graphs that a plain join cannot express.

## 1. Basic syntax

```sql
WITH name AS (
  SELECT ...
),
another AS (
  SELECT ... FROM name ...
)
SELECT ... FROM another;
```

Later CTEs can reference earlier ones. The final statement sees all of them. Order matters: a CTE cannot reference one defined below it.

```sql run
WITH paid_orders AS (
  SELECT id, user_id, total_cents
  FROM orders
  WHERE status IN ('paid', 'shipped', 'delivered')
),
per_user AS (
  SELECT user_id, COUNT(*) AS orders, SUM(total_cents) AS revenue_cents
  FROM paid_orders
  GROUP BY user_id
)
SELECT u.full_name,
       p.orders,
       p.revenue_cents / 100.0 AS revenue
FROM per_user AS p
JOIN users AS u ON u.id = p.user_id
ORDER BY p.revenue_cents DESC
LIMIT 10;
```

Compare the subquery version:

```sql
SELECT u.full_name, p.orders, p.revenue_cents / 100.0
FROM (
  SELECT user_id, COUNT(*) AS orders, SUM(total_cents) AS revenue_cents
  FROM (
    SELECT id, user_id, total_cents
    FROM orders
    WHERE status IN ('paid', 'shipped', 'delivered')
  ) AS paid_orders
  GROUP BY user_id
) AS p
JOIN users AS u ON u.id = p.user_id;
```

Same result, read inside-out. CTEs read outside-in, which is why they dominate in analytics code.

## 2. What a CTE is *not*

| Tool | Lifetime | Stored? | Use when |
|---|---|---|---|
| **CTE** | one statement | no | readability, recursion, reuse within a query |
| **Derived table** (`FROM (SELECT ...)`) | one statement | no | small local subquery, no reuse |
| **View** | permanent | definition only | reusable logic across queries |
| **Materialized view** | permanent | **yes, as data** | expensive aggregate, refreshed periodically |
| **Temp table** | session | yes (disk/memory) | multi-step ETL, indexes, statistics |
| **Table** | permanent | yes | real data |

A CTE is *not* a temp table: it disappears at the end of the statement, and in modern PostgreSQL it is usually **inlined** into the surrounding query — so it does not necessarily act as an optimisation fence (see §4).

## 3. Data-modifying CTEs

`WITH` can wrap `INSERT`, `UPDATE` or `DELETE` with `RETURNING`, and the outer statement can use those rows. This is how you do "insert the parent, then the children, in one round trip":

```sql run
WITH new_order AS (
  INSERT INTO orders (user_id, status, placed_at, total_cents)
  VALUES (7, 'pending', now(), 0)
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents)
SELECT new_order.id, p.id, 1, p.price_cents
FROM new_order
CROSS JOIN products AS p
WHERE p.id IN (3, 8);
```

Details that matter:

- The whole statement is **atomic** — if the second insert fails, the first is rolled back.
- `RETURNING` is the only way to feed the inserted rows into another part of the statement.
- A data-modifying CTE that is **not referenced** by the final query still executes (in PostgreSQL), but relying on that is fragile. Always reference it.
- You cannot `SELECT` the same data-modifying CTE twice — each CTE is evaluated once.

> [!NOTE]
> MySQL 8 supports `WITH` but **not** data-modifying CTEs. SQL Server uses `OUTPUT` instead of `RETURNING` and also disallows DML in CTEs.

## 4. Materialisation: the PostgreSQL optimisation rule

This is a frequent interview question and a frequent surprise.

**PostgreSQL 12+** inlines a non-recursive CTE into the outer query when:

- it is referenced **once**, and
- it has no side effects (no volatile functions, no data-modifying statements).

Inlined means the planner can push predicates into it, use indexes, and reorder joins — which is usually what you want. If the CTE is referenced **multiple times**, or is recursive, it is materialised (computed once, stored in memory/temp).

You can force either behaviour:

```sql
WITH expensive AS MATERIALIZED (       -- compute once, don't inline
  SELECT user_id, SUM(total_cents) AS revenue
  FROM orders GROUP BY user_id
)
SELECT * FROM expensive WHERE revenue > 100000;

WITH cheap AS NOT MATERIALIZED (       -- always inline, push filters in
  SELECT * FROM orders WHERE status = 'paid'
)
SELECT * FROM cheap WHERE user_id = 7;
```

Rules of thumb:

- **One reference, simple filters** → inlining is better; do nothing.
- **Multiple references** → materialised by default; correct, but watch memory.
- **A filter would make the CTE cheaper** (huge table, selective outer `WHERE`) → `NOT MATERIALIZED` so the filter can be pushed down.
- **The CTE is expensive and reused** → `MATERIALIZED` to avoid computing it twice.

> [!WARNING]
> Before PostgreSQL 12, **every** CTE was an optimisation fence. Advice you find in older blog posts ("CTEs are slow") is about that behaviour and no longer applies by default.

## 5. Recursive CTEs

A recursive CTE has three parts:

```sql
WITH RECURSIVE tree AS (
  -- 1. Anchor: starting rows
  SELECT ...
  FROM ...

  UNION ALL          -- or UNION to de-duplicate

  -- 2. Recursive term: references `tree` itself
  SELECT ...
  FROM some_table
  JOIN tree ON ...
)
-- 3. Final query
SELECT * FROM tree;
```

Execution is iterative: evaluate the anchor, then repeatedly evaluate the recursive term against the **previous iteration's** rows, until it produces zero rows. `UNION ALL` keeps duplicates (faster); `UNION` removes them (protects against cycles, but costs sorting).

### Org chart

```sql run
WITH RECURSIVE org AS (
  -- Anchor: the people with no manager (the roots)
  SELECT id, full_name, manager_id, 0 AS depth
  FROM employees
  WHERE manager_id IS NULL

  UNION ALL

  -- Recursive term: everyone whose manager was found in the previous step
  SELECT e.id, e.full_name, e.manager_id, org.depth + 1
  FROM employees AS e
  JOIN org ON e.manager_id = org.id
)
SELECT repeat('    ', depth) || full_name AS employee,
       depth
FROM org
ORDER BY depth, full_name;
```

`depth` is not magic: it is a column you carry forward and increment. Adding a `path` column gives you sorting, breadcrumbs, and cycle detection for free:

```sql run
WITH RECURSIVE org AS (
  SELECT id, full_name, manager_id, 0 AS depth, ARRAY[id] AS path
  FROM employees
  WHERE manager_id IS NULL

  UNION ALL

  SELECT e.id, e.full_name, e.manager_id, o.depth + 1, o.path || e.id
  FROM employees AS e
  JOIN org AS o ON e.manager_id = o.id
  WHERE NOT e.id = ANY(o.path)          -- stop on a cycle
)
SELECT depth, array_to_string(path, ' → ') AS chain, full_name
FROM org
ORDER BY path;
```

### Bill of materials / graph traversal

Recursion is not only for trees. Any self-referencing edge list works: categories and subcategories, tasks and dependencies, users and referrals. The recursive term just follows the edge:

```sql
WITH RECURSIVE descendants AS (
  SELECT id, parent_id, name, 1 AS level
  FROM categories
  WHERE id = 12

  UNION ALL

  SELECT c.id, c.parent_id, c.name, d.level + 1
  FROM categories AS c
  JOIN descendants AS d ON c.parent_id = d.id
)
SELECT * FROM descendants ORDER BY level, name;
```

On a **cyclic graph** (a cycle in `parent_id`), an unguarded `UNION ALL` loops forever. Guard with a path array (above) or PostgreSQL 14+'s `CYCLE` clause:

```sql
WITH RECURSIVE graph AS (
  SELECT id, parent_id, ARRAY[id] AS path
  FROM nodes WHERE id = 1
  UNION ALL
  SELECT n.id, n.parent_id, g.path || n.id
  FROM nodes AS n JOIN graph AS g ON n.parent_id = g.id
)
CYCLE id SET is_cycle USING cycle_path
SELECT * FROM graph;
```

### Date spines

Recursion can generate a gap-free calendar, though `generate_series` is usually clearer:

```sql run
WITH RECURSIVE months AS (
  SELECT date_trunc('month', now()) - interval '5 months' AS month
  UNION ALL
  SELECT month + interval '1 month'
  FROM months
  WHERE month < date_trunc('month', now())
)
SELECT m.month::date                     AS month,
       COUNT(o.id)                       AS orders,
       COALESCE(SUM(o.total_cents), 0) / 100.0 AS revenue
FROM months AS m
LEFT JOIN orders AS o
       ON o.placed_at >= m.month
      AND o.placed_at <  m.month + interval '1 month'
GROUP BY m.month
ORDER BY m.month;
```

The `LEFT JOIN` is what makes empty months appear — a plain aggregate would silently skip them.

## 6. Performance notes

Recursive CTEs are executed in a loop, and the planner has very little information:

- **Row estimates are poor.** PostgreSQL estimates 1 row for the recursive term per iteration; on large hierarchies the plan can be far off. Keep iterations bounded.
- **No predicate pushdown into the recursion.** `SELECT * FROM tree WHERE depth < 3` filters *after* the walk. If you need a depth limit, add `WHERE depth < 3` inside the recursive term so it stops early.
- **Index the join key.** `employees.manager_id` must be indexed for the recursive step to be cheap.
- **`UNION` de-duplicates every iteration** — use it only when cycles are possible; otherwise `UNION ALL` + path guard.
- **Materialise heavily reused results** into a temp table if you need them across multiple statements inside one request.

```sql run
EXPLAIN ANALYZE
WITH RECURSIVE org AS (
  SELECT id, manager_id, 1 AS depth FROM employees WHERE manager_id IS NULL
  UNION ALL
  SELECT e.id, e.manager_id, o.depth + 1
  FROM employees AS e JOIN org AS o ON e.manager_id = o.id
)
SELECT * FROM org;
```

## 7. Practice

1. Rewrite a three-level nested subquery as a CTE pipeline.
2. Return each employee's full reporting chain ("Priya → Marcus → Daniel").
3. Find all descendants of a category using a recursive CTE.
4. Build a 12-month revenue report where months with zero orders still appear.
5. Explain why adding `WHERE month > now() - interval '3 months'` to the *outer* query of the date-spine example does not make the recursion cheaper.
6. Insert an order and two line items atomically using a data-modifying CTE.

> [!TIP]
> **ELI5: CTEs are recipe steps**
> A `WITH` clause is a mise en place: "first make the sauce (step 1), then the filling (step 2), then assemble". Recursive CTEs are "keep asking the same question until nobody new raises their hand" — everyone whose manager you already found, then their reports, then theirs.

## 8. Checklist

- [ ] CTEs are ordered so each one only references earlier ones.
- [ ] A CTE referenced once is not accidentally materialised (check `EXPLAIN`).
- [ ] `MATERIALIZED` / `NOT MATERIALIZED` is used deliberately, with a reason.
- [ ] Recursive CTEs have an anchor, a termination condition, and an index on the join key.
- [ ] Cycles are handled with a path array or `CYCLE`.
- [ ] Recursion depth is bounded inside the recursive term when possible.
- [ ] Data-modifying CTEs are referenced by the outer statement.
- [ ] Temp tables (not CTEs) are used when multiple statements need the result.
