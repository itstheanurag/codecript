---
title: News Feed (Scaling & Ranking)
description: Fan-out on write vs read, hybrid feeds, ranking, cursor stability, hot users, caching, and the failure modes that appear when the feed is slower than the tweet.
order: 3
---

A news feed aggregates content from the people/entities you follow, orders it, and returns a page fast. The design question is **when the aggregation happens**.

## Scope

In scope:

- Create posts (text + media references).
- Follow/unfollow users.
- Home feed: posts from followees, newest/ranked first, cursor paginated.
- Profile feed.
- Like/reply counts (eventually consistent).

Out of scope v1:

- Ads, recommendations, trending.
- Full-text search.
- Edit history.
- Moderation tooling (but plan hooks).

## Estimates

```
50M DAU, 5 sessions/day, 10 feed pages/session → 2.5B feed reads/day ≈ 29k RPS avg, ~90k peak
posts: 5M/day ≈ 58 RPS avg
average followees: 200
fan-out writes if write-time: 5M × 200 = 1B entries/day
```

Reads dominate; the fan-out strategy decides whether you pay on writes or reads.

## The three fan-out strategies

| Strategy | How | Pros | Cons |
|---|---|---|---|
| **Fan-out on write** | on post, insert into every follower's feed | fast reads | expensive for celebrities; backfill/repair |
| **Fan-out on read** | query followees' posts at read time | cheap writes, always fresh | slow reads, merge many sources, hard ranking |
| **Hybrid** | write-fan-out for normal users; pull for celebrities | balanced | more code/complexity |

Practical default: **hybrid**. Precompute feeds for typical accounts; merge in a small number of high-fan-out accounts at read time.

## Data model

```sql
CREATE TABLE posts (
  id         uuid PRIMARY KEY,
  author_id  uuid NOT NULL,
  body       text,
  created_at timestamptz NOT NULL,
  like_count bigint NOT NULL DEFAULT 0
);
CREATE INDEX posts_author_created_idx ON posts (author_id, created_at DESC, id DESC);

CREATE TABLE follows (
  follower_id uuid,
  followee_id uuid,
  created_at  timestamptz,
  PRIMARY KEY (follower_id, followee_id)
);
CREATE INDEX follows_followee_idx ON follows (followee_id);
```

Feed store (fan-out on write) as a cache, not the source of truth:

```
feed:{userId} → sorted set of (score, postId)   // Redis
```

or a table:

```sql
CREATE TABLE feed_entries (
  user_id  uuid,
  post_id  uuid,
  score    bigint,
  PRIMARY KEY (user_id, post_id)
);
CREATE INDEX feed_user_score_idx ON feed_entries (user_id, score DESC);
```

Feed entries are **derived**; deleting/rebuilding them must be possible without touching posts.

## Ranking

Start with reverse chronological. If ranking:

- score = f(recency, affinity, engagement, content type);
- compute at fan-out time (cheap, stale) or read time (expensive, fresh);
- keep a deterministic tiebreaker (`post_id`) for cursors;
- store the score used for ordering if it must be stable across pages.

A ranked feed with non-deterministic scores cannot paginate reliably. Freeze the ordering for a session/page window.

## Cursors

- Cursor = `(score, post_id)` of the last item.
- Query `WHERE (score, post_id) < (?, ?) ORDER BY score DESC, post_id DESC`.
- Never use offset on a live feed: new posts shift pages.
- Cap page size (e.g., 50).

## Hot users and fan-out

A celebrity with 100M followers cannot be write-fanned-out.

- Keep celebrity posts out of precomputed feeds.
- At read time, merge their recent posts into the page.
- Cache their recent posts separately.
- Bound the merge: "last 20 celebrity posts within 7 days".

Detect hot authors by follower count and fan-out cost, not by fame lists only.

## Caching

- Cache the first page per active user (short TTL, e.g., 30–60 s).
- Cache celebrity posts and profile feeds.
- Invalidate or patch on new posts; otherwise accept bounded staleness.
- Do not cache the whole feed history; cache pages/cursors.

## Backfill and repair

New follower → their feed needs recent posts from the followee.

- Backfill asynchronously with a cap (last N posts / last M days).
- Repair jobs rebuild feeds when entries are missing or stale.
- Make feed generation idempotent (`user_id, post_id` upsert).
- Rate-limit backfills for users following thousands of accounts.

## Consistency and deletes

- A deleted post must disappear from feeds: filter at read time (tombstone or deleted flag) and remove asynchronously.
- Follower changes apply to new posts; historical backfill is a product decision.
- Counts (likes/replies) are eventually consistent; do not block rendering on exact counts.

## Failure modes

| Failure | Impact | Mitigation |
|---|---|---|
| Slow fan-out | stale feeds for followees | async workers, prioritise active users |
| Celebrity post | fan-out queue explosion | hybrid read-time merge |
| Cache stampede | DB meltdown | jittered TTL, single-flight |
| Missing feed entries | empty feed | backfill/repair, fallback to pull |
| Offset pagination | duplicates/skips | keyset cursor |
| Deleted posts in cache | policy violation | tombstones + short TTL |
| Hot key per user | shard imbalance | shard by user id, bound page size |

## Build order

1. Posts + follows + profile feed (pull model).
2. Home feed via pull merge (simple, correct).
3. Cache first pages.
4. Hybrid fan-out for normal accounts.
5. Ranking + stable cursors.
6. Backfill/repair jobs.
7. Deletes/tombstones.
8. Load test at peak read RPS.

## Review questions

- Why did you choose write vs read fan-out?
- How does a user with 50M followers publish?
- How do you paginate a ranked feed without duplicates?
- What happens when a post is deleted?
- What is the cache hit ratio and the fallback?
- How fresh is a new post for a follower?

## Checklist

- [ ] Fan-out strategy is explicit and justified by follower distribution.
- [ ] Feed entries are derived and rebuildable.
- [ ] Cursors are stable `(score, id)` pairs with a total order.
- [ ] Celebrity/hot authors are handled at read time.
- [ ] Cache TTLs and stampede protection exist.
- [ ] Backfill and repair are idempotent and rate-limited.
- [ ] Deletes propagate with tombstones or read-time filtering.
- [ ] Peak read load is tested.
