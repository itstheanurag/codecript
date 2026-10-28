---
title: Routing (DNS & BGP)
description: How names resolve and packets find their way — the DNS hierarchy and caching, records that matter, DNSSEC, and the BGP policies behind reachability and outages.
order: 3
---

Two different routing problems:

- **DNS** maps names to addresses (and other records).
- **BGP** decides which network path packets take between autonomous systems.

Most "site is down" incidents start in one of them.

## DNS: the hierarchy

```
root (.)
  └── TLD (com, org, dev)
        └── authoritative nameserver for example.com
              └── records (www, api, mail, ...)
```

Resolution:

1. A **stub resolver** (your OS/browser) asks a **recursive resolver** (ISP, 1.1.1.1, 8.8.8.8).
2. The recursive resolver asks the root, then the TLD, then the authoritative server (iterative).
3. The answer is cached for the record's **TTL**.

`dig +trace example.com` shows the whole chain. `dig example.com @1.1.1.1` asks a specific resolver.

## Records that matter

| Type | Purpose | Notes |
|---|---|---|
| `A` | IPv4 address | multiple records = round robin |
| `AAAA` | IPv6 address | dual-stack clients prefer IPv6 |
| `CNAME` | alias to another name | not allowed at the zone apex |
| `MX` | mail exchangers | priority ordering |
| `TXT` | arbitrary text | SPF/DKIM/DMARC, verification |
| `NS` | delegation | which servers are authoritative |
| `SOA` | zone metadata | serial, refresh, negative TTL |
| `CAA` | allowed CAs | certificate issuance control |
| `SRV` | service location | host + port + priority |

Apex problem: `example.com` needs `SOA`/`NS`, so it cannot be a `CNAME`. Use `A`/`AAAA` or provider-specific ALIAS/ANAME.

## TTL and caching

TTL is a **contract with resolvers**: how long they may reuse the answer.

- Low TTL (30–60 s) → faster failover, more queries.
- High TTL (hours) → fewer queries, slower changes.
- **TTL 0** does not mean "no cache"; some resolvers clamp it.
- **Negative caching** (NXDOMAIN/NODATA) uses the SOA minimum; a typo can stick for minutes/hours.

Changing DNS is not instant. Plan for the old TTL to expire everywhere; during migration, lower TTL **before** the change, then raise it after.

## Anycast and geo-routing

- **Anycast**: the same IP is announced from multiple locations; BGP routes each user to the nearest/healthiest. Used by root servers, public resolvers, CDNs.
- **GeoDNS**: the resolver returns different addresses based on the resolver's location (not the user's, which can differ).
- **Weighted/latency routing**: provider feature, often implemented via health checks and DNS TTLs.

DNS-based failover is coarse: resolvers cache, clients ignore TTLs, and health checks can flap. Treat it as a second line of defence, not a load balancer.

## DNS security

- **DNSSEC**: signs records so resolvers can verify authenticity. Does not encrypt queries.
- **DoT/DoH**: encrypts DNS traffic to the resolver; does not make the answer authoritative.
- **CAA**: restricts which CAs may issue certificates.
- **Registrar security**: MFA, registrar lock, monitored NS changes. Domain hijacks are often registrar/account compromises.

## BGP: how packets cross the Internet

The Internet is a set of **autonomous systems (ASes)**. BGP announces which IP prefixes an AS can reach and via which neighbours.

- **AS path**: the sequence of ASes to a prefix; shorter is usually preferred.
- **Policies**: business relationships (customer/provider/peer) override shortest path; valleys are avoided.
- **Local preference / MED / communities** influence selection.
- **Anycast** relies on BGP: many locations announce the same prefix.

BGP is **trust-based**. A misconfiguration can:

- **Hijack** a prefix (announce someone else's space),
- **Leak** routes (re-announce a provider's routes to peers),
- **Blackhole** traffic (announce but drop).

Mitigations: RPKI/ROA (cryptographic origin validation), prefix filters, max-prefix limits, monitoring (BGPStream, RIPE RIS).

## Failure modes and symptoms

| Symptom | Likely cause |
|---|---|
| `NXDOMAIN` for a valid host | missing record, wrong zone, expired domain |
| `SERVFAIL` | DNSSEC failure, authoritative unreachable, resolver issue |
| Works for some users | stale caches, split-horizon, geo-routing, anycast route |
| Changed record not visible | TTL not expired; check multiple resolvers |
| Email goes to spam | SPF/DKIM/DMARC TXT records |
| Certificate issuance blocked | CAA record |
| One region unreachable | BGP withdrawal/hijack, peering issue |
| DNS slow but HTTP fast | resolver latency, cold cache, DoH provider |

## Debugging checklist

```bash
dig +short example.com
dig +trace example.com
dig example.com @8.8.8.8
dig -x 203.0.113.10           # reverse
dig example.com TXT
dig example.com CAA
whois example.com
curl -v --resolve example.com:443:203.0.113.10 https://example.com
```

- Test from multiple networks/resolvers.
- Compare authoritative vs recursive answers.
- Check TTL and negative caching.
- Verify DNSSEC with `dig +dnssec` (look for `ad` flag).
- For BGP, check looking glasses and RPKI validity.

## Design guidance

- Keep DNS simple; avoid deep CNAME chains.
- Use a reputable anycast DNS provider with a documented SLA.
- Lower TTLs before migrations; raise after.
- Automate certificate issuance and monitor CAA.
- Use health-checked failover only where TTLs are short.
- For global traffic, combine DNS/anycast with application-level routing.
- Monitor resolution from multiple geographies and resolvers.

## Interview prompts

1. "Users in one country cannot reach us; others can. How do you debug?" → DNS/geo, anycast/BGP, regional infra, certificate/SNI.
2. "You changed an A record; some users still hit the old server. Why?" → TTL caching, resolvers, connection reuse.
3. "What is anycast and why does it help?" → same IP, BGP nearest path, DDoS absorption.

## Checklist

- [ ] I know which resolver my users actually use.
- [ ] TTLs match the change/failover strategy.
- [ ] Negative caching is understood.
- [ ] Apex records use ALIAS/A instead of CNAME.
- [ ] DNSSEC/CAA are configured where needed.
- [ ] Registrar account has MFA and lock.
- [ ] BGP/anycast health is monitored from multiple regions.
- [ ] I can trace a resolution end to end.
