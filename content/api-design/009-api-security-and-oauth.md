---
title: API Security & OAuth 2.0
description: Authentication vs authorisation, the OAuth flows worth using, token validation and rotation, object-level access control, and the OWASP API risks that cause real breaches.
order: 9
---

Security is a property of the whole request path, not a middleware checkbox. Two questions must be answered separately:

- **Authentication (AuthN)**: who is calling?
- **Authorisation (AuthZ)**: are they allowed to do this, on this object, now?

Most API breaches are authorisation failures, not broken cryptography.

## OAuth 2.0 in one page

OAuth delegates access without sharing passwords. Roles:

- **Resource owner** — the user.
- **Client** — the app requesting access.
- **Authorization server** — issues tokens after consent/auth.
- **Resource server** — your API, validates tokens.

### Authorization Code + PKCE (browser/mobile)

Best for user-facing apps:

1. Client generates `code_verifier` + `code_challenge`.
2. Redirects to the authorization server with `client_id`, `redirect_uri`, `scope`, `state`, `code_challenge`.
3. User authenticates/consents.
4. Server redirects back with `code` (and `state`).
5. Client exchanges `code` + `code_verifier` for tokens at the token endpoint.
6. Client calls the API with `Authorization: Bearer <access_token>`.

PKCE prevents authorization-code interception. `state` prevents CSRF on the callback.

### Client Credentials (service-to-service)

No user context. The service authenticates with its client id/secret (or mTLS/private key JWT) and receives a token scoped to its own permissions.

### Device Code (TVs/CLI)

The device shows a code, the user approves on another device, the device polls for tokens.

### Flows to avoid

- **Implicit** — tokens in URLs; deprecated.
- **Resource Owner Password** — apps handling user passwords; deprecated.
- Long-lived tokens without refresh.

## Tokens

| | JWT (self-contained) | Opaque (reference) |
|---|---|---|
| Validation | local signature/claims | introspection/lookup |
| Revocation | hard before expiry | immediate |
| Size | larger | small |
| Best for | short-lived access tokens | refresh tokens, high-security revocation |

JWT rules:

- validate **signature**, `iss`, `aud`, `exp`, `nbf`, and `scope`;
- never trust `alg: none`; pin accepted algorithms;
- keep access tokens short-lived (5–15 min);
- do not put secrets or excessive PII in claims (they are readable);
- support key rotation via `kid` and JWKS.

Refresh tokens:

- store server-side (hashed), rotate on use, detect reuse;
- bind to client/device where possible;
- revoke on logout/password change.

## Scopes, roles, permissions

- **Scopes** limit what a token can do at the API level (`orders:read`, `orders:write`).
- **Roles** group permissions for humans (`support`, `admin`).
- **Object-level permissions** decide per resource (`order.customerId === user.id`).

A token with `orders:read` still must not read another tenant's order. Enforce tenancy at the query level, not just in the handler.

```ts
async function getOrder(ctx: Context, id: OrderId): Promise<Order> {
  const order = await orders.findById(id);
  if (!order) throw new NotFound();
  if (order.tenantId !== ctx.tenantId) throw new NotFound(); // do not leak existence
  if (!ctx.user.can("order:read", order)) throw new Forbidden();
  return order;
}
```

## OWASP API Security risks (the ones that matter)

| Risk | Example | Defence |
|---|---|---|
| **BOLA** (object-level authz) | `/orders/123` returns another user's order | check ownership/tenant on every object |
| **Broken authentication** | weak tokens, no expiry, credential stuffing | short-lived tokens, MFA, rate limits |
| **Broken object property authz** | mass assignment sets `role: admin` | allowlist mutable fields |
| **Excessive data exposure** | returning full user rows | response DTOs, field-level filtering |
| **Broken function authz** | admin endpoint only hidden in UI | server-side role checks |
| **Unrestricted resource consumption** | expensive queries, large uploads | limits, quotas, timeouts |
| **SSRF** | fetch arbitrary URL from server | allowlist, block private IPs |
| **Security misconfiguration** | verbose errors, open CORS, debug endpoints | safe defaults, headers, reviews |
| **Injection** | SQL/NoSQL/command | parameterised queries, validation |
| **Improper inventory** | forgotten v1 endpoint | API inventory/deprecation |

## Cookies, CSRF, CORS

- Cookies: `Secure`, `HttpOnly`, `SameSite=Lax/Strict`, scoped `Path`, short expiry.
- State-changing cookie-authenticated requests need **CSRF** protection (double-submit token or SameSite + origin checks).
- CORS is not authorisation. Allow specific origins, methods, headers; never `*` with credentials.
- Bearer tokens in browser storage are XSS-sensitive; prefer memory + refresh cookie, or BFF pattern.

## API keys and mTLS

- **API keys** identify a client, not a user. They are not sufficient for authorisation by themselves; combine with scopes/IP allowlists and rotate them.
- **mTLS** authenticates the client certificate; common in B2B and high-security service meshes. Requires certificate lifecycle management.
- Never put keys in URLs, git, or client-side code.

## Rate limiting and abuse

Security controls fail without limiting:

- per-IP and per-account limits;
- login/OTP attempt limits (credential stuffing);
- payload/upload size caps;
- expensive query budgets;
- anomaly detection for scraping.

## Logging and privacy

- Log auth decisions (allow/deny) with caller id and reason, not tokens.
- Redact secrets, PII, and authorization headers.
- Keep an audit trail for sensitive actions (who, what, when, from where).
- GDPR/CCPA: data minimisation, retention, deletion.

## Checklist

- [ ] AuthN and AuthZ are separate decisions, enforced server-side.
- [ ] Every object access checks tenant/ownership (BOLA).
- [ ] Scopes are validated, not just token presence.
- [ ] Access tokens are short-lived; refresh tokens rotate and can be revoked.
- [ ] JWTs validate signature, alg, iss, aud, exp.
- [ ] Mass assignment is blocked by DTO allowlists.
- [ ] Responses expose only necessary fields.
- [ ] Rate limits and payload caps exist on auth, search, and uploads.
- [ ] CORS, cookies, and CSRF are configured for the browser model.
- [ ] Secrets are in a secret manager, rotated, and never logged.

Next: [Versioning & Pagination](/api-design/010-versioning-and-pagination) — evolving a contract without breaking callers.
