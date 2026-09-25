---
title: Routing (DNS & BGP)
description: Learn how DNS resolves a hostname to an IP, which records matter, how BGP routes packets between networks, and how to debug both.
order: 3
---

To fetch `https://api.example.com` your machine needs an **IP address** (DNS) and a **path across independently owned networks** (BGP). DNS is a question you can run with `dig`. BGP is the backbone protocol you will rarely configure, but you *will* feel when it breaks.

> [!TIP]
> **ELI5: Phonebook and highway signs**
> DNS is the phonebook: "example.com" → "203.0.113.10". BGP is the highway system between countries (ISPs, clouds). Each country advertises "I can reach these address blocks." Your packet hops from sign to sign. If a country lies about a shortcut, traffic goes to the wrong place (**BGP hijack**).

## 1. DNS: name → record

DNS is a distributed database of **records**, not just "the IP for a website."

| Type | Meaning |
| :--- | :--- |
| **A / AAAA** | IPv4 / IPv6 address |
| **CNAME** | Alias to another name (CDN, Heroku, etc.) |
| **MX** | Where email goes |
| **NS** | Who is authoritative for this zone |
| **TXT** | Arbitrary text (SPF, ACME challenges) |
| **TTL** | How long a resolver may cache the answer |

### Resolution path

1. **Stub** (browser/OS) asks a **recursive resolver** (often 1.1.1.1, 8.8.8.8, or your ISP).
2. If cached and TTL not expired, that is the answer.
3. Else the resolver walks: **root** → **TLD** (`.com`) → **authoritative** nameservers for `example.com`.
4. Authoritative server returns the record. Resolver caches it for the TTL.

There are 13 **logical** root server identities, anycasted to hundreds of physical machines. You do not talk to "the one root in Virginia."

```bash
dig +trace api.example.com     # walk the chain
dig A api.example.com          # what clients will use
dig NS example.com             # who owns the zone
```

**TTL is an ops lever.** TTL 60s means a failover is visible in about a minute (plus stubborn caches). TTL 86400 means you announced an IP change yesterday and half the internet will believe the old one until tomorrow.

**CNAMEs at the zone apex** (`example.com` itself) are painful; that is why `ALIAS`/`ANAME` exist at some DNS hosts. You also cannot put a CNAME next to other records on the same name.

> [!WARNING]
> If you point a domain at a new load balancer but leave TTL at 24 hours, "I updated DNS" is not an incident response plan. Lower TTL *before* the maintenance window.

## 2. BGP: how packets leave your ISP

The internet is **Autonomous Systems** (AS): AT&T, Cloudflare, AWS, a university. Each has an **ASN** and a set of IP prefixes it owns (or is allowed to announce).

**BGP** is how ASes tell neighbors: "send me traffic for `203.0.113.0/24`." Routers pick a path (policy + AS-hop count, not "shortest fiber"). Your packet is forwarded hop by hop; no one box has the full user-to-server circuit.

You will see this as:

- `traceroute` showing routers you do not own.
- A region going dark because a transit provider dropped a prefix.
- Multi-homed companies advertising the same prefix from two ISPs for backup.

**BGP hijack / route leak:** an AS accidentally (or maliciously) announces a more-specific prefix for someone else's IPs. Traffic follows the lie. RPKI and filtering exist because original BGP trusted announcements.

You do not run BGP on a typical app server. Your cloud's edge does. You *do* choose regions, anycast CDNs, and DNS failover that assume BGP path quality.

## 3. Debugging "the site is down" at this layer

```bash
dig +short api.example.com
curl -vI --resolve api.example.com:443:203.0.113.10 https://api.example.com/
```

- DNS points at the wrong IP → fix records, wait TTL (or lower it next time).
- DNS is right, TCP times out → routing, firewall, or the origin is dead. `traceroute` / cloud status.
- Some ISPs work, others do not → resolver cache, or a BGP path issue to *your* prefix.

## What to remember

- DNS maps names to records (A, AAAA, CNAME, MX, NS) with a TTL. `dig` is the tool.
- Recursive resolvers cache; authoritative servers are the source of truth.
- BGP glues ASes together. Prefix announcements *are* the map; they can be wrong.
- Change TTL before you need a fast cutover. DNS is not a load balancer by itself (round-robin A records are a blunt instrument).
