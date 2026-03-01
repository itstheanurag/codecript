---
title: Build a URL Shortener
order: 1
---

A URL shortener takes a long URL and creates a short, unique alias. Think bit.ly or TinyURL.

## Requirements

- Given a long URL, generate a short unique URL
- Redirect short URLs to the original
- Handle high read traffic (reads >> writes)
- Short URLs should be as short as possible

## High-Level Design

1. **API** — POST /shorten (creates short URL), GET /:code (redirects)
2. **Database** — stores mapping of code → long URL
3. **Encoding** — convert a unique ID to a base62 string

## Encoding Strategy

Use an auto-incrementing ID and convert it to base62 (a-z, A-Z, 0-9):

```javascript
function encode(id) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  while (id > 0) {
    result = chars[id % 62] + result;
    id = Math.floor(id / 62);
  }
  return result;
}
```

## Database Schema

| Column     | Type     |
| ---------- | -------- |
| id         | BIGINT   |
| code       | VARCHAR  |
| long_url   | TEXT     |
| created_at | DATETIME |

## Scaling Considerations

- Add a cache (Redis) for hot URLs
- Use a counter service or Snowflake IDs for distributed ID generation
- Partition the database by code hash
