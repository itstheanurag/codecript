---
title: Idempotency
description: Making retries safe — idempotency keys, deduplication tables, state machines, exactly-once illusions, and the partial-failure cases that double-charge customers.
order: 27
---

An operation is **idempotent** if performing it more than once has the same effect as performing it once.

This matters because distributed systems retry:

- clients time out and retry,
- load balancers retry,
- queues deliver **at least once**,
- workers crash after doing the work but before acknowledging,
- humans click "Pay" twice.

Without idempotency, every retry is a potential duplicate charge, duplicate order, or duplicate email.

## What is naturally idempotent

| Operation | Idempotent? | Why |
|---|---|---|
| `SET balance = 100` | ✅ | absolute assignment |
| `SET balance = balance + 100` | ❌ | relative change |
| `PUT /users/42 {name}` | ✅ | full replacement |
| `POST /orders` | ❌ | creates a new resource each time |
| `DELETE /orders/42` | ✅ (usually) | second call is a no-op |
| Publish an event | ❌ | consumers may process twice |
| Increment a counter | ❌ | adds twice |

The fix is not "don't retry"; it is to make the **effect** deduplicatable.

## Idempotency keys

A client generates a unique key per logical operation and sends it with every retry:

```http
POST /payments
Idempotency-Key: 7c1f0e0e-7d3a-4f2b-9d1e-2f7a1c9b4e11
Content-Type: application/json

{"amountCents": 4200, "currency": "USD", "customerId": "c_123"}
```

Server behaviour:

1. First request: process, persist the result **and the key** atomically.
2. Retry with the same key: return the stored result (same status, same body).
3. Same key with a **different payload**: reject with `409 Conflict` (key reuse is a client bug).
4. Concurrent requests with the same key: one processes, the others wait or return the in-progress result.

```sql
CREATE TABLE idempotency_keys (
  key            text PRIMARY KEY,
  request_hash   text NOT NULL,
  status         text NOT NULL,          -- in_progress | completed | failed
  response_code  integer,
  response_body  jsonb,
  created_at     timestamptz NOT NULL DEFAULT now(),
  expires_at     timestamptz NOT NULL
);
```

```ts
async function withIdempotency<T>(key: string, request: unknown, fn: () => Promise<T>) {
  const hash = sha256(JSON.stringify(request));

  const inserted = await db.query(
    `INSERT INTO idempotency_keys (key, request_hash, status, expires_at)
     VALUES ($1, $2, 'in_progress', now() + interval '24 hours')
     ON CONFLICT (key) DO NOTHING
     RETURNING key`,
    [key, hash],
  );

  if (inserted.rowCount === 0) {
    const existing = await loadKey(key);
    if (existing.request_hash !== hash) throw new Conflict("key reused with different payload");
    if (existing.status === "completed") return existing.response_body as T;
    if (existing.status === "in_progress") throw new RetryLater();
    throw new Error(`previous attempt failed for key ${key}`);
  }

  const result = await fn();
  await saveCompleted(key, result);
  return result;
}
```

The key table must be written in the **same transaction** as the business effect, or you reintroduce the dual-write problem.

## Exactly-once is an illusion

You can have:

- **at-most-once** delivery (may lose),
- **at-least-once** delivery (may duplicate),
- **effectively-once processing** (at-least-once + dedupe/idempotent consumer).

Kafka, SQS, and most brokers give at-least-once. "Exactly once" (e.g., Kafka transactions) is scoped to the broker + consumer offsets, not to your side effects on external systems.

Design for **effectively once**:

1. Every message carries a unique event id.
2. Consumers record processed ids (or use a naturally idempotent upsert).
3. The dedupe record and the side effect commit together.

```sql
INSERT INTO processed_events (event_id) VALUES ($1)
ON CONFLICT (event_id) DO NOTHING
RETURNING event_id;
-- If no row returned: already processed, skip.
```

For external side effects (charge a card, send an email), use the provider's idempotency key as well.

## State machines instead of booleans

Operations with multiple steps need explicit states:

```
created → authorized → captured → settled
        ↘ failed
```

Rules:

- Transitions are guarded (`captured` only from `authorized`).
- Retries are safe because a repeated transition is a no-op.
- Partial failures leave a state you can reconcile ("authorized but not captured").

A boolean `paid` cannot express "charged but not fulfilled"; a state machine can.

## Common failure cases

| Case | What goes wrong | Fix |
|---|---|---|
| Retry after timeout | server processed but response lost | idempotency key + stored result |
| Concurrent duplicate | two workers process the same key | unique constraint / advisory lock |
| Key reuse with different body | wrong result returned | hash payload, reject mismatch |
| Key expires too early | late retry duplicates | TTL longer than max retry window |
| Dedupe insert outside transaction | side effect committed, dedupe lost | same transaction / outbox |
| Provider lacks idempotency | duplicate charge | own state machine + reconciliation |
| Consumer processes then crashes before ack | redelivery | dedupe table committed with effect |
| At-least-once + non-idempotent email | duplicate emails | template id / send log |

> [!WARNING]
> The most expensive idempotency bug is a **dedupe record written before the effect** (or in a different transaction). The retry is then rejected while the original work never happened. Write the effect and the dedupe row atomically, or use an outbox.

## Choosing keys

- **Client-generated UUIDs** are best: retries reuse the key; the server does not need to infer intent.
- Derive keys from business identity when the client cannot: `order:{orderId}:capture` — but beware of legitimate repeated operations.
- Scope keys per tenant and endpoint to avoid collisions.
- Expire after the maximum retry horizon (hours to days, not seconds).

## Reconciliation

Even with idempotency, some flows end in an unknown state (provider timeout, process crash). A reconciliation job compares local state with the provider/system of record:

- find `in_progress` keys older than N minutes,
- query the provider by idempotency key,
- settle the local state or fail it explicitly.

Idempotency reduces duplicates; reconciliation closes the gap.

## Interview drill

**1. "A client retries a payment three times. How do you charge once?"**
- **Cover:** idempotency key table + payload hash; provider idempotency key; same transaction as the effect; stored response; TTL.
- **Follow-up:** "What about concurrent retries?" (unique constraint/in-progress state).
- **Common miss:** writing the dedupe record before the charge.

**2. "SQS delivers a message twice. How do you avoid duplicate emails?"**
- **Cover:** event id dedupe committed with the side effect; send log; provider idempotency; DLQ.
- **Follow-up:** "What if the process crashes after sending?" (send log before/with send, reconciliation).
- **Common miss:** an in-memory `Set` that resets on restart.

**3. "Make order creation idempotent without a client key."**
- **Cover:** natural key (`cart_id`); unique constraint; return the existing order; handle changed cart.
- **Follow-up:** "What if the cart changes between retries?" (reject or version the cart).
- **Common miss:** `SELECT` then `INSERT` without a constraint.

## Checklist

- [ ] Every retried write has an idempotency key or a natural unique key.
- [ ] The key, payload hash, and result are stored atomically with the effect.
- [ ] Reuse with a different payload is rejected.
- [ ] Consumers dedupe by event id in the same transaction as the side effect.
- [ ] Multi-step operations are state machines with guarded transitions.
- [ ] Key TTL exceeds the retry horizon.
- [ ] Reconciliation exists for unknown/partial states.
- [ ] External providers are called with their own idempotency keys.

Next: [Distributed Locking](/sys-design/029-distributed-locking) — mutual exclusion when the clock and network lie.
