---
title: API Security & OAuth 2.0
order: 3
---

Securing APIs is paramount. A single misconfigured authorization check can lead to massive data breaches.

## 1. Authentication vs. Authorization

*   **Authentication (AuthN):** "Who are you?" Proving identity (e.g., logging in with a username and password).
*   **Authorization (AuthZ):** "What are you allowed to do?" Verifying permissions (e.g., User A is an Admin and can delete posts).

## 2. JSON Web Tokens (JWT)

A JWT (pronounced "jot") is a standard for safely representing claims between two parties. It is the most common way to handle stateless API authentication.

### Structure of a JWT
A JWT is a string composed of three parts: `Header.Payload.Signature`

```mermaid
architecture-beta
    group jwt(cloud)[JSON Web Token]
    
    service header(database)[Header (Alg)] in jwt
    service payload(database)[Payload (User Data)] in jwt
    service sig(database)[Signature (Hash)] in jwt
    
    header:R -- L:payload
    payload:R -- L:sig
```

1.  **Header:** Contains metadata about the token (e.g., the signing algorithm used, like HS256).
2.  **Payload:** Contains the actual claims (the data). *Example:* `{"user_id": 123, "role": "admin"}`.
3.  **Signature:** A cryptographic hash of the Header and Payload, signed using a secret key held by the server.

### How it Works (Statelessness)

> [!TIP]
> **ELI5: The VIP Wristband**
> Instead of checking a massive guest list at the door of every single room in the club (Stateful DB lookup), the bouncer checks your ID once at the front door (Login). 
> They give you a tamper-proof VIP wristband (JWT). Now, whenever you go to the VIP lounge, the guard just looks at the wristband. They don't need to ask the front desk who you are.

1.  User logs in.
2.  Server verifies credentials, generates a JWT, signs it with a secret key, and sends it back.
3.  Client includes the JWT in the `Authorization: Bearer <token>` header of every subsequent API request.
4.  The server receives the token, recalculates the signature using its secret key. If the signature matches, the server knows the token is valid.

**Crucially, the server does not need to query the database to verify the token.** This makes JWTs incredibly scalable.

> [!WARNING]
> The Payload of a JWT is simply Base64 encoded, **not encrypted**. Anyone who intercepts the token can decode it and read the data. Never put sensitive information (passwords, credit cards) inside a JWT payload.

## 3. OAuth 2.0 (Delegated Authorization)

OAuth 2.0 is an industry-standard protocol for authorization. It allows a user to grant a third-party application access to their resources on another service, *without* giving the third party their password.

> [!TIP]
> **ELI5: The Valet Key**
> You don't give a valet your master car key, because then they could unlock the glovebox, open the trunk, and drive off with the car. You give them a "Valet Key" (OAuth Token) that *only* allows them to start the ignition and drive a short distance, but prevents them from opening the trunk.

### The Authorization Code Flow
This is the most secure and common OAuth flow.

1.  The Client (e.g., Budget App) redirects the User to the Authorization Server (e.g., Chase Bank).
2.  The User logs in to Chase and clicks "Approve Access".
3.  Chase redirects the User back to the Budget App with a temporary `Authorization Code`.
4.  The Budget App's backend server sends the `Authorization Code` + its own `Client Secret` directly to Chase (backchannel, securely).
5.  Chase validates the code and secret, and returns an `Access Token`.
6.  The Budget App uses the `Access Token` to request transaction data.

By exchanging the temporary code for the final token entirely on the backend, the actual Access Token is never exposed to the user's browser, significantly reducing the risk of interception.
