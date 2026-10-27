---
title: How SQL Actually Runs
order: 4
description: The logical order of a SQL query, set semantics, and three-valued NULL logic — the mental model that explains most "why doesn't this work?" moments.
---

SQL is **declarative**: you describe the result you want, not the steps to produce it. The engine is free to scan, join, sort and parallelise however it likes, as long as the result matches the query's meaning.

But there *is* a fixed **logical order** in which the clauses are evaluated. It is not the order you write them, and almost every confusing SQL behaviour follows from it.

## 1. Written order vs. logical order

We write:

```sql
SELECT   ...
FROM     ...
JOIN     ...
WHERE    ...
GROUP BY ...
HAVING   ...
ORDER BY ...
LIMIT    ...
```

The engine evaluates:

| Step | Clause | What happens |
|---|---|---|
| 1 | `FROM` / `JOIN` | Build the working set: combine tables, apply `ON` conditions |
| 2 | `WHERE` | Keep rows that satisfy the predicate (row-by-row) |
| 3 | `GROUP BY` | Collapse rows into groups |
| 4 | `HAVING` | Keep groups that satisfy the predicate |
| 5 | **Window functions** | Compute `OVER (...)` values over the surviving rows |
| 6 | `SELECT` | Evaluate expressions and aliases |
| 7 | `DISTINCT` | Remove duplicate output rows |
| 8 | `ORDER BY` | Sort the output |
| 9 | `LIMIT` / `OFFSET` | Slice the sorted output |

```mermaid
flowchart LR
    A[FROM / JOIN] --> B[WHERE] --> C[GROUP BY] --> D[HAVING] --> E[Window funcs] --> F[SELECT] --> G[DISTINCT] --> H[ORDER BY] --> I[LIMIT]
```

### Consequences you will hit this week

**`WHERE` cannot use a `SELECT` alias** — aliases are created at step 6, after `WHERE` at step 2.

```sql
-- ERROR: column "revenue" does not exist
SELECT price_cents * quantity AS revenue
FROM order_items
WHERE revenue > 1000;
```

Repeat the expression, or wrap the query (a derived table / CTE, see [chapter 7](/databases/sql/007-ctes-and-recursive-queries)):

```sql
SELECT price_cents * quantity AS revenue
FROM order_items
WHERE price_cents * quantity > 1000;
```

> [!NOTE]
> PostgreSQL is lenient about aliases in `GROUP BY` and `ORDER BY` (steps 3 and 8), because those happen after `SELECT`. MySQL allows aliases in `HAVING` too; the SQL standard does not. Don't build a habit on it.

**`WHERE` cannot filter aggregates** — at step 2 there are no groups yet. That is what `HAVING` is for (step 4).

**Window functions cannot be filtered in `WHERE`** — they are computed at step 5, after `WHERE`. This is the single most common window-function mistake:

```sql
-- ERROR: window functions are not allowed in WHERE
SELECT user_id, total_cents,
       ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY total_cents DESC) AS rn
FROM orders
WHERE rn = 1;
```

Filter in an outer query instead:

```sql run
SELECT *
FROM (
  SELECT user_id,
         total_cents,
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY total_cents DESC) AS rn
  FROM orders
) AS ranked
WHERE rn = 1
ORDER BY total_cents DESC
LIMIT 10;
```

**`LIMIT` without `ORDER BY` is a random row sample.** Step 9 slices whatever order the plan produced — which can change with statistics, indexes, or parallelism.

## 2. Tables are bags, not sets

Relational theory calls them sets, but SQL tables are **bags (multisets)**: duplicate rows are allowed unless a `PRIMARY KEY`/`UNIQUE` constraint forbids them. This matters because:

- `SELECT` never de-duplicates. If a join matches three rows, you get three rows — even if they look identical in the projected columns.
- `DISTINCT` (step 7) removes duplicates **after** `SELECT`, which costs a sort/hash over the whole result.
- Aggregates (`COUNT`, `SUM`) count *rows*, so duplicated input inflates them.

A classic symptom — "my revenue report is 3× too high" — is a one-to-many join feeding an aggregate. Chapter 2 covers fan-out in detail.

```sql run
-- 180 orders, but a join to order_items multiplies the rows
SELECT COUNT(*) AS joined_rows
FROM orders AS o
JOIN order_items AS oi ON oi.order_id = o.id;
```

**Rule of thumb:** decide what one output row represents *before* writing the query ("one row per user"), then verify the join cardinality preserves it.

## 3. NULL is "unknown", not "empty"

`NULL` means *the value is not known*. It is not `0`, not `''`, and not equal to anything — including another `NULL`.

Any comparison to `NULL` yields `NULL` (unknown), not `false`:

```sql
NULL = NULL      -- NULL
NULL <> NULL     -- NULL
NULL = 0         -- NULL
NULL IN (1, 2)   -- NULL
```

`WHERE` keeps only rows where the predicate is **true**, so unknown rows are silently dropped. Use `IS NULL` / `IS NOT NULL`:

```sql run
SELECT COUNT(*)                        AS total_orders,
       COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled,
       COUNT(*) FILTER (WHERE status IS NULL)       AS unknown_status
FROM orders;
```

### Three-valued logic

| `A` | `B` | `A AND B` | `A OR B` | `NOT A` |
|---|---|---|---|---|
| true | unknown | unknown | true | false |
| false | unknown | false | unknown | true |
| unknown | unknown | unknown | unknown | unknown |

Two practical traps follow.

**`NOT IN` with a NULL in the list returns nothing.**

```sql
-- If ANY user_id is NULL, this matches no rows at all.
SELECT *
FROM orders
WHERE user_id NOT IN (SELECT user_id FROM orders WHERE status = 'cancelled');
```

The engine expands `x NOT IN (a, NULL)` to `x <> a AND x <> NULL` — which is `unknown`. Prefer `NOT EXISTS`, which is NULL-safe:

```sql
SELECT *
FROM orders AS o
WHERE NOT EXISTS (
  SELECT 1 FROM orders AS c
  WHERE c.user_id = o.user_id AND c.status = 'cancelled'
);
```

**Aggregates ignore NULLs.** `AVG` divides by the count of *non-null* values, not the row count:

```sql run
SELECT COUNT(*)              AS rows,
       COUNT(total_cents)    AS non_null_totals,
       AVG(total_cents)      AS avg_ignoring_null,
       AVG(COALESCE(total_cents, 0)) AS avg_treating_null_as_zero
FROM orders;
```

Use `COALESCE(value, fallback)` when "missing" should behave like a real value, and `COUNT(*)` when you mean "rows".

### NULL-safe comparison and sorting

- `a IS DISTINCT FROM b` — true when the values differ *or* exactly one is NULL. Use it for change detection.
- PostgreSQL sorts `NULL`s **last** in `ASC` and **first** in `DESC` by default. Control it explicitly: `ORDER BY x DESC NULLS LAST`.
- `UNIQUE` constraints treat NULLs as distinct (two NULLs do not collide), unless you use `NULLS NOT DISTINCT` (PostgreSQL 15+).

## 4. Types and literals are part of the semantics

SQL is strongly typed, but implicit casts hide it until they hurt.

| Stored as | Use for | Trap |
|---|---|---|
| `numeric` / `bigint` cents | money | `real`/`float` cannot represent `0.10` exactly |
| `timestamptz` | timestamps | `timestamp` (no zone) silently drops the offset |
| `date` | calendar days | comparing `date` to a timestamp casts midnight |
| `text` | strings | `char(n)` pads with spaces; `varchar(n)` truncates or errors |

```sql run
-- Integer division truncates: 1/2 is 0, not 0.5
SELECT 1 / 2 AS integer_division,
       1.0 / 2 AS numeric_division,
       (1::numeric / 2) AS explicit_numeric;
```

And an implicit cast can quietly disable an index (chapter 10):

```sql
-- user_id is integer; the literal is text, so the column is cast per row
WHERE user_id::text = '42'
```

## 5. How to read a query

Before you run it, answer five questions:

1. **Grain** — what does one output row represent?
2. **Sources** — which tables, and what is the join key + cardinality (1:1, 1:N, M:N)?
3. **Filters** — which conditions belong in `WHERE` (pre-aggregation) vs `HAVING` (post-aggregation)?
4. **Aggregation/window** — is anything collapsing rows, expanding them, or ranking within a partition?
5. **Ordering/limit** — is the result deterministic without `ORDER BY`?

If you can answer all five, most "impossible" SQL bugs become obvious.

> [!TIP]
> **ELI5: The restaurant order**
> You do not tell the kitchen *how* to cook — you hand over an order ("one pasta, no cheese, table 4"). SQL is the same: you describe the plate, and the planner decides whether to grill, boil, or parallelise. The logical order is the order the **waiter** checks the ticket: dishes first (`FROM`), then special requests (`WHERE`), then combining into a table's order (`GROUP BY`), then "hold the desserts" (`HAVING`), then plating (`SELECT`), then serving in order (`ORDER BY`).
