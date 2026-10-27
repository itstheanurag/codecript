---
title: Indexes & Query Plans
order: 13
description: How B-tree indexes work, composite/partial/covering indexes, sargability, and how to read EXPLAIN ANALYZE to find the real bottleneck.
---

An index is a data structure that lets the database find rows **without reading every row**. That is the whole idea, and it is enough to explain why some queries are instant and others are not.

This chapter is about choosing the right index and proving that it is used.

## 1. The mental model: a B-tree is a phone book

A B-tree index keeps the indexed values **sorted**, with pointers to the table rows:

```
                [ M ]
              /       \
      [ D, H ]          [ S, W ]
     /    |   \        /    |   \
  A..C  D..G  H..L   M..R  S..V  W..Z
```

To find `user_id = 42`, the engine:

1. Walks from the root to the leaf containing `42` — O(log n), a handful of page reads.
2. Follows the pointer to the row (or reads the needed columns directly, if the index covers them).

To find `WHERE user_id = 42` **without** an index, it reads every page of the table: O(n). On 10 million rows, that is the difference between 3 page reads and 300,000.

Two consequences follow immediately:

- **An index must be on the column you filter by** (or a prefix/expression of it).
- **An index is only useful if it eliminates most of the table.** If 40% of rows match, reading the index *and* then the table is slower than a plain sequential scan — the planner knows this and will ignore your index.

## 2. Index types

| Type | Good for | Example |
|---|---|---|
| **B-tree** (default) | equality, ranges, sorting, `IS NULL`, prefix `LIKE 'abc%'` | ids, dates, amounts, names |
| **Hash** | equality only, large values | rare; B-tree usually wins |
| **GIN** | containment in composite values: arrays, `jsonb`, full-text | `tags @> '{sql}'`, `to_tsvector(...)` |
| **GiST** | geometric ranges, nearest-neighbour, exclusion constraints | `tstzrange` overlap, PostGIS |
| **BRIN** | huge, naturally-ordered tables (append-only time series) | 100M log rows ordered by `created_at` |
| **SP-GiST** | non-balanced structures: quadtrees, text prefixes | niche |

Start with B-tree. Reach for GIN when querying inside JSONB/arrays, BRIN when the table is huge and physically ordered by the filter column, GiST for ranges/geometry.

## 3. Composite indexes

An index on `(user_id, placed_at)` is sorted by `user_id` first, then by `placed_at` within each user.

```sql
CREATE INDEX orders_user_placed_idx ON orders (user_id, placed_at DESC);
```

It serves:

| Query | Uses index? |
|---|---|
| `WHERE user_id = 42` | Yes (leftmost prefix) |
| `WHERE user_id = 42 ORDER BY placed_at DESC` | Yes (order already matches) |
| `WHERE user_id = 42 AND placed_at >= '2026-01-01'` | Yes |
| `WHERE placed_at >= '2026-01-01'` | No (skips the first column) |
| `WHERE user_id > 40 ORDER BY placed_at` | Partial (range on first column breaks sort order) |

**Column order rule:** equality columns first, then range/sort columns. A composite index is a sorted phone book — you cannot look up by last name if it is sorted by first name.

```sql run
EXPLAIN ANALYZE
SELECT id, placed_at
FROM orders
WHERE user_id = 42
ORDER BY placed_at DESC
LIMIT 5;
```

Look for `Index Scan using orders_user_placed_idx` and the absence of a `Sort` node.

### Covering indexes (`INCLUDE`)

If the index contains every column the query needs, the engine can answer from the index alone — an **index-only scan**, with no table lookups:

```sql
CREATE INDEX orders_user_covering_idx
  ON orders (user_id, placed_at DESC) INCLUDE (total_cents, status);
```

`INCLUDE` columns are stored in the leaf pages but not used for ordering — cheaper than putting them in the key. Index-only scans still consult the visibility map, so they work best on well-vacuumed tables.

### Partial indexes

Index only the rows you query:

```sql
CREATE INDEX orders_pending_idx
  ON orders (placed_at)
  WHERE status = 'pending';
```

Smaller index, faster writes, and often a better cache hit rate. The query must include the predicate (`WHERE status = 'pending'`) for the planner to use it.

### Expression indexes

Query by an expression, index that expression (see [chapter 6](/databases/sql/006-sql-functions-and-expressions)):

```sql
CREATE INDEX users_lower_email_idx ON users (lower(email));
```

## 4. When *not* to index

Indexes are not free:

- Every `INSERT` writes every index; every `UPDATE` writes indexes for changed columns.
- Each index consumes disk and cache; too many indexes push hot data out of memory.
- The planner must consider each one, which slows down planning on write-heavy schemas.

Skip an index when:

- The table is tiny (a few thousand rows — a seq scan is fine).
- The column has very low selectivity (`boolean`, `status` with 3 values) **unless** the values are skewed and you use a partial index.
- The column is rarely filtered or joined.
- The table is write-heavy and the index is never used in `pg_stat_user_indexes`.

```sql
-- Unused indexes are write tax. Find candidates for removal.
SELECT relname AS table, indexrelname AS index, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;
```

> [!NOTE]
> `idx_scan = 0` after a representative period (weeks, not minutes) is a signal — not proof. Check for monthly reports and rare admin queries before dropping.

## 5. Sargability: the query must be indexable

The planner can only use an index when the indexed column appears **bare** on one side of the comparison.

```sql
-- Sargable
WHERE created_at >= '2026-01-01'
WHERE email = 'a@example.com'
WHERE name LIKE 'Ada%'

-- Not sargable (function on the column)
WHERE date_trunc('day', created_at) = '2026-01-01'
WHERE lower(email) = 'a@example.com'
WHERE created_at::date = '2026-01-01'

-- Not sargable (leading wildcard, no trigram index)
WHERE name LIKE '%ada%'

-- Not sargable (arithmetic on the column)
WHERE price_cents * 2 > 1000
```

Rewrites that keep the index usable:

| Instead of | Write |
|---|---|
| `date_trunc('day', ts) = d` | `ts >= d AND ts < d + interval '1 day'` |
| `lower(email) = x` | expression index on `lower(email)`, or store normalised |
| `ts::date = d` | half-open range |
| `LIKE '%x%'` | trigram GIN index, or full-text search |
| `price * 2 > 1000` | `price > 500` |
| `id = 1 OR id = 2` | `id IN (1, 2)` (usually planned as a BitmapOr) |

`OR` across **different columns** often forces a sequential scan; `UNION ALL` of two indexed queries can be faster.

Implicit casts matter too: comparing `varchar` to `integer`, or `text` to `uuid`, can cast the column per row. Match types in literals and parameters.

## 6. Reading `EXPLAIN`

`EXPLAIN` shows the **plan and estimates**. `EXPLAIN ANALYZE` actually runs the query and adds **actual timings and row counts**.

```sql run
EXPLAIN ANALYZE
SELECT o.id, o.total_cents
FROM orders AS o
WHERE o.user_id = 7
ORDER BY o.placed_at DESC
LIMIT 10;
```

Read a plan **inside-out** (the innermost node produces rows first):

```
Limit  (cost=0.28..24.31 rows=10 width=12) (actual time=0.031..0.089 rows=10 loops=1)
  ->  Index Scan using orders_user_placed_idx on orders o
        (cost=0.28..86.42 rows=3 width=12) (actual time=0.029..0.084 rows=10 loops=1)
        Index Cond: (user_id = 7)
```

| Field | Meaning |
|---|---|
| `cost=0.28..24.31` | start-up cost .. total cost (arbitrary units, page reads dominate) |
| `rows=10` | **estimated** rows at this node |
| `actual time=0.031..0.089` | first row .. all rows (milliseconds) |
| `rows=10 ... loops=1` | actual rows × loops = total rows produced |
| `Index Cond` | predicate pushed into the index |
| `Filter` | predicate applied after reading rows (can mean wasted work) |

### Common nodes

| Node | Meaning | Usually |
|---|---|---|
| `Seq Scan` | read the whole table | fine for small/short tables, bad on large ones with a selective filter |
| `Index Scan` | walk index, fetch matching rows from the table | good for selective predicates |
| `Index Only Scan` | answer from the index alone | best (check `Heap Fetches`) |
| `Bitmap Index Scan` + `Bitmap Heap Scan` | collect row locations, then fetch pages in order | good for medium selectivity |
| `Nested Loop` | for each outer row, look up inner | great with an index, terrible without |
| `Hash Join` | build a hash table on one side | good for large equality joins |
| `Merge Join` | sort both sides, then zip | good when inputs are already sorted |
| `Sort` | explicit sort | watch for `external merge` (spills to disk) |
| `WindowAgg` | window function | sorting cost sits beneath it |
| `Aggregate` / `GroupAggregate` / `HashAggregate` | grouping | `HashAggregate` is usually cheaper |

### Estimates vs. actuals

The most useful diagnostic is the gap between `rows=` (estimate) and `rows=` after `actual`:

- **Estimate 1, actual 50,000** → stale statistics, correlated columns, or a function the planner cannot estimate. Run `ANALYZE`; consider `CREATE STATISTICS`.
- **Estimate 50,000, actual 1** → equally bad; may cause a nested loop over a huge inner side.

```sql
ANALYZE orders;                 -- refresh statistics
VACUUM ANALYZE orders;          -- also reclaim space and update the visibility map
```

## 7. Joins and indexes

- An index on the **inner** side of a nested loop (`orders.user_id`) turns per-row scans into O(log n) lookups.
- A hash join does not need an index — it needs enough memory to build the hash table (`work_mem`).
- A **missing index on a foreign key** is the most common reason a delete of a parent row becomes slow: the FK check scans the child table.
- The planner chooses join order and algorithm from statistics. If it picks a nested loop with `loops=100000`, either the estimate is wrong or the inner side is missing an index.

```sql run
EXPLAIN ANALYZE
SELECT u.country, COUNT(*)
FROM users AS u
JOIN orders AS o ON o.user_id = u.id
WHERE o.status = 'paid'
GROUP BY u.country;
```

## 8. A performance workflow

1. **Reproduce with realistic data volume.** A query that is fast on 100 rows says nothing about 10 million.
2. **Find the slow statements** — `pg_stat_statements` ranks by total time and mean time.
3. **`EXPLAIN (ANALYZE, BUFFERS)`** the actual query. Look for seq scans on large tables, misestimated rows, sorts spilling to disk, and high `loops`.
4. **Fix the cause**: add/adjust an index, rewrite the predicate to be sargable, pre-aggregate, or reduce the rows before the expensive step.
5. **Measure again.** An index that is not used is not a fix.
6. **Watch the write cost.** Re-check insert/update latency and index bloat after adding indexes.

```sql run
EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM orders
WHERE status = 'cancelled'
ORDER BY placed_at DESC
LIMIT 5;
```

`Buffers: shared hit=… read=…` tells you how much came from cache. A query that is fast only because everything is cached will behave differently on a cold production cache.

> [!TIP]
> **ELI5: An index is the back-of-book index**
> A 900-page cookbook without an index means reading every page to find "chocolate cake". With an index you jump straight to page 402. But if you ask for "every recipe that contains sugar", the index does not help — you are reading the whole book anyway (a seq scan). And every time you publish a new edition, the index must be rebuilt (write cost).

## 9. Practice

1. Create an index that makes `WHERE user_id = ? ORDER BY placed_at DESC` use no explicit sort.
2. Write a partial index for "pending orders older than an hour" maintenance queries.
3. Find a non-sargable predicate in your own codebase and rewrite it.
4. Run `EXPLAIN ANALYZE` on a join and identify which side is hashed and why.
5. Check `pg_stat_user_indexes` for an unused index and decide whether it is safe to drop.
6. Compare `Seq Scan` vs `Index Scan` plans for `status = 'cancelled'` (a low-selectivity value) and explain the planner's choice.

## 10. Checklist

- [ ] Every foreign key has an index on the child column.
- [ ] Composite index columns are ordered: equality first, then range/sort.
- [ ] Predicates are sargable (no functions/casts on indexed columns).
- [ ] Low-selectivity filters use partial indexes rather than full-column indexes.
- [ ] Plans are checked with `EXPLAIN (ANALYZE, BUFFERS)` on realistic data.
- [ ] Estimated vs. actual row counts are compared; `ANALYZE` runs regularly.
- [ ] Index write cost and bloat are monitored.
- [ ] Unused indexes are reviewed, not kept "just in case".
