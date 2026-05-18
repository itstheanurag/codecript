---
title: REST API Fundamentals
order: 2
---

**REST (Representational State Transfer)** is not a protocol, a framework, or a library. It is an architectural style for designing networked applications, introduced by Roy Fielding in his 2000 PhD dissertation.

Despite being the most popular term in backend engineering, true REST is heavily misunderstood. 

## 1. The Core Constraints of REST

To be considered a true RESTful system, an API must adhere to several strict constraints. The two most critical for interviews are:

### Statelessness
The server must not store any session state about the client between requests. Every single HTTP request from the client must contain *all* the information necessary (like the Authentication token) for the server to understand and process it. 
*   **Why?** It makes scaling horizontally trivial. If a user hits Server A on their first request, and Server B on their second request, Server B doesn't need to ask Server A who the user is.

### Client-Server Separation
The user interface (frontend) and data storage (backend) must be completely separated. They evolve independently and only communicate via the API.

## 2. Resource-Oriented Design

REST is fundamentally built around **Resources** (Nouns), not Actions (Verbs).

> [!WARNING]
> **Anti-Pattern (RPC Style):**
> `/getUser?id=5`
> `/createNewUser`
> `/deleteUser`
> 
> **RESTful Pattern (Resource Style):**
> `GET /users/5`
> `POST /users`
> `DELETE /users/5`

In REST, the URL identifies the *Noun* (the Resource), and the standard HTTP Method identifies the *Verb* (the Action).

## 3. The Myth of REST (HATEOAS)

If you ask a purist, 99% of "REST APIs" built today are not actually RESTful. They are just "JSON over HTTP". 

A true REST API must implement **HATEOAS** (Hypermedia As The Engine Of Application State). 

> [!TIP]
> **ELI5: HATEOAS and the Web Browser**
> When you go to `amazon.com`, you don't need a manual to know how to navigate the site. The server returns an HTML page containing **hyperlinks** to other pages (like "View Cart" or "Checkout"). You just click the links.
> 
> HATEOAS applies this exact concept to JSON APIs.

**Without HATEOAS (Standard Industry API):**
```json
{
  "id": 123,
  "balance": 50.00
}
```
*The frontend has to hardcode the knowledge that to deposit money, it must make a `POST` request to `/accounts/123/deposit`.*

**With HATEOAS (True REST):**
```json
{
  "id": 123,
  "balance": 50.00,
  "links": [
    { "rel": "deposit", "method": "POST", "href": "/accounts/123/deposit" },
    { "rel": "withdraw", "method": "POST", "href": "/accounts/123/withdraw" }
  ]
}
```
*The API tells the client exactly what actions are currently allowed and where to find them. If the account is frozen, the API simply omits the "withdraw" link.*

While HATEOAS is brilliant in theory (as it completely decouples the frontend from backend routing logic), it is incredibly tedious to build and consume, which is why the industry largely abandoned it in favor of standard JSON over HTTP.
