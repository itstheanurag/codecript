---
title: WebSockets & Scaling
order: 7
---

If Server-Sent Events (SSE) are unidirectional, what do you use for a highly interactive, low-latency Multiplayer Game or a real-time collaborative editor (like Figma)? 

You need **WebSockets**. 

A WebSocket upgrades a standard HTTP connection into a persistent, full-duplex TCP tunnel. Both the client and the server can push binary or text data at each other instantly, with almost zero overhead.

## 1. The Disconnect Problem

WebSockets are **Stateful**. The server must keep the connection object in memory for the duration of the session. 

This introduces massive reliability challenges. Unlike a clean HTTP request that finishes in 50ms, a mobile phone might lock its screen, enter a tunnel, or switch from WiFi to 4G. 

The server often *does not know* the client disconnected. The connection sits in memory, slowly causing a memory leak, while the server wastes CPU trying to broadcast to a dead socket.

### The Solution: Ping/Pong Heartbeats
To maintain a healthy WebSocket server, you must implement a Heartbeat mechanism.
1.  The server sends a `PING` frame every 30 seconds to all connected clients.
2.  The client must respond with a `PONG` frame within 5 seconds.
3.  If the server does not receive the `PONG`, it assumes the client is dead, forcefully terminates the socket, and clears it from memory.

## 2. The Broadcasting Problem (Cross-Server Scaling)

This is the classic Senior Engineer system design question: **"How do you scale a Chat Application?"**

> [!WARNING]
> **The Problem:** 
> Imagine you have 2 servers behind a Load Balancer. 
> Alice connects via WebSocket to **Server 1**. 
> Bob connects via WebSocket to **Server 2**.
> 
> Alice sends a chat message: *"Hi Bob!"* 
> Server 1 receives the message. But Server 1 does not hold Bob's socket in memory. Server 2 has it. How does Server 1 send the message to Bob?

Because WebSockets are stateful, you cannot simply scale horizontally by blindly adding more servers. The servers must be able to communicate with each other.

### The Solution: The Redis Pub/Sub Backplane

To solve this, we introduce a central message broker, typically **Redis Pub/Sub**.

```mermaid
architecture-beta
    group cluster(cloud)[Backend Architecture]
    
    service alice(server)[Alice]
    service bob(server)[Bob]
    
    service ws1(disk)[Server 1] in cluster
    service ws2(disk)[Server 2] in cluster
    service redis(database)[Redis Pub/Sub] in cluster
    
    alice:R -- L:ws1
    bob:L -- R:ws2
    
    ws1:R -- L:redis
    ws2:L -- R:redis
```

1.  **Subscription:** When Server 1 boots up, it subscribes to a Redis channel called `chat_messages`. Server 2 does the same.
2.  **The Message:** Alice sends *"Hi Bob!"* to Server 1.
3.  **The Publish:** Server 1 does *not* try to find Bob. Instead, Server 1 publishes the message to the Redis `chat_messages` channel.
4.  **The Broadcast:** Redis instantly blasts that message out to *all* subscribed servers (Server 1 and Server 2).
5.  **The Delivery:** Server 2 receives the message from Redis. Server 2 checks its local memory, sees that it holds the WebSocket for Bob, and forwards the message to him.

This architecture allows you to scale to 1,000 WebSocket servers seamlessly, as they all share a common communication backplane.
