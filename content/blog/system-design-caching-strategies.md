---
title: Caching Strategies Every Developer Should Know
excerpt: From write-through to LRU eviction — a practical overview of caching patterns for scalable systems.
date: 2026-02-15
readTime: 10 min read
tags: [System Design, Backend]
---

Caching is one of the most impactful performance optimizations you can apply. But choosing the wrong strategy can introduce subtle bugs and stale data.

## Cache-Aside (Lazy Loading)

The application checks the cache first. On a miss, it fetches from the database, stores it in the cache, and returns.

**Pros:** Only requested data is cached. Simple to implement.
**Cons:** Cache misses are slow (three round trips). Data can become stale.

## Write-Through

Every write goes to the cache and the database simultaneously. Reads always hit the cache.

**Pros:** Cache is always up-to-date. Reads are fast.
**Cons:** Write latency increases. You cache data that may never be read.

## Write-Behind (Write-Back)

Writes go to the cache immediately, and the cache asynchronously flushes to the database.

**Pros:** Ultra-fast writes. Great for write-heavy workloads.
**Cons:** Risk of data loss if the cache crashes before flushing.

## Eviction Policies

When the cache is full, something has to go:

- **LRU (Least Recently Used)** — Evicts the item that hasn't been accessed the longest. Most common choice.
- **LFU (Least Frequently Used)** — Evicts the item accessed the fewest times.
- **TTL (Time To Live)** — Items expire after a fixed duration.

## Redis in Practice

Redis is the de facto caching layer for most web applications. A typical pattern:

```python
def get_user(user_id):
    cached = redis.get(f"user:{user_id}")
    if cached:
        return json.loads(cached)

    user = db.query("SELECT * FROM users WHERE id = ?", user_id)
    redis.setex(f"user:{user_id}", 3600, json.dumps(user))
    return user
```

## When NOT to Cache

- Data that changes every request
- Security-sensitive information
- When consistency is more important than speed

## Key Takeaway

Caching is not a silver bullet. Understand your read/write ratio, your consistency requirements, and your eviction needs before choosing a strategy.
