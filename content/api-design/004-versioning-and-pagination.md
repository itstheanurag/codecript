---
title: Versioning & Pagination
order: 4
---

# API Versioning & Pagination

APIs are meant to be consumed by clients you do not control. Once you publish an API, changing the structure of the data or the URL paths will break those clients. 

## 1. API Versioning

You must have a strategy for introducing breaking changes (e.g., renaming a field, removing an endpoint). 

### URI Versioning (Most Common)
Include the version number directly in the URL path.
*   *Example:* `GET /api/v1/users` -> `GET /api/v2/users`
*   **Pros:** Very explicit. Easy to route traffic to different backend services at the API Gateway level based on the path.

### Header Versioning
Clients pass the desired version in an HTTP header (often `Accept`).
*   *Example:* `GET /api/users` with header `Accept: application/vnd.company.v2+json`
*   **Pros:** Keeps URLs clean and adheres strictly to REST principles.
*   **Cons:** Harder to test manually in a browser.

## 2. Pagination

When an endpoint can return thousands or millions of records, returning them all at once will crash your server (OOM errors) and the client. You must paginate the results.

### Offset / Limit Pagination (The Standard, but Flawed)
The client specifies how many records to skip (`offset`) and how many to take (`limit`).
*   *Query:* `GET /users?offset=100&limit=20` (Returns items 101-120).
*   **Pros:** Very easy to implement. Allows the client to jump to specific pages (e.g., Page 5).

> [!WARNING]
> **The Offset Penalty:** At high offsets (e.g., `offset=100000`), the database must still read and discard the first 100,000 rows before returning the next 20. It becomes exponentially slower as the user pages deeper.

### Cursor / Keyset Pagination (The Performant Approach)
Instead of relying on an offset, the client sends a "cursor" (a pointer to a specific record, usually the ID or a timestamp of the last item they saw).

> [!TIP]
> **ELI5: The Bookmark**
> *   **Offset Pagination:** You tell a friend, "Read me the sentence that is exactly 45,302 words into the book." They have to start at page 1 and count every single word until they get there. Very slow.
> *   **Cursor Pagination:** You place a bookmark. You tell your friend, "Start reading immediately after the bookmark on page 214." They instantly flip there and start reading. Blazingly fast.

*   *Query 1:* `GET /users?limit=20` (Returns items 1-20. Client notes the ID of the 20th item is `948`).
*   *Query 2:* `GET /users?limit=20&after=948`
*   **Database Query:** `SELECT * FROM users WHERE id > 948 ORDER BY id ASC LIMIT 20;`

**Pros:** Incredible performance. The database uses an index to jump directly to ID `948` and takes the next 20. Performance remains constant `O(1)` regardless of how deep into the pages you go.

> [!TIP]
> For infinite scrolling feeds (like Twitter or Instagram) or massive datasets, Cursor Pagination is mandatory. Offset pagination should only be used for small, static datasets like admin dashboards.
