---
title: REST API Fundamentals
description: Resource modelling, naming, representations, filtering, pagination, concurrency control, and the pragmatic parts of REST that survive contact with real clients.
order: 2
---

REST is an architectural style, not a JSON convention. The useful core for application APIs is:

1. **Resources** are nouns identified by URIs.
2. **Representations** (JSON) are transferred, not the resources themselves.
3. **Uniform interface**: standard methods and status codes.
4. **Stateless requests**: each request carries the context it needs.
5. **Cacheable responses** where semantics allow.

Most "REST vs RPC" debates are really about **resource modelling and cacheability**, not purity.

## Modelling resources

Name **things**, not actions:

| Good | Avoid |
|---|---|
| `GET /orders` | `GET /getOrders` |
| `POST /orders` | `POST /createOrder` |
| `GET /orders/{id}` | `GET /order?id=...` |
| `POST /orders/{id}/cancel` | `POST /orders/{id}/actions/cancel` (acceptable for actions) |

Actions that are not CRUD can be modelled as sub-resources or explicit action endpoints:

```
POST /orders/{id}/cancel
POST /payments/{id}/capture
POST /users/{id}/verify-email
```

Pragmatic REST accepts action endpoints when forcing them into `PATCH status` would hide semantics.

### Hierarchy and depth

```
/customers/{customerId}/orders
/customers/{customerId}/orders/{orderId}/items
```

Two levels are readable; five levels become a query language. For deep relationships, prefer top-level resources with filters:

```
GET /orders?customerId=c_1&status=open
```

### Identifiers

- Opaque, stable, URL-safe (UUID/ULID/nanoid).
- Do not expose sequential integers if enumeration is a risk.
- Allow client-generated ids for idempotent creates where useful (`PUT /orders/{clientId}`).

## Representations

- JSON by default; be explicit about `Content-Type`.
- Use a consistent envelope or none at all — but be consistent:

```json
{ "data": { ... }, "meta": { ... } }
```

- Never change a field's type or meaning within a version.
- Tolerate unknown fields on input to allow additive evolution.
- Use ISO-8601 UTC timestamps and integer cents (or decimal strings) for money.

## Collections

| Need | Convention |
|---|---|
| Filter | `?status=open&customerId=c_1` |
| Sort | `?sort=-createdAt,id` (document allowed fields) |
| Paginate | `?limit=50&cursor=...` |
| Search | `?q=...` |
| Fields | `?fields=id,status,total` (sparse fieldsets) |
| Expand | `?expand=customer` (avoid unbounded nesting) |

**Pagination**: prefer cursor/keyset over offset.

```http
GET /orders?limit=50&cursor=eyJjcmVhdGVkQXQiOi...
```

```json
{
  "data": [ ... ],
  "nextCursor": "eyJjcmVhdGVkQXQiOi...",
  "hasMore": true
}
```

Offset pagination slows down and skips/duplicates rows under writes. If you must support page numbers, cap the offset.

## Status codes, again

| Operation | Success | Notes |
|---|---|---|
| List | `200` | paginated |
| Get | `200` / `304` | conditional GET |
| Create | `201` + `Location` | or `202` if async |
| Replace | `200`/`204` | `412` on `If-Match` mismatch |
| Patch | `200`/`204` | document merge semantics |
| Delete | `204`/`202` | idempotent: second delete → 204/404 consistently |
| Validation | `400`/`422` | one convention, documented |
| Conflict | `409` | duplicate key, state conflict |
| Auth | `401`/`403` | never conflate |
| Rate limit | `429` + `Retry-After` | |

## Errors

```json
{
  "error": {
    "code": "order_already_shipped",
    "message": "Order ord_123 has shipped and cannot be cancelled.",
    "requestId": "req_01H...",
    "details": { "orderId": "ord_123", "status": "shipped" }
  }
}
```

- `code` is stable and machine-readable.
- `message` is for humans and may change.
- Field-level validation errors belong in `details`.
- Do not leak stack traces or SQL.

## Concurrency control

Two clients edit the same resource. Options:

1. **Optimistic** (preferred for APIs): `ETag` + `If-Match`.

```http
GET /orders/ord_1
ETag: "v7"

PATCH /orders/ord_1
If-Match: "v7"
```

Mismatch → `412 Precondition Failed`; the client re-reads and retries.

2. **Version field** in the body (`version: 7`), same semantics with `409`.
3. **Pessimistic locks** (`POST /orders/{id}/lock`) — avoid for public APIs; they do not compose with retries.

## Batch and bulk operations

- Prefer a small number of explicit endpoints over one generic `POST /batch`.
- Bulk creates should be **idempotent per item** and return per-item results, not one opaque failure:

```json
{
  "results": [
    { "index": 0, "status": 201, "id": "ord_1" },
    { "index": 1, "status": 409, "error": { "code": "duplicate" } }
  ]
}
```

- Cap batch size; large imports belong in an async job with a status endpoint.

## HATEOAS: the pragmatic take

Hypermedia links (`_links`) help discoverability and decouple clients from URL construction:

```json
{
  "id": "ord_1",
  "status": "open",
  "_links": {
    "self": "/orders/ord_1",
    "cancel": "/orders/ord_1/cancel",
    "items": "/orders/ord_1/items"
  }
}
```

Most teams use links only for pagination and actions. Full HATEOAS (clients navigating solely by links) is rare outside mature public APIs; do not force it.

## REST anti-patterns

- Verbs in paths for CRUD (`/getUser`).
- Returning different shapes for the same resource in different endpoints.
- `200` with an error body.
- Unbounded collections.
- Deep nesting that mirrors the database schema.
- Chatty APIs that force N+1 calls for one screen.
- Using `POST` for reads because it is "easier".
- Breaking changes without versioning.

## When REST is the wrong choice

- **Highly connected, client-shaped reads** → GraphQL.
- **Low-latency service-to-service** with streaming → gRPC.
- **Server-push** updates → SSE/WebSockets.
- **Event fan-out to many consumers** → webhooks/queues, not polling REST.

## Interview drill

**1. "Design the API for a booking system."**
- **Cover:** resources (properties, availability, bookings); hold → confirm; idempotency; concurrency control; hold expiry; pagination.
- **Follow-up:** "How do you prevent double booking?" (DB constraint + version/lock).
- **Common miss:** offset pagination for availability and no hold semantics.

**2. "How do you prevent double booking?"**
- **Cover:** unique/exclusion constraint or conditional update; optimistic version; row lock; hold TTL; idempotency key.
- **Follow-up:** "What if the payment fails after the hold?" (expiry/release, state machine).
- **Common miss:** a check-then-insert in application code only.

**3. "How do you evolve this API?"**
- **Cover:** additive changes; versioning strategy; deprecation headers/telemetry; contract tests; migration guide.
- **Follow-up:** "Is adding an enum value breaking?" (tolerant clients vs strict ones).
- **Common miss:** silent breaking changes and no usage telemetry.

## Checklist

- [ ] Resources are nouns; actions are explicit sub-resources.
- [ ] Methods and status codes match semantics.
- [ ] Collections have filtering, stable sort, and cursor pagination.
- [ ] Errors have stable codes and field details.
- [ ] Writes define idempotency and concurrency behaviour (`ETag`/version).
- [ ] Bulk operations return per-item outcomes and are bounded.
- [ ] Representations evolve additively; no field repurposing.
- [ ] The API is cacheable where semantics allow.

Next: [GraphQL](/api-design/003-graphql) — client-shaped reads and the operational costs that come with them.
