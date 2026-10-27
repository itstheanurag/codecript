---
title: Observer Pattern
description: A subscription mechanism done safely — unsubscribe, error isolation, ordering, async delivery, memory leaks, and when an in-process observer is the wrong tool.
order: 11
---

Observer lets a **subject** notify a set of **observers** when something happens, without the subject knowing what they do.

The in-process version is a pub/sub list:

```ts
interface Observer<T> {
  update(event: T): void;
}
```

The pattern is simple. The production problems are not: leaks, listener errors, ordering, async delivery, and the illusion of reliability.

## The problem it solves

Placing an order should trigger email, analytics, loyalty points, and warehouse reservation. Writing that inline couples checkout to four systems and four failure modes:

```ts
await sendEmail(order);
await analytics.track("order_placed", order);
await loyalty.award(order);
await warehouse.reserve(order);
```

Observer inverts the dependency: checkout publishes `OrderPlaced`; listeners subscribe. Checkout does not import the email or warehouse modules.

## A safe in-process implementation

```ts
type Listener<T> = (event: T) => void | Promise<void>;

export class EventBus<T> {
  private readonly listeners = new Set<Listener<T>>();
  private readonly onError: (error: unknown, listener: Listener<T>) => void;

  constructor(onError: (error: unknown, listener: Listener<T>) => void) {
    this.onError = onError;
  }

  subscribe(listener: Listener<T>): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async publish(event: T): Promise<void> {
    // Snapshot: listeners may unsubscribe while we iterate.
    for (const listener of [...this.listeners]) {
      try {
        await listener(event);
      } catch (error) {
        // One broken listener must not stop the others.
        this.onError(error, listener);
      }
    }
  }
}
```

Three deliberate choices:

1. **`subscribe` returns an unsubscribe function** — the caller controls its lifetime.
2. **Iteration uses a copy** — a listener may unsubscribe itself or others during dispatch.
3. **Errors are isolated and reported** — not swallowed, not allowed to break the loop.

Usage:

```ts
type OrderPlaced = { orderId: string; customerId: string; totalCents: number };

const bus = new EventBus<OrderPlaced>((error) => logger.error({ error }, "listener failed"));

const unsubscribeEmail = bus.subscribe(async (event) => {
  await emails.sendReceipt(event.customerId, event.orderId);
});

const unsubscribeAnalytics = bus.subscribe((event) => {
  analytics.track("order_placed", { total: event.totalCents });
});

await bus.publish({ orderId: "o1", customerId: "c1", totalCents: 4200 });

unsubscribeEmail(); // important: components must unsubscribe on shutdown
```

## Push vs. pull

| Style | Event carries | Observer does |
|---|---|---|
| **Push** | the full payload | reacts immediately; cheap, but payload changes ripple |
| **Pull** | an id/reference | fetches what it needs; more decoupled, extra I/O |
| **Hybrid** | id + summary | avoids stale payloads while staying cheap |

Push payloads become an implicit contract. If the email listener only needs `orderId` and `customerId`, do not send the whole order object; send a versioned, minimal event.

## Production failure modes

### 1. Memory leaks

A subscriber that outlives its owner (component, request, connection) keeps the owner alive and receives events after it is destroyed.

- Always store and call the unsubscribe function (`useEffect` cleanup, `onModuleDestroy`).
- Prefer subscription scopes: a `SubscriptionBag` disposed with the request.
- In long-lived processes, log listener counts and alert on unbounded growth.

### 2. Listener errors

In a naive implementation, the first throwing listener prevents the rest. In a "fire and forget" implementation, failures disappear. Decide explicitly:

- isolate per listener (as above);
- report to a logger/metric;
- define whether `publish` fails when listeners fail (rarely) or succeeds with recorded failures.

### 3. Ordering

Listeners run in registration order in-process. That order can change as modules initialize. If order matters (inventory before email), do not encode it in subscription timing — use an explicit pipeline or a queue.

### 4. Async semantics

`publish` that awaits listeners is **sequential**; `Promise.all` is concurrent but fails as a group unless wrapped. Neither is a message queue:

- there is no retry;
- there is no durability (a crash loses events);
- there is no delivery guarantee;
- a slow listener back-pressures the publisher (or grows an unbounded queue if you fire and forget).

### 5. Duplicate or missing delivery

At-least-once requires idempotent consumers. In-process observers are usually **at-most-once**: if the process dies after the database commit but before notification, the event is lost. For money, inventory, or anything auditable, use the **outbox pattern** and a real broker.

### 6. Unbounded fan-out

One event with 50 listeners, each doing I/O, turns a 5 ms publish into a 2-second request. Measure fan-out; keep listeners thin (enqueue work, don't perform it inline).

## Observer vs. event bus vs. queue

| Mechanism | Scope | Durability | Delivery | Use for |
|---|---|---|---|---|
| **Observer** (this pattern) | in-process object graph | none | synchronous call | UI updates, in-process hooks |
| **Event bus** | in-process, decoupled modules | none | sync/async | domain events inside one service |
| **Message queue / broker** | across services/processes | yes (usually) | at-least-once | integration, retries, backpressure |
| **Outbox + relay** | database → broker | yes | at-least-once | reliable domain events after commit |

The pattern does **not** make delivery reliable. If the business rule says "the receipt must eventually be sent", the observer alone is not enough.

> [!WARNING]
> Never `await bus.publish(...)` inside a database transaction and assume the notification is committed atomically with the data. If the transaction rolls back, the email has already gone out. Publish after commit, or record an outbox row in the same transaction.

## Pulling the design apart

A robust domain event flow often looks like:

1. The use case writes state **and** an outbox row in one transaction.
2. A relay publishes the outbox row to a broker.
3. Consumers are idempotent (dedupe by event id) and retry with backoff.

The Observer pattern still appears inside the relay or UI layer — but it is no longer the guarantee.

## Testing

- **Subject test**: subscribe two listeners, publish, assert both receive the event.
- **Unsubscribe test**: after unsubscribe, no calls.
- **Error isolation test**: one listener throws, the second still runs, the error reporter is called.
- **Snapshot test**: a listener unsubscribes during dispatch; iteration is safe.
- **Async test**: `publish` resolves only after awaited listeners (if that is the contract).
- **Leak test** (optional): assert listener count returns to zero after disposal.

```ts
test("one failing listener does not stop the next", async () => {
  const errors: unknown[] = [];
  const bus = new EventBus<number>((error) => errors.push(error));
  const seen: number[] = [];

  bus.subscribe(() => { throw new Error("boom"); });
  bus.subscribe((n) => { seen.push(n); });

  await bus.publish(1);

  expect(seen).toEqual([1]);
  expect(errors).toHaveLength(1);
});
```

## Exercises

1. Implement `EventBus` with unsubscribe, error isolation, and copy-on-iterate.
2. Add a `SubscriptionBag` that disposes all subscriptions when a request ends.
3. Decide which of your domain events are safe to lose. Move the rest to an outbox.
4. Measure the fan-out of your busiest event; move slow listeners off the request path.
5. Write a test proving a listener cannot break delivery to another.

## Checklist

- [ ] Every subscription has an owner that unsubscribes on shutdown.
- [ ] Listener errors are isolated and reported.
- [ ] Ordering requirements are explicit, not accidental registration order.
- [ ] Events are minimal and versioned, not entire entities.
- [ ] Async delivery semantics are documented (sequential/concurrent, awaited/fire-and-forget).
- [ ] Reliability requirements use an outbox/queue, not the in-process bus.
- [ ] Publishing happens after commit, never inside a transaction whose rollback would contradict the notification.
