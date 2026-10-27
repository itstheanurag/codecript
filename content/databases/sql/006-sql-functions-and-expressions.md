---
title: Functions & Expressions
order: 9
description: The string, numeric, date/time, conditional, cast and JSON helpers you use every day — plus why wrapping a column in a function kills your index.
---

You rarely return raw columns. You format names, bucket timestamps, round money, coalesce missing values, and parse JSON. SQL's built-in function library is large; this chapter covers the 80% worth memorising and the mistakes that cost the most.

> [!NOTE]
> Names are PostgreSQL-first. MySQL equivalents are noted where they differ materially; SQL Server uses different names again (`LEN`, `GETDATE`, `ISNULL`).

## 1. The rule that governs everything: expressions are opaque to indexes

A normal B-tree index stores **column values**. If you wrap the column in a function, the index on the raw column cannot be used:

```sql
-- Cannot use an index on created_at (the function result is not indexed)
WHERE date_trunc('day', created_at) = '2026-01-01'

-- Sargable: the column is compared to constants, index can be used
WHERE created_at >= '2026-01-01' AND created_at < '2026-01-02'
```

This is called **sargability** (Search ARGument able). Chapter 10 goes deep; the takeaway here is:

- Prefer rewriting the **constant** rather than the **column**.
- If you must wrap the column, create an **expression index** on exactly that expression.

```sql
CREATE INDEX users_lower_email_idx ON users (lower(email));
-- Now this is fast:
SELECT * FROM users WHERE lower(email) = 'user1@example.com';
```

## 2. Strings

| Need | PostgreSQL | Notes |
|---|---|---|
| Concatenate | `'a' || 'b'`, `concat(a, b)`, `concat_ws(',', ...)` | `\|\|` returns NULL if any operand is NULL; `concat` skips NULLs |
| Case | `lower`, `upper`, `initcap` | `lower(email)` is the classic normalisation |
| Length | `length(s)`, `char_length(s)` | counts characters, not bytes |
| Trim | `trim`, `ltrim`, `rtrim`, `btrim` | `trim(both ' ' from s)` for explicit sides |
| Extract piece | `substring(s from 2 for 3)`, `substr(s, 2, 3)` | 1-based indexing |
| Search | `position('x' in s)`, `strpos(s, 'x')` | returns 0 when absent |
| Replace | `replace(s, 'a', 'b')` | all occurrences |
| Split | `split_part(s, ',', 2)` | returns the 2nd field |
| Slice | `left(s, 3)`, `right(s, 3)` | |
| Pad | `lpad(s, 5, '0')`, `rpad(s, 5, ' ')` | `'42'` → `'00042'` |
| Build strings | `format('%s (%s)', name, email)` | printf-style, NULL-safe |
| Pattern match | `LIKE`, `ILIKE`, `SIMILAR TO`, `~` (regex) | `ILIKE` is case-insensitive (Postgres) |
| Regex replace | `regexp_replace(s, 'pattern', 'replacement', 'g')` | |
| Regex extract | `regexp_match(s, '(\d+)')` | returns text[] |

```sql run
SELECT u.full_name,
       lower(u.email)                                    AS normalised_email,
       split_part(u.email, '@', 2)                       AS domain,
       upper(left(u.full_name, 1)) || '.' ||
         lower(split_part(u.full_name, ' ', 2))          AS handle,
       length(u.full_name)                               AS name_length
FROM users AS u
WHERE u.email ILIKE 'user1%'
ORDER BY u.id
LIMIT 5;
```

> [!WARNING]
> `LIKE '%term%'` cannot use a normal index — the leading wildcard forces a scan. Use a trigram index (`pg_trgm`), a full-text index (`tsvector`), or an external search engine. See [Search & Time-Series](/databases/008-search-and-time-series).

### NULL propagation

`'a' || NULL` is `NULL`, and so is almost any function applied to NULL. Use `concat`/`concat_ws` (which skip NULLs) or `coalesce`:

```sql
SELECT COALESCE(nickname, full_name) || ' <' || email || '>' FROM users;
```

## 3. Numbers

| Need | Function | Trap |
|---|---|---|
| Round | `round(x, 2)` | with `numeric`, half-up; with `double precision`, binary rounding |
| Truncate | `trunc(x, 2)` | toward zero, not "round down" |
| Ceiling/floor | `ceil(x)`, `floor(x)` | return numeric for numeric input |
| Absolute value | `abs(x)` | |
| Remainder | `mod(a, b)`, `a % b` | sign follows the dividend |
| Powers/roots | `power(a, b)`, `sqrt(x)` | |
| Random | `random()` | not cryptographic, not reproducible without a seed |
| Min/max across columns | `least(a, b)`, `greatest(a, b)` | NULL behaviour differs by dialect |

```sql run
SELECT 7 / 2                AS integer_division,   -- 3
       7.0 / 2              AS numeric_division,   -- 3.5
       7 % 2                AS remainder,          -- 1
       round(2.345, 2)      AS rounded,            -- 2.35
       trunc(2.349, 2)      AS truncated,          -- 2.34
       ceil(2.1)            AS ceiling,            -- 3
       greatest(3, 9, 4)    AS greatest;           -- 9
```

**Money must not be floating point.** `0.1 + 0.2` in `real`/`double precision` is not `0.3`. Store integer cents (as this project's schema does) or `numeric(12,2)`.

```sql run
SELECT 0.1::float8 + 0.2::float8 AS float_sum,
       0.1::numeric + 0.2::numeric AS numeric_sum;
```

`least`/`greatest` and NULL: PostgreSQL ignores NULL arguments; the SQL standard and MySQL return NULL if any argument is NULL. Do not rely on either without a `coalesce`.

## 4. Dates and times

Use `timestamptz` for instants (events, created_at) and `date` for calendar days. `timestamp` without time zone is a wall-clock value with no location — usually a bug in application data.

| Need | Function |
|---|---|
| Now | `now()`, `current_timestamp`, `current_date`, `current_time` |
| Truncate to bucket | `date_trunc('hour' \| 'day' \| 'week' \| 'month' \| 'year', ts)` |
| Extract field | `extract(year from ts)`, `extract(epoch from ts)` |
| Format | `to_char(ts, 'YYYY-MM-DD HH24:MI')` |
| Parse | `to_timestamp('2026-01-31', 'YYYY-MM-DD')` |
| Add/subtract | `ts + interval '7 days'`, `ts - interval '1 hour'` |
| Difference | `ts2 - ts1` (interval), `age(ts2, ts1)` (human-readable) |
| Convert zone | `ts AT TIME ZONE 'Asia/Kolkata'` |
| Current zone | `current_setting('TimeZone')` |
| Series | `generate_series(start, stop, interval)` |

```sql run
SELECT date_trunc('month', placed_at)::date       AS month,
       COUNT(*)                                   AS orders,
       SUM(total_cents) / 100.0                   AS revenue
FROM orders
WHERE placed_at >= date_trunc('month', now()) - interval '3 months'
GROUP BY 1
ORDER BY 1;
```

### Half-open ranges

Always express date ranges as `>= start AND < end`, never `BETWEEN` with timestamps:

```sql
-- Correct: includes all of Jan 31, excludes Feb 1 00:00
WHERE placed_at >= '2026-01-01' AND placed_at < '2026-02-01'

-- Wrong: BETWEEN '2026-01-01' AND '2026-01-31' silently drops 23:59:59.999
```

### Time zones

```sql run
SELECT now()                                   AS instant_with_zone,
       now() AT TIME ZONE 'UTC'                AS utc_wall_clock,
       (now() AT TIME ZONE 'Asia/Kolkata')     AS kolkata_wall_clock,
       extract(epoch FROM now())::bigint       AS unix_seconds;
```

`timestamptz AT TIME ZONE 'zone'` converts to a wall-clock `timestamp` in that zone. Going the other way, `'2026-01-01 00:00'::timestamp AT TIME ZONE 'UTC'` produces the corresponding instant. `date_trunc` on a `timestamptz` truncates in the **session** time zone — set it explicitly (`SET TIME ZONE 'UTC'`) if reports must be stable across environments.

## 5. Conditionals

```sql run
SELECT o.id,
       CASE
         WHEN o.total_cents >= 50000 THEN 'high'
         WHEN o.total_cents >= 15000 THEN 'medium'
         ELSE 'low'
       END AS bucket,
       CASE o.status
         WHEN 'paid' THEN 'settled'
         WHEN 'cancelled' THEN 'void'
         ELSE 'in flight'
       END AS stage,
       COALESCE(o.total_cents, 0) / 100.0 AS total,
       NULLIF(o.status, 'pending')        AS status_or_null
FROM orders AS o
ORDER BY o.id
LIMIT 8;
```

- **`CASE`** is the only portable conditional expression. It evaluates conditions **in order** and stops at the first true branch. Without `ELSE`, unmatched rows return `NULL`.
- **`COALESCE(a, b, c)`** returns the first non-NULL argument. Use it for defaults.
- **`NULLIF(a, b)`** returns NULL when `a = b`, otherwise `a`. Its main job is avoiding division by zero: `x / NULLIF(y, 0)`.
- **`GREATEST`/`LEAST`** clamp values, with the NULL caveat above.

> [!TIP]
> `CASE` inside an aggregate is the portable pivot: `SUM(CASE WHEN status = 'paid' THEN total_cents ELSE 0 END)`. `FILTER` is Postgres-specific sugar for the same idea (chapter 4).

## 6. Casts and conversions

```sql
SELECT '42'::integer            AS int_cast,
       CAST('2026-01-31' AS date) AS date_cast,
       '3.14159'::numeric(6,2)  AS rounded_by_cast,   -- 3.14
       42::text                 AS text_cast,
       't'::boolean             AS bool_cast;
```

Rules:

- `::type` and `CAST(x AS type)` are equivalent; `::` is Postgres-specific and shorter.
- Casting a `numeric` to `integer` **rounds** (not truncates): `2.5::int` → 3.
- Invalid text casts raise an error. Use `NULLIF`/validation, or a `try_cast` equivalent (Postgres has none built in; `to_number`/`to_date` are the safer parsers).
- Implicit casts can silently disable indexes: comparing `integer` to a `text` literal casts the **column**, not the literal, in some contexts. Match types.

## 7. JSON and JSONB

Prefer real columns for anything you filter or join on. Reach for `jsonb` (binary, indexable) for genuinely schemaless attributes.

| Operator | Returns |
|---|---|
| `j -> 'key'` / `j -> 0` | `jsonb` (nested) |
| `j ->> 'key'` / `j ->> 0` | `text` (scalar) |
| `j #> '{a,b}'` | `jsonb` at path |
| `j #>> '{a,b}'` | `text` at path |
| `j @> '{"a":1}'` | containment (boolean, GIN-indexable) |
| `j ? 'key'` | key exists (boolean) |
| `jsonb_array_elements(j)` | one row per array element |

```sql
SELECT payload ->> 'plan'                     AS plan,
       (payload ->> 'seats')::integer          AS seats
FROM subscriptions
WHERE payload @> '{"plan":"pro"}';

SELECT s.id, item ->> 'sku' AS sku
FROM subscriptions AS s
CROSS JOIN LATERAL jsonb_array_elements(s.payload -> 'items') AS item;
```

`json` stores text and re-parses on every access; `jsonb` is normalised, indexable, and what you almost always want. Note that `->` returns `jsonb` while `->>` returns `text` — mixing them up is why "why doesn't this number compare correctly?" happens (`->>` gives text, and `'10' > '9'` is false lexicographically).

> [!NOTE]
> For document-shaped data at scale, use a document database (or at least a GIN index on the columns you query). JSONB is a flexible *column type*, not a schema strategy — see [Document & Key-Value Stores](/databases/005-nosql-document-and-key-value).

## 8. Practice

1. Build a `display_name` that falls back from `full_name` to the email local part.
2. Bucket orders into `< $100`, `$100–$499`, `$500+` without a `CASE` in `WHERE`.
3. Return the number of orders per hour of day, for the last 7 days.
4. Format each order as `#42 · 2026-03-01 · $129.50`.
5. Find users whose email domain appears more than once (hint: `split_part` + `GROUP BY`/`HAVING`).
6. Explain why `WHERE upper(country) = 'IN'` cannot use an index on `country`, and write the index that fixes it without changing the query.

> [!TIP]
> **ELI5: Functions are kitchen tools**
> A knife (function) is only useful if you apply it to the right thing at the right time. `date_trunc` is a cookie cutter for time — cut the *data* into day-sized pieces, don't try to reshape the clock. And if you always cut your carrots the same way (a fixed expression), keep a pre-cut box (an expression index) so you don't redo the work on every order.

## 9. Checklist

- [ ] No function wraps an indexed column in `WHERE` without an expression index.
- [ ] `SUM`/`AVG` over money uses `numeric` or integer cents, never floats.
- [ ] Date ranges are half-open (`>= start AND < end`).
- [ ] Timestamps are `timestamptz`; reports pin the session time zone.
- [ ] Division is guarded with `NULLIF(denominator, 0)`.
- [ ] `CASE` covers the `ELSE` case or the NULL result is intentional.
- [ ] JSONB is used for attributes, not for fields you filter heavily.
- [ ] `->>` vs `->` is used correctly (text vs jsonb).
