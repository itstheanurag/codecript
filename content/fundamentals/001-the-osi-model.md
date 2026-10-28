---
title: The OSI Model
description: Layering as a debugging tool — what each OSI layer actually does, how encapsulation works, how it maps to TCP/IP, and how to narrow a failure to the right layer.
order: 1
---

The OSI model is a **vocabulary for separation of concerns**. It is not a protocol; it is a way to describe where a failure can occur and which component owns it.

Its practical value is diagnostic: when a request fails, you want to know whether the problem is naming (DNS), transport (TCP), encryption (TLS), application semantics (HTTP), or the code behind it.

## The seven layers

| # | Layer | PDU | Job | Examples | Devices/tools |
|---|---|---|---|---|---|
| 7 | Application | data | user-facing protocols | HTTP, DNS, SMTP, SSH | libraries, servers |
| 6 | Presentation | data | encoding, compression, encryption | TLS*, JSON, protobuf | TLS libraries |
| 5 | Session | data | session state, auth context | RPC sessions, cookies* | app frameworks |
| 4 | Transport | segment | process-to-process delivery, ports | TCP, UDP, QUIC | kernel |
| 3 | Network | packet | host-to-host routing | IP, ICMP, BGP | routers |
| 2 | Data link | frame | local delivery, MAC | Ethernet, ARP, Wi-Fi | switches, NICs |
| 1 | Physical | bits | signals on a medium | copper, fibre, radio | cables, PHYs |

\* In practice TLS sits between transport and application; the OSI mapping is approximate. HTTP cookies are application state, not a presentation/session protocol.

## Encapsulation

Each layer adds its own header (and sometimes trailer) around the payload:

```
HTTP request
  -> TCP header (ports, seq, flags)
    -> IP header (src/dst, TTL)
      -> Ethernet header + FCS
        -> bits on the wire
```

The receiver strips headers in reverse. Two consequences:

- **MTU matters.** A packet larger than the path MTU is fragmented or dropped (IPv6: dropped, ICMP "packet too big" required). Large POSTs can fail while GETs work.
- **Headers cost bytes.** Small payloads are dominated by header overhead; batching helps.

## OSI vs TCP/IP

The Internet runs the TCP/IP model:

| TCP/IP layer | OSI equivalent | Examples |
|---|---|---|
| Application | 5–7 | HTTP, DNS, TLS, WebSocket |
| Transport | 4 | TCP, UDP, QUIC |
| Internet | 3 | IP, ICMP |
| Link | 1–2 | Ethernet, Wi-Fi, ARP |

When someone says "layer 7 load balancer", they mean HTTP-aware. "Layer 4" means it routes TCP/UDP without parsing the application protocol.

## Troubleshooting by layer

### Layer 1–2: can the host reach the network?

Symptoms: total unreachability, link flapping, duplicate IP, ARP conflicts, Wi-Fi drops.

```bash
ip link            # link state, errors, drops
ethtool -S eth0    # CRC errors, carrier changes
arp -an            # duplicate MACs/IPs
```

### Layer 3: is the route correct?

Symptoms: `Destination Host Unreachable`, asymmetric paths, MTU black holes, one region unreachable.

```bash
ip route get 1.1.1.1
ping -M do -s 1472 1.1.1.1    # MTU probe (IPv4)
traceroute 1.1.1.1
```

BGP problems (route leaks, hijacks, missing announcements) appear here: traffic leaves, but to the wrong place.

### Layer 4: is the port reachable?

Symptoms: connection refused (RST), timeouts (SYN dropped), resets mid-stream, port exhaustion.

```bash
ss -ltnp                 # listening sockets
ss -s                    # socket summary, TIME_WAIT
nc -vz host 443          # connect test
```

- **Refused** → nothing listening / firewall rejecting.
- **Timeout** → SYN filtered (security group, firewall, blackhole).
- **Reset** → middlebox, idle timeout, or server crash.

### Layer 5–7: is the protocol happy?

Symptoms: 400/401/403/404, TLS errors, slow TTFB, malformed responses.

```bash
curl -v -w 'dns=%{time_namelookup} tcp=%{time_connect} tls=%{time_appconnect} ttfb=%{time_starttransfer}\n' https://example.com
openssl s_client -connect example.com:443 -servername example.com
```

TLS failures usually report at layer 7 but originate in certificate/chain/SNI configuration.

## Worked examples

**"Some users get 502s, others are fine."**
Look at layer 3/4 first: are the failing users on one ISP/region? Check BGP announcements, anycast routes, and load-balancer health. Then layer 7: one backend pool version.

**"The API is fast in curl but slow in the browser."**
curl has no cold DNS cache, no connection pool, no HTTP/2 multiplexing, no service worker. Compare phases with `curl -w` in both; check DNS, TLS session reuse, and browser connection limits.

**"Large uploads fail at ~1 MB."**
Likely MTU/fragmentation or a proxy body limit. Test with a smaller POST, inspect ICMP, check `client_max_body_size` / gateway limits.

## Misconceptions

| Myth | Reality |
|---|---|
| "OSI is how the Internet works." | TCP/IP is the deployed model; OSI is a teaching/diagnostic framework. |
| "Layer 2 switching is always faster than layer 3." | Modern routers switch at line rate; policy and features dominate. |
| "TLS is layer 4." | TLS runs over TCP (or QUIC); it is usually treated as 5–6 or "between 4 and 7". |
| "A 200 means the app worked." | It can carry an error body; semantics live at layer 7. |
| "Layer 8 is the user." | The user is not a layer; blaming them skips measurement. |

## Failure modes by layer

| Layer | Typical failure | First check |
|---|---|---|
| 1 | cable/PHY errors | link errors, carrier |
| 2 | ARP/duplicate IP/VLAN | ARP table, switch MACs |
| 3 | route/MTU/BGP | `ip route`, traceroute, MTU probe |
| 4 | firewall/RST/timeout/backlog | `ss`, connect test, security groups |
| 5–6 | TLS/cert/encoding | `openssl s_client`, content type |
| 7 | status/schema/auth | logs, traces, payload |

## Checklist

- [ ] I can state which layer a failure belongs to.
- [ ] I check name resolution before blaming the server.
- [ ] I measure connect and TLS time separately from TTFB.
- [ ] I know the path MTU and whether large bodies are limited.
- [ ] I can distinguish refused, timeout, and reset.
- [ ] I inspect certificates and SNI for TLS errors.
- [ ] I use logs/traces for layer 7, not packet captures first.
