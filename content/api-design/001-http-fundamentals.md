---
title: HTTP Fundamentals
description: Methods, status codes, headers, caching, and connection behaviour — the parts of HTTP that decide whether your API is predictable, cacheable, and safe to retry.
order: 1
---

HTTP is a **request/response protocol** with semantics layered on top of a simple message format. The semantics — safety, idempotency, caching, status meaning — are the contract your clients rely on.

## The message

```
POST /v1/orders HTTP/1.1
Host: api.example.com
Content-Type: application/json
Authorization: Bearer <token>
Idempotency-Key: 7c1f...

{"items":[{"sku":"sku_1","qty":2}]}
```

```
HTTP/1.1 201 Created
Content-Type: application/json
Location: /v1/orders/ord_123
Cache-Control: no-store

{"id":"ord_123","status":"pending"}
```

Every part matters: method semantics, status meaning, headers for caching/auth/retries, and the body schema.

## Versions

| Version | What changed | Practical impact |
|---|---|---|
| HTTP/1.1 | text protocol, keep-alive, pipelining (rarely used) | one request at a time per connection; head-of-line blocking |
| HTTP/2 | binary framing, multiplexing, header compression, server push (deprecated) | many streams per connection; still TCP head-of-line at packet loss |
| HTTP/3 | runs over QUIC/UDP, per-stream loss recovery | better on lossy/mobile networks; TLS 1.3 built in |

For APIs, the version is mostly invisible: clients care about **connection reuse**, **multiplexing**, and **timeouts**. Keep-alive and HTTP/2 reduce handshake cost; HTTP/3 helps mobile tails.

## Methods and semantics

| Method | Safe | Idempotent | Body | Typical meaning |
|---|---|---|---|---|
| `GET` | yes | yes | no | read a resource |
| `HEAD` | yes | yes | no | metadata only |
| `POST` | no | **no** | yes | create / non-idempotent action |
| `PUT` | no | yes | yes | replace a resource at a known URI |
| `PATCH` | no | **not guaranteed** | yes | partial update |
| `DELETE` | no | yes | optional | remove a resource |
| `OPTIONS` | yes | yes | no | capabilities/CORS preflight |

**Safe** = no intended state change. **Idempotent** = repeating has the same effect. These are promises clients and infrastructure rely on:

- caches may serve `GET` without contacting you;
- proxies/load balancers may retry idempotent requests;
- clients may safely retry `PUT`/`DELETE` after a timeout.

If your `POST /orders` is not idempotent, retries create duplicate orders — unless you add an idempotency key.

`PATCH` is not idempotent in general (e.g., `{"op":"increment"}`); JSON Merge Patch (`application/merge-patch+json`) is.

## Status codes that matter

| Code | Meaning | Common mistake |
|---|---|---|
| `200` | OK | returning 200 for errors |
| `201` | Created (+ `Location`) | missing `Location` |
| `202` | Accepted (async) | using 200 for queued work |
| `204` | No content | sending a body anyway |
| `301/308` | Permanent redirect | changing method semantics accidentally (308 preserves) |
| `304` | Not modified | ignoring conditional requests |
| `400` | Bad request | using it for validation vs malformed |
| `401` | Unauthenticated | missing `WWW-Authenticate` |
| `403` | Authenticated but forbidden | leaking existence of resources |
| `404` | Not found | using 403 to hide, inconsistently |
| `409` | Conflict | using 400 for concurrency conflicts |
| `412` | Precondition failed | ignoring `If-Match` |
| `422` | Semantically invalid | mixing with 400 arbitrarily |
| `429` | Rate limited | no `Retry-After` |
| `500` | Server bug | leaking stack traces |
| `502/503/504` | Upstream/unavailable/timeout | retrying non-idempotent calls |

Clients branch on status families first (`2xx`, `4xx`, `5xx`), then on the error code in the body. Be consistent.

## Headers you will actually use

| Header | Purpose |
|---|---|
| `Content-Type` | body format (`application/json; charset=utf-8`) |
| `Accept` / `Accept-Encoding` | content negotiation (`gzip`, `br`) |
| `Authorization` | bearer token / basic / signature |
| `Cache-Control` | caching policy (`no-store`, `max-age`, `s-maxage`) |
| `ETag` / `If-None-Match` | conditional GET, optimistic concurrency |
| `If-Match` | optimistic locking (`412` on mismatch) |
| `Location` | created resource / redirect |
| `Retry-After` | backoff hint on 429/503 |
| `Idempotency-Key` | deduplicate retried writes (convention) |
| `X-Request-Id` | correlation across services |
| `Vary` | which request headers change the cache key |

## Caching

Two mechanisms:

**Freshness** (`Cache-Control`):

```http
Cache-Control: public, max-age=60, s-maxage=300, stale-while-revalidate=30
```

**Validation** (ETag):

```http
ETag: "v42"
If-None-Match: "v42"      ->  304 Not Modified (no body)
```

Use validation for user-specific or frequently changing data; use freshness for static/public data. Never cache authenticated responses publicly. Handle `Vary` carefully (`Accept-Encoding`, `Accept-Language`), or caches will serve the wrong variant.

## Content negotiation and compression

- Support JSON first; add others only with a real consumer.
- Compress large bodies (`gzip`/`br`) and set `Vary: Accept-Encoding`.
- Respect `Accept`; return `406` if you cannot satisfy it, or fall back explicitly.
- Avoid compression for tiny payloads and secrets where BREACH-style attacks matter.

## Connections, timeouts, and retries

HTTP is built on TCP (or QUIC). Consequences:

- **Handshakes are expensive**: reuse connections (keep-alive), pool them, and set idle timeouts above the upstream's.
- **Timeouts are mandatory**: connect, read, and total. A client without a timeout can hang forever.
- **Retries need idempotency**: retry `GET`/`PUT`/`DELETE` and idempotency-keyed `POST`; do not blindly retry `POST`.
- **Backoff with jitter** avoids synchronized retry storms.

```ts
const res = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json", "Idempotency-Key": key },
  body: JSON.stringify(payload),
  signal: AbortSignal.timeout(2_000),
});
```

## Cookies vs tokens

- **Cookies** are automatically attached by browsers; require `Secure`, `HttpOnly`, `SameSite`, and CSRF protection for state-changing requests.
- **Bearer tokens** are explicit; must be protected from XSS, scoped, short-lived, and rotatable.
- Never put secrets in URLs (they leak in logs/referrers).

## Common mistakes

- Returning `200` with `{"error": ...}` — breaks every generic client, cache, and monitor.
- Using `GET` for state changes — caches and prefetchers will execute them.
- No `Idempotency-Key` on a retryable `POST`.
- Unbounded lists and no pagination.
- Caching personalised responses publicly.
- Inconsistent error shapes across endpoints.
- Missing `Vary` and serving gzip to clients that cannot decode it.
- No timeout on outbound calls.

## Checklist

- [ ] Methods match safety/idempotency semantics.
- [ ] Status codes are correct and consistent; errors have stable codes.
- [ ] `Content-Type`, `Accept`, and compression are handled.
- [ ] Mutations define retry/idempotency behaviour.
- [ ] Caching policy is explicit (`no-store` for authenticated data).
- [ ] Timeouts and backoff are configured on clients.
- [ ] Cookies/tokens set `Secure`/`HttpOnly`/`SameSite` where applicable.
- [ ] Request ids propagate for debugging.

Next: [REST Fundamentals](/api-design/002-rest-fundamentals) — resources, representations, and the parts of REST worth keeping.
