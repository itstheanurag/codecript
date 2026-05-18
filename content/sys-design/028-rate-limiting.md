---
title: Rate Limiting
order: 28
---

Rate limiting is the process of controlling the number of requests a user or client can make to an API within a specified timeframe. 

Without it, a single malicious user (or a poorly written loop in a client application) could overwhelm your servers, drain your database connections, and cause a total outage for all other users (a Denial of Service).

> [!TIP]
> **ELI5: The Bouncer and the Nightclub**
> Imagine a nightclub (Your API) that can safely hold 500 people. 
> A giant party bus arrives with 2,000 people. If they all rush the door, the club is destroyed. 
> The Bouncer (The Rate Limiter) stands at the door with a clicker. He enforces a strict rule: "Only 10 people from this bus can enter per minute. The rest of you have to wait." The club remains safe and functional.

## 1. Where to Implement It?

Rate limiters are almost never implemented directly within the application code of a microservice. They are placed at the edge of your network:
*   **API Gateway** (e.g., Kong, AWS API Gateway)
*   **CDN / Edge Firewall** (e.g., Cloudflare WAF)

If a user exceeds the limit, the server immediately returns an **HTTP 429: Too Many Requests** response.

## 2. Rate Limiting Algorithms

There are several standard algorithms used to implement rate limiting, each with different performance and fairness trade-offs. (These are very common interview questions).

### 1. Token Bucket
The most common and elegant algorithm (used by Amazon and Stripe).
*   **How it works:** Imagine a bucket that holds exactly 10 tokens. Every time a request comes in, you take a token out. If the bucket is empty, the request is dropped. A background process adds a new token to the bucket every 1 second, up to the maximum of 10.
*   **Pros:** Allows for sudden "bursts" of traffic (up to 10 requests at the exact same millisecond), while maintaining a steady long-term average rate.

### 2. Leaky Bucket
*   **How it works:** Requests enter the top of a bucket (a queue). The bucket has a small hole in the bottom that "leaks" (processes) requests at a steady, fixed rate (e.g., 2 per second). If the bucket fills up, new requests overflowing the top are dropped.
*   **Pros:** Smooths out bursts. No matter how fast traffic arrives, it hits your backend servers at a perfectly smooth, predictable rate.

### 3. Fixed Window Counter
*   **How it works:** Time is divided into fixed windows (e.g., 1:00 to 1:01). A counter tracks requests for that specific minute. If the counter hits 100, requests are blocked until 1:01 begins and the counter resets to zero.
*   **The Flaw (Bursting at the edges):** A user could send 100 requests at 1:00:59, and another 100 requests at 1:01:01. They technically obeyed the rule, but your server just got slammed with 200 requests in a 2-second span.

### 4. Sliding Window Log
*   **How it works:** Solves the fixed window flaw by keeping a precise timestamp log of every single request in Redis. When a new request arrives, it deletes timestamps older than 1 minute, and counts the remaining.
*   **Cons:** Extremely memory-intensive. Storing thousands of timestamps for millions of users in Redis requires massive amounts of RAM.

## 3. Distributed Rate Limiting (Redis)

If you have 5 API Gateway servers, how do they share the rate limit counter? If User A hits Server 1, and then Server 2, they both need to know the user's current limit.

The solution is an extremely fast, centralized in-memory store like **Redis**. The API Gateways check Redis before allowing the request through. To avoid the network latency of hitting Redis for *every single request*, gateways often use complex eventual consistency models or local memory batching.
