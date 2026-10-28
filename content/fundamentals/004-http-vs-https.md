---
title: HTTP vs HTTPS (TLS)
description: What TLS actually protects, the 1.2 vs 1.3 handshakes, certificates and trust chains, SNI/ALPN/HSTS, mTLS, and the certificate failures that page teams at 3 a.m.
order: 4
---

HTTP is plaintext: anyone on the path can read, modify, or inject. **HTTPS is HTTP over TLS**, providing:

- **Confidentiality** — encryption in transit.
- **Integrity** — tampering is detected.
- **Authentication** of the server (and optionally the client) via certificates.

TLS does not hide the destination IP, the hostname (unless ECH), or traffic volume/timing.

## The handshake

### TLS 1.2 (2 RTT)

```
ClientHello  (versions, ciphers, SNI, key share)
            <-- ServerHello, Certificate, ServerKeyExchange, ServerHelloDone
ClientKeyExchange, ChangeCipherSpec, Finished
            <-- ChangeCipherSpec, Finished
```

### TLS 1.3 (1 RTT, 0-RTT resumption)

```
ClientHello + key share
            <-- ServerHello + key share + Certificate + Finished
Finished
```

TLS 1.3 removed legacy ciphers, encrypts more of the handshake, and supports **0-RTT** early data on resumed connections. 0-RTT data is **replayable** — only use it for idempotent requests.

Handshake cost matters:

```
DNS + TCP + TLS + request = several RTTs before the first byte
```

At 150 ms RTT, 3 RTTs is 450 ms. This is why connection reuse, session resumption, and edge termination are performance features, not just security ones.

## Certificates and trust

A certificate binds a **name** to a **public key**, signed by a CA. The client validates:

1. **Chain** up to a trusted root in its store.
2. **Hostname** matches SAN (CN is legacy).
3. **Validity dates** (and clock correctness).
4. **Revocation** (OCSP/CRL, often soft-fail).
5. **Key usage / EKU** appropriate for server auth.

Intermediate certificates must be served with the leaf; missing intermediates work on some clients and fail on others (classic mobile-only failure).

**SNI** lets one IP serve many hostnames: the client sends the name in the handshake, so the server picks the certificate. Without SNI, you need one IP per certificate. Encrypted Client Hello (ECH) hides SNI from the network.

**ALPN** negotiates the application protocol (`h2`, `http/1.1`, `h3`) during the handshake.

## HTTPS in production

- **Terminate TLS at the edge/proxy**, keep internal traffic on a trusted network or mTLS.
- **HSTS**: `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` forces HTTPS; preload is hard to undo.
- **Redirect HTTP → HTTPS** with 301/308.
- **OCSP stapling** avoids a client round trip to the CA.
- **Certificate Transparency** logs issuance; monitor CT logs for unexpected certs.
- **Automate renewal** (ACME) and alert before expiry.
- **CAA** records restrict which CAs may issue.

## mTLS

Both sides present certificates. Common for service meshes, B2B APIs, and zero-trust networks.

Operational cost: certificate lifecycle for every client, revocation, and trust-store distribution. Do not use mTLS as a substitute for application authorisation.

## Performance notes

| Technique | Effect |
|---|---|
| TLS 1.3 | 1-RTT, fewer round trips |
| Session resumption / tickets | avoid full handshake |
| 0-RTT | lowest latency, replay risk |
| HTTP/2 multiplexing | fewer connections |
| HTTP/3 (QUIC) | avoids TCP HOL on loss |
| Edge termination | shorter RTT to users |
| OCSP stapling | avoids revocation round trip |
| Session cache/tickets | CPU savings |

TLS handshakes are CPU-heavy at scale; terminate at the edge and reuse sessions.

## Failure modes

| Symptom | Cause |
|---|---|
| `certificate has expired` | renewal failed |
| `unable to get local issuer certificate` | missing intermediate |
| `hostname mismatch` | SNI/SAN wrong |
| Works in browser, fails in app | different trust store/chain |
| `SSL_ERROR_NO_CYPHER_OVERLAP` | protocol/cipher mismatch |
| `ERR_SSL_PROTOCOL_ERROR` | plain HTTP on HTTPS port, proxy misconfig |
| Mixed content blocked | page loads HTTP assets |
| Clock skew errors | client/server time wrong |
| Mobile-only failures | missing intermediate, old TLS support |
| 0-RTT duplicate writes | replay of non-idempotent requests |

## Debugging

```bash
openssl s_client -connect example.com:443 -servername example.com -showcerts
curl -vI https://example.com
curl --tlsv1.3 --tls-max 1.3 https://example.com
echo | openssl s_client -connect example.com:443 2>/dev/null | openssl x509 -noout -dates -subject -issuer
```

Check:

- protocol/cipher chosen and ALPN;
- full chain sent by the server;
- expiry and SANs;
- redirects and HSTS;
- mixed content in the browser console.

## Design checklist

- [ ] TLS 1.2+ only; prefer 1.3.
- [ ] Automated certificate issuance/renewal with expiry alerts.
- [ ] Full chain served; intermediates included.
- [ ] SNI configured for every hostname.
- [ ] HSTS considered (preload only when ready).
- [ ] HTTP redirects to HTTPS.
- [ ] 0-RTT limited to idempotent requests.
- [ ] mTLS (if used) has a lifecycle plan.
- [ ] Certificate transparency monitored.
- [ ] Trust store differences tested (mobile/CLI).
