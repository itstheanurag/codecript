---
title: TCP vs UDP (Layer 4)
description: Learn how TCP's handshake, retransmission, and congestion control differ from UDP, and when HTTP/3 and games pick each one.
order: 2
---

When an app sends bytes, **Layer 4** decides the shipping rules. Two protocols dominate: **TCP** (a connection with receipts) and **UDP** (stamped envelopes, no tracking). HTTP, Postgres, and SSH sit on TCP. Video calls, DNS, and many games sit on UDP. HTTP/3 sits on **QUIC**, which is UDP plus reliability reinvented.

> [!TIP]
> **ELI5: Courier vs megaphone**
> TCP is a courier who knocks, gets a signature, and resends if the box vanished. UDP is shouting across a field: faster, no "did you hear me?", and the next shout is a new sentence anyway.

## 1. TCP: connection, order, receipts

TCP is **connection-oriented**. Before payload, both sides agree they exist (**three-way handshake**):

1. Client → `SYN` (I want to talk; here is my sequence number).
2. Server → `SYN-ACK`.
3. Client → `ACK`. Then data.

Closing is a similar dance (`FIN`/`ACK`). That is why a naive "open 10,000 HTTP/1 connections" is expensive: each costs round trips and kernel state.

**What TCP guarantees (from the app's point of view):**

- **Delivery.** Unacked segments are retransmitted. The app sees a stream, not packets.
- **Order.** Segment 2 waits if 1 is missing. The app never sees 2 before 1.
- **Flow and congestion control.** A window limits in-flight data. If the network is dropping, TCP slows down (AIMD) so the path does not collapse.

**Cost:** handshake latency (one extra RTT before data on a cold connection). **Head-of-line blocking:** one lost packet stalls *everything* behind it in that stream. HTTP/2 multiplexes requests on one TCP connection — a lost packet still stalls all of them. That is a reason HTTP/3 left TCP.

Ports: TCP (and UDP) addresses are `ip:port`. `443` is a convention, not magic. `ss -lptn` shows who is listening.

## 2. UDP: no session, no apology

UDP sends a **datagram** to `ip:port` and is done. No handshake, no retry, no order, no congestion control in the protocol itself.

If you need those, **you build them in the application** (or use a library: QUIC, WebRTC, a game netcode).

DNS queries are tiny and retry-at-the-app: UDP is the default; TCP is the fallback for large responses. A VoIP packet that arrives 200ms late is trash — better to skip than to stall. A bank transfer is the opposite.

**UDP still has checksums** (optional on IPv4, not a substitute for app-level integrity). It can still be firewalled, NATed, and dropped. "UDP is unreliable" means the *protocol* will not help you; the network is lossy for both.

## 3. Head-of-line, QUIC, and the interview table

| | TCP | UDP |
| :--- | :--- | :--- |
| Setup | Handshake, state in kernel | None |
| Lost packet | Retransmit; stream waits | App never hears, or app retries |
| Order | Strict | Arrival order |
| Congestion | Built in | App or nothing |
| Typical | HTTP/1–2, TLS, DB, SSH | DNS, video, games, QUIC |

**HTTP/3 / QUIC:** reliability and TLS moved *into* userspace on top of UDP, with **independent streams** so one loss does not freeze the whole connection. Know this sentence for interviews; you do not need the RFC.

**The gaming answer:** position updates are UDP because the next packet supersedes the last. **The money answer:** ledgers are TCP (or QUIC) because a silent drop is corruption, not lag.

> [!IMPORTANT]
> TCP is not "always slower to *send*." A long transfer on a healthy path is extremely fast. TCP is slower to *start* and *stalls on loss*. UDP is not "always better for realtime" if you then reinvent a worse TCP.

## 4. What you debug as an engineer

- `connection refused` — nothing listening on that TCP port (or RST).
- `connection timed out` — packet filtered, or host dead. UDP timeouts are app-defined; there is no connection to time out.
- TLS happens *on top of* TCP (or inside QUIC). Handshake failures are not "UDP vs TCP," they are certs and ciphers.
- NAT hole punching is a UDP (and WebRTC) problem because there is no connection the NAT can bind as easily as TCP.

## What to remember

- TCP = stream, ordered, retransmitted, congestion-controlled. Handshake + HOL blocking.
- UDP = datagrams. Fast start, no guarantees; apps that care build their own.
- Pick TCP when a missed byte is a bug. Pick UDP when a missed byte is already stale.
- HTTP/3 is "reliable UDP," not "we stopped caring about loss."
