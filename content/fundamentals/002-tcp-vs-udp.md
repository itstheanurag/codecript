---
title: TCP vs UDP (Layer 4)
description: Reliable streams versus datagrams — handshakes, retransmission, flow and congestion control, head-of-line blocking, QUIC, and what each means for latency and failure.
order: 2
---

TCP and UDP are both transport protocols. The difference is not "fast vs slow"; it is **what the protocol guarantees and where the complexity lives**.

- **TCP** provides an ordered, reliable, congestion-controlled byte stream.
- **UDP** provides datagrams: no ordering, no retransmission, no congestion control by default.
- **QUIC** provides streams and reliability over UDP, in userspace.

## TCP

### Establishing a connection

```
client                          server
  SYN  ------------------------>
       <------------------ SYN-ACK
  ACK  ------------------------>
```

Three packets, one round trip before data (unless TCP Fast Open). Then TLS adds another round trip (1-RTT in TLS 1.3, 2-RTT in 1.2) unless session resumption/0-RTT is used.

Latency floor for a new HTTPS connection over TCP + TLS 1.3:

```
1 RTT (TCP) + 1 RTT (TLS) + 1 RTT (request/response) = 3 RTT
```

At 100 ms RTT that is 300 ms before the first byte of the response. This is why connection reuse and edge termination matter.

### Reliability

Every byte is numbered. The receiver ACKs; unacknowledged data is retransmitted after a timeout (RTO) or on duplicate ACKs (fast retransmit).

Consequences:

- **Loss becomes latency**, not data loss.
- **Reordering** is repaired by buffering, which can cause head-of-line blocking.
- **Retransmission timeouts** grow exponentially; a single loss on a high-RTT link hurts.

### Flow control and congestion control

- **Flow control** prevents overwhelming the receiver (advertised window).
- **Congestion control** prevents overwhelming the network: slow start, congestion avoidance, fast recovery. Algorithms (CUBIC, BBR) differ in how they infer loss vs delay.

Symptom mapping:

| Observation | Likely cause |
|---|---|
| High retransmit rate | lossy path, bufferbloat, MTU issue |
| Throughput plateaus at low RTT | congestion window, receiver window, app-level limit |
| Latency grows with load | queueing (bufferbloat), not bandwidth |

### Nagle and delayed ACK

Classic sources of mysterious 40 ms delays:

- **Nagle's algorithm** coalesces small writes; combined with delayed ACKs it can stall request/response protocols.
- **`TCP_NODELAY`** disables Nagle for latency-sensitive writes.

Modern HTTP stacks set `TCP_NODELAY`; custom protocols often forget.

### Connection state and exhaustion

- `TIME_WAIT` holds sockets after close (2×MSL) to absorb late packets; high connection churn can exhaust ephemeral ports.
- `CLOSE_WAIT` accumulating means the application is not closing sockets — a leak.
- Backlog overflow (SYN queue) causes connection timeouts under burst.

```bash
ss -s
ss -tan state time-wait | wc -l
ss -tan state close-wait | head
```

## UDP

UDP sends independent datagrams. No handshake, no order, no retransmit, no congestion control unless the application adds it.

Why use it:

- **Low latency, loss-tolerant** media (voice/video, games).
- **Custom reliability** (QUIC, DNS, TFTP).
- **Broadcast/multicast** (not supported by TCP).
- **Connectionless** request/response where a handshake costs more than the data (DNS).

Risks:

- amplification/reflection attacks (DNS, NTP, memcached) if responses are larger than requests;
- no fairness: an unthrottled UDP flow can starve TCP;
- application must handle loss, ordering, duplication, and MTU.

## QUIC (HTTP/3)

QUIC runs over UDP and moves reliability into userspace:

- **Per-stream ordering** — a lost packet blocks only its stream, not all streams (no TCP head-of-line blocking).
- **1-RTT handshake**, 0-RTT resumption (with replay caveats).
- **Connection migration** — survives IP changes (mobile).
- **Encryption by default** (TLS 1.3 integrated).
- **Userspace congestion control** — easier to iterate, but more CPU.

Operational notes: UDP is sometimes blocked by corporate networks; browsers fall back to TCP/TLS. Monitor both paths.

## Head-of-line blocking

With one TCP stream, a lost packet stalls everything behind it, even unrelated responses. HTTP/1.1 pipelining suffers badly; HTTP/2 multiplexing helps at the application layer but **still shares one TCP connection**, so packet loss blocks all streams.

QUIC solves this with independent streams. This is a major reason HTTP/3 improves tail latency on lossy mobile networks.

## Choosing a transport

| Need | Choose |
|---|---|
| Ordered, reliable bytes (HTTP/1.1, DB, SSH) | TCP |
| Low-latency, loss-tolerant media | UDP (with app-level recovery) |
| Modern web with tail-latency sensitivity | QUIC/HTTP/3 where available |
| Tiny request/response, idempotent | UDP (DNS-style) with retry |
| Broadcast/multicast | UDP |

## Failure modes

| Failure | Symptom | Fix/inspect |
|---|---|---|
| Packet loss | retransmits, p99 spikes | `netstat -s`, tcptrace, path quality |
| Bufferbloat | latency grows with load | AQM (fq_codel), smaller buffers |
| MTU black hole | large payloads hang | path MTU discovery, ICMP allowed |
| Nagle + delayed ACK | ~40 ms stalls | `TCP_NODELAY` |
| Port exhaustion | connect timeouts | connection reuse/pooling |
| `CLOSE_WAIT` growth | FD leak | close sockets in `finally` |
| UDP blocked | QUIC falls back or fails | monitor fallback, allow 443/UDP |

## Tuning that matters

- Reuse connections (keep-alive) and pool them.
- Set connect/read/total timeouts; never rely on OS defaults.
- Enable `TCP_NODELAY` for interactive protocols.
- Size accept backlog and file descriptors for peak connections.
- Monitor retransmits, RTT, and connection churn — not just throughput.
- Prefer HTTP/2/3 where supported, but measure; multiplexing can concentrate loss.

## Interview prompts

1. "Why is the first request slow but subsequent ones fast?" → DNS/TCP/TLS handshakes, connection reuse.
2. "Users on mobile see p99 spikes. Why?" → loss/HOL, QUIC, retransmits, RTT variance.
3. "When would you build on UDP?" → real-time media, custom reliability, multicast.

## Checklist

- [ ] I know the RTT and loss profile of my users.
- [ ] Handshake cost is measured separately from server time.
- [ ] Connections are reused and pooled.
- [ ] Timeouts and `TCP_NODELAY` are set deliberately.
- [ ] I monitor retransmits, TIME_WAIT, and CLOSE_WAIT.
- [ ] Large payloads respect path MTU.
- [ ] UDP/QUIC fallback is tested.
- [ ] I can explain head-of-line blocking to a teammate.
