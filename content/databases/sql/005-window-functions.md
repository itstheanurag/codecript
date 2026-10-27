---
title: Window Functions
order: 8
description: OVER, PARTITION BY, ranking functions, frames, running totals, LAG/LEAD, and the de-duplication patterns that replace self-joins and correlated subqueries.
---

`GROUP BY` collapses rows. **Window functions** compute across related rows while keeping **every row** — so you can show an order *and* its rank, its running total, and the previous order's date on the same line.

If you learn one advanced SQL feature properly, make it this one. Window functions replace a large class of self-joins, correlated subqueries, and application-side loops.

## 1. Anatomy of `OVER`

```sql
function_name(...) OVER (
  PARTITION BY ...   -- split rows into independent groups
  ORDER BY ...       -- order rows within each partition
  frame_clause       -- which rows around the current row to include
)
```

- **No `PARTITION BY`** → the whole result set is one window.
- **No `ORDER BY`** → the default frame is the entire partition (good for totals).
- **With `ORDER BY`** → the default frame is *from the start of the partition to the current row* (good for running totals, surprising for `LAST_VALUE`).
- `PARTITION BY` is **not** `GROUP BY`: partitions never collapse rows.

```sql run
SELECT u.full_name,
       o.id AS order_id,
       o.total_cents / 100.0 AS total,
       ROW_NUMBER() OVER (PARTITION BY o.user_id ORDER BY o.total_cents DESC) AS rank_in_user,
       RANK()       OVER (PARTITION BY o.user_id ORDER BY o.total_cents DESC) AS rank_with_ties
FROM orders AS o
JOIN users AS u ON u.id = o.user_id
WHERE u.id <= 3
ORDER BY u.id, rank_in_user
LIMIT 20;
```

## 2. Window vs. `GROUP BY`

| | `GROUP BY` | Window function |
|---|---|---|
| Output rows | one per group | one per input row |
| Typical use | summaries, reports | ranking, running totals, comparing to neighbours |
| Can be filtered by | `HAVING` | an outer query / CTE (never `WHERE`) |
| Combines with aggregates | yes | yes (`SUM(COUNT(*)) OVER ()`) |

They compose. "Percent of country revenue" needs a grouped aggregate *and* a window over those groups:

```sql run
SELECT u.country,
       SUM(o.total_cents) / 100.0 AS revenue,
       ROUND(100.0 * SUM(o.total_cents) / SUM(SUM(o.total_cents)) OVER (), 1) AS pct_of_total
FROM orders AS o
JOIN users AS u ON u.id = o.user_id
GROUP BY u.country
ORDER BY revenue DESC;
```

## 3. Ranking functions

| Function | Ties | Gaps | Example result |
|---|---|---|---|
| `ROW_NUMBER()` | no ties ever | n/a | 1, 2, 3, 4 |
| `RANK()` | same rank | yes | 1, 2, 2, 4 |
| `DENSE_RANK()` | same rank | no | 1, 2, 2, 3 |
| `NTILE(n)` | splits into buckets | n/a | 1,1,2,2 |
| `PERCENT_RANK()` | percentile position | — | 0 … 1 |
| `CUME_DIST()` | cumulative distribution | — | 0 … 1 |

```sql run
SELECT e.full_name,
       e.department,
       e.salary_cents / 100.0 AS salary,
       RANK()       OVER (PARTITION BY department ORDER BY salary_cents DESC) AS rank,
       DENSE_RANK() OVER (PARTITION BY department ORDER BY salary_cents DESC) AS dense_rank,
       ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary_cents DESC) AS row_number
FROM employees AS e
ORDER BY e.department, rank;
```

Choose deliberately:

- `ROW_NUMBER` for **de-duplication** and "pick exactly one".
- `RANK` for leaderboards where gaps matter ("joint 2nd, then 4th").
- `DENSE_RANK` for "how many distinct levels above me".

> [!WARNING]
> Ranking needs a **deterministic `ORDER BY`** inside `OVER`. If two rows tie on `total_cents`, `ROW_NUMBER` may give them either number on different runs. Add a tiebreaker (e.g. `ORDER BY total_cents DESC, id`) whenever the result is consumed by code or paginated.

## 4. Offset functions: `LAG` and `LEAD`

`LAG` looks backwards, `LEAD` forwards, within the partition:

```sql run
SELECT user_id,
       id AS order_id,
       placed_at,
       LAG(placed_at) OVER (PARTITION BY user_id ORDER BY placed_at) AS previous_order,
       placed_at - LAG(placed_at) OVER (PARTITION BY user_id ORDER BY placed_at) AS gap,
       LEAD(total_cents, 1, 0) OVER (PARTITION BY user_id ORDER BY placed_at) AS next_total
FROM orders
WHERE user_id <= 3
ORDER BY user_id, placed_at;
```

- The third argument to `LAG`/`LEAD` is the **default** for rows with no neighbour (otherwise NULL).
- The second argument is the offset (`LAG(x, 2)` = two rows back).
- The first row of each partition has no previous row by definition.

This replaces the "self-join on `id - 1`" pattern, which breaks as soon as ids have gaps.

## 5. `FIRST_VALUE`, `LAST_VALUE`, `NTH_VALUE`

```sql run
SELECT user_id,
       id,
       total_cents,
       FIRST_VALUE(total_cents) OVER (PARTITION BY user_id ORDER BY placed_at) AS first_order_total,
       LAST_VALUE(total_cents)  OVER (
         PARTITION BY user_id
         ORDER BY placed_at
         ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
       ) AS last_order_total
FROM orders
WHERE user_id <= 3
ORDER BY user_id, placed_at;
```

The verbose frame on `LAST_VALUE` is not optional. With the default frame ("start of partition through current row"), the "last value" **is the current row**, so every row returns itself. This is the most common window-function bug in production.

## 6. Frames: which rows count

A frame clause controls the set of rows the function sees for the current row.

| Frame | Rows included |
|---|---|
| `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW` | all rows from partition start up to this one |
| `ROWS BETWEEN 2 PRECEDING AND CURRENT ROW` | this row + two physical rows before |
| `ROWS BETWEEN 1 FOLLOWING AND 3 FOLLOWING` | next three rows |
| `RANGE BETWEEN INTERVAL '7 days' PRECEDING AND CURRENT ROW` | all rows within the last 7 days (value-based) |
| `GROUPS BETWEEN 1 PRECEDING AND CURRENT ROW` | previous peer group + current group |

Differences that matter:

- **`ROWS`** counts physical rows (after `WHERE`, before `ORDER BY` output). Duplicate sort values are still separate rows.
- **`RANGE`** counts *values*: with `ORDER BY placed_at`, `RANGE ... CURRENT ROW` includes **all rows with the same timestamp** (peers). It also supports interval offsets for date arithmetic.
- **`GROUPS`** counts peer groups, which is handy for "previous distinct day" semantics.

Without `ORDER BY`, the default frame is the whole partition. With `ORDER BY`, it is `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW` — i.e. **running total semantics**.

```sql run
SELECT placed_at::date AS day,
       COUNT(*) AS orders,
       SUM(COUNT(*)) OVER (ORDER BY placed_at::date) AS running_total,
       SUM(COUNT(*)) OVER (
         ORDER BY placed_at::date
         ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
       ) AS rolling_7_day
FROM orders
GROUP BY placed_at::date
ORDER BY day;
```

## 7. The patterns to memorise

### De-duplicate: keep the latest row per key

```sql run
WITH ranked AS (
  SELECT o.*,
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY placed_at DESC, id DESC) AS rn
  FROM orders AS o
)
SELECT id, user_id, placed_at, total_cents / 100.0 AS total
FROM ranked
WHERE rn = 1
ORDER BY user_id
LIMIT 10;
```

This is *the* way to deduplicate. `DISTINCT` cannot choose which row survives; `ROW_NUMBER` can.

### Running total and moving average

```sql run
SELECT placed_at::date AS day,
       SUM(total_cents) / 100.0 AS daily_revenue,
       SUM(SUM(total_cents)) OVER (ORDER BY placed_at::date) / 100.0 AS cumulative_revenue,
       ROUND(AVG(SUM(total_cents)) OVER (
         ORDER BY placed_at::date
         ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
       ) / 100.0, 2) AS seven_day_avg
FROM orders
GROUP BY placed_at::date
ORDER BY day;
```

### Compare each row to its partition total

```sql run
SELECT o.id,
       o.user_id,
       o.total_cents / 100.0 AS total,
       ROUND(100.0 * o.total_cents / SUM(o.total_cents) OVER (PARTITION BY o.user_id), 1) AS pct_of_user_spend
FROM orders AS o
WHERE o.user_id <= 3
ORDER BY o.user_id, o.total_cents DESC;
```

### Top-N per partition

```sql run
WITH ranked AS (
  SELECT p.category,
         p.name,
         p.price_cents / 100.0 AS price,
         ROW_NUMBER() OVER (PARTITION BY p.category ORDER BY p.price_cents DESC) AS rn
  FROM products AS p
)
SELECT category, name, price
FROM ranked
WHERE rn <= 3
ORDER BY category, price DESC;
```

## 8. Named windows

When several columns share a window definition, name it once:

```sql run
SELECT user_id,
       id,
       total_cents,
       SUM(total_cents) OVER w AS running_total,
       AVG(total_cents) OVER w AS running_avg
FROM orders
WHERE user_id = 1
WINDOW w AS (PARTITION BY user_id ORDER BY placed_at, id)
ORDER BY placed_at;
```

A named window can be refined: `WINDOW w AS (PARTITION BY user_id), w2 AS (w ORDER BY placed_at)`.

## 9. Performance notes

Window functions are usually implemented as a **sort per partition**, then a single pass. Consequences:

- The rows are sorted by `PARTITION BY` + `ORDER BY`. An index on `(user_id, placed_at)` lets the planner read pre-sorted data and skip the sort — big win on large tables.
- Windows run **after** `WHERE`, so filtering first is essential. Do not compute a rank over 10 million rows to keep 10.
- You **cannot** reference a window alias in `WHERE`, `GROUP BY`, or another window of the same `SELECT`. Wrap it in a subquery/CTE.
- Each distinct window definition may require its own sort. Reuse named windows where possible.

```sql run
EXPLAIN ANALYZE
SELECT user_id, id, total_cents,
       ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY placed_at DESC) AS rn
FROM orders;
```

Look for `WindowAgg` and a `Sort` beneath it. If the sort is spilling to disk (`Sort Method: external merge`), you are sorting more data than you need.

## 10. Practice

1. Rank users by total spend, with ties sharing a rank.
2. Show each order's total, the previous order's total for the same user, and the difference.
3. For each user, compute the share of their spend that came from their single most expensive order.
4. Find the longest gap between consecutive orders for each user.
5. Return the first order of each month across the whole dataset.
6. Rewrite `SELECT DISTINCT user_id FROM orders` to also return the latest order date *without* de-duplicating after the fact.

> [!TIP]
> **ELI5: Windows are stadium seating**
> `GROUP BY` is "everyone in a row stands up and merges into one person". A window is "everyone stays seated, but can look at the people in their own section (partition), in seat order (order by), maybe only the last few seats (frame)". Everybody still gets their own ticket — you just add information about their neighbours.

## 11. Checklist

- [ ] `PARTITION BY` matches the entity the calculation is "within".
- [ ] Every ranking has a deterministic tiebreaker in `ORDER BY`.
- [ ] `LAST_VALUE` uses an explicit `UNBOUNDED FOLLOWING` frame.
- [ ] `ROWS` vs `RANGE` is chosen deliberately for duplicate order values.
- [ ] Window results are filtered in an outer query, never in `WHERE`.
- [ ] Only the rows you need are fed into the window (filter early).
- [ ] Indexes on `(partition_key, order_key)` are checked in `EXPLAIN`.
- [ ] Repeated window definitions are named or extracted into a CTE.
