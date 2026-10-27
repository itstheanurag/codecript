---
title: DML, DDL & Constraints
order: 11
description: Safe INSERT/UPDATE/DELETE, upserts with ON CONFLICT and MERGE, schema changes, and the constraint toolbox that keeps bad data out of the database.
---

`SELECT` gets the attention; writes cause the incidents. This chapter covers the statements that change data and structure, with the failure modes that matter in production: lost updates, accidental mass deletes, locking migrations, and constraints that silently do nothing.

## 1. `INSERT`

```sql
-- One row, with generated values returned
INSERT INTO users (email, full_name, country, created_at)
VALUES ('ada@example.com', 'Ada Lovelace', 'GB', now())
RETURNING id, created_at;

-- Many rows in one statement (one round trip, one transaction)
INSERT INTO users (email, full_name, country, created_at)
VALUES ('a@example.com', 'A', 'IN', now()),
       ('b@example.com', 'B', 'US', now()),
       ('c@example.com', 'C', 'DE', now());

-- Copy from another query
INSERT INTO archived_orders (id, user_id, total_cents)
SELECT id, user_id, total_cents FROM orders WHERE placed_at < '2025-01-01';

-- All defaults
INSERT INTO users DEFAULT VALUES;
```

Rules and traps:

- **Multi-row `VALUES` is much faster than a loop.** Each statement has round-trip and commit overhead; batching 500–5,000 rows per statement is typical.
- **`RETURNING`** gives you server-generated values (`id`, defaults, triggers) without a second query.
- **Always list the columns.** `INSERT INTO t VALUES (...)` breaks the day someone adds a column, and it silently reorders data.
- `INSERT ... SELECT` takes the same locks as a normal insert; it is atomic by itself but can be long-running on big tables.

## 2. Upsert: insert-or-update

Two sessions inserting the same unique key both see "not found" and both try to insert; one fails. Do not write `SELECT`-then-`INSERT` in application code — use an atomic upsert.

### PostgreSQL: `ON CONFLICT`

```sql run
DROP TABLE IF EXISTS tags;
CREATE TEMP TABLE tags (
  id    integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name  text NOT NULL UNIQUE,
  uses  integer NOT NULL DEFAULT 0
);

INSERT INTO tags (name) VALUES ('sql'), ('postgres'), ('joins');

-- Ignore a duplicate
INSERT INTO tags (name) VALUES ('sql')
ON CONFLICT (name) DO NOTHING;

-- Or update it; `excluded` is the row you tried to insert
INSERT INTO tags (name, uses) VALUES ('sql', 1)
ON CONFLICT (name) DO UPDATE
SET uses = tags.uses + excluded.uses
RETURNING id, name, uses;
```

Key points:

- `ON CONFLICT (name)` requires a **unique index/constraint** on `name`. Without a target (`ON CONFLICT DO NOTHING` with no column list) it catches *any* unique violation.
- `excluded` refers to the proposed row; the table name refers to the existing row.
- `DO UPDATE ... WHERE ...` lets you skip no-op updates:

```sql
ON CONFLICT (name) DO UPDATE SET uses = tags.uses + 1
WHERE tags.uses < 100
```

- Concurrent upserts can still deadlock if two sessions touch the same keys in different orders. Sort input keys when batching.
- `ON CONFLICT` does not see rows inserted by *uncommitted* other transactions; the conflict resolution happens at the index level, so it is safe, but it cannot "merge" with a row it cannot see.

### PostgreSQL 15+: `MERGE`

`MERGE` handles richer cases (match, not-matched, source rows used for delete), and is part of the SQL standard:

```sql
MERGE INTO inventory AS inv
USING (VALUES (1, 10), (2, -3)) AS incoming (product_id, delta)
   ON inv.product_id = incoming.product_id
WHEN MATCHED AND inv.quantity + incoming.delta >= 0 THEN
  UPDATE SET quantity = inv.quantity + incoming.delta
WHEN MATCHED THEN
  DELETE
WHEN NOT MATCHED THEN
  INSERT (product_id, quantity) VALUES (incoming.product_id, incoming.delta);
```

MySQL uses `INSERT ... ON DUPLICATE KEY UPDATE`; SQL Server has `MERGE` (with a long history of concurrency caveats — prefer `UPDATE`/`INSERT` with proper locking).

> [!WARNING]
> Upserts only protect **unique keys**. They do not prevent two sessions from reading the same row and overwriting each other's changes. That is a lost update — see [chapter 9](/databases/sql/009-transactions-and-isolation).

## 3. `UPDATE`

```sql
UPDATE orders
SET status = 'cancelled',
    total_cents = 0
WHERE id = 42
RETURNING id, status;
```

### Update from another table

```sql run
DROP TABLE IF EXISTS order_flags;
CREATE TEMP TABLE order_flags AS
SELECT id AS order_id, false AS flagged FROM orders;

UPDATE order_flags AS f
SET flagged = true
FROM orders AS o
WHERE o.id = f.order_id
  AND o.status = 'cancelled';

SELECT COUNT(*) FILTER (WHERE flagged) AS flagged_orders,
       COUNT(*)                        AS total_orders
FROM order_flags;
```

The `FROM` clause is a join, so **a non-unique join key will update the same target row multiple times** (only the last write survives — silently). Make sure the join target is unique; `UPDATE ... FROM (SELECT DISTINCT ...)` if unsure.

### Update in batches

PostgreSQL has no `UPDATE ... LIMIT`, but you can restrict by key:

```sql
WITH batch AS (
  SELECT id FROM orders WHERE status = 'pending' ORDER BY id LIMIT 1000 FOR UPDATE SKIP LOCKED
)
UPDATE orders SET status = 'paid'
WHERE id IN (SELECT id FROM batch)
RETURNING id;
```

Batching keeps transactions short (locks, WAL, replication lag) and makes retries possible.

> [!CAUTION]
> `UPDATE t SET active = false;` with no `WHERE` updates every row. Some clients run statements on Enter. Use transactions for manual work (`BEGIN; UPDATE ...; SELECT ...; COMMIT;`), and make the `WHERE` visible before the `SET`.

## 4. `DELETE`, `TRUNCATE`, `DROP`

| Statement | Scope | Speed | Rollback-able? | Resets identity? |
|---|---|---|---|---|
| `DELETE` | rows matching `WHERE` | slow (row-by-row, WAL, triggers) | Yes | no |
| `TRUNCATE` | all rows | very fast (deallocates pages) | Yes in Postgres | optional `RESTART IDENTITY` |
| `DROP TABLE` | the table itself | instant | Yes in Postgres | n/a |

```sql
DELETE FROM sessions
WHERE expires_at < now()
RETURNING id, user_id;

-- Fast reset of a staging table
TRUNCATE TABLE staging_events RESTART IDENTITY;
```

Details:

- `TRUNCATE` takes an `ACCESS EXCLUSIVE` lock and is blocked by foreign keys referencing the table unless you `TRUNCATE ... CASCADE` — which also truncates the referencing tables. Know exactly what you are cascading.
- `DELETE` fires triggers and writes WAL per row; deleting 10 million rows in one statement will bloat the table and hold locks. Delete in batches with a small sleep.
- `ON DELETE CASCADE` on a foreign key turns a parent delete into a child delete. Great for ownership ("delete user → delete their sessions"); dangerous when a "lookup" table is referenced by business data.

### Soft deletes

`deleted_at timestamptz NULL` instead of a hard delete:

- Keeps referential history and lets support "undelete".
- Every query must now filter `WHERE deleted_at IS NULL` — forget once and you leak deleted data.
- Unique constraints need partial indexes: `CREATE UNIQUE INDEX ... ON users (email) WHERE deleted_at IS NULL;`

Prefer hard deletes plus an audit/event table unless the product genuinely needs restore.

## 5. DDL: defining structure

```sql
CREATE TABLE invoices (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id  bigint NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  number       text NOT NULL,
  issued_at    date NOT NULL,
  due_at       date NOT NULL,
  total_cents  bigint NOT NULL CHECK (total_cents >= 0),
  currency     char(3) NOT NULL DEFAULT 'USD',
  notes        text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT invoices_number_unique UNIQUE (customer_id, number),
  CONSTRAINT invoices_due_after_issue CHECK (due_at >= issued_at)
);
```

```sql
ALTER TABLE invoices ADD COLUMN paid_at timestamptz;
ALTER TABLE invoices ALTER COLUMN notes SET NOT NULL;         -- fails if NULLs exist
ALTER TABLE invoices ALTER COLUMN notes DROP NOT NULL;
ALTER TABLE invoices DROP COLUMN paid_at;
ALTER TABLE invoices RENAME COLUMN number TO invoice_number;
```

### Identity vs serial

- `GENERATED ALWAYS AS IDENTITY` (SQL standard, PostgreSQL 10+) is the modern choice: it owns the sequence, prevents accidental manual inserts, and supports `OVERRIDING SYSTEM VALUE`.
- `serial` is legacy shorthand (`integer + sequence + default`); it leaks the sequence and allows manual IDs.
- Use `bigint` for ids. `integer` overflows at ~2.1 billion, and migrating an id column under load is painful.

### Generated columns

```sql
ALTER TABLE order_items
  ADD COLUMN line_total_cents integer GENERATED ALWAYS AS (quantity * unit_price_cents) STORED;
```

Stored generated columns are computed on write and can be indexed. Use them for cheap derived values; do not use them for values that depend on other tables (not allowed) or on `now()` (not allowed — functions must be immutable).

## 6. Constraints: the cheapest data quality you will ever buy

| Constraint | Guarantees | Notes |
|---|---|---|
| `PRIMARY KEY` | unique + not null | one per table; also an index |
| `UNIQUE` | no duplicate values | NULLs are distinct by default (Postgres 15+: `NULLS NOT DISTINCT`) |
| `NOT NULL` | value present | independent of PK |
| `FOREIGN KEY` | value exists in parent | prevents orphans; costs a lookup on write |
| `CHECK` | predicate holds | row-level; cannot reference other rows/tables |
| `EXCLUDE` | no overlapping ranges | needs GiST + `btree_gist` for equality columns |

```sql
-- A booking system: no double-booking the same room for overlapping stays.
CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE bookings
  ADD CONSTRAINT no_overlap
  EXCLUDE USING gist (
    room_id WITH =,
    tstzrange(starts_at, ends_at) WITH &&
  );
```

Foreign key actions:

| Action | On parent delete |
|---|---|
| `RESTRICT` / `NO ACTION` | block the delete (default) |
| `CASCADE` | delete children |
| `SET NULL` | null the child's FK (column must be nullable) |
| `SET DEFAULT` | set the child's FK to its default |

Deferrable constraints let you break the rule temporarily **inside a transaction** — required for circular references and bulk loads:

```sql
ALTER TABLE invoices
  ADD CONSTRAINT invoices_customer_fk
  FOREIGN KEY (customer_id) REFERENCES customers(id)
  DEFERRABLE INITIALLY DEFERRED;
```

> [!TIP]
> Constraints are documentation the database *enforces*. `CHECK (total_cents >= 0)` costs microseconds per write and saves an incident where a refund bug creates negative revenue. Application validation is UX; constraints are correctness.

## 7. Changing a schema without an outage

PostgreSQL has **transactional DDL** — `ALTER TABLE` rolls back with the transaction. That does not make it free: most `ALTER TABLE` variants take an `ACCESS EXCLUSIVE` lock, blocking reads *and* writes for their duration. On a large table, a "quick" type change can be a multi-minute outage because it waits behind a long-running query.

Safe patterns:

| Change | Safe approach |
|---|---|
| Add a nullable column | `ADD COLUMN` (metadata-only in PG 11+) |
| Add a column with default | safe in PG 11+ (no table rewrite for non-volatile defaults) |
| Add `NOT NULL` to a big table | add `CHECK (col IS NOT NULL) NOT VALID`, backfill, `VALIDATE CONSTRAINT`, then `SET NOT NULL` |
| Add a FK / CHECK | `ADD CONSTRAINT ... NOT VALID`, then `VALIDATE CONSTRAINT` (no full lock) |
| Add an index | `CREATE INDEX CONCURRENTLY` (cannot run inside a transaction) |
| Change a column type | usually a full rewrite; for `varchar` widening it is metadata-only, for others plan a shadow column |
| Rename a column | expand/contract: add new → dual-write → backfill → switch reads → drop old |
| Backfill data | batch by id, commit per batch, throttle |

Always set a lock timeout for migrations:

```sql
SET lock_timeout = '3s';
SET statement_timeout = '60s';
ALTER TABLE orders ADD COLUMN ...;
```

If the lock cannot be acquired, the migration fails fast instead of queueing behind a long query and blocking every new request.

> [!WARNING]
> `CREATE INDEX CONCURRENTLY` can leave an **invalid** index if it fails. Check `pg_index.indisvalid`, drop and retry — an invalid index still costs writes but is not used for reads.

## 8. Practice

1. Upsert five `tags` rows in one statement, incrementing `uses` on conflict.
2. Set `orders.total_cents` to the sum of their line items in a single `UPDATE ... FROM`.
3. Delete cancelled orders older than a year, returning the affected ids.
4. Add a `CHECK` constraint that prevents negative `order_items.quantity`.
5. Explain why `ALTER TABLE ... ADD COLUMN x int NOT NULL DEFAULT 0` is fast on PostgreSQL 16 but was a rewrite on PostgreSQL 10.
6. Write the migration sequence to add a `NOT NULL` foreign key to a 50-million-row table without locking it for more than a second.

## 9. Checklist

- [ ] `INSERT` lists columns explicitly and uses `RETURNING` for generated values.
- [ ] Upserts use `ON CONFLICT` / `MERGE`, not read-then-write.
- [ ] `UPDATE ... FROM` joins on a unique key.
- [ ] Destructive statements have a `WHERE`, and manual work runs in a transaction.
- [ ] `CASCADE` behaviour is understood on every foreign key.
- [ ] Every important business rule has a `CHECK`/`UNIQUE`/`FK` backing it.
- [ ] Migrations set `lock_timeout` and avoid long `ACCESS EXCLUSIVE` locks.
- [ ] Index creation on live tables uses `CONCURRENTLY`.
