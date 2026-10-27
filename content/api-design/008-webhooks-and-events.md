---
title: Webhooks & Events
description: Delivering events to systems you do not control — signing, retries, idempotency, ordering, replay, secret rotation, and the security traps of outbound HTTP.
order: 8
---

A webhook is **an HTTP callback**: your system sends an event to a URL owned by a consumer. It replaces polling and couples you to consumer availability, which is why delivery needs careful design.

## Delivery semantics

Assume **at-least-once**:

- you retry failures,
- consumers may see duplicates,
- ordering is not guaranteed unless you design for it.

Do not promise exactly-once. Promise *effectively-once* processing via event ids and idempotent consumers.

## The request

```http
POST /hooks/orders HTTP/1.1
Host: consumer.example.com
Content-Type: application/json
X-Event-Id: evt_01H...
X-Event-Type: order.shipped
X-Event-Timestamp: 1735689600
X-Signature: t=1735689600,v1=5f3a...
User-Agent: CodeCript-Webhooks/1.0

{"id":"evt_01H...","type":"order.shipped","createdAt":"2025-01-01T00:00:00Z","data":{"orderId":"ord_1"}}
```

Include:

- a unique `event id` (idempotency),
- a `type` and a schema `version`,
- a timestamp,
- the signature headers,
- a minimal payload (ids + what changed), not the whole database row.

## Signing

Consumers must verify the request came from you. HMAC over a canonical string:

```ts
const timestamp = Math.floor(Date.now() / 1000);
const body = JSON.stringify(event);
const signature = createHmac("sha256", secret)
  .update(`${timestamp}.${body}`)
  .digest("hex");

headers["X-Event-Timestamp"] = String(timestamp);
headers["X-Signature"] = `t=${timestamp},v1=${signature}`;
```

Verification:

```ts
function verify(rawBody: string, header: string, secret: string): boolean {
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=")));
  const timestamp = Number(parts.t);
  if (Math.abs(Date.now() / 1000 - timestamp) > 300) return false; // replay window

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");

  return timingSafeEqual(Buffer.from(parts.v1), Buffer.from(expected));
}
```

Rules:

- sign the **raw body**, not a re-serialised object;
- include a timestamp to prevent replay;
- use constant-time comparison;
- support **secret rotation** (multiple active signatures);
- never put the secret in the payload or URL.

## Retries and delivery

| Policy | Recommendation |
|---|---|
| Timeout | 5–10 s per attempt |
| Retries | 5–10 attempts with exponential backoff + jitter |
| Retry on | timeouts, connection errors, 5xx, 429 |
| Do not retry | 4xx (except 408/429) |
| Success | any 2xx |
| Dead letter | after max attempts; expose in dashboard + replay |

Retries must be **scheduled durably** (queue/outbox), not in-memory. A deploy should not lose pending deliveries.

```ts
await deliveryQueue.add(
  "deliver",
  { eventId, url, payload },
  { attempts: 8, backoff: { type: "exponential", delay: 1_000 } },
);
```

## Ordering

HTTP delivery plus retries means events can arrive out of order:

- include a monotonically increasing `sequence` per subscription/stream;
- consumers buffer or reject stale sequences;
- or make consumers state-based (`order.shipped` sets status, not append).

Document that ordering is best-effort unless you provide a stream id + sequence and consumers enforce it.

## Replay

Consumers will have outages. Provide:

- a **replay endpoint/UI** by event id or time range,
- an API to fetch missed events (`GET /events?since=...`) for reconciliation,
- retention long enough for the worst realistic outage.

Replay must be idempotent on the consumer side; the same event id is sent again.

## Subscription management

- One or more endpoints per account/tenant.
- Verify endpoint ownership (challenge token or signed request).
- Store per-subscription secrets, event filters, and status.
- Auto-disable after sustained failure and notify the owner.
- Allow pause/resume and test delivery from the dashboard.

## Security

- **SSRF**: never fetch arbitrary URLs without validation; block private IP ranges and metadata endpoints, disallow redirects to internal hosts.
- **DNS rebinding**: resolve and pin, or use egress controls.
- **Redirects**: do not follow them (or re-validate the target).
- **TLS**: require HTTPS; validate certificates.
- **Payload secrecy**: assume the consumer endpoint may leak; send minimal data.
- **Rate limiting**: cap deliveries per consumer to avoid weaponising your retries.

> [!WARNING]
> Webhooks are outbound requests to untrusted URLs. Without SSRF protection, an attacker can make your server call internal services or cloud metadata endpoints.

## Versioning

- Version the **event schema** (`v: 1`), not the URL.
- Add fields; never change types/meaning in place.
- Keep old versions for the deprecation window.
- Publish a changelog and a test suite consumers can run.

## Testing

- **Contract fixtures**: sample payloads per event type/version.
- **Signature tests**: valid, expired, tampered, rotated secret.
- **Retry tests**: 500/timeout/429 then success.
- **Replay tests**: same event id delivered twice, consumer dedupes.
- **Security tests**: SSRF-blocked URL, redirect handling.
- **Consumer simulator** in the dashboard.

## Failure modes

| Failure | Impact | Fix |
|---|---|---|
| No signature | forged events accepted | HMAC + timestamp |
| Retry storm | consumer DDoS after outage | backoff + jitter + caps |
| In-memory retries | lost on deploy | durable queue |
| No idempotency | duplicate side effects | event id dedupe |
| Unverified URL | SSRF/internal access | allowlist/egress controls |
| Silent failures | events lost | DLQ + alerting + auto-disable |
| Schema change | consumer crashes | versioned additive evolution |

## Checklist

- [ ] Events carry a unique id, type, version, and timestamp.
- [ ] Requests are signed over the raw body with a replay window.
- [ ] Consumers can rotate secrets without downtime.
- [ ] Retries are durable, bounded, and jittered.
- [ ] A DLQ, alerting, and replay path exist.
- [ ] Endpoint ownership is verified; SSRF protections block private ranges.
- [ ] Ordering semantics are documented (or consumers are state-based).
- [ ] Event schemas evolve additively with a deprecation policy.

Next: [API Security & OAuth 2.0](/api-design/009-api-security-and-oauth) — identity, scopes, tokens, and the mistakes that become breaches.
