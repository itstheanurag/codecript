---
title: Versioning & Pagination
order: 10
---

When designing a production API, you must assume two things: your data will grow infinitely, and your business requirements will change constantly. 

To handle infinite data, you need **Pagination**. To handle changing requirements without breaking existing clients, you need **Versioning**.

## 1. Versioning Strategies

When you introduce a breaking change (like deleting a required field or changing a data structure), you must create a new version of the API. Old mobile apps floating around in the wild must continue to work.

### URL Path Versioning (The Standard)
The version is baked directly into the URL.
`GET https://api.example.com/v1/users`
*   **Pros:** Extremely explicit. Easy to route traffic in an API Gateway (e.g., all `/v1/*` goes to the legacy server).
*   **Cons:** Not technically RESTful (a version is a property of the representation, not the core resource).

### Header Versioning
The client sends a custom header.
`Accept: application/vnd.example.v1+json` or `X-API-Version: 2024-01-01` (Stripe's method).
*   **Pros:** Cleaner URLs. Allows for very granular, date-based versioning.
*   **Cons:** Harder to test manually in a browser.

## 2. Pagination: Offset vs. Cursor

If an endpoint returns 50,000 records, sending them all in one JSON payload will crash the server and the client. You must paginate the results.

There are two dominant strategies for pagination.

### Offset-Based Pagination (The Easy Way)
The client provides a `page` number and a `limit`. The database skips the first `N` records.

`GET /users?page=3&limit=20`

**How it works in SQL:**
```sql
SELECT * FROM users ORDER BY created_at DESC LIMIT 20 OFFSET 40;
```

**Pros:**
*   Extremely easy to implement.
*   Allows the user to jump directly to a specific page (e.g., "Go to page 5").

**Cons (The Danger):**
*   **Performance:** `OFFSET 10000` is incredibly slow in SQL. The database still has to compute and read the first 10,000 rows just to throw them away.
*   **Data Drift:** If a new user is inserted at the top of the list while you are moving from Page 1 to Page 2, everything shifts down. You will accidentally see a duplicate record on Page 2.

### Cursor-Based Pagination (The Scalable Way)
The client provides a unique pointer (a Cursor) to a specific record, and asks for the *next* X records after it. The Cursor is usually an ID or a Timestamp.

`GET /users?limit=20&after=user_id_987`

**How it works in SQL:**
```sql
SELECT * FROM users WHERE id > 987 ORDER BY id ASC LIMIT 20;
```

> [!TIP]
> **ELI5: The Bookmark**
> *   **Offset:** "Open the book and flip exactly 400 pages." (You have to physically count 400 pages every time).
> *   **Cursor:** "Open the book directly to the Bookmark I left on page 400." (Instant access).

**Pros:**
*   **Massively Performant:** Because it uses a `WHERE` clause on an indexed column (like an ID), it is an instant `O(1)` or `O(log n)` lookup, even if you are on the 500th page.
*   **Immune to Drift:** It doesn't matter if new records are inserted at the top of the list. You are strictly anchoring your query to a specific ID.

**Cons:**
*   You cannot jump directly to "Page 50". You can only go to the "Next" or "Previous" page.
*   Slightly more complex to implement on the backend (especially if sorting by multiple columns).

> [!IMPORTANT]
> **Interview Rule of Thumb:** If the list is small (like comments on a blog post) or requires jumping to specific pages, use Offset. If the list is infinite (like a Twitter timeline or a massive log stream), you **must** use Cursor-based pagination.
