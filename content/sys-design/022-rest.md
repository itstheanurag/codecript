---
title: REST (Representational State Transfer)
order: 22
---

REST is an architectural style for designing networked applications. It relies on a stateless, client-server, cacheable communications protocol — in virtually all cases, the **HTTP** protocol.

---

## 6 Guiding Principles of REST

To be considered "RESTful," a system must follow these constraints:

1.  **Stateless**: Each request from client to server must contain all the information necessary to understand and complete the request. The server cannot use any stored context on the server.
2.  **Client-Server**: Uniform interface separates clients from servers. This means, for example, that clients aren't concerned with data storage, and servers aren't concerned with the user interface.
3.  **Cacheable**: Responses must, implicitly or explicitly, define themselves as cacheable or not to prevent clients from reusing stale or inappropriate data.
4.  **Uniform Interface**: Simplifies and decouples the architecture. (Resource identification, manipulation through representations, self-descriptive messages).
5.  **Layered System**: A client cannot ordinarily tell whether it is connected directly to the end server or to an intermediary along the way (like a Load Balancer or Proxy).
6.  **Code on Demand (Optional)**: Servers can temporarily extend or customize the functionality of a client by transferring executable code (e.g., JavaScript).

---

## HTTP Methods (Verbs)

REST uses standard HTTP methods to perform operations on resources:

| Method   | Action               | Idempotent? | Best For                      |
| :------- | :------------------- | :---------- | :---------------------------- |
| **GET**    | Read/Retrieve        | Yes         | Fetching a user profile       |
| **POST**   | Create               | No          | Submitting a new order        |
| **PUT**    | Update (Replace)     | Yes         | Updating an entire user record |
| **PATCH**  | Update (Partial)     | No          | Changing just the user's email|
| **DELETE** | Remove               | Yes         | Deleting a comment            |

---

## Resource Naming Conventions

Resources should be named as **nouns**, not verbs. Use hierarchical paths to represent relationships.

-   ✅ **Good**: `GET /users`, `POST /orders`, `GET /users/123/posts`
-   ❌ **Bad**: `GET /getUsers`, `POST /createOrder`, `GET /postsForUser/123`

---

## Pros and Cons

### Pros
-   **Simplicity**: Uses standard HTTP and is easy to learn.
-   **Scalability**: Statelessness allows for easy horizontal scaling.
-   **Flexibility**: Can return data in different formats (JSON, XML, YAML).

### Cons
-   **Over-fetching**: Getting more data than you need (e.g., fetching a whole user object just for the name).
-   **Under-fetching**: Not getting enough data in one call, leading to multiple round trips (the "N+1 Problem").
-   **Payload Size**: JSON headers and text-based data can be bulky compared to binary protocols.

---

## Key Takeaway

REST is the de-facto standard for public APIs and most web communication. While it has flaws like over-fetching, its simplicity and compatibility with browsers make it the "safe" choice for the majority of projects.
