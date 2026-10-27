---
title: Building Projects
description: End-to-end builds that connect requirements, data models, scaling, and failure handling — plus the engineering habits that make a project reviewable.
order: 0
---

Reading about system design is not the same as building. These chapters take a product from requirements to a working design, with the decisions and failure modes made explicit.

Each build covers:

1. **Scope** — what is in and out for v1.
2. **Estimates** — load, storage, bandwidth.
3. **Data model and API** — keys, indexes, critical paths.
4. **Architecture** — components, sync vs async, caching.
5. **Scale and failure** — what breaks first, degraded modes.
6. **Build order** — what to implement in which milestone.
7. **Review checklist** — the questions a senior reviewer would ask.

## The builds

| Build | Core challenge |
|---|---|
| [URL Shortener](/building/001-url-shortener) | ID generation, redirect latency, abuse |
| [Chat System](/building/002-chat-system) | ordering, delivery, presence, fan-out |
| [News Feed](/building/003-news-feed) | fan-out on write vs read, ranking |
| [Video Streaming](/building/004-video-streaming) | ingestion, transcoding, CDN economics |
| [Todo CLI](/building/005-todo-cli) | small scope done rigorously |
| [Web Server from Scratch](/building/006-web-server) | protocol parsing, concurrency, limits |

## A build is not finished until…

- [ ] The **critical path** is implemented end to end (not just diagrammed).
- [ ] The data model has keys and indexes matching the queries.
- [ ] There is a **load test** at the target scale, or a documented reason it is infeasible.
- [ ] Failures are simulated: dependency down, slow, duplicate delivery, restart.
- [ ] Inputs are validated; outputs are bounded.
- [ ] Logs, metrics, and traces answer "what happened to request X?".
- [ ] A runbook exists for the top three failure modes.
- [ ] The README explains how to run it and what was intentionally left out.

## How to use these chapters

Do not copy the design. Use it as a checklist:

1. Write your own requirements and estimates.
2. Sketch the data model and API before the architecture.
3. Build the smallest vertical slice.
4. Add the failure handling you would page on.
5. Compare your decisions with the chapter and note the differences.
