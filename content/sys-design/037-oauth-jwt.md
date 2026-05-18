---
title: OAuth 2.0 & JWT (System Design)
order: 37
---

# Identity: OAuth 2.0 & JWT

In a distributed microservices system, handling user identity securely and efficiently is a massive challenge. If every microservice has to query a central "Users Database" to check if a session is valid, that database will quickly become a crippling bottleneck.

The modern standard to solve this is using stateless JSON Web Tokens (JWTs) in combination with an Identity Provider (OAuth 2.0).

## 1. JSON Web Tokens (JWT)

A JWT allows you to authenticate a user without storing a session in a database.

```mermaid
architecture-beta
    group jwt(cloud)[JSON Web Token]
    
    service header(database)[Header] in jwt
    service payload(database)[Payload (Claims)] in jwt
    service sig(database)[Signature] in jwt
    
    header:R -- L:payload
    payload:R -- L:sig
```

> [!TIP]
> **ELI5: The VIP Wristband**
> Instead of checking a massive guest list at the door of every single room in the club (Stateful DB lookup), the bouncer checks your ID once at the front door (Login). 
> They give you a tamper-proof VIP wristband (JWT). Now, whenever you go to the VIP lounge (Microservice A) or the private bar (Microservice B), the guard just looks at the wristband. They don't need to ask the front desk who you are.

### How Microservices Validate JWTs
1.  The `Auth Service` signs the JWT using a private key and sends it to the user.
2.  The user sends the JWT in the HTTP headers to the `Billing Service`.
3.  The `Billing Service` mathematically verifies the signature. **It does not need to talk to the Auth Service or the Database.** It instantly knows the token is valid and trusts the data inside it (e.g., `user_id: 123`).

### The JWT Invalidation Problem
Because JWTs are stateless, you cannot easily "log out" a user. The token remains valid until its expiration time.
*   **Solution:** Keep JWT expiration times very short (e.g., 15 minutes). Issue a long-lived "Refresh Token" that is stored in the database. When the JWT expires, the client uses the Refresh Token to get a new one. If the user logs out, you delete the Refresh Token from the database.

## 2. OAuth 2.0 (Delegated Authorization)

OAuth 2.0 allows a user to grant a third-party application access to their resources *without* giving the third party their password.

> [!TIP]
> **ELI5: The Valet Key**
> You don't give a valet your master car key, because then they could unlock the glovebox, open the trunk, and drive off with the car. You give them a "Valet Key" (OAuth Token) that *only* allows them to start the ignition and drive a short distance.

### The Authorization Code Flow
If you are designing a system that integrates with Google or Stripe, you use this flow.

1.  **Redirect:** Your app redirects the user to Google.
2.  **Consent:** The user logs into Google and clicks "Approve".
3.  **The Code:** Google redirects the user back to your app with a temporary `Authorization Code`.
4.  **The Exchange (Backchannel):** Your backend server secretly sends the `Authorization Code` and your `Client Secret` directly to Google's servers.
5.  **The Token:** Google validates the secret and returns the final `Access Token`.

We do the exchange on the backend (Step 4) so the highly sensitive Access Token is never exposed to the user's browser where a malicious Chrome extension could steal it.
