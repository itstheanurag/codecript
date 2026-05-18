---
title: HTTP Fundamentals
order: 1
---

Before discussing advanced API architectures like GraphQL or REST, you must deeply understand the underlying transport layer: **HTTP (Hypertext Transfer Protocol)**. 

Every time a frontend application (like a React web app or an iOS mobile app) wants data from a backend server, it constructs and sends an HTTP Request.

> [!TIP]
> **ELI5: The Mail System**
> Think of an HTTP Request as sending a physical letter through the mail.
> *   **The URL:** The destination address on the envelope.
> *   **The Method (Verb):** A sticker on the envelope saying what you want (e.g., "GET: Please send me a package" or "POST: Here is a package to keep").
> *   **The Headers:** The metadata (e.g., Return address, "Fragile", "Overnight Delivery").
> *   **The Body:** The actual contents inside the envelope (the payload).

## 1. The Structure of an HTTP Request

When your browser or a tool like `fetch()` makes a request, it generates a raw text string that looks like this:

```http
POST /users/123/profile?theme=dark HTTP/1.1
Host: api.example.com
Authorization: Bearer my_secret_token
Content-Type: application/json

{
  "username": "coder123",
  "bio": "I love distributed systems"
}
```

Let's break down exactly how this request is formed.

### The Endpoint (URL / URI)
The URL defines *where* the request is going and *what* it is targeting. It is composed of the base domain, path parameters, and query parameters.

### Path Parameters
Variables embedded directly into the URL path, used to identify a specific resource.
*   **Example:** `/users/123/profile` (where `123` is the Path Parameter identifying a specific user).
*   **When to use:** When you need to retrieve or modify one specific item by its ID.

### Query Parameters
Key-value pairs appended to the end of the URL after a `?`.
*   **Example:** `/users?role=admin&sort=desc`
*   **When to use:** When you are filtering, sorting, or paginating a list of resources. They are optional modifiers, not primary identifiers.

## 2. HTTP Methods (Verbs)

The Method tells the server *what action* you want to perform on the URL.

*   `GET`: Retrieve data. (Should be Idempotent—calling it 10 times doesn't change anything).
*   `POST`: Create new data or submit a payload. (Not Idempotent).
*   `PUT`: Replace an existing resource entirely.
*   `PATCH`: Partially update an existing resource (e.g., just updating the "bio" field).
*   `DELETE`: Remove a resource.

## 3. HTTP Headers

Headers are key-value pairs sent alongside the request (or response) that provide critical metadata.

*   **`Authorization`**: The most important header for security. It usually contains a JWT or an API Key (e.g., `Authorization: Bearer <token>`).
*   **`Content-Type`**: Tells the server how to parse the Body. Usually `application/json`, but could be `multipart/form-data` for file uploads.
*   **`Accept`**: Tells the server what format the frontend *wants* to receive back (e.g., `Accept: text/html` vs `Accept: application/json`).

## 4. The Request Body

The Body contains the actual data payload.
*   It is typically formatted as JSON in modern APIs.
*   `GET` and `DELETE` requests generally **do not** have a body, as they only use the URL to identify what to fetch or delete.
*   `POST`, `PUT`, and `PATCH` requests use the body to send the massive chunks of data (like a user's entire profile data, or a base64 encoded image).

## 5. The Response (Status Codes)

When the server replies, it sends back a Status Code indicating what happened. You must memorize these categories:

*   **`2xx` (Success):** Everything worked! (`200 OK`, `201 Created`).
*   **`3xx` (Redirection):** Go look somewhere else. (`301 Moved Permanently`).
*   **`4xx` (Client Error):** The frontend messed up. (`400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `429 Too Many Requests`).
*   **`5xx` (Server Error):** The backend crashed. (`500 Internal Server Error`, `503 Service Unavailable`).
