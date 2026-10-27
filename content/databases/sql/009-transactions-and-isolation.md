---
title: Transactions & Isolation
order: 12
description: ACID in practice, isolation levels and the anomalies they prevent, row locking, deadlocks, and how to keep transactions short enough to survive production.
---

A transaction is a group of statements that succeed or fail **together**. It is the database's unit of consistency, and the thing that keeps a half-finished money transfer from becoming a real-world problem.

Most engineers can recite ACID. Far fewer can explain *which anomaly* a given isolation level prevents — or why their app still gets "could not serialize access" errors under load. This chapter closes that gap.

## 1. Transaction control

```sql
BEGIN;                          -- start
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;                         -- make it durable

BEGIN;
DELETE FROM orders WHERE id = 42;
ROLLBACK;                       -- undo everything since BEGIN
```

Nested transactions do not exist in SQL. What exists is **savepoints** — named checkpoints you can roll back to without losing the whole transaction:

```sql run
DROP TABLE IF EXISTS tx_demo;

BEGIN;

CREATE TEMP TABLE tx_demo (id integer);
INSERT INTO tx_demo VALUES (1);

SAVEPOINT before_risky;
INSERT INTO tx_demo VALUES (2);
ROLLBACK TO SAVEPOINT before_risky;   -- drops the id=2 insert

COMMIT;

SELECT * FROM tx_demo ORDER BY id;
```

Notes:

- Most drivers run in **autocommit** mode: every statement is its own transaction unless you explicitly `BEGIN`. That means two statements in your application are *not* atomic by default.
- `RELEASE SAVEPOINT name` forgets a savepoint; `ROLLBACK TO` keeps the savepoint active.
- In PostgreSQL, **DDL is transactional** (`CREATE TABLE`/`ALTER TABLE` roll back). In MySQL, DDL causes an implicit commit — a significant behavioural difference for migrations.
- Some statements cannot run inside a transaction block: `CREATE INDEX CONCURRENTLY`, `VACUUM`, `REINDEX CONCURRENTLY`.

## 2. The anomalies, precisely

| Anomaly | What happens | Example |
|---|---|---|
| **Dirty read** | You read another transaction's **uncommitted** write | Read a balance before the transfer commits |
| **Non-repeatable read** | You read the same row twice and get different values | Re-read an account mid-transfer |
| **Phantom read** | A re-run query returns **new rows** matching the predicate | `COUNT(*)` grows between two statements |
| **Lost update** | Two sessions read, both write, one overwrites the other | Two withdrawals both see $100 and both set $0 |
| **Write skew** | Two sessions read an invariant, each writes a different row, together breaking the invariant | Two doctors both go off-call because each sees the other still on |
| **Read skew** | One transaction sees an inconsistent snapshot across statements | Debit visible, credit not yet |

Dirty reads are essentially nonexistent in production databases because even the weakest real level (Read Committed) prevents them. The expensive ones are **lost update** and **write skew**, because they are not prevented by row locks alone.

## 3. Isolation levels

The SQL standard defines four levels. PostgreSQL implements three (its `READ UNCOMMITTED` behaves as `READ COMMITTED`):

| Level | Dirty read | Non-repeatable read | Phantom read | Lost update | Write skew |
|---|---|---|---|---|---|
| `READ COMMITTED` (default) | no | **yes** | **yes** | **yes**† | **yes** |
| `REPEATABLE READ` | no | no | no* | no | **yes** |
| `SERIALIZABLE` | no | no | no | no | no |

\* PostgreSQL's `REPEATABLE READ` is snapshot isolation and prevents phantoms as well — stronger than the standard requires.
† A single `UPDATE` re-reads the row under a lock, so a naive "read then write" in one statement is safe; a read-modify-write **across statements** is not.

Set it per transaction:

```sql
BEGIN ISOLATION LEVEL REPEATABLE READ;
-- or globally for a session:
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
```

### `READ COMMITTED` — the default

Each **statement** sees a snapshot taken at the start of that statement. Two reads in the same transaction can see different data. `UPDATE`/`DELETE` re-evaluate their `WHERE` against the latest committed row version when they hit a lock, which is why `UPDATE accounts SET balance = balance - 100` is safe, but `SELECT balance; ... ; UPDATE ... SET balance = <value from the SELECT>` is not.

### `REPEATABLE READ` — snapshot isolation

The whole transaction sees one snapshot. Concurrent commits are invisible. Writers that try to update a row changed since the snapshot get:

```
ERROR: could not serialize access due to concurrent update
```

Your application must **retry** the transaction.

### `SERIALIZABLE` — optimistic, not slow

PostgreSQL implements Serializable Snapshot Isolation (SSI): it tracks read/write dependencies and aborts transactions that *could* produce a serialization anomaly. No read locks, no blocking — but a non-trivial abort rate under contention.

```
ERROR: could not serialize access due to read/write dependencies among transactions
SQLSTATE: 40001
```

Both `REPEATABLE READ` and `SERIALIZABLE` require **retry loops** in the application. This is not optional: it is the contract.

```ts
// Sketch: retry serialization failures, with jitter and a cap.
for (let attempt = 0; attempt < 5; attempt++) {
  try {
    return await db.transaction(async (tx) => {
      // ... read + write ...
    }, { isolationLevel: "serializable" });
  } catch (error) {
    if (error.code !== "40001") throw error;
  }
}
```

> [!WARNING]
> Retries must re-run the **whole** transaction, including reads. Reusing values read before the abort defeats the purpose.

## 4. Explicit row locking

Sometimes you need to lock a row before you decide what to do with it. `SELECT ... FOR UPDATE` acquires a row-level lock that blocks other writers:

```sql
BEGIN;

SELECT balance
FROM accounts
WHERE id = 1
FOR UPDATE;          -- other sessions block here until COMMIT

UPDATE accounts SET balance = balance - 100 WHERE id = 1;

COMMIT;
```

Lock strengths, from strongest to weakest:

| Clause | Blocks | Use for |
|---|---|---|
| `FOR UPDATE` | other `UPDATE`/`DELETE`/`FOR UPDATE` | read-modify-write of the row |
| `FOR NO KEY UPDATE` | same (but not FK checks) | what a plain `UPDATE` takes internally |
| `FOR SHARE` | writers, allows other share locks | read consistency of a row you may later update |
| `FOR KEY SHARE` | deletes/updates of the key only | FK validation |

Modifiers:

- `FOR UPDATE NOWAIT` — fail immediately instead of blocking.
- `FOR UPDATE SKIP LOCKED` — ignore locked rows (the job-queue pattern).
- `FOR UPDATE OF table_alias` — lock only one side of a join.

### `SKIP LOCKED`: a work queue in SQL

```sql
BEGIN;

WITH job AS (
  SELECT id
  FROM jobs
  WHERE status = 'pending'
  ORDER BY created_at
  LIMIT 1
  FOR UPDATE SKIP LOCKED
)
UPDATE jobs
SET status = 'running', started_at = now()
WHERE id = (SELECT id FROM job)
RETURNING id, payload;

COMMIT;
```

Multiple workers run this concurrently and each gets a different job. Without `SKIP LOCKED`, they queue behind each other on the same row and throughput collapses.

`SKIP LOCKED` returns an incomplete view of the table by design. Never use it for anything except claiming work.

### Advisory locks

For application-level mutual exclusion (cron jobs, migrations), PostgreSQL has advisory locks that are not tied to any table:

```sql
SELECT pg_try_advisory_lock(42);   -- false if another session holds it
-- ... do the work ...
SELECT pg_advisory_unlock(42);
```

`pg_try_advisory_lock` is non-blocking; `pg_advisory_lock` waits. Session-level locks release on disconnect; `pg_advisory_xact_lock` releases at commit. They are global to the database — namespace your keys.

## 5. Deadlocks

A deadlock is two transactions each holding a lock the other needs:

```
Session A: UPDATE accounts SET ... WHERE id = 1;   -- locks row 1
Session B: UPDATE accounts SET ... WHERE id = 2;   -- locks row 2
Session A: UPDATE accounts SET ... WHERE id = 2;   -- waits for B
Session B: UPDATE accounts SET ... WHERE id = 1;   -- waits for A
```

PostgreSQL detects the cycle after `deadlock_timeout` (default 1 s) and aborts one transaction:

```
ERROR: deadlock detected
SQLSTATE: 40P01
```

Prevention, in order of effectiveness:

1. **Lock rows in a consistent order** (e.g. always ascending id). This eliminates most deadlocks.
2. **Keep transactions short** — the longer the window, the more chances to collide.
3. **Use one statement instead of several** where possible (`UPDATE ... FROM` instead of read-then-write).
4. **Retry** on `40P01` (and `40001`), with backoff.
5. Reduce the lock scope: `SELECT ... FOR UPDATE` on fewer rows; avoid locking entire tables.

> [!NOTE]
> Deadlocks are not a bug in the database — they are a scheduling outcome you must design for. An application that treats 40P01 as fatal will page someone at 3 a.m. for a solvable condition.

## 6. Long transactions are slow even when they are idle

An open transaction holds a snapshot. Consequences:

- **`VACUUM` cannot clean up** row versions newer than the oldest snapshot → table and index bloat.
- **DDL blocks** behind the transaction's locks; a single `idle in transaction` session can stall a migration indefinitely.
- **Replication and backups** can be delayed by long-running transactions.
- Locks accumulate; the chance of deadlock rises.

Rules:

- Never open a transaction and then call an external API, render a page, or wait for user input.
- Set timeouts: `SET idle_in_transaction_session_timeout = '30s'`, `SET statement_timeout = '5s'`.
- For reports, use a read-only transaction with a snapshot: `BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY;` — consistent results without blocking writers.
- Monitor `pg_stat_activity` for `state = 'idle in transaction'` and `xact_start`.

```sql
SELECT pid, state, now() - xact_start AS transaction_age, query
FROM pg_stat_activity
WHERE xact_start IS NOT NULL
ORDER BY transaction_age DESC
LIMIT 10;
```

## 7. Practice

1. Wrap two `UPDATE`s in a transaction and verify a `ROLLBACK` undoes both.
2. Use a savepoint to recover from a constraint violation without losing earlier work.
3. Simulate a lost update with two sessions on `psql`/the playground, then fix it with `SELECT ... FOR UPDATE`.
4. Explain why `READ COMMITTED` allows a phantom read but PostgreSQL's `REPEATABLE READ` does not.
5. Implement a retry wrapper for SQLSTATE `40001` and `40P01`.
6. Build the `SKIP LOCKED` job-claim query and explain what happens with 10 concurrent workers.

## 8. Checklist

- [ ] Multi-statement writes run inside an explicit transaction.
- [ ] The isolation level is chosen deliberately, not left to chance.
- [ ] Serialization/deadlock errors are retried, and the retry re-runs the whole transaction.
- [ ] Read-modify-write paths use `FOR UPDATE` or a single atomic `UPDATE`.
- [ ] Work queues use `FOR UPDATE SKIP LOCKED`.
- [ ] Transactions never wrap network calls or user think-time.
- [ ] `statement_timeout` / `idle_in_transaction_session_timeout` are set.
- [ ] Lock ordering is consistent across code paths that touch the same rows.
