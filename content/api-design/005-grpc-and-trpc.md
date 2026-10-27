---
title: Modern RPC (gRPC & tRPC)
description: Typed, code-generated remote calls with gRPC and end-to-end TypeScript with tRPC — streaming, deadlines, errors, versioning, and when not to use RPC at all.
order: 5
---

REST treats the network as a set of resources. **RPC treats it as function calls.** Both are valid; the trade-off is coupling versus ergonomics.

Two modern flavours dominate:

- **gRPC**: language-neutral, schema-first, HTTP/2, streaming.
- **tRPC**: TypeScript-only, no schema file, inferred types end to end.

## gRPC

### The contract

```proto
syntax = "proto3";

package orders.v1;

service OrderService {
  rpc GetOrder(GetOrderRequest) returns (Order);
  rpc WatchOrders(WatchRequest) returns (stream OrderEvent);
  rpc UploadItems(stream Item) returns (UploadSummary);
}

message GetOrderRequest { string id = 1; }

message Order {
  string id = 1;
  string status = 2;
  int64 total_cents = 3;
  string currency = 4;
}
```

- **proto3** is the schema; code is generated for every language.
- Field numbers are the wire contract — never reuse or renumber them.
- Add fields freely; remove/rename only after all clients migrate (use `reserved`).

### Transports

gRPC runs over **HTTP/2**, giving:

- multiplexed streams over one connection,
- binary framing and header compression,
- four call types: unary, server-streaming, client-streaming, bidirectional.

That makes it a good fit for service-to-service calls, large payloads, and streaming telemetry.

### Deadlines and cancellation

Every call should carry a deadline:

```ts
const client = new OrderServiceClient(addr);
const order = await client.getOrder(
  { id: "ord_1" },
  { deadline: Date.now() + 500 },
);
```

Deadlines propagate: when the caller's budget expires, the server is cancelled. Without deadlines, a slow dependency holds connections indefinitely.

### Errors

gRPC has its own status codes:

| Code | HTTP analogue | Retry? |
|---|---|---|
| `OK` | 200 | — |
| `INVALID_ARGUMENT` | 400 | no |
| `UNAUTHENTICATED` | 401 | after refresh |
| `PERMISSION_DENIED` | 403 | no |
| `NOT_FOUND` | 404 | no |
| `ALREADY_EXISTS` / `ABORTED` | 409 | re-read/retry |
| `RESOURCE_EXHAUSTED` | 429 | backoff |
| `FAILED_PRECONDITION` | 412 | no |
| `UNAVAILABLE` | 503 | yes, with backoff |
| `DEADLINE_EXCEEDED` | 504 | idempotent only |
| `INTERNAL` | 500 | not blindly |

Return `google.rpc.Status` details for structured errors; map to your domain codes at the boundary.

### Interceptors

Cross-cutting behaviour lives in interceptors (the middleware equivalent):

```ts
const auth: Interceptor = (options, nextCall) =>
  new InterceptingCall(nextCall(options), {
    start(metadata, listener, next) {
      metadata.set("authorization", `Bearer ${token()}`);
      next(metadata, listener);
    },
  });
```

Use them for auth, tracing, metrics, retries, and deadlines. Keep business logic out.

### Load balancing and health

- Client-side LB (round robin/least request) needs service discovery.
- Server-side LB via proxies (Envoy) is common.
- Health checking: `grpc.health.v1.Health/Check`.
- Long-lived connections need keepalive pings and reconnect/backoff.

### Browsers

Browsers cannot speak raw HTTP/2 gRPC. Options:

- **grpc-web** via a proxy (Envoy) — limited streaming.
- **Connect** protocol (gRPC-compatible over HTTP/1.1/JSON or binary).
- REST/JSON at the edge for public clients.

### Versioning

- Package name carries the version (`orders.v1`).
- Add fields, never repurpose numbers.
- Reserve removed numbers/names.
- Run old and new services side by side during migration.

## tRPC

tRPC removes the schema file by using TypeScript types directly:

```ts
export const appRouter = router({
  order: router({
    byId: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(({ input, ctx }) => ctx.orders.findById(input.id)),
    cancel: protectedProcedure
      .input(z.object({ id: z.string(), reason: z.string().max(200) }))
      .mutation(({ input, ctx }) => ctx.orders.cancel(input.id, input.reason)),
  }),
});

export type AppRouter = typeof appRouter;
```

Client:

```ts
const order = await trpc.order.byId.query({ id: "ord_1" });
```

Benefits:

- end-to-end type safety with zero codegen;
- input validation with Zod (runtime + types);
- excellent DX in a TypeScript monorepo;
- works over HTTP (queries/mutations) and WebSockets (subscriptions).

Constraints:

- **TypeScript only** — no Python/Go/Java clients.
- The client is coupled to the server implementation package; not suitable for public APIs.
- Versioning is a shared-package/versioning problem, not a wire contract.
- Large routers can slow type-checking; split them.

Use tRPC for internal full-stack TypeScript products; use REST/gRPC where other languages or third parties are involved.

## Choosing

| Need | Choose |
|---|---|
| Public API, broad clients, caching | REST |
| Service-to-service, streaming, polyglot | gRPC |
| Internal TS full-stack, fastest DX | tRPC |
| Legacy enterprise contract | SOAP |
| Browser push/live | SSE/WebSockets (or gRPC-web) |

## Failure modes

- **No deadlines** → connection exhaustion and cascading timeouts.
- **Retrying non-idempotent calls** → duplicate writes; add idempotency keys.
- **Field-number reuse** → silent data corruption across versions.
- **Blocking the event loop** in Node gRPC servers → all calls stall.
- **tRPC types drift** between client/server versions → runtime shape mismatches; deploy together.
- **Unbounded streaming** without backpressure → memory growth.

## Checklist

- [ ] Every call has a deadline/timeout and cancellation.
- [ ] Errors map to a documented status taxonomy.
- [ ] Field numbers are never reused; removed fields are reserved.
- [ ] Retries are limited to idempotent calls with backoff.
- [ ] Auth/tracing/metrics live in interceptors/middleware.
- [ ] Streaming has backpressure and size limits.
- [ ] Browser access uses grpc-web/Connect or a REST edge.
- [ ] The choice matches clients and team topology, not fashion.

Next: [Real-Time APIs](/api-design/006-real-time-polling-sse) — polling, SSE, and when push is worth the complexity.
