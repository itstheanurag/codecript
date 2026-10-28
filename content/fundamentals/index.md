---
title: Core CS & Web Fundamentals
description: The layer-by-layer foundations behind every web request — OSI/TCP, DNS and BGP, TLS, security, execution models, memory, scheduling, and file I/O.
order: 0
---

Most production incidents are a fundamental in disguise:

- "The API is slow" → TCP retransmissions, queueing, or a cold TLS handshake.
- "It works locally" → DNS caching, MTU, or a different TLS trust store.
- "The server is out of memory" → an allocation pattern, a cache without eviction, or a file descriptor leak.
- "The deploy broke auth" → a cookie `SameSite` change, not the code you reviewed.

This section builds the mental models that let you debug down the stack instead of guessing.

## How to read it

| Chapter | What it explains | Where it shows up |
|---|---|---|
| [The OSI Model](/fundamentals/001-the-osi-model) | layering and encapsulation | narrowing a failure to a layer |
| [TCP vs UDP](/fundamentals/002-tcp-vs-udp) | reliable streams, congestion, QUIC | timeouts, head-of-line blocking, tail latency |
| [DNS & BGP](/fundamentals/003-dns-and-bgp) | naming and routing | "some users can't reach us" |
| [HTTP vs HTTPS](/fundamentals/004-http-vs-https) | TLS handshakes and certificates | certificate errors, latency, mTLS |
| [Web Security](/fundamentals/005-web-security-owasp) | attack classes and defences | XSS, SQL injection, SSRF, broken access control |
| [Execution Models](/fundamentals/006-compilers-vs-interpreters) | compilation, JIT, bytecode | startup time, warmup, performance cliffs |
| [Memory Management](/fundamentals/007-memory-management) | virtual memory, allocation, GC | OOMs, leaks, fragmentation |
| [CPU Scheduling](/fundamentals/008-cpu-scheduling) | run queues, priorities, cgroups | noisy neighbours, p99 spikes |
| [File Systems & I/O](/fundamentals/009-file-systems-and-io) | page cache, journaling, fsync | data loss, IOPS limits, slow writes |

## The method: go down one layer at a time

When something fails:

1. **Reproduce and scope it.** One user, one region, one endpoint, or everything?
2. **Check the layer below the symptom.** A 504 from the gateway may be a TCP retransmit, a slow TLS handshake, or a saturated database.
3. **Measure at the boundary.** Packet capture, `curl -w`, `dig`, `openssl s_client`, `strace`, `/proc`, flame graphs.
4. **Change one thing.** Confirm the layer before "fixing" it.

A useful rule: **the layer that reports the error is rarely the layer that caused it.**

## The stack in one request

```
browser
  DNS lookup            -> UDP/TCP :53 (or DoH)
  TCP handshake         -> SYN / SYN-ACK / ACK
  TLS handshake         -> certificate, keys, ALPN
  HTTP request          -> method, path, headers, body
  LB / gateway          -> routing, auth, rate limits
  service               -> business logic, DB, cache
  response              -> status, headers, body
```

Each arrow can add latency and each has its own failure modes. A 300 ms p99 budget is a budget across all of them.

## The diagnostic toolbox

| Tool | Answers |
|---|---|
| `dig` / `nslookup` | what does DNS return, and from which resolver? |
| `curl -v -w` | timings per phase: DNS, connect, TLS, TTFB |
| `openssl s_client -connect` | certificate chain, protocol, ALPN |
| `tcpdump` / Wireshark | retransmits, resets, handshake failures |
| `ss -s` / `ss -tanp` | socket states, backlog, TIME_WAIT |
| `strace` / `perf` | syscalls, CPU hotspots, blocking points |
| `/proc/meminfo`, `vmstat`, `iostat` | memory pressure, paging, disk saturation |
| flame graphs | where CPU time actually goes |

## Mental models worth keeping

- **Bandwidth ≠ latency.** A fat pipe does not fix a 150 ms RTT; caching/edge does.
- **Reliability is not free.** TCP retransmits turn packet loss into latency; UDP/QUIC move the problem to the application.
- **Caching is a consistency decision.** DNS TTLs, HTTP caches, and CDNs all trade freshness for speed.
- **Memory is virtual.** "Out of memory" can mean the heap, the container limit, the page cache, or address space.
- **Scheduling is fairness vs latency.** A busy CPU with many runnable threads means queueing, not throughput.
- **Durability requires a flush.** `write()` success does not mean the data survives a power loss.

## Checklist

- [ ] I can name the layer where a failure occurs before changing code.
- [ ] I measure DNS, connect, TLS, and TTFB separately.
- [ ] I know the RTT and packet-loss characteristics of my users.
- [ ] I understand which caches sit between the user and my data.
- [ ] I know the durability guarantees of every write path.
- [ ] I can explain a p99 spike in terms of queueing, retransmits, GC, or scheduling.

> "The stack is not a diagram to memorise. It is a debugging order."
