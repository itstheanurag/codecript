---
title: GraphQL
description: Schema-first client-shaped reads, resolver mechanics, the N+1 and caching problems, complexity limits, field-level authorisation, and when GraphQL is the wrong tool.
order: 3
---

GraphQL is a **typed query language and runtime** for APIs. The client asks for exactly the fields it needs from a schema; the server resolves them.

```graphql
query OrderSummary($id: ID!) {
  order(id: $id) {
    id
    status
    total { amount currency }
    customer { name email }
    items(first: 10) {
      edges { node { sku quantity } }
    }
  }
}
```

One round trip replaces several REST calls and over-fetching. The cost moves to the server: resolving a graph is harder than returning a resource.

## The schema is the contract

```graphql
type Order {
  id: ID!
  status: OrderStatus!
  total: Money!
  customer: Customer!
  items(first: Int = 20, after: String): OrderItemConnection!
  createdAt: DateTime!
}

type Query {
  order(id: ID!): Order
  orders(filter: OrderFilter, first: Int = 20, after: String): OrderConnection!
}

type Mutation {
  cancelOrder(id: ID!, reason: String): CancelOrderResult!
}
```

Rules that keep it healthy:

- **Nullable by default** for fields that can fail; `!` is a promise.
- **Connections** (cursor pagination) for lists; avoid unbounded arrays.
- **Input types** for mutations; return result unions for expected failures.
- **No business logic in the schema**; types describe shape, resolvers enforce rules.

## Resolvers and the N+1 problem

A resolver runs per field. Naively:

```ts
const resolvers = {
  Order: {
    customer: (order) => db.customers.findById(order.customerId),
    items: (order) => db.items.findByOrder(order.id),
  },
};
```

A query for 100 orders performs **201 database calls**. This is the defining performance problem of GraphQL.

**DataLoader** batches and caches per request:

```ts
const customerLoader = new DataLoader<string, Customer>(async (ids) => {
  const rows = await db.customers.findByIds([...ids]);
  const byId = new Map(rows.map((row) => [row.id, row]));
  return ids.map((id) => byId.get(id) ?? new Error(`missing ${id}`));
});

const resolvers = {
  Order: {
    customer: (order) => customerLoader.load(order.customerId),
  },
};
```

Batching works when the resolver returns a key and the loader defers execution to the end of the tick. Every list field needs this treatment (items, users, counts).

## Caching is harder than REST

| Layer | REST | GraphQL |
|---|---|---|
| HTTP/CDN | URL is the cache key | single POST endpoint; needs persisted queries |
| Client cache | per URL | normalised entity cache (Apollo/Relay) |
| Server cache | per resource | field/resolver-level (DataLoader, Redis) |

Techniques:

- **Persisted queries** (hash → query) so GET + CDN caching is possible.
- **Entity-level caching** keyed by type/id.
- **Response caching** only for public, non-personalised queries.
- **`Cache-Control` hints per field** (some servers support this).

Never let a CDN cache a response containing another user's data.

## Security and abuse

A single query can ask for 10,000 nested items. Protect the server:

- **Depth limit** (e.g., 10).
- **Complexity/cost limit**: assign weights per field and reject expensive queries before execution.
- **Pagination caps** on every connection.
- **Timeouts and query allowlists** for persisted queries.
- **Disable introspection** in production if it helps (not a security boundary by itself).
- **Rate limit by cost**, not just request count.

```ts
const cost = estimateCost(document, { maxDepth: 10, maxCost: 1000 });
if (cost > limit) throw new GraphQLError("query too expensive", { extensions: { code: "QUERY_TOO_EXPENSIVE" } });
```

## Authorisation

Authorise **per field and per object**, not just at the entry point:

```ts
const resolvers = {
  Order: {
    total: (order, _args, ctx) => {
      if (!ctx.user.can("order:read:financial", order)) return null;
      return order.total;
    },
  },
};
```

A schema can expose a field that some callers must not see; hiding it in the UI is not authorisation. Consider field-level policies, tenant scoping, and tests for unauthorised access.

## Errors and partial data

GraphQL can return **data and errors together**:

```json
{
  "data": { "order": { "id": "o1", "customer": null } },
  "errors": [{ "message": "customer unavailable", "path": ["order", "customer"], "extensions": { "code": "UPSTREAM" } }]
}
```

Clients must handle partial responses. Use stable `extensions.code` for machine handling, and avoid leaking internals in messages.

For expected business failures, prefer **result unions** over throwing:

```graphql
union CancelOrderResult = Cancelled | OrderNotCancellable

type OrderNotCancellable { reason: String! }
```

## Schema evolution

- Add fields/types freely (non-breaking).
- Deprecate with `@deprecated(reason: "...")` and a sunset date.
- Never change a field's type or nullability in place; introduce a new field.
- Remove only after usage analysis (field-level telemetry).
- Version the schema only for major breaking changes; prefer additive evolution.

## Federation

Large organisations split the graph into subgraphs (orders, users, inventory) behind a gateway:

- each team owns its subgraph and schema;
- the gateway plans queries across services;
- entity references (`@key`) stitch types together.

Federation solves **ownership**, at the cost of a query planner, cross-service calls, and harder debugging. Do not adopt it for a single team.

## When GraphQL is a good fit

- Many clients (web, mobile, partner) needing different shapes.
- Aggregating several services behind one contract.
- Product UIs with deeply nested, variable data needs.
- Teams willing to invest in DataLoader, cost limits, and schema governance.

## When it is not

- Simple CRUD with few clients → REST is cheaper.
- Heavy binary/streaming transfer → gRPC or HTTP.
- Public APIs where caching and simple integration matter more than flexibility.
- Teams without the operational maturity for query cost control.

## Interview drill

**1. "Why is your GraphQL endpoint slow?"**
- **Cover:** N+1 resolvers; DataLoader batching; unbounded list fields; expensive resolvers; missing indexes; response size.
- **Follow-up:** "How do you trace a query?" (per-field spans, resolver timing).
- **Common miss:** blaming GraphQL instead of resolver/database access patterns.

**2. "How do you rate limit GraphQL?"**
- **Cover:** query cost/depth limits; pagination caps; persisted queries; per-field weights; timeouts; per-client budgets.
- **Follow-up:** "How do you stop a malicious nested query?" (reject before execution).
- **Common miss:** counting requests instead of cost.

**3. "How do you cache GraphQL?"**
- **Cover:** persisted queries over GET + CDN for public data; normalised client cache; entity cache server-side; `private` for personalised data.
- **Follow-up:** "How does authorisation affect caching?" (per-user keys or no shared cache).
- **Common miss:** caching personalised responses at the edge.

## Checklist

- [ ] The schema models the domain, not the database.
- [ ] Lists use cursor connections with caps.
- [ ] Every relation uses batching (DataLoader) and per-request caching.
- [ ] Depth, complexity, timeout, and pagination limits are enforced.
- [ ] Authorisation is field/object level.
- [ ] Errors have stable codes; partial data is handled by clients.
- [ ] Deprecation policy and field usage telemetry exist.
- [ ] Introspection and playgrounds are controlled in production.

Next: [SOAP APIs](/api-design/004-soap-apis) — the enterprise contract you will meet in banking and insurance.
