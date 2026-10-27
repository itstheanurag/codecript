---
title: SOAP APIs
description: What SOAP actually is, WSDL/XSD contracts, WS-Security and reliability, why banks still use it, and how to integrate with it without inheriting its weight.
order: 4
---

SOAP (Simple Object Access Protocol) is an XML-based messaging protocol with a formal contract. It predates REST's dominance and survives in banking, insurance, telecom, government, and enterprise integrations where **contract formality and WS-* standards** matter.

You will not usually choose SOAP for a new product. You will integrate with one.

## The message

```xml
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header>
    <wsse:Security xmlns:wsse="...">
      <wsse:UsernameToken>
        <wsse:Username>partner</wsse:Username>
        <wsse:Password>...</wsse:Password>
      </wsse:UsernameToken>
    </wsse:Security>
  </soap:Header>
  <soap:Body>
    <GetAccountBalance xmlns="urn:bank:accounts:v2">
      <AccountId>acct_123</AccountId>
    </GetAccountBalance>
  </soap:Body>
</soap:Envelope>
```

Three parts:

- **Envelope** — the message wrapper.
- **Header** — security, routing, transaction context, correlation.
- **Body** — the operation payload.
- **Fault** — structured error inside the body (`soap:Fault`).

## The contract: WSDL + XSD

A **WSDL** describes operations, messages, bindings (SOAP 1.1/1.2, HTTP), and endpoints. **XSD** defines the data types. Tooling generates strongly typed clients from these files.

That formality is the main advantage:

- the contract is machine-readable and versioned;
- validation can happen before business logic;
- code generation is standard across languages;
- enterprise partners can agree on a document rather than a wiki page.

The cost is verbosity and tooling drift: WSDL/XSD versioning, namespace changes, and generator quirks are a real maintenance burden.

## Style: document/literal

Use **document/literal wrapped** (WS-I compliant) for new integrations. Older `rpc/encoded` services are hard to consume and effectively legacy.

```
<soap:Body>
  <CreateTransfer xmlns="urn:bank:transfers:v1">
    <From>acct_1</From>
    <To>acct_2</To>
    <Amount currency="USD">100.00</Amount>
  </CreateTransfer>
</soap:Body>
```

## WS-* standards you may meet

| Standard | Purpose | Practical note |
|---|---|---|
| **WS-Security** | message-level auth/signature/encryption | UsernameToken, X.509, SAML assertions |
| **WS-Policy** | declares required security/policy | often ignored by hand-written clients |
| **WS-ReliableMessaging** | delivery guarantees | rare; most rely on retries/idempotency |
| **WS-AtomicTransaction** | distributed transactions | heavy, brittle, usually avoided |
| **WS-Addressing** | message routing/correlation headers | useful for async patterns |
| **MTOM** | binary attachments | large files; often replaced by object storage |

Use only what the partner requires. WS-AtomicTransaction across organisations is an operational hazard.

## Errors

SOAP errors are faults:

```xml
<soap:Fault>
  <faultcode>soap:Client</faultcode>
  <faultstring>Account not found</faultstring>
  <detail>
    <Error xmlns="urn:bank:errors:v1">
      <Code>ACCOUNT_NOT_FOUND</Code>
    </Error>
  </detail>
</soap:Fault>
```

- `Client` vs `Server` distinguishes caller vs provider faults.
- Put a stable business code in `detail`.
- HTTP status is often `500` even for client faults — parse the fault, not the status.

## Security

- **Transport**: TLS with mutual authentication (mTLS) is common.
- **Message**: WS-Security signatures/encryption protect end-to-end through intermediaries.
- **Identity**: SAML assertions or X.509 certificates; UsernameToken only over TLS and ideally not at all.
- **Replay protection**: timestamps and nonces in the security header.
- **XML attacks**: disable DTDs/external entities (XXE), limit payload size, validate against schema.

## When SOAP is the right choice

- A partner or regulator mandates it.
- The contract must be formally described and versioned (WSDL/XSD).
- WS-Security or WS-* semantics are required end to end.
- Existing enterprise service bus (ESB) infrastructure expects it.

## When it is not

- New internal APIs → REST/gRPC.
- Browser/mobile clients → JSON/HTTP.
- High-throughput, low-latency service calls → gRPC.
- Simple public integrations → REST + webhooks.

## Integrating without inheriting the pain

1. **Isolate** SOAP behind an adapter with your own domain types.
2. **Generate the client** from WSDL; never hand-parse XML.
3. **Map faults** to your error taxonomy.
4. **Add timeouts, retries with idempotency, and circuit breakers** at the adapter boundary.
5. **Log the SOAP envelope id/correlation id**, not full payloads with secrets.
6. **Record contract versions** and test against partner sandboxes in CI where possible.
7. **Facade for migration**: expose REST/gRPC internally; translate to SOAP at the edge until the partner moves.

```ts
interface BalancePort {
  getBalance(accountId: AccountId): Promise<Money>;
}

class PartnerSoapAdapter implements BalancePort {
  constructor(private readonly client: PartnerClient) {}

  async getBalance(accountId: AccountId): Promise<Money> {
    try {
      const response = await this.client.getAccountBalance({ accountId });
      return Money.fromDecimal(response.amount, response.currency);
    } catch (error) {
      throw mapSoapFault(error);
    }
  }
}
```

## Testing

- Contract tests against the WSDL/XSD (schema validation).
- Fault-path tests (Client/Server, business codes).
- Sandbox integration tests with recorded fixtures.
- Timeout/retry tests, especially for idempotent operations.
- XML security tests (XXE disabled, signature verification).

## Checklist

- [ ] The WSDL/XSD version in use is recorded and validated in CI.
- [ ] document/literal is used; no rpc/encoded for new work.
- [ ] Faults map to stable business codes in your domain.
- [ ] mTLS and/or WS-Security requirements are implemented and tested.
- [ ] XXE and DTD processing are disabled; payload size is capped.
- [ ] Timeouts, retries, and idempotency are handled at the adapter.
- [ ] The SOAP client is isolated behind a domain port.
- [ ] Correlation ids are logged for partner support.

Next: [Modern RPC (gRPC & tRPC)](/api-design/005-grpc-and-trpc) — typed contracts without XML.
