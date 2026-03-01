---
title: Build a Real-Time Chat App
order: 2
---

A real-time chat application requires persistent connections and efficient message delivery.

## Core Features

- One-on-one messaging
- Group chats
- Online/offline status
- Message history

## Technology Choices

### WebSockets

Persistent, full-duplex connections. The standard for real-time web apps.

### Server-Sent Events (SSE)

One-way server-to-client. Simpler but less flexible than WebSockets.

### Long Polling

Client repeatedly polls the server. Fallback for environments that don't support WebSockets.

## Architecture

1. **Connection Service** — manages WebSocket connections, maps user → connection
2. **Message Service** — handles sending, storing, and routing messages
3. **Presence Service** — tracks online/offline status
4. **Database** — stores message history (Cassandra or similar for write-heavy loads)

## Message Flow

1. User A sends a message via WebSocket
2. Server stores the message in the database
3. Server checks if User B is online (presence service)
4. If online, push via WebSocket; if offline, queue for later delivery

## Scaling

- Multiple WebSocket servers behind a load balancer (sticky sessions or a message broker like Redis Pub/Sub)
- Partition chat rooms across servers
- Use a message queue (Kafka) for reliable delivery
