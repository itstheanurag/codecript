---
title: API Design & Communication
description: Choosing between REST, GraphQL, gRPC, webhooks, and real-time transports — and the details that make an API usable, secure, and operable years after launch.
order: 0
---

An API is a **contract with a caller you do not control**. The contract includes:

- the transport and encoding,
- the shape of requests and responses,
- error semantics and retry rules,
- authentication and authorisation,
- versioning and deprecation,
- rate limits and pagination,
- the latency and consistency callers can expect.

Most API problems are not "wrong style". They are missing contracts: ambiguous errors, no idempotency, unbounded responses, silent breaking changes.

## Choosing a style

| Style | Best at | Weak at | Typical use |
|---|---|---|---|
| **REST/JSON** | resource CRUD, caching, broad clients | over/under-fetching, chatty UIs | public APIs, web/mobile backends |
| **GraphQL** | client-shaped reads, aggregation | caching, complexity limits, N+1 | product UIs with many views |
| **gRPC** | typed internal calls, streaming, low latency | browser support, human debuggability | service-to-service |
| **tRPC** | end-to-end types in a TS monorepo | non-TS clients, public APIs | internal full-stack TypeScript |
| **SOAP** | legacy enterprise contracts, WS-* | weight, tooling, modern clients | banking/insurance integrations |
| **Webhooks** | server-to-server events | delivery guarantees, security | integrations, async notifications |
| **SSE / WebSockets** | server push, live updates | scaling state, backpressure | feeds, presence, collaboration |

The right question is not "which is modern?" but:

1. Who are the callers (browser, mobile, service, third party)?
2. Is the interaction request/response, streaming, or event-driven?
3. What is the caching story?
4. What is the failure/retry story?
5. How will it evolve without breaking callers?

## The non-negotiables

Regardless of style, every production API needs:

### 1. Explicit errors

A machine-readable code, a human message, and a stable shape:

```json
{
  "error": {
    "code": "insufficient_funds",
    "message": "Balance is too low for this transfer.",
    "requestId": "req_01H...",
    "details": { "availableCents": 1200, "requiredCents": 5000 }
  }
}
```

Callers branch on `code`, not on prose. Include a request id for support.

### 2. Idempotency and safe retries

- `GET`/`HEAD` safe; `PUT`/`DELETE` idempotent; `POST` usually not.
- For `POST` that must be retryable, accept an `Idempotency-Key` and store the result.
- Document which errors are retryable (`429`, `503`, timeouts) and which are not (`400`, `409`).

### 3. Pagination and limits

No unbounded lists. Cursor pagination with a stable sort and a hard max page size. Return the next cursor, not a total count that requires a full scan.

### 4. Versioning and deprecation

Breaking changes need a plan: versioned path/media type, overlap window, sunset headers, migration guide. "We'll tell customers" is not a plan.

### 5. Authentication and authorisation

Authentication identifies the caller; authorisation decides what they may do. Both must be enforced server-side, per object, not just per endpoint.

### 6. Observability

- request id propagated across services,
- structured logs with route, status, latency, caller,
- metrics by endpoint/status,
- traces for multi-service calls.

### 7. Rate limits

Per key, per operation, with `429` + `Retry-After` and documented quotas. Protect both the API and its dependencies.

### 8. Compatibility discipline

- additive changes only within a version,
- never repurpose a field or change its type,
- tolerate unknown fields on the server,
- test against real clients/contracts.

## Latency budget

An API call is a chain. Budget it:

```
client → TLS → edge → gateway → auth → service → DB/deps → serialise → back
```

At p99, the tail of each hop adds. Keep synchronous fan-out small; move non-critical work to async events. An endpoint that calls five services has the availability of all five multiplied together.

## API review checklist

- [ ] Callers and use cases are named; the style fits them.
- [ ] Resource/endpoint names are nouns, not verbs (REST) or schema types (GraphQL).
- [ ] Errors have stable codes and actionable details.
- [ ] Mutating operations define idempotency.
- [ ] Every list is paginated with a bounded page size.
- [ ] Authn/authz are enforced per object, not only per route.
- [ ] Rate limits and retry guidance exist.
- [ ] Versioning/deprecation policy is written down.
- [ ] The API can be exercised by a new developer in under 10 minutes.
- [ ] Logs/metrics/traces identify slow and failing callers.

## Reading order

1. [HTTP Fundamentals](/api-design/001-http-fundamentals)
2. [REST Fundamentals](/api-design/002-rest-fundamentals)
3. [GraphQL](/api-design/003-graphql)
4. [SOAP APIs](/api-design/004-soap-apis)
5. [Modern RPC (gRPC & tRPC)](/api-design/005-grpc-and-trpc)
6. [Real-Time APIs (Polling & SSE)](/api-design/006-real-time-polling-sse)
7. [WebSockets & Scaling](/api-design/007-websockets-and-scaling)
8. [Webhooks & Events](/api-design/008-webhooks-and-events)
9. [API Security & OAuth 2.0](/api-design/009-api-security-and-oauth)
10. [Versioning & Pagination](/api-design/010-versioning-and-pagination)

> "A good API is boring to integrate and impossible to break by accident. Excitement belongs in the product, not the contract."
