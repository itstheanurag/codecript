---
title: Schema Design in Practice
order: 14
description: Turning requirements into tables — keys, normal forms, relationship patterns, type choices, deliberate denormalization, and the conventions that keep a schema maintainable.
---

Query skills let you ask questions of a schema. **Schema design** decides which questions are easy, which are expensive, and which become impossible.

Good schemas are boring: obvious table names, keys that mean something, constraints that encode the rules, and no surprises when the product changes. This chapter is the checklist experienced engineers apply before writing the first migration.

## 1. Start from access patterns, not from nouns

The classic mistake is to model the domain as a diagram of nouns and stop there. A schema must serve **queries**:

- What are the top three read paths? (list feed, detail page, report)
- What is the write path and its volume?
- What must be transactionally consistent?
- What grows without bound?

Sketch the queries first, then the tables. A schema that is "correct" but requires four joins for the main screen is a design failure that no index will fix.

```mermaid
flowchart LR
    A[Access patterns] --> B[Entities & relationships]
    B --> C[Keys & constraints]
    C --> D[Types & indexes]
    D --> E[Denormalisation where measured]
```

## 2. Keys

Every table needs a **primary key**: a stable, unique, non-null identifier.

| Option | Pros | Cons |
|---|---|---|
| `bigint GENERATED ALWAYS AS IDENTITY` | compact (8 bytes), index-friendly, sortable, fast joins | reveals counts; requires round trip to know the id |
| `uuid` (v4) | generatable client-side; unguessable | 16 bytes, random order → index bloat and cache misses |
| `uuid` (v7 / ULID) | client-side + time-ordered | newer; support varies |
| Natural key (`email`, `isbn`, `country_code`) | meaningful, no extra column | values change; wide; privacy concerns |
| Composite key (`order_id, line_no`) | natural uniqueness, no surrogate | every referencing table carries both columns |

Practical rules:

- **Use `bigint` identity** for internal entities unless you have a concrete reason for UUIDs (offline generation, public identifiers, merging data from many sources).
- **Never expose sequential ids** in URLs if enumeration is a security concern — use a separate public `uuid`/slug.
- **Every table gets a primary key**, including join tables (`(order_id, product_id)` or its own id if it carries attributes).
- **Foreign keys must be the same type as the parent key.** `bigint` vs `integer` mismatches are a classic silent performance bug.

## 3. Normalisation, without the ceremony

Normal forms are rules for eliminating redundancy and update anomalies:

| Form | Rule | Violation example |
|---|---|---|
| **1NF** | atomic values, no repeating groups | `phones = '555-1234,555-9876'` |
| **2NF** | no partial dependency on part of a composite key | `order_items(order_id, product_id, product_name)` — name depends only on product |
| **3NF** | no transitive dependency | `orders(order_id, customer_id, customer_city)` — city depends on customer |
| **BCNF** | every determinant is a candidate key | rare edge cases involving overlapping composite keys |

The first three cover almost everything in application schemas. Normalise until it hurts, then denormalise deliberately.

Common violations and the fix:

| Smell | Fix |
|---|---|
| CSV in a text column (`tags = 'a,b,c'`) | join table or `text[]` + GIN index |
| Repeated columns (`phone1`, `phone2`, `phone3`) | child table |
| Copied parent fields (`orders.customer_name`) | join, unless it is a deliberate historical snapshot |
| `status` plus three boolean flags that duplicate it | one status column (or an enum) |
| Money as `float` | `numeric` or integer cents |

> [!NOTE]
> Normalisation is about **writes** (one fact stored once). Analytics and read-heavy APIs often want the opposite: pre-joined, denormalised read models. That is a performance decision, not a modelling one — and it should be made with measurements.

## 4. Relationship patterns

### One-to-many

The child holds the foreign key:

```sql
CREATE TABLE orders (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id bigint NOT NULL REFERENCES users(id),
  ...
);
CREATE INDEX orders_user_id_idx ON orders (user_id);
```

Index the child column: without it, "orders for this user" scans the table, and deleting a user scans it again for the FK check.

### Many-to-many

A join table with a composite primary key:

```sql
CREATE TABLE product_tags (
  product_id bigint NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tag_id     bigint NOT NULL REFERENCES tags(id)     ON DELETE CASCADE,
  PRIMARY KEY (product_id, tag_id)
);
CREATE INDEX product_tags_tag_idx ON product_tags (tag_id);
```

The composite PK already indexes `(product_id, tag_id)` for lookups by product; add the reverse index for "products with this tag".

### One-to-one

Same key on both sides, or a unique FK:

```sql
CREATE TABLE user_profiles (
  user_id bigint PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bio text,
  avatar_url text
);
```

Do not use one-to-one to avoid nullable columns on the main table unless the split is justified by size or access pattern.

### Polymorphic associations

The `entity_type` + `entity_id` pattern ("comments belong to a post *or* a video") cannot be enforced by a foreign key, which means orphaned rows and impossible joins:

```sql
-- Hard to constrain, index, or cascade correctly.
CREATE TABLE comments (
  entity_type text NOT NULL,   -- 'post' | 'video'
  entity_id   bigint NOT NULL
);
```

Prefer:

- **Separate tables** (`post_comments`, `video_comments`) when rules differ.
- **A shared parent table** (`content_items`) when they are genuinely the same kind of thing.
- **Exclusive-arc columns** with `CHECK (num_nonnulls(post_id, video_id) = 1)` plus two real FKs — more columns, real integrity.

## 5. Types that age well

| Domain | Use | Avoid |
|---|---|---|
| Identifiers | `bigint` / `uuid` | `varchar(36)` for UUIDs |
| Money | integer cents or `numeric(p,2)` | `real`, `double precision`, `varchar` |
| Timestamps | `timestamptz` | `timestamp` (no zone), epoch strings |
| Calendar days | `date` | timestamps at midnight |
| Short enums | `text` + `CHECK`, or a lookup table | `enum` types when values change often |
| Flexible attributes | `jsonb` for low-traffic fields | JSONB for anything you filter/join on |
| Booleans | `boolean` | `char(1)` flags |
| Durations | `interval` or integer seconds | ambiguous units in integers |

### Money

Integer cents (`total_cents bigint`) or `numeric(12,2)`. Both are exact; integers are smaller and immune to formatting surprises. Whatever you choose, document the unit in the column name — `total` is a bug waiting to happen, `total_cents` is not.

### Enums vs lookup tables

- `CHECK (status IN ('pending','paid'))` or a PostgreSQL `enum`: simple, fast, awkward to change (adding values to a PG enum is easy since 9.1; removing/renaming is not).
- Lookup table (`statuses(id, label)`): referentially enforced, localisable, easy to extend, costs a join.

Rule of thumb: a fixed set the code depends on (order status) can be a `CHECK`/enum; user-editable taxonomy belongs in a table.

### JSONB: a column, not a schema

Use it for genuinely variable attributes (integration payloads, feature flags, per-tenant config). Do not use it to avoid migrations for core fields — you lose types, constraints, joins, and statistics. If you must query inside JSONB, index it (GIN) and accept the awkward syntax.

## 6. Deliberate denormalisation

Denormalise only after measuring, and always write down the invariant:

| Technique | Use when | Keep correct by |
|---|---|---|
| Cached counters (`orders.total_cents`) | hot read path, expensive aggregate | triggers, or recompute in the same transaction |
| Materialised read model | dashboards, search | periodic refresh / event-driven update |
| Copied historical fields (`invoice.customer_name`) | the value must be frozen at creation time | never update it on parent change |
| `text[]` tags | small, read-mostly, GIN-indexed | replace the whole array on write |

The danger is **dual sources of truth**. If `orders.total_cents` and `SUM(order_items)` can disagree, you need a reconciliation job, a trigger, or (best) a single write path that updates both in one transaction.

## 7. Soft deletes, audit columns, and tenancy

**Soft delete** (`deleted_at timestamptz`) preserves history but pollutes every query. If you use it:

- Add partial indexes (`WHERE deleted_at IS NULL`) and partial unique constraints.
- Centralise the filter (views, ORM scopes) so no query forgets it.
- Decide what happens to children and unique keys after deletion.

**Audit columns**: `created_at timestamptz NOT NULL DEFAULT now()`, `updated_at timestamptz` maintained by a trigger or the application. Prefer `timestamptz` and never trust the client clock.

**Multi-tenancy**: put `tenant_id` on every row, include it in every unique constraint and index prefix, and enforce it in queries *and* row-level security if using PostgreSQL. A missing `tenant_id` filter is a data breach, not a bug.

## 8. Constraints and naming are documentation

- Name constraints explicitly (`orders_status_check`, `users_email_key`) so errors are readable and migrations can drop them by name.
- Constraint names should describe the rule, not the mechanism.
- Use `snake_case`, singular table names, and consistent suffixes (`_id`, `_at`, `_cents`, `_url`).
- Add `COMMENT ON TABLE/COLUMN` for anything non-obvious — it lives next to the data.

```sql
CREATE TABLE payments (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id    bigint NOT NULL REFERENCES orders(id),
  provider    text NOT NULL,
  amount_cents bigint NOT NULL CHECK (amount_cents > 0),
  currency    char(3) NOT NULL DEFAULT 'USD',
  status      text NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  provider_ref text UNIQUE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON COLUMN payments.amount_cents IS 'Gross amount in minor units (cents).';
```

This schema prevents: negative payments, unknown statuses, duplicate provider references, and missing creation times — without a single line of application code.

## 9. Reviewing the sample schema

The schema used throughout this track:

```sql
users(id, email UNIQUE, full_name, country, created_at)
products(id, name, category, price_cents, in_stock)
orders(id, user_id FK, status CHECK, placed_at, total_cents)
order_items(id, order_id FK, product_id FK, quantity CHECK > 0, unit_price_cents)
employees(id, full_name, department, manager_id FK self, salary_cents, hired_at)
```

Deliberate choices:

- **Integer cents** for money — exact arithmetic across `SUM`/`AVG`.
- **`timestamptz`** for `placed_at`/`created_at` — no lost offsets.
- **`CHECK` on status** — invalid states are impossible, not just "unexpected".
- **`unit_price_cents` on the line item** — a historical price snapshot; product prices change, invoices must not.
- **Self-referencing `manager_id`** — a hierarchy; nullable for the root, indexed for recursion.
- **Join table with its own identity** — line items are entities (quantity, price), not just links.

Trade-offs worth naming: no `updated_at`, no soft delete, no tenant column, and no audit trail. Each is a decision you would revisit per product, not a universal rule.

## 10. Practice

1. Design tables for "a user can belong to many teams; a team has one owner" with the right keys and constraints.
2. Add a constraint that prevents a room from being double-booked for overlapping ranges.
3. Decide between a lookup table and a `CHECK` for payment status, and justify it.
4. Write the migration sequence to add a `tenant_id` to a live multi-tenant table without downtime.
5. Spot the modelling smell: `users(id, email, phone1, phone2, phone3, tags_csv)`.
6. Explain why `uuid` (v4) primary keys hurt insert-heavy workloads, and what to use instead.

## 11. Checklist

- [ ] Every table has a primary key of the right type.
- [ ] Foreign keys are declared, indexed, and have a deliberate `ON DELETE` action.
- [ ] Money, timestamps, and identifiers use precise types.
- [ ] Enums/status values are constrained in the database.
- [ ] Many-to-many relationships use a join table with the right indexes.
- [ ] JSONB is used for attributes, not for filtered core fields.
- [ ] Denormalised values have a single write path and a documented invariant.
- [ ] Naming is consistent (`_id`, `_at`, `_cents`) and constraints are named.
- [ ] Multi-tenant rows carry `tenant_id` in keys, indexes, and queries.
