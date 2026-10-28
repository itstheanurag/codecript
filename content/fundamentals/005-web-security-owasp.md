---
title: Web Security (OWASP)
description: A working threat model and the OWASP Top 10 in practice — access control, injection, XSS/CSRF, SSRF, auth, secrets, and the defences that actually stop exploits.
order: 5
---

Security is not a feature at the end of the backlog. It is a set of **trust boundaries** you design and test.

## Threat model in five questions

1. **What are the assets?** credentials, money, PII, admin actions, availability.
2. **Who are the actors?** anonymous users, authenticated users, tenants, insiders, automated bots.
3. **Where are the trust boundaries?** browser→server, service→service, server→third party, server→database.
4. **What can cross a boundary?** inputs, identity claims, files, URLs, headers.
5. **What happens if it does?** data leak, privilege escalation, fraud, outage.

Every input crossing a boundary is hostile until validated; every identity claim is untrusted until verified.

## The OWASP Top 10, practically

### A01: Broken access control

The most common serious bug. Users access objects they do not own.

```ts
// Vulnerable: trusts the URL, not the session
app.get("/orders/:id", (req, res) => db.orders.findById(req.params.id));
```

Fix: check ownership/tenant on **every** object, server-side:

```ts
const order = await db.orders.findForUser(req.user.id, req.params.id);
if (!order) return res.sendStatus(404); // do not leak existence
```

Also: deny by default, avoid force-browsable admin routes, validate `..` path traversal, and never rely on hidden UI.

### A02: Cryptographic failures

- plaintext or weak hashing for passwords (use Argon2id/bcrypt/scrypt);
- hard-coded keys, keys in git;
- no TLS internally;
- ECB mode, static IVs, homemade crypto;
- sensitive data in logs.

Use vetted libraries, encrypt in transit and at rest, and rotate keys.

### A03: Injection

Data becomes code when concatenated into a query, shell, or template.

```ts
// SQL injection
db.query(`SELECT * FROM users WHERE email = '${email}'`);
```

Fix: parameterised queries, allowlisted identifiers, no shell interpolation (`execFile` with args, not `exec`), context-aware output encoding.

XSS is injection into HTML/JS:

- **Stored** (persisted), **reflected** (in a response), **DOM** (client-side sinks).
- Fix: escape by context, use framework escaping, CSP as defence in depth, avoid `innerHTML` with untrusted data.
- `dangerouslySetInnerHTML`, `v-html`, `eval`, `new Function` are sinks.

### A04: Insecure design

No amount of implementation fixes a broken flow:

- password reset without expiry/one-time tokens;
- business rules enforced only in the client;
- no rate limit on OTP/credential stuffing;
- races in coupon redemption.

Fix: threat-model the flow, enforce invariants server-side, add limits and idempotency.

### A05: Security misconfiguration

- default admin credentials, debug endpoints, stack traces;
- permissive CORS (`*` with credentials);
- S3 buckets public;
- directory listing;
- missing security headers;
- verbose errors leaking internals.

Fix: hardened baselines, config as code, automated scanning, safe defaults.

### A06: Vulnerable and outdated components

Dependencies are code you did not write. Track SBOM, run `npm audit`/Dependabot, pin versions, and patch. Remove unused packages.

### A07: Identification and authentication failures

- credential stuffing (rate-limit + breached-password checks + MFA);
- session fixation (rotate on login);
- weak session cookies (`Secure`, `HttpOnly`, `SameSite`);
- predictable reset tokens;
- JWT `alg: none` / unverified signatures.

### A08: Software and data integrity failures

- unsafe deserialization (RCE);
- CI/CD compromise;
- unsigned updates;
- `postinstall` scripts from untrusted packages.

Fix: signed artifacts, lockfiles, dependency review, least-privilege CI tokens.

### A09: Logging and monitoring failures

You cannot respond to what you cannot see. Log auth decisions, access-control denials, admin actions, and payment events. Do not log secrets/PII. Alert on anomalies. Keep audit logs immutable.

### A10: SSRF

The server fetches a URL supplied by the user. Attackers target:

- cloud metadata (`169.254.169.254`),
- internal admin services,
- `localhost`, RFC1918, IPv6 equivalents.

Fix: allowlist destinations, block private ranges, resolve and pin IPs, disable redirects, egress controls, and never let user input choose the scheme/host.

## CSRF and CORS

- **CSRF**: a state-changing request authenticated by cookies. Fix with `SameSite`, CSRF tokens, origin checks.
- **CORS** is a browser relaxation, not authentication. Never reflect arbitrary origins with credentials.

## Security headers

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; object-src 'none'; base-uri 'none'
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

CSP is the strongest XSS mitigation; roll it out in report-only mode first.

## Secrets

- Never in git, URLs, logs, or client bundles.
- Use a secret manager with rotation and least privilege.
- Separate secrets per environment.
- Scan commits and images (`gitleaks`, `trufflehog`).

## Defence in depth

| Layer | Control |
|---|---|
| Client | input constraints, CSP, escaping |
| API | authn/authz, validation, rate limits |
| Service | least privilege, parameterised queries, timeouts |
| Data | encryption, row-level scoping, backups |
| Infra | patching, network policy, WAF |
| Process | review, threat modelling, incident drills |

No single layer is sufficient; assume one will fail.

## Testing

- Automated: SAST/DAST, dependency scanning, secret scanning.
- Manual: authz matrix tests (user A cannot access B), IDOR sweeps, fuzzing.
- Abuse cases: OTP brute force, password reset replay, coupon race, SSRF to metadata.
- Tabletop: what happens if a token leaks? if an admin account is phished?

## Interview prompts

1. "How do you prevent users from reading each other's orders?" → server-side ownership/tenant checks, tests, deny by default.
2. "Where can XSS happen in a React app?" → sinks, `dangerouslySetInnerHTML`, third-party scripts; CSP.
3. "A user-supplied URL is fetched by the server. What do you do?" → SSRF allowlist/egress controls.

## Checklist

- [ ] Every object access checks ownership/tenant.
- [ ] Queries are parameterised; shell calls avoid interpolation.
- [ ] Passwords use a modern KDF; sessions rotate on login.
- [ ] Cookies are `Secure`, `HttpOnly`, `SameSite`.
- [ ] CORS is explicit, never `*` with credentials.
- [ ] Inputs are validated at the boundary; outputs encoded by context.
- [ ] Secrets are managed and scanned.
- [ ] Dependencies are patched and inventoried.
- [ ] Security headers/CSP are deployed.
- [ ] Auth/admin events are logged and alerted.
