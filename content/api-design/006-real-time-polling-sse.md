---
title: Real-Time APIs (Polling & SSE)
description: Short polling, long polling, and Server-Sent Events — latency, cost, reconnection semantics, proxy traps, and how to scale each without melting the origin.
order: 6
---

"Real-time" is a latency requirement, not a protocol. Choose the cheapest transport that meets it.

| Transport | Direction | Latency | Complexity | Best for |
|---|---|---|---|---|
| Short polling | client → server | interval | lowest | low-frequency updates |
| Long polling | server holds request | low | medium | compatibility fallback |
| SSE | server → client | low | low-medium | feeds, notifications, progress |
| WebSockets | bidirectional | lowest | high | chat, collaboration, games |

## Short polling

The client asks every N seconds:

```ts
useEffect(() => {
  const id = setInterval(async () => {
    const res = await fetch("/api/notifications?since=" + lastSeen);
    setNotifications(await res.json());
  }, 5_000);
  return () => clearInterval(id);
}, [lastSeen]);
```

Pros: trivial, works everywhere, stateless servers, cacheable.

Cons:

- latency up to the interval;
- load scales with `clients / interval` even when nothing changed;
- wasteful for large fleets.

Make it cheap:

- `?since=<cursor>` and `304 Not Modified` when nothing changed;
- jitter intervals to avoid synchronized spikes;
- back off when idle; poll faster only during known activity;
- cap response size and send deltas, not full state.

## Long polling

The client sends a request; the server holds it open until data exists or a timeout:

```ts
async function longPoll(cursor: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  try {
    const res = await fetch(`/api/events?since=${cursor}`, {
      signal: controller.signal,
    });
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}
```

Server side:

- park the request (async, not a blocked thread);
- wake on new events or timeout (return `204`/empty);
- client immediately reconnects.

Scaling concerns:

- one parked connection per client → connection limits, memory, load-balancer idle timeouts;
- needs a pub/sub fan-out so any instance can wake any waiter;
- timeouts must be shorter than LB/proxy idle timeouts;
- on deploy, connections drop and reconnect in a thundering herd → jitter.

Long polling approximates push using request/response infrastructure. It is a compatibility tool, not a scaling strategy.

## Server-Sent Events (SSE)

SSE is a one-way stream over plain HTTP:

```http
GET /api/events HTTP/1.1
Accept: text/event-stream
Last-Event-ID: 42
```

```http
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

id: 43
event: notification
data: {"id":"n_1","text":"Order shipped"}

: keepalive

id: 44
retry: 5000
data: {"id":"n_2","text":"Payment received"}
```

Client:

```ts
const source = new EventSource("/api/events");
source.onmessage = (event) => handle(JSON.parse(event.data));
source.addEventListener("notification", (event) => handleAlert(event));
source.onerror = () => {
  // EventSource reconnects automatically; exponential backoff is built in.
};
```

Key properties:

- **Automatic reconnection** with `retry` hints.
- **`Last-Event-ID`** lets the server resume from the last delivered event — implement replay or explicitly signal a gap.
- **Plain HTTP**: works through proxies, HTTP/2 multiplexing, auth via cookies/tokens.
- **One-way**: client → server messages need a separate `POST`.

### SSE constraints and traps

- **Proxy buffering**: `X-Accel-Buffering: no` (nginx) or configure the proxy; otherwise events arrive in clumps.
- **Idle timeouts**: send a comment (`: ping`) every 15–30 s.
- **Connection limits**: browsers allow ~6 connections per host over HTTP/1.1; use HTTP/2 (multiplexed) or separate domains.
- **Auth expiry**: EventSource cannot set custom headers; use cookies or a short-lived token in the query string (careful with logs).
- **Scaling**: each connection is stateful; a fan-out layer (Redis pub/sub, NATS) distributes events to the instance holding the connection.
- **Replay**: `Last-Event-ID` requires an event log with retention; otherwise tell the client to resync fully.

## Choosing

- Dashboard that refreshes every 30 s → **short polling**.
- Notifications/feed where seconds matter, server→client only → **SSE**.
- Chat/collaboration with typing, presence, and low latency → **WebSockets**.
- Legacy client/proxy constraints → **long polling** fallback.

A common architecture: SSE for reads, normal HTTP for writes, WebSocket only where true bidirectional low latency is required.

## Scaling real-time connections

All push transports share the same problem: **connections are pinned to an instance**.

```
client ──SSE──> edge ──> app instance ──subscribe──> pub/sub ──> event source
```

- Keep the edge connection alive (LB idle timeout > heartbeat interval).
- Use a shared pub/sub or stream so any instance can deliver any event.
- On scale-in/deploy, drain connections gracefully (send a reconnect hint, then close).
- Cap connections per instance and shed load when saturated.
- Monitor connection counts, event lag, reconnect rate, and error rate.

> [!WARNING]
> A push endpoint behind an autoscaler without connection draining produces reconnect storms on every deploy. Treat connection lifecycle as part of the deployment design.

## Failure modes

| Failure | Symptom | Fix |
|---|---|---|
| Proxy buffering | events arrive in bursts | disable buffering, flush headers |
| Idle timeout | connection drops every 60 s | heartbeats below timeout |
| Reconnect storm | origin spike after deploy | jitter, connection draining |
| No replay | missed events after reconnect | event ids + retention, or full resync |
| Unbounded fan-out | one event → thousands of writes | pub/sub, batching |
| EventSource auth | 401 loops | cookie auth or token refresh flow |

## Interview drill

**1. "Design notifications for 10M users."**
- **Cover:** SSE for server→client; fan-out bus; event log + resume; connection caps; auth/reauth; deploy draining.
- **Follow-up:** "What about users who are offline?" (push notifications, sync on next open).
- **Common miss:** storing connection state on a single node.

**2. "Why not WebSockets?"**
- **Cover:** one-way need; HTTP/proxy compatibility; auto-reconnect; simpler ops; writes over REST.
- **Follow-up:** "When would you switch?" (bidirectional low-latency, presence/typing).
- **Common miss:** choosing WebSockets for prestige, then paying the scaling cost.

**3. "SSE reconnects every minute. Why?"**
- **Cover:** proxy idle timeout; buffering; missing heartbeats; `Last-Event-ID`; LB timeout alignment.
- **Follow-up:** "How do you handle missed events?" (replay log or full resync).
- **Common miss:** client retry loops without backoff.

## Checklist

- [ ] The transport matches the direction and latency requirement.
- [ ] Polling is delta-based, jittered, and backs off when idle.
- [ ] Push endpoints send heartbeats below proxy timeouts.
- [ ] Reconnection semantics (backoff, replay, gap handling) are defined.
- [ ] Auth works with the chosen transport.
- [ ] Connections are drained on deploy and capped per instance.
- [ ] Fan-out uses a shared bus, not per-instance broadcasts.
- [ ] Connection count, lag, and reconnect rate are monitored.

Next: [WebSockets & Scaling](/api-design/007-websockets-and-scaling) — bidirectional connections without losing your mind.
