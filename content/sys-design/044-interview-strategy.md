---
title: System Design Interview Strategy
order: 44
---

A system design interview is not just a test of what you know; it is a test of **how you think**.

You typically have **45 minutes** to design a massive system. You cannot cover everything. You must be strategic.

---

## The 4-Step Strategy

Follow this framework to stay organized and demonstrate seniority.

### Step 1: Clarify Requirements (5-10 mins)
Never start drawing immediately.
- **Functional**: "What are the 2-3 most important things this system does?" (e.g., Post, Feed, Like).
- **Social**: "How many users? What is the QPS? What is the expected data size?"
- **Constraint**: "Do we prioritize Availability or Consistency?" (CAP Theorem).

### Step 2: High-Level Design (10-15 mins)
Sketch the "Big Picture".
- Draw the main components: **Client -> Load Balancer -> API Gateway -> Services -> Databases**.
- Explain how data flows from point A to point B.
- **Goal**: Show that you understand how a basic system works before going deep.

### Step 3: Deep Dive (15-20 mins)
Pick the most interesting part of the system and go deep.
- If it's a URL shortener, talk about **Hashing vs. KGS**.
- If it's a Chat system, talk about **WebSockets vs. Long Polling**.
- If it's a news feed, talk about the **Celebrity Problem**.
- **Goal**: Show your specialized "Senior" expertise.

### Step 4: Wrap Up & Bottlenecks (5 mins)
No system is perfect. Be honest about yours.
- "If traffic doubles tomorrow, I would add more **Read Replicas**."
- "The **API Gateway** is currently a single point of failure; I'd scale it horizontally."
- "I'd add **Observability** (Jaeger) to trace slow requests."

---

## The "Red Flags" to Avoid

-   **Designing in a vacuum**: Not asking about the scale or users.
-   **Static answers**: Saying "I will use MongoDB" without explaining *why* it's better than SQL for this specific case.
-   **Ignoring the network**: Assuming the network is perfect and fast. Mention **Latencies, Retries, and CDNs**.
-   **Running out of time**: Spending 30 minutes on the database and 0 minutes on the actual logic.

---

## Final Tip: Be a Consultant, Not a Student
In a system design interview, the interviewer is your "client".
- Don't wait for them to ask questions—**lead the conversation**.
- Offer **Trade-offs** for every decision. "Option A is faster, but Option B is more reliable. Given our high-availability requirement, I pick Option B."

---

## Summary of Your Journey
You have completed the entire System Design Guide!
1.  **Fundamentals**: Scalability, Latency, CAP.
2.  **Components**: Load Balancers, DNS, Caching.
3.  **Patterns**: Microservices, Event-Driven.
4.  **Data**: REST, gRPC, WebSockets.
5.  **Distributed**: Raft, Consensus, Partitioning.
6.  **Case Studies**: Bitly, WhatsApp, Instagram, YouTube.

> System Design is an art of compromise. There are no right answers, only different sets of trade-offs.
