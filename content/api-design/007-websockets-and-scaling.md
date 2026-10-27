---
title: WebSockets & Scaling
description: Upgrade handshakes, framing, heartbeats, backpressure, reconnection and resume, auth, and the stateful scaling problems that make WebSockets expensive.
order: 7
---

WebSockets provide a **persistent, bidirectional** connection over a single TCP connection. They are the right tool when both sides must send low-latency messages: chat, collaboration, multiplayer, trading.

They are also the most operationally expensive real-time transport, because every connection is state pinned to an instance.

## The handshake

```
GET /ws HTTP/1.1
Host: api.example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: <base64 nonce>
Sec-WebSocket-Version: 13
```

The server responds `101 Switching Protocols`, and the connection becomes framed WebSocket messages (text/binary). After the upgrade, normal HTTP semantics no longer apply: no per-message caching, status codes, or headers.

## Framing and control

- **Text** frames for JSON; **binary** for protobuf/msgpack when volume matters.
- **Ping/pong** control frames keep middleboxes from closing idle connections.
- **Close** frames carry a code and reason.
- Message size limits and fragmentation are the server's responsibility.

## Connection lifecycle

```ts
const ws = new WebSocket("wss://api.example.com/ws?token=" + shortLivedToken);

ws.onopen = () => {
  ws.send(JSON.stringify({ type: "subscribe", channels: ["orders"] }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  handle(message);
};

ws.onclose = (event) => {
  if (event.code !== 1000) reconnectWithBackoff();
};
```

Protocol design decisions:

| Concern | Recommendation |
|---|---|
| Message envelope | `{ id, type, data, ts }` — stable `type` discriminator |
| Ordering | per-connection ordering exists; cross-connection ordering does not |
| Acknowledgements | explicit `ack` for critical messages; retries with idempotency |
| Heartbeat | app-level ping every 20–30 s + pong timeout |
| Resume | client sends `lastMessageId`; server replays missed messages or signals resync |
| Versioning | include `v` in the envelope; support overlap |

## Authentication

- Authenticate during the handshake (cookie, `Authorization`, or a short-lived token in the query string).
- **Revalidate** on token expiry: send a `reauth` message and close if not refreshed.
- Do not trust the connection for the lifetime of a long session without re-checking permissions.
- For cookies, protect against CSRF on the handshake (SameSite/Origin checks), because browsers attach cookies automatically.
- Authorise **per channel/room**, not just per connection.

## Backpressure: the hard part

A slow client must not make the server buffer unboundedly:

- track `ws.bufferedAmount`; if it exceeds a threshold, drop low-value messages or close the connection;
- prefer **conflated state** (send the latest value) over an unbounded event stream;
- apply per-connection quotas and rate limits;
- never broadcast large payloads synchronously to thousands of sockets in one loop.

```ts
function safeSend(ws: WebSocket, payload: string) {
  if (ws.readyState !== ws.OPEN) return;
  if (ws.bufferedAmount > 1_000_000) {
    ws.close(1013, "client too slow");
    return;
  }
  ws.send(payload);
}
```

## Scaling

Each connection is stateful. The architecture:

```
client ──ws──> edge/LB ──> gateway instance ──subscribe──> pub/sub
                                   │
                                   └── presence/session store (Redis)
```

Key concerns:

- **Connection limits** per instance (file descriptors, memory, event loop cost). Plan capacity in connections, not just RPS.
- **Routing**: the instance holding the socket must receive the message. Use a shared pub/sub (Redis, NATS, Kafka) keyed by user/channel.
- **Presence**: which user is on which node? Store with TTL in Redis; clean up on disconnect.
- **Broadcast**: fan-out via pub/sub, not cross-node RPC per message.
- **Sticky sessions**: needed only if the LB cannot route by connection; WebSocket upgrade naturally sticks, but reconnects may land elsewhere — resume must not depend on the node.
- **Deploys**: drain connections (send `reconnect`), wait, then close. Otherwise every deploy triggers a reconnect storm.

## Message delivery guarantees

WebSockets give **ordered delivery while connected**, nothing more:

- messages are lost if the connection drops before delivery;
- reconnects need resume + event log or a full resync;
- critical actions need application-level acks and idempotency;
- do not use WebSockets as a durable queue.

For reliability, persist events (outbox/log) and let the client resume from a cursor.

## Security

- Validate `Origin` on the handshake.
- Rate limit connections per IP/user; cap message rate and size.
- Authorise channel subscriptions.
- Treat all input as untrusted; validate message schemas.
- Watch for connection exhaustion (Slowloris-style).
- Terminate TLS at the edge; use `wss://` only.

## WebSockets vs alternatives

| Need | Better choice |
|---|---|
| Server → client only | SSE (simpler, auto-reconnect, HTTP) |
| Request/response with occasional updates | REST + polling/SSE |
| Media streams | WebRTC |
| Durable event delivery | message queue + webhooks/consumers |
| Ultra-low latency bidirectional | WebSockets (or WebTransport) |

## Failure modes

| Failure | Symptom | Fix |
|---|---|---|
| No heartbeat | idle disconnects via proxies | ping/pong + app-level keepalive |
| No backpressure | memory growth, OOM | bufferedAmount limits, conflation |
| Reconnect storm | CPU spike after deploy/outage | jitter, draining, capacity headroom |
| Auth never revalidated | revoked users keep access | reauth flow, periodic checks |
| Per-node broadcast | messages missing across nodes | pub/sub fan-out |
| Unbounded message size | abuse/DoS | size caps, schema validation |
| State on node | reconnect loses session | externalise session/resume state |

## Checklist

- [ ] The use case truly needs bidirectional low latency.
- [ ] Heartbeats and close codes are implemented.
- [ ] Auth happens at handshake and is revalidated.
- [ ] Channels are authorised per subscription.
- [ ] Backpressure limits and message size caps exist.
- [ ] Resume/replay or full-resync semantics are defined.
- [ ] Fan-out uses a shared bus; presence is externalised.
- [ ] Deploys drain connections and reconnect with jitter.
- [ ] Capacity is planned in connections and memory, not RPS.

Next: [Webhooks & Events](/api-design/008-webhooks-and-events) — reliable delivery to consumers you do not control.
