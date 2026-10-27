---
title: Aggregation & Grouping
order: 7
description: COUNT semantics, GROUP BY and HAVING, FILTER and conditional aggregation, ROLLUP/CUBE/GROUPING SETS, and top-N-per-group patterns without fan-out bugs.
---

Aggregation answers "how many / how much / how often" — the language of every dashboard, invoice and report.

The functions themselves are simple. The difficulty is in three places: **NULL semantics**, **where filters run relative to grouping**, and **row multiplication before aggregation**.

## 1. The aggregate functions

| Function | Returns | Ignores NULL? |
|---|---|---|
| `COUNT(*)` | number of rows | no (counts everything) |
| `COUNT(expr)` | number of non-NULL values | yes |
| `COUNT(DISTINCT expr)` | number of distinct non-NULL values | yes |
| `SUM(expr)` | total | yes (NULL if no rows) |
| `AVG(expr)` | mean of non-NULL values | yes |
| `MIN(expr)` / `MAX(expr)` | smallest / largest | yes |
| `string_agg(expr, ',')` | concatenated string | yes |
| `array_agg(expr)` | array of values | yes |
| `bool_and(expr)` / `bool_or(expr)` | logical AND / OR | yes |
| `stddev_pop`, `var_pop` | statistics | yes |
| `percentile_cont(0.5) WITHIN GROUP (ORDER BY x)` | median/percentile | yes |

```sql run
SELECT COUNT(*)                                   AS order_rows,
       COUNT(total_cents)                         AS non_null_totals,
       COUNT(DISTINCT user_id)                    AS distinct_customers,
       SUM(total_cents) / 100.0                   AS revenue,
       ROUND(AVG(total_cents) / 100.0, 2)         AS avg_order_value,
       MIN(placed_at)                             AS first_order,
       MAX(placed_at)                             AS last_order
FROM orders;
```

> [!NOTE]
> `SUM` of an empty set is `NULL`, not `0`. `SELECT SUM(total_cents) FROM orders WHERE false` returns NULL. Use `COALESCE(SUM(...), 0)` when zero is the meaningful answer.

### `COUNT(*)` vs `COUNT(column)`

The difference is exactly the NULL rule:

```sql run
SELECT COUNT(*)                          AS all_rows,
       COUNT(NULLIF(status, 'cancelled')) AS non_cancelled
FROM orders;
```

`COUNT(*)` is what you usually want. `COUNT(column)` is a NULL filter in disguise. On outer joins this becomes the classic bug from [chapter 2](/databases/sql/002-joins-in-depth): `COUNT(*)` counts the fabricated NULL row.

### Distinct counting is not additive

`COUNT(DISTINCT user_id)` per day cannot be summed into a monthly active-user count — a user active on ten days is counted ten times. You need `COUNT(DISTINCT user_id)` over the whole period, or a subquery:

```sql run
-- Correct: distinct users across the whole window
SELECT COUNT(DISTINCT user_id) AS monthly_active_users
FROM orders
WHERE placed_at >= now() - interval '30 days';
```

## 2. `GROUP BY`: defining the grain

`GROUP BY` collapses rows that share the same key values into one output row. Everything in `SELECT` must be either:

- listed in `GROUP BY`, or
- wrapped in an aggregate.

```sql run
SELECT status,
       COUNT(*)                  AS orders,
       SUM(total_cents) / 100.0  AS revenue
FROM orders
GROUP BY status
ORDER BY orders DESC;
```

Grouping by several columns means "one row per combination":

```sql run
SELECT u.country, o.status, COUNT(*) AS orders
FROM orders AS o
JOIN users AS u ON u.id = o.user_id
GROUP BY u.country, o.status
ORDER BY u.country, o.status;
```

### Grouping by expressions

You can group by any expression, not just a column:

```sql run
SELECT date_trunc('month', placed_at)::date AS month,
       COUNT(*)                            AS orders,
       SUM(total_cents) / 100.0            AS revenue
FROM orders
GROUP BY date_trunc('month', placed_at)
ORDER BY month;
```

This is how you build time series. Keep the expression identical in `SELECT` and `GROUP BY`, or use a derived table/CTE for readability.

> [!TIP]
> In PostgreSQL, grouping by a table's **primary key** lets you select any other column of that table without listing it — the planner knows the dependency. It works, but explicit `GROUP BY` lists are easier to review and portable.

### Grouping by ordinal or alias

Both of these work in PostgreSQL (and the ordinal in MySQL):

```sql
GROUP BY 1, 2        -- positions in the SELECT list
GROUP BY country     -- an alias defined in SELECT
```

They are convenient in ad-hoc queries, but brittle during refactors: add a column to `SELECT` and your `GROUP BY 1, 2` silently means something else. Use explicit column names in application code.

## 3. `WHERE` vs `HAVING`

`WHERE` filters **rows before grouping**; `HAVING` filters **groups after aggregation** (chapter 1's logical order).

```sql run
SELECT status, COUNT(*) AS orders
FROM orders
WHERE placed_at >= now() - interval '365 days'  -- rows
GROUP BY status
HAVING COUNT(*) >= 10                            -- groups
ORDER BY orders DESC;
```

Rules that follow:

- To filter on an aggregate, use `HAVING`.
- To filter on a plain column, use `WHERE` — it reduces the input before the expensive grouping step.
- Do both: `WHERE` on the raw date, `HAVING` on the aggregate.

Filtering in `HAVING` when you could have used `WHERE` is a common performance smell:

```sql
-- Works, but groups everything then throws most of it away.
SELECT user_id, COUNT(*) FROM orders GROUP BY user_id HAVING user_id > 40;
-- Better: filter before grouping.
SELECT user_id, COUNT(*) FROM orders WHERE user_id > 40 GROUP BY user_id;
```

## 4. `FILTER` and conditional aggregation

PostgreSQL's `FILTER (WHERE ...)` computes an aggregate over a subset without a second query:

```sql run
SELECT u.country,
       COUNT(*)                                               AS users,
       COUNT(*) FILTER (WHERE u.created_at > now() - interval '180 days') AS new_users,
       COUNT(*) FILTER (WHERE u.created_at <= now() - interval '180 days') AS older_users
FROM users AS u
GROUP BY u.country
ORDER BY users DESC;
```

The portable equivalent is `SUM(CASE WHEN ... THEN 1 ELSE 0 END)`, which every database supports:

```sql run
-- Pivot: one row per country, one column per status.
SELECT u.country,
       COUNT(*) FILTER (WHERE o.status = 'paid')      AS paid,
       COUNT(*) FILTER (WHERE o.status = 'shipped')   AS shipped,
       COUNT(*) FILTER (WHERE o.status = 'cancelled') AS cancelled,
       COUNT(*) FILTER (WHERE o.status = 'pending')   AS pending
FROM orders AS o
JOIN users AS u ON u.id = o.user_id
GROUP BY u.country
ORDER BY u.country;
```

Conditional aggregation is how you pivot without a `PIVOT` clause — and unlike `COUNT(DISTINCT ...)` filters, it composes cleanly.

> [!WARNING]
> `COUNT(*) FILTER (WHERE ...)` counts rows, not non-null values. If you mean "non-null totals", use `COUNT(total_cents) FILTER (...)`.

## 5. Subtotals: `ROLLUP`, `CUBE`, `GROUPING SETS`

A plain `GROUP BY` gives one row per group. `ROLLUP` adds hierarchical subtotals, `CUBE` adds every combination, and `GROUPING SETS` lets you list exactly which groupings you want.

```sql run
SELECT u.country,
       o.status,
       COUNT(*)                 AS orders,
       SUM(o.total_cents) / 100.0 AS revenue
FROM orders AS o
JOIN users AS u ON u.id = o.user_id
GROUP BY ROLLUP (u.country, o.status)
ORDER BY u.country NULLS LAST, o.status NULLS LAST;
```

`ROLLUP (a, b)` produces:

1. `GROUP BY a, b` (detail)
2. `GROUP BY a` (subtotal per country)
3. no grouping (grand total)

The subtotal rows have `NULL` in the rolled-up columns — which is ambiguous if those columns can be NULL themselves. `GROUPING()` disambiguates:

```sql run
SELECT CASE WHEN GROUPING(u.country) = 1 THEN 'ALL COUNTRIES' ELSE u.country END AS country,
       CASE WHEN GROUPING(o.status)  = 1 THEN 'ALL STATUSES' ELSE o.status  END AS status,
       COUNT(*) AS orders
FROM orders AS o
JOIN users AS u ON u.id = o.user_id
GROUP BY ROLLUP (u.country, o.status)
ORDER BY GROUPING(u.country), u.country, GROUPING(o.status), o.status;
```

| Clause | Rows produced for 3 columns |
|---|---|
| `GROUP BY a, b, c` | 1 grouping |
| `ROLLUP (a, b, c)` | 4: (a,b,c), (a,b), (a), () |
| `CUBE (a, b, c)` | 8: every subset |
| `GROUPING SETS ((a,b,c),(a),())` | exactly the 3 listed |

Use `ROLLUP` for time hierarchies (year → month → day), `GROUPING SETS` when you need two unrelated summaries in one pass, and avoid `CUBE` on high-cardinality columns (the row count explodes).

> [!NOTE]
> `GROUPING SETS`, `ROLLUP` and `CUBE` exist in PostgreSQL, MySQL 8+, SQL Server and Oracle. SQLite has none — pre-aggregate with `UNION ALL` there.

## 6. Top-N per group

"Three most recent orders per user" is not a `GROUP BY` problem (that would collapse each user to a single row). Three valid approaches:

**`DISTINCT ON` (PostgreSQL)** — shortest, but non-standard:

```sql run
SELECT DISTINCT ON (user_id)
       user_id, id AS order_id, placed_at, total_cents / 100.0 AS total
FROM orders
ORDER BY user_id, placed_at DESC
LIMIT 15;
```

**`LATERAL`** — index-friendly, keeps parents with no children when using `LEFT JOIN LATERAL`:

```sql run
SELECT u.id, recent.id AS order_id, recent.total_cents / 100.0 AS total
FROM users AS u
LEFT JOIN LATERAL (
  SELECT o.id, o.total_cents
  FROM orders AS o
  WHERE o.user_id = u.id
  ORDER BY o.placed_at DESC
  LIMIT 1
) AS recent ON true
ORDER BY u.id
LIMIT 15;
```

**Window function** — the most portable, covered in [chapter 5](/databases/sql/005-window-functions):

```sql run
WITH ranked AS (
  SELECT user_id, id, placed_at, total_cents,
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY placed_at DESC) AS rn
  FROM orders
)
SELECT user_id, id AS order_id, total_cents / 100.0 AS total
FROM ranked
WHERE rn = 1
ORDER BY user_id
LIMIT 15;
```

Rule of thumb: `DISTINCT ON` for a one-off, `LATERAL` with an index for production "latest row" lookups, windows when you need `N > 1` or more ranking columns.

## 7. Aggregating after joins (the fan-out trap)

Aggregates count **input rows**. If a 1:N join multiplied them, every `SUM` and `COUNT` is inflated — see [chapter 2 §12](/databases/sql/002-joins-in-depth).

The fix is to aggregate at each table's own grain, then join the aggregates:

```sql run
WITH order_totals AS (
  SELECT user_id, COUNT(*) AS orders, SUM(total_cents) AS revenue_cents
  FROM orders
  GROUP BY user_id
),
item_totals AS (
  SELECT o.user_id, SUM(oi.quantity) AS units
  FROM orders AS o
  JOIN order_items AS oi ON oi.order_id = o.id
  GROUP BY o.user_id
)
SELECT u.full_name,
       COALESCE(ot.orders, 0)        AS orders,
       COALESCE(ot.revenue_cents, 0) / 100.0 AS revenue,
       COALESCE(it.units, 0)         AS units
FROM users AS u
LEFT JOIN order_totals AS ot ON ot.user_id = u.id
LEFT JOIN item_totals AS it  ON it.user_id = u.id
ORDER BY revenue DESC
LIMIT 10;
```

If you must join first, aggregate with `DISTINCT` at the parent level (`SUM(DISTINCT o.total_cents)`) — but that is usually a workaround, not a model: two orders with the same total would be collapsed into one.

## 8. Percentages and shares

Percent of total needs the aggregate **plus** the overall total. A window function computes both in one pass (chapter 5):

```sql run
SELECT u.country,
       COUNT(*) AS users,
       ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS pct_of_users
FROM users AS u
GROUP BY u.country
ORDER BY users DESC;
```

`SUM(COUNT(*)) OVER ()` looks odd but is exactly right: `COUNT(*)` is the group aggregate, and `SUM(...) OVER ()` re-aggregates those group results across all groups. Doing it with a scalar subquery (`(SELECT COUNT(*) FROM users)`) also works and is easier to read.

## 9. Practice

1. Revenue per country, plus a grand-total row, using `ROLLUP`.
2. For each category, count products in stock and out of stock in two columns.
3. Which users placed more than three cancelled orders? Return the user and the count.
4. Monthly order counts for the last 12 months, including months with zero orders (hint: `generate_series` + `LEFT JOIN`).
5. Fix this query: `SELECT u.id, COUNT(*) FROM users u JOIN orders o ON o.user_id = u.id GROUP BY u.id HAVING COUNT(*) = 0;`
6. Median order value per country (hint: `percentile_cont`).

> [!TIP]
> **ELI5: GROUP BY is sorting laundry into piles**
> `WHERE` is "only clothes from this basket". `GROUP BY` is "make a pile per colour". `HAVING` is "ignore piles with fewer than three items". Aggregates are what you count *per pile* — and if you accidentally toss the same shirt into the pile twice (fan-out), your count is wrong no matter how good the piles look.

## 10. Checklist

- [ ] `COUNT(*)` vs `COUNT(column)` is deliberate.
- [ ] `SUM` over an empty set is wrapped in `COALESCE` if zero is expected.
- [ ] Row filters are in `WHERE`; only aggregate filters are in `HAVING`.
- [ ] The query's grain is stated, and every non-aggregated column is grouped.
- [ ] Joins feeding an aggregate do not multiply rows (no fan-out).
- [ ] `COUNT(DISTINCT ...)` is not being summed across time buckets.
- [ ] `ROLLUP`/`CUBE` subtotal NULLs are disambiguated with `GROUPING()`.
- [ ] Top-N per group uses `DISTINCT ON`, `LATERAL`, or a window — not `GROUP BY` + `LIMIT`.
