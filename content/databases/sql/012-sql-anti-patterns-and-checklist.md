---
title: Anti-Patterns & Readiness Checklist
order: 15
description: The SQL mistakes that survive code review, why they hurt, and a practical checklist to know you are production-ready.
---

This chapter is the back cover of the track: the mistakes that show up again and again, and the checklist to run before you call yourself done.

## 1. The twenty anti-patterns

| # | Anti-pattern | Symptom | Fix |
|---|---|---|---|
| 1 | `SELECT *` | extra I/O, broken code when columns change | list columns |
| 2 | `NOT IN (subquery)` with NULLs | silently returns zero rows | `NOT EXISTS` |
| 3 | Function on an indexed column | index ignored, slow scans | rewrite range, or expression index |
| 4 | Implicit type cast | index ignored, wrong results | match types explicitly |
| 5 | `OFFSET` pagination | slows linearly; duplicates/skips on writes | keyset pagination |
| 6 | N+1 queries | hundreds of round trips per page | join / batch / eager load |
| 7 | `DISTINCT` to hide duplicates | masks a fan-out bug, costs a sort | fix the join grain |
| 8 | Missing index on FK | slow parent deletes, slow child lookups | index child columns |
| 9 | Over-indexing | slow writes, bloat, cache pressure | drop unused indexes |
| 10 | Money in floats | rounding errors, mismatched totals | `numeric` or integer cents |
| 11 | `timestamp` without zone | off-by-hours bugs across DST/regions | `timestamptz` |
| 12 | CSV/JSON in a text column | unqueryable, unindexable | join table, array, JSONB + GIN |
| 13 | EAV for core fields | every read becomes a pivot | real columns |
| 14 | No foreign keys | orphan rows, silent corruption | declare FKs |
| 15 | Read-then-write for uniqueness | duplicate rows under concurrency | `ON CONFLICT` / `MERGE` |
| 16 | Long transactions | bloat, locks, vacuum starvation | short transactions |
| 17 | Business logic only in triggers | invisible behaviour, hard debugging | app logic + constraints |
| 18 | `OR` across columns | planner falls back to seq scans | `UNION ALL`, partial indexes |
| 19 | Unordered `LIMIT` | different rows each run | deterministic `ORDER BY` |
| 20 | No retry on `40001`/`40P01` | random 500s under load | retry with backoff |

## 2. The ones worth seeing in code

### N+1: the ORM trap

```js
// One query for the list, then one per row: 1 + N round trips.
const orders = await db.query("SELECT * FROM orders LIMIT 50");
for (const order of orders) {
  order.user = await db.query("SELECT * FROM users WHERE id = $1", [order.user_id]);
}
```

```js
// One join: 1 round trip.
const orders = await db.query(`
  SELECT o.*, u.full_name AS user_name
  FROM orders AS o
  JOIN users AS u ON u.id = o.user_id
  LIMIT 50
`);
```

An ORM makes this easy to trigger and hard to see. Enable query logging in development and count the queries per request.

### Offset pagination

```sql run
-- Deep pages get slower and unstable when rows are inserted.
SELECT id, placed_at
FROM orders
ORDER BY placed_at DESC, id DESC
OFFSET 120 LIMIT 10;
```

```sql run
-- Keyset: constant cost, stable under writes.
SELECT id, placed_at
FROM orders
WHERE (placed_at, id) < ('2026-01-01 00:00+00', 999999)
ORDER BY placed_at DESC, id DESC
LIMIT 10;
```

Keyset pagination requires a deterministic total order (`placed_at, id`) and an index that matches it: `(placed_at DESC, id DESC)`.

### `SELECT *` in production

Beyond I/O, it couples your code to the physical schema: a new `blob` column, a rename, or a column reorder breaks deserialisation. `RETURNING *` has the same problem.

### Counting instead of existing

```sql
-- Scans every match just to answer yes/no
SELECT COUNT(*) FROM orders WHERE user_id = 7 AND status = 'cancelled';

-- Stops at the first match
SELECT EXISTS (SELECT 1 FROM orders WHERE user_id = 7 AND status = 'cancelled');
```

### Predicates that cannot use indexes

```sql
WHERE lower(email) = 'a@example.com'      -- expression index or normalise on write
WHERE created_at::date = '2026-03-01'     -- half-open range
WHERE status = 'cancelled' OR user_id = 7 -- different columns: consider UNION ALL
WHERE id IN (1, 2, 3) AND id <> 2          -- harmless, but the planner sees a scan
```

### Hidden fan-out in reports

Every "revenue is wrong" bug in this list's history was a join multiplied by a child table before a `SUM`. Aggregate at the parent grain, then join aggregates (chapters [2](/databases/sql/002-joins-in-depth) and [4](/databases/sql/004-aggregation-and-grouping)).

## 3. A schema smell test

Ask these ten questions about any schema you inherit:

1. Does every table have a primary key? Is it the right type?
2. Are all relationships enforced with foreign keys?
3. Are money, dates, and identifiers using precise types?
4. Is any column storing multiple values (CSV, JSON-as-schema)?
5. Are there `phone1..phone5`-style repeating columns?
6. Is there a `status` plus booleans that can contradict it?
7. Are historical facts (prices, addresses) snapshotted where they must be?
8. Is there a single source of truth for cached/denormalised values?
9. Do unique constraints exist for natural keys (email, slug, invoice number)?
10. Are multi-tenant tables scoped by `tenant_id` in keys, indexes, and queries?

Any "no" is a conversation, not necessarily a defect — but it should be a decision.

## 4. Production readiness checklist

### Queries

- [ ] Every list query has a deterministic `ORDER BY` and a bounded `LIMIT`.
- [ ] Filters are sargable; no functions/casts on indexed columns.
- [ ] Existence checks use `EXISTS`; anti-joins use `NOT EXISTS`.
- [ ] No `SELECT *` in application code.
- [ ] Aggregations are protected from fan-out.
- [ ] Pagination is keyset-based for deep pages.

### Schema

- [ ] Primary keys, foreign keys, and `NOT NULL` are declared.
- [ ] `CHECK`/`UNIQUE` constraints encode business rules.
- [ ] Money/timestamps use precise types (`numeric`/cents, `timestamptz`).
- [ ] Join tables and FK columns are indexed.
- [ ] Denormalised values have a single write path.

### Transactions

- [ ] Multi-statement writes are explicit transactions.
- [ ] Isolation level is chosen; serialization failures are retried.
- [ ] Read-modify-write uses `FOR UPDATE` or a single atomic statement.
- [ ] Upserts use `ON CONFLICT`/`MERGE`.
- [ ] Transactions do not wrap network calls or user think-time.

### Operations

- [ ] Slow queries are visible (`pg_stat_statements`, logs).
- [ ] Migrations set `lock_timeout`; big indexes use `CONCURRENTLY`.
- [ ] `ANALYZE`/`VACUUM` run automatically; bloat is monitored.
- [ ] Backups and restore are tested (a backup you cannot restore is not a backup).
- [ ] Connection pool size is intentional; no `idle in transaction` leak.
- [ ] Reads and writes are separable (replica/routing) if scale requires it.

### Security

- [ ] Queries are parameterised; no string concatenation (see [OWASP](/fundamentals/005-web-security-owasp)).
- [ ] Application users have least-privilege grants.
- [ ] Sensitive columns are encrypted at rest/in transit as required.
- [ ] Multi-tenant queries always filter by tenant.

## 5. Interview drill

Answer these out loud; the act of explaining exposes gaps.

1. **Why can't you use a `SELECT` alias in `WHERE`?** Because `WHERE` runs before `SELECT` in the logical order.
2. **`WHERE` vs `HAVING`?** Rows before grouping vs groups after aggregation.
3. **`COUNT(*)` vs `COUNT(col)`?** All rows vs non-NULL values.
4. **`INNER` vs `LEFT` join, and where do filters go?** Left keeps unmatched rows; right-table filters go in `ON` for outer joins, `WHERE` otherwise.
5. **What is fan-out?** A 1:N join multiplying parent rows, inflating aggregates.
6. **`ROW_NUMBER` vs `RANK`?** No ties vs ties with gaps.
7. **Why does `LAST_VALUE` return the current row?** Default frame ends at `CURRENT ROW`; use `UNBOUNDED FOLLOWING`.
8. **When does a CTE materialise?** Multiple references, recursion, or `MATERIALIZED`; single-reference non-volatile CTEs inline in PG 12+.
9. **How do you safely upsert?** `ON CONFLICT` on a unique key (or `MERGE`), never read-then-write.
10. **What is write skew, and which level prevents it?** Two transactions read an invariant and write different rows; only `SERIALIZABLE` prevents it.
11. **Why is `SELECT ... FOR UPDATE SKIP LOCKED` useful?** Concurrent workers claim different rows without blocking.
12. **Why can an index be ignored?** Low selectivity, non-sargable predicate, stale stats, or type mismatch.
13. **What does an index-only scan need?** All columns in the index (or `INCLUDE`) and a current visibility map.
14. **Why is `OFFSET 100000` slow?** The engine reads and discards 100,000 rows; keyset pagination avoids that.
15. **How do you add a `NOT NULL` column to a huge table?** Add nullable → backfill in batches → `CHECK ... NOT VALID` → `VALIDATE` → `SET NOT NULL`.

## 6. Where to go next

- **Practice** — run every example in the [SQL Playground](/playground) and work through the [64-question practice sheet](/playground) with instant feedback.
- **Optimisation** — [SQL Query Optimisation](/databases/004-sql-query-optimization) for the application-side view (N+1, keyset pagination, indexes).
- **Transactions at scale** — [Relational Databases](/databases/002-relational-databases) for replication, ACID, and sharding.
- **Storage choices** — [Choosing the Right Database](/databases/009-choosing-the-right-database) when relational is not the answer.
- **Operating it** — [Monitoring & Observability](/devops/009-monitoring-and-observability) for query telemetry in production.

> [!TIP]
> **ELI5: Readiness is reflexes, not trivia**
> A senior engineer does not recite normal forms at a whiteboard. They *notice* the missing `WHERE` before pressing Enter, *ask* about cardinality before joining, and *check* the plan before declaring victory. The checklist above is just those reflexes written down.

> "The query is the easy part. Knowing what one row means is the job."
