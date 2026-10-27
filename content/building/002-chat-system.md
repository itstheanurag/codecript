---
title: Real-Time Chat System
description: Building chat that survives reconnects — message IDs and ordering, delivery acknowledgements, offline sync, presence, fan-out, and storage that can page history.
order: 2
---

Chat is a stateful, bidirectional, ordered event stream per conversation. The UI is the easy part; **ordering, delivery, and sync** are the product.

## Scope

In scope:

- 1:1 and group conversations.
- Send/receive messages in real time.
- History with pagination.
- Delivery/read receipts (optional v1).
- Online presence (best effort).
- Push notifications when offline.

Out of scope for v1:

- End-to-end encryption (large design change).
- Voice/video (WebRTC).
- Message search at scale.
- Bots/integrations.

## Estimates

```
10M DAU, 50 messages/day each → 500M messages/day ≈ 5,800/s avg, ~20k/s peak
payload ≈ 200 B → 100 GB/day raw + indexes/replicas
fan-out: group of 100 → 100 deliveries per message
```

Writes are modest; **fan-out and connection count** dominate.

## Data model

```sql
CREATE TABLE messages (
  id           uuid PRIMARY KEY,
  conversation_id uuid NOT NULL,
  sender_id    uuid NOT NULL,
  seq          bigint NOT NULL,           -- per conversation, monotonic
  body         text NOT NULL,
  created_at   timestamptz NOT NULL,
  UNIQUE (conversation_id, seq)
);
CREATE INDEX messages_conv_seq_idx ON messages (conversation_id, seq DESC);

CREATE TABLE conversation_members (
  conversation_id uuid,
  user_id         uuid,
  last_read_seq   bigint NOT NULL DEFAULT 0,
  joined_at       timestamptz,
  PRIMARY KEY (conversation_id, user_id)
);
```

Why a per-conversation `seq`: ordering is local to a conversation and does not need global clocks. Clients request "messages after seq N", which is exactly what sync and pagination need.

Alternative: server-assigned sortable IDs (ULID/Snowflake) per message. Either works; the contract is **a monotonic cursor per conversation**.

## Sending and ordering

1. Client sends `{clientId, conversationId, body}` to the API/WS.
2. Server validates membership, assigns `id` + `seq` atomically.
3. Persist, then fan out to online members.
4. Return the canonical message to the sender (with `seq`).

Idempotency: the `clientId` deduplicates retries. A unique constraint on `(conversation_id, client_id)` makes retries safe.

Ordering guarantees:

- per-conversation total order by `seq`;
- cross-conversation ordering is irrelevant;
- clients display by `seq` and buffer out-of-order arrivals until the gap fills or a timeout triggers a resync.

## Delivery and acknowledgements

Delivery states: `sent → delivered → read`.

- **Sent** = server persisted.
- **Delivered** = recipient device received (ack).
- **Read** = recipient opened/read up to `seq` (update `last_read_seq`).

Acks are messages too; batch them to avoid storms. For group chats, track per-member read positions, not per-message rows.

## Offline sync

On reconnect, the client sends the highest `seq` it has per conversation. The server returns newer messages (bounded) or a `resync_required` if the gap exceeds retention.

```
GET /conversations/{id}/messages?after=1234&limit=100
```

Rules:

- capped page size;
- stable ordering;
- no unbounded catch-up in one response;
- clients store messages locally (IndexedDB/SQLite) for offline display.

## Presence

Presence is ephemeral and lossy:

- maintain a TTL key in Redis (`presence:user:{id}` → connection/expiry);
- heartbeat every 20–30 s;
- mark offline on disconnect/timeout;
- do not put presence in the durable database;
- aggregate presence (typing indicators) with rate limits.

Never block message delivery on presence updates.

## Fan-out and scaling

```
sender → WS gateway → message service → DB → pub/sub (per conversation/user)
                                         └→ push notification (offline)
```

- Connections are pinned to gateway instances; use pub/sub keyed by user/conversation.
- Group fan-out: publish once per conversation; gateways deliver to connected members.
- Very large groups: fan-out in a worker with rate limits; consider "read from feed" model.
- Cap message size and group size.

Sticky sessions are unnecessary if the client can reconnect anywhere and resume by `seq`.

## Storage and retention

- Hot recent messages in the primary; older partitions archived (time-based partitioning).
- Media goes to object storage; messages carry URLs + metadata.
- Deletes: soft delete with tombstones so clients converge, then purge.
- Retention policy per plan; export/deletion for compliance.

## End-to-end encryption (if required)

E2EE changes the architecture: the server cannot read messages, search, or moderate. Key management, multi-device sync, and backups become product problems. Treat it as a separate project, not a flag.

## Failure modes

| Failure | Impact | Mitigation |
|---|---|---|
| WS reconnect storm | gateway overload | jitter, connection draining, capacity headroom |
| Duplicate send | duplicate messages | clientId idempotency |
| Out-of-order delivery | confusing UI | `seq` ordering + gap buffering |
| Pub/sub message loss | missing real-time message | resume-by-seq on reconnect |
| Presence flapping | noisy UI | TTL + hysteresis |
| Hot group | fan-out storm | batching, worker queues, limits |
| Offline backlog | huge catch-up response | paginated sync + resync signal |

## Build order

1. Auth + conversation/member model.
2. Send/list API with `seq` and idempotency.
3. WebSocket gateway + pub/sub fan-out.
4. Reconnect/resume by `seq`.
5. Read receipts + presence.
6. Push notifications for offline.
7. Partitioning/retention + media.
8. Load test with 100k concurrent connections.

## Review questions

- How do you guarantee per-conversation ordering?
- What happens if a message is delivered twice? Out of order?
- How does a device that was offline for a week sync?
- Where is presence stored, and can it block delivery?
- What happens when a gateway dies with 50k connections?
- How do you moderate/delete messages with many clients?

## Checklist

- [ ] Messages have stable ids and a per-conversation sequence.
- [ ] Sends are idempotent via `clientId`.
- [ ] Reconnect resumes from a cursor with bounded pages.
- [ ] Delivery/read receipts are batched and per-member.
- [ ] Presence is ephemeral, TTL-based, and non-blocking.
- [ ] Fan-out uses pub/sub and is rate-limited for large groups.
- [ ] Retention/partitioning and media storage are defined.
- [ ] Connection draining and reconnect jitter are planned.
