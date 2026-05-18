---
title: Caching Strategies
order: 12
---

# Caching Strategies

A cache is a temporary storage layer (usually entirely in RAM) that stores a subset of data so that future requests for that data are served much faster than accessing the primary storage location (like a database or a 3rd-party API).

Caching is the single most effective way to improve system performance, but as the old programming proverb goes: *"There are only two hard things in Computer Science: cache invalidation and naming things."*

> [!TIP]
> **ELI5: The Librarian and the Desk**
> The Database is a massive, slow library in the basement. The Cache is the librarian's small desk upstairs.
> *   **Cache-Aside (Lazy Loading):** A student asks for a book. The librarian checks their desk. If it's not there (Cache Miss), they walk down to the basement, get the book, give it to the student, and *leave a copy on the desk* for the next student.
> *   **Write-Through:** When a student returns a book, the librarian immediately walks it down to the basement, ensuring the library is perfectly up to date, but the student has to wait for the librarian to come back.

## 1. Where to Cache?

Caching can happen at almost every layer of a modern web architecture.

1.  **Client/Browser Cache:** Storing HTML/CSS/JS locally so the browser doesn't download it twice.
2.  **CDN (Content Delivery Network):** Caching static assets physically close to the user.
3.  **API Gateway / Reverse Proxy Cache:** Caching the entire HTTP response payload for identical requests.
4.  **Application / Database Cache (Redis/Memcached):** Caching the result of a complex, expensive SQL query in RAM.

## 2. Reading Strategies

### Cache-Aside (Lazy Loading)
The most common strategy. The application is responsible for reading from the cache, and if it misses, reading from the database and populating the cache.
*   **Pros:** Only data that is actually requested gets cached (efficient use of memory).
*   **Cons:** The first user to request data pays a "cache miss penalty" (they have to wait for the slow database query).

```mermaid
architecture-beta
    group app(cloud)[Cache-Aside Architecture]
    
    service server(server)[App Server] in app
    service redis(database)[Redis Cache] in app
    service postgres(disk)[Database] in app
    
    server:R -- L:redis
    server:B -- T:postgres
```

### Read-Through
The application only talks to the Cache. The Cache itself is configured with logic to fetch from the Database if it doesn't have the data.

## 3. Writing Strategies

When data changes, how do we keep the cache in sync with the database?

### Write-Through
The application writes data to the Cache, and the Cache synchronously writes it to the Database. The request does not complete until both are written.
*   **Pros:** Absolute consistency.
*   **Cons:** High latency for write operations.

### Write-Behind (Write-Back)
The application writes data to the Cache and immediately returns success to the user. The Cache asynchronously flushes the data to the Database in the background later.
*   **Pros:** Incredible write performance.
*   **Cons:** If the Cache server crashes before flushing, data is permanently lost.

### Cache Invalidation (Write-Around)
The application writes data directly to the Database, and simply deletes (invalidates) the corresponding key in the Cache. The next time someone reads it, they will experience a cache miss and reload the fresh data.
*   **Pros:** Very easy to implement.
