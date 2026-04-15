---
title: Web Security
order: 3
---

# Web Security Fundamentals

To be an enterprise-ready engineer, you must understand the common vulnerabilities that put user data at risk. The **OWASP Top 10** is the industry standard list for these risks.

## 1. Cross-Site Scripting (XSS)

XSS occurs when an attacker injects malicious scripts into content from otherwise trusted websites.

- **How it works**: An attacker submits a comment with `<script>send_cookies_to_attacker()</script>`. If the site doesn't sanitize this input, every user who reads the comment executes the script.
- **Prevention**:
  - Always sanitize user input.
  - Use modern frameworks (React/Vue) which automatically escape content.
  - Set a strong **Content Security Policy (CSP)**.
  - Mark cookies as `HttpOnly`.

---

## 2. Cross-Site Request Forgery (CSRF)

CSRF forces an authenticated user to execute unwanted actions on a web application in which they're currently authenticated.

- **How it works**: You are logged into `bank.com`. You visit `evil.com`. `evil.com` has an image tag `<img src="https://bank.com/transfer?amount=1000&to=attacker">`. Your browser automatically sends your `bank.com` cookies, and the transfer happens.
- **Prevention**:
  - Use **Anti-CSRF Tokens** (hidden unique tokens in forms).
  - Set cookie `SameSite` attribute to `Lax` or `Strict`.
  - Check `Origin` and `Referer` headers.

---

## 3. SQL Injection (SQLi)

SQLi consists of an insertion or "injection" of a SQL query via the input data from the client to the application.

- **How it works**: A query like `"SELECT * FROM users WHERE id = " + user_input`. If input is `1; DROP TABLE users;`, the table is deleted.
- **Prevention**:
  - Use **Prepared Statements** (Parameterized queries).
  - Use an ORM (like Prisma or TypeORM) which handles this by default.
  - Never concatenate strings to build queries.

---

## 4. HTTPS and TLS

HTTPS is HTTP over an encrypted connection (**TLS/SSL**).

- **Encryption**: Prevents "Man-in-the-middle" (MITM) attacks.
- **Authentication**: Ensures you are talking to the real server (using Certificates).
- **Integrity**: Ensures data hasn't been tampered with in transit.

> **Key Interview Term**: **Perfect Forward Secrecy (PFS)**—Ensures that if a server's private key is compromised in the future, past communications still cannot be decrypted.
