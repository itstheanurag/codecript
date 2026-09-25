---
title: Serverless Architecture
description: Learn how Functions-as-a-Service actually run, what cold starts cost, which limits bite, and when serverless is the wrong tool.
order: 6
---

"Serverless" does not mean no servers. It means you do not provision, patch, or size them. You upload a function; the platform creates an execution environment when an event arrives, runs your code, and bills you for the time it ran.

AWS Lambda, Google Cloud Functions, Azure Functions, Cloudflare Workers — same contract, different limits.

> [!TIP]
> **ELI5: The ghost kitchen**
> You do not rent a restaurant (a VM) that is empty at 3am. You publish a recipe (the function). When an order arrives, the platform staffs a cook for that ticket, plates it, and sends the cook home. No orders, no payroll. The first order after a quiet stretch waits while someone clocks in (**cold start**).

## 1. What actually runs

A function is a handler:

```javascript
export async function handler(event) {
  const id = event.pathParameters.id;
  const user = await db.getUser(id);
  return { statusCode: 200, body: JSON.stringify(user) };
}
```

The platform maps **events** onto that handler: an HTTP request (API Gateway / Function URL / Cloud Run), a queue message (SQS, Pub/Sub), an object uploaded to S3, a schedule (`cron`), a stream record.

Rough lifecycle of a Lambda-style invoke:

1. Platform picks a free **execution environment** (micro-VM or container) with your runtime.
2. If none exist, it creates one: download package, start Node/Python, run init code **outside** the handler (global imports, DB client). That is the **cold start**.
3. It calls `handler(event)`.
4. It keeps the environment around for minutes, reusing it for more invokes (**warm start**). Your global variables survive. The disk is a small ephemeral `/tmp`.
5. Eventually it is frozen or destroyed. You are not told when.

You are billed for duration × memory (Lambda) or CPU-time (Cloud Run). Scale-to-zero is the cost story. Scale-to-a-lot is the ops story: the platform runs many environments in parallel, up to a **concurrency limit**.

## 2. Cold starts, without folklore

Cold start time is dominated by:

- Runtime: Java and .NET are heavier than Node, Python, or Go.
- Package size: a 80MB `node_modules` is slower to unpack than a 5MB bundle.
- VPC: attaching to a private subnet used to add seconds (ENI). Modern Lambda in VPC is better, still not free.
- Init work: opening a DB connection at import time is good for warm invokes and painful for cold ones if you do too much.

Typical ballpark (order of magnitude, not a promise): warm Node HTTP is single-digit milliseconds of overhead; cold can be 100ms–1s+; a fat JVM in a VPC can be worse.

Mitigations that actually exist:

- **Provisioned concurrency / min instances**: keep N environments warm. You pay for that idle time. You have reinvented a small always-on fleet.
- **Bundle and tree-shake.** Skip `FROM node:20` with the whole OS if the platform lets you ship a zip.
- **Avoid doing auth+DB+S3 in the import graph** if most events do not need it.
- **Edge runtimes** (Cloudflare Workers, some Vercel/Netlify edge): isolate model is V8 isolates, not a full Node process. Cold starts are tiny; Node APIs are not all there.

> [!NOTE]
> A 300ms cold start on a webhook that runs 2 times an hour is fine. The same on a synchronous "search as you type" API is not. Measure p99 including cold starts, not just warm local `curl`.

## 3. Hard limits that design your system

Read the quota page for your vendor. The recurring ones:

| Limit | Why it matters |
| :--- | :--- |
| **Timeout** (Lambda default 3s, max 15min) | HTTP users will not wait 15 minutes. Queue consumers can. Do not run video transcoding in an HTTP Lambda. |
| **Payload size** (6MB sync Lambda, larger on async/S3) | Do not POST a 50MB file through the function. Put it in object storage, pass the key. |
| **Memory / CPU** | CPU often scales with memory. Under-provisioning makes you slower *and* you stay running longer, so you pay more. |
| **Concurrency** | Account-level cap (e.g. 1000). One noisy function can starve others. Set **reserved concurrency**. |
| **Execution environment reuse** | A global DB pool of 10 × 500 concurrent environments = 5000 connections. Your RDS `max_connections` will die. Use RDS Proxy or a connection-thrifty driver. |

**Stateless** means: do not expect `/tmp`, RAM, or a local socket to still be there on the next request. You may get the same environment; you may not. Persist to the database, cache, or object storage.

## 4. When serverless is the wrong tool

Good fit:

- Spiky or idle traffic (internal tools, webhooks, cron, image thumbnail on upload).
- Glue between managed services (S3 → function → queue → function).
- Teams that should not own Kubernetes for a CRUD API.

Bad fit:

- Steady high QPS with tiny handlers: you will pay more than a small always-on container, and you will fight connection pooling.
- Long-lived WebSockets or SSE (possible with some platforms, awkward on classic Lambda).
- Tight p99 latency with heavy runtimes.
- Specialized hardware, GPUs, or a protocol that is not HTTP/queue.

**Cloud Run / App Runner / Azure Container Apps** sit in the middle: you ship a container, they scale it, sometimes to zero. You keep a normal HTTP server, fewer Lambda-shaped constraints, still less cluster ops.

## 5. Cost and operations

Cost is not always cheaper. A 512MB function at 200ms, 10 million times a month, is a few dollars of compute plus API Gateway which is often *more* than compute. Always price the trigger.

Ops you still own: IAM for the function role (least privilege to one bucket prefix, not `*`), structured logs, traces (the platform will inject a request id — log it), alerts on error rate and throttles (`429` from concurrency), and **idempotency** because queues retry.

A function that is not idempotent + an SQS retry = double charges, double emails, double writes. Design for "at least once."

## What to remember

- The platform runs your handler in a reused environment. Cold start is environment create; warm is reuse.
- Timeouts, payload size, and concurrency are design constraints, not footnotes.
- Connection pools × concurrency can knock over a database.
- Serverless is glue and spiky HTTP, not a default for every service.
- Pay for idle-zero; also pay for API Gateway, provisioned concurrency, and retries.
