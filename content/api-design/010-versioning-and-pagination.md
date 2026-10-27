---
title: Versioning & Pagination
description: What actually breaks a contract, versioning strategies that work, deprecation with telemetry, and cursor pagination that stays correct under writes.
order: 10
---

Two API details separate a hobby endpoint from a product: **how it evolves** and **how it scales result sets**. Both are contracts, not implementation details.

## What counts as a breaking change

| Change | Breaking? | Why |
|---|---|---|
| Add a response field | No | clients should ignore unknown fields |
| Add an optional request field | No | defaults preserved |
| Add a required request field | **Yes** | existing calls fail |
| Remove/rename a field | **Yes** | clients read it |
| Change a field's type/format | **Yes** | deserialisation breaks |
| Change nullability | **Yes** | clients may not handle null (or may rely on it) |
| Change enum values | Depends | tolerant clients survive; strict ones break |
| Change status code for a case | **Yes** | clients branch on status |
| Change default page size/order | **Yes** | results change |
| Tighten validation | **Yes** | previously valid requests fail |
| Add a new endpoint | No | additive |

The safest habit: **additive evolution within a version**, version only for genuine breaks.

## Versioning strategies

| Strategy | Example | Pros | Cons |
|---|---|---|---|
| URL path | `/v2/orders` | obvious, easy routing/caching | URL churn |
| Custom header | `API-Version: 2025-01-01` | clean URLs | invisible, easy to forget |
| Media type | `Accept: application/vnd.acme.v2+json` | REST-purist, content negotiation | tooling friction |
| Query param | `?version=2` | simple | pollutes cache keys |

Pick one and document it. Most public APIs use a **major version in the path** plus **additive changes** within it. Date-based versions (Stripe-style) work well for B2B APIs where clients pin a snapshot.

## Deprecation that works

A deprecation is a project, not an announcement:

1. **Announce** with a migration guide, timeline, and owner contact.
2. **Instrument usage** per client/version/endpoint. Without telemetry you cannot know who is affected.
3. **Send signals** in responses:

```http
Deprecation: true
Sunset: Wed, 01 Jul 2026 00:00:00 GMT
Link: <https://docs.example.com/migrate-v2>; rel="deprecation"
```

4. **Provide overlap**: run old and new versions concurrently.
5. **Warn, then brownout** (brief intentional failures) for laggards if policy allows.
6. **Remove** only after the sunset date and with a rollback plan.

Never break silently. Never reuse a version number for different behaviour.

## Client compatibility

- Clients should ignore unknown fields and tolerate enum additions.
- Servers should ignore unknown optional fields on input where safe.
- Contract tests: run the consumer's test suite against the provider, or validate responses against a published schema.
- Publish an OpenAPI/proto/GraphQL schema and diff it in CI; fail on breaking changes unless explicitly allowed.

## Pagination

### Offset pagination

```http
GET /orders?limit=50&offset=1000
```

Simple and supports "page N". Problems:

- `OFFSET 100000` scans and discards rows (slow);
- inserts/deletes shift rows → duplicates/skips between pages;
- unstable ordering without a unique tiebreaker.

Use for small, static datasets or admin UIs with small offsets.

### Cursor (keyset) pagination

```http
GET /orders?limit=50&cursor=eyJjcmVhdGVkQXQiOi...
```

The cursor encodes the last row's sort key:

```sql
SELECT id, created_at, total_cents
FROM orders
WHERE (created_at, id) < ($1, $2)
ORDER BY created_at DESC, id DESC
LIMIT $3;
```

Requirements:

- a **total order** — add a unique tiebreaker (`created_at, id`);
- an index matching the sort;
- an opaque cursor (base64 of the key) so clients do not depend on internals;
- a max page size enforced server-side.

Benefits: constant cost at any depth, stable under writes, index-friendly.

### Response shape

```json
{
  "data": [ ... ],
  "nextCursor": "eyJjcmVhdGVkQXQiOiIyMDI1LTAxLTAxVDAwOjAwOjAwWiIsImlkIjoib3JkXzEifQ==",
  "hasMore": true
}
```

Optional `prevCursor` for bidirectional navigation. Avoid `total` unless you can compute it cheaply; counting large tables is expensive.

### Page size and limits

- default small (20–50), max bounded (100–1000 depending on payload);
- reject or clamp larger requests explicitly;
- document whether the limit is per page or per query;
- protect expensive filters with rate limits or query budgets.

## Filtering and sorting are part of the contract

- Allowlist sortable/filterable fields; never pass raw input to SQL.
- Define default sort and tiebreakers; document them.
- Changing defaults is a breaking change.
- For complex filtering, consider a query language with a cost limit (or keep filters explicit).

## Common mistakes

- Offset pagination on a live, large table.
- No stable ordering → duplicate rows across pages.
- Cursors that encode SQL or are tamperable without validation.
- Versioning every additive change → version sprawl.
- Announcing deprecation without usage telemetry.
- Changing default page size silently.
- Returning `total` via `COUNT(*)` on every list request.

## Interview drill

**1. "Paginate a feed of 100M posts."**
- **Cover:** keyset `(score, id)`; matching index; opaque cursor; stable sort; page-size caps.
- **Follow-up:** "What if the feed is ranked?" (freeze ordering per session/page window).
- **Common miss:** offset pagination on a live, large table.

**2. "How do you migrate clients off v1?"**
- **Cover:** per-client usage telemetry; overlap window; `Deprecation`/`Sunset`; migration guide; brownouts; rollback.
- **Follow-up:** "What if you have no telemetry?" (add it before announcing).
- **Common miss:** announcing a sunset date without knowing who calls v1.

**3. "Is adding an enum value a breaking change?"**
- **Cover:** tolerant clients are fine; strict clients break; contract tests; docs; version only for real breaks.
- **Follow-up:** "How do you make clients tolerant?" (ignore unknown values, default branch).
- **Common miss:** assuming all additive changes are safe.

## Checklist

- [ ] Breaking vs additive changes are defined and enforced in CI.
- [ ] One versioning strategy is used consistently.
- [ ] Deprecation has telemetry, headers, a sunset date, and a migration guide.
- [ ] Lists use a stable total order with a tiebreaker.
- [ ] Pagination is cursor-based for large/live datasets.
- [ ] Page sizes are bounded server-side.
- [ ] Cursors are opaque and validated.
- [ ] Sorting/filtering fields are allowlisted and documented.
