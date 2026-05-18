---
title: Serverless Architecture (FaaS)
order: 6
---

In traditional deployments, you rent a Virtual Machine (EC2) or run a Kubernetes cluster. You pay for these servers 24/7, even if no users are accessing your application at 3:00 AM. 

**Serverless** (specifically Functions as a Service - FaaS) flips this model on its head.

## 1. What is Serverless?

Serverless does *not* mean there are no servers. It means you, the developer, do not manage them.

With services like **AWS Lambda** or **Google Cloud Functions**, you upload your raw code (a single JavaScript or Python function). The cloud provider holds your code in storage. When an HTTP request comes in, the provider instantly spins up a micro-container, executes your function, returns the response, and immediately destroys the container.

### The Value Proposition
*   **Zero Ops:** No OS to patch, no Docker images to build, no K8s YAML to write.
*   **Pay per Execution:** You are billed by the millisecond of compute time. If your app gets 0 traffic, your bill is exactly $0.00.
*   **Infinite Auto-scaling:** If your app goes viral and receives 10,000 requests in one second, AWS instantly spins up 10,000 parallel instances of your function.

## 2. The Cold Start Problem

Serverless is not a silver bullet. Its biggest drawback is the **Cold Start**.

When a request comes in and there are no active instances of your function running, the cloud provider must:
1. Allocate a container.
2. Download your code.
3. Boot the language runtime (Node.js/Python).
4. Execute your code.

This process can take anywhere from 300ms to 2 seconds. For a user waiting for an API response, a 2-second delay is extremely noticeable and frustrating.

*   **Warm Starts:** If another request comes in shortly after the first one, the container is kept "warm" and handles the request instantly (in ~10ms).
*   **Mitigation:** To solve Cold Starts, engineers use "Provisioned Concurrency" (paying a flat fee to keep X containers warm 24/7—which defeats the cost savings of serverless) or optimize their code bundle size to boot faster.

## 3. Stateful vs Stateless

Serverless functions must be entirely **Stateless**. 

Because the container is destroyed after the execution finishes, you cannot save data to memory (RAM) or the local file system and expect it to be there for the next request. 
Any state or session data must be immediately persisted to an external database (like DynamoDB or Redis).

## 4. Edge Computing (Serverless at the Edge)

Traditional serverless functions (like AWS Lambda) run in a specific geographic region (e.g., `us-east-1` in Virginia). If a user in Tokyo requests your function, they suffer significant network latency.

**Edge Computing** (Cloudflare Workers, Vercel Edge Functions) deploys your serverless code to hundreds of CDNs worldwide. When the Tokyo user makes a request, the function executes on a server physically located in Tokyo, returning a response in milliseconds.
