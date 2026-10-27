---
title: System Design Interview Strategy
description: A 45-minute framework that demonstrates judgement — scoping, estimates, API and data model, high-level design, deep dives, failure analysis, and the trade-off language interviewers look for.
order: 44
---

A system design interview is not a trivia quiz about technologies. It is a **simulated design review** where the interviewer assesses how you think under ambiguity.

What is scored, roughly:

| Dimension | What good looks like |
|---|---|
| Scoping | you narrow an unbounded prompt with the interviewer |
| Estimation | numbers drive decisions, not decorate the answer |
| Structure | the design has clear boundaries and a walkable critical path |
| Depth | 1–2 components are understood to failure-mode level |
| Trade-offs | every choice has a cost and an alternative |
| Communication | the interviewer can follow and interrupt productively |
| Judgment | you defer or cut scope when it is not justified |

## The 45-minute shape

| Time | Phase | Output |
|---|---|---|
| 0–5 | Clarify requirements | 3–5 use cases, scale, SLOs, out of scope |
| 5–9 | Estimates | QPS, storage, bandwidth, cache |
| 9–13 | API + data model | 3–5 endpoints, keys, access patterns |
| 13–28 | High-level design | boxes, arrows, state, caching, async |
| 28–40 | Deep dives | 1–2 hard components to failure level |
| 40–45 | Failure + wrap | bottlenecks, degraded modes, next steps |

Adapt: a senior/staff interview spends more time in deep dives; a junior one needs more structure.

## 1. Clarify (do not skip)

Ask, then **state the assumptions you will proceed with**:

- Who are the users and what are the core actions?
- Read/write ratio? Payload sizes? Retention?
- Global or single-region? Mobile or web?
- Latency target and availability target?
- Consistency needs per feature (payments vs feed)?
- Any hard constraints (budget, existing stack, team size)?

Write a compact scope box at the top of the board:

```
In scope: post creation, home feed (read), follow
Out: DMs, search, ads, moderation
Scale: 10M DAU, 3× peak, read:write ≈ 100:1
SLO: p99 < 300 ms feed, 99.95% availability
```

## 2. Estimate

Use orders of magnitude and **state what each number changes**:

```
DAU 10M, 10 opens/day, 20 reads/open → 2B reads/day ≈ 23k RPS avg, 70k peak
writes: 1 post per 50 opens → 2M/day ≈ 23 RPS avg, 70 peak
storage: 2M posts/day × 1 KB × 3 replicas ≈ 6 GB/day
cache: 20% of 30-day hot set ≈ 12 GB
```

Then say the implication: "this is read-dominated, so caching and fan-out strategy dominate; writes are not the bottleneck."

If you skip estimates, you cannot justify sharding, queueing, or CDN choices.

## 3. API and data model

Define the few endpoints that pin down access patterns:

```
POST /posts              { text, mediaIds }         -> 201 { id }
GET  /feed?cursor=...                                 -> { items[], nextCursor }
POST /users/{id}/follow                               -> 204
GET  /users/{id}/posts?cursor=...                     -> { items[], nextCursor }
```

Then the tables/keys:

```
posts(id, author_id, text, created_at)
follows(follower_id, followee_id, created_at)   PK(follower_id, followee_id)
feed_entries(user_id, post_id, rank, created_at) PK(user_id, post_id)
```

State why the key matches the query: `(user_id, created_at)` supports the feed read and cursor pagination; `followee_id` index supports fan-out.

## 4. High-level design

Draw a small number of boundaries:

```
client → CDN → API gateway → feed service → cache
                                   ├── posts DB (read replicas)
                                   ├── follow graph (cache/DB)
                                   └── fan-out queue → feed store
media: client → pre-signed URL → object storage → CDN
```

Conventions that make the diagram readable:

- solid arrow = synchronous call; dashed = async/event;
- label the data store per service;
- show read vs write paths separately;
- mark where state is authoritative vs derived.

Walk the **critical path** once, end to end, naming latency and failure at each hop.

## 5. Deep dives

Pick the hard part, not the familiar part. For a feed: fan-out on write vs read, hot users, ranking, cursor stability. For payments: idempotency, exactly-once effects, reconciliation.

A deep dive should reach:

- the data structure/key design,
- the concurrency/consistency behaviour,
- the failure mode and recovery,
- the trade-off and what you would change at 10×.

> [!TIP]
> Signal depth with numbers and failure stories, not with more boxes. "We add Kafka" is not a deep dive; "consumers lag, so the feed is stale; we cap lag at 30 s and fall back to a pull path for users with cold feeds" is.

## 6. Failure and wrap

Reserve the last five minutes:

- first bottleneck at 10× load,
- what happens if a node/AZ/region fails,
- degraded mode for each critical dependency,
- what you would monitor and alert on,
- what you would cut for v1.

End with a one-sentence summary of the design and its main trade-off.

## Trade-off language

Use sentences of this shape:

> "We chose X over Y because Z; the cost is C, which we mitigate by M."

Examples:

- "Async fan-out over read-time joins: cheaper reads, at the cost of staleness; mitigated with a 30 s lag SLO and a pull fallback."
- "Single-leader Postgres over multi-leader: linearizable writes, at the cost of cross-region write latency; acceptable because writes are 1% of traffic."
- "Cache with 60 s TTL over write-through: simpler, bounded staleness; the product tolerates it for the feed but not for balances."

If you cannot name the cost, you have not made a trade-off — you have made a preference.

## Common failure modes in interviews

| Mistake | Fix |
|---|---|
| Designing before clarifying | spend 3–5 minutes scoping, confirm with the interviewer |
| No numbers | estimate QPS/storage and use them to choose components |
| Technology parade | start from requirements and access patterns |
| Ignoring the read/write split | state it; it drives caching and storage choices |
| One giant database | explain when and how you would partition |
| No failure story | rehearse zone loss, dependency slow, retry storm |
| Over-engineering v1 | state what you would defer |
| Silent thinking | narrate the decision and the trade-off |
| Defensive when challenged | treat it as a design review, ask what they would prioritise |

## Practice plan

1. Pick 10 canonical prompts (feed, chat, ride-hailing, payments, URL shortener, rate limiter, search, notifications, video, file storage).
2. For each, do a 10-minute scope + estimate + API outline.
3. Do three full 45-minute mocks with a timer and a peer.
4. After each, write the one thing you would change and the trade-off you missed.
5. Review one real postmortem per week; map it to the failure modes in this section.

## Checklist

- [ ] Scope and assumptions are written and confirmed.
- [ ] Estimates drive at least two design decisions.
- [ ] The API and data model match the access patterns.
- [ ] The critical path is walkable end to end.
- [ ] One deep dive reaches failure/recovery level.
- [ ] Each major choice has a named cost and mitigation.
- [ ] Failure, degradation, and monitoring are covered.
- [ ] The summary states the main trade-off in one sentence.
