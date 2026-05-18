---
title: CI/CD & GitOps
order: 8
---

Continuous Integration and Continuous Deployment (CI/CD) is the automated process that takes code from a developer's laptop to running reliably in production.

> [!TIP]
> **ELI5: The Car Factory Assembly Line**
> *   **Without CI/CD (The Artisan):** One person builds a car from scratch in their garage. They forget to tighten the brakes, drive it on the highway, and crash.
> *   **With CI/CD (The Factory):** A robot puts on the wheels. Another robot immediately tests if they spin (Automated Testing). If a wheel falls off, the assembly line stops instantly, an alarm sounds (Build Failed), and the broken car never reaches the dealership (Production).

## 1. Continuous Integration (CI)

**The Goal:** Detect integration errors as quickly as possible.

**The Process:**
1.  Developer pushes code to a branch.
2.  A CI server (e.g., GitHub Actions, Jenkins) detects the push.
3.  The CI server pulls the code, builds it, and runs the entire automated testing suite.
4.  If any test fails, the build turns "Red," the team is alerted, and the code cannot be merged.

## 2. Continuous Delivery vs. Continuous Deployment (CD)

*   **Continuous Delivery:** Code that passes CI is built into a deployable artifact (like a Docker image). It is *ready* to be deployed at any time, but requires a human to click "Deploy".
*   **Continuous Deployment:** Every change that passes CI is released to customers *automatically*, with zero human intervention. Requires extreme confidence in your automated tests.

## 3. GitOps: The Modern CD Paradigm

Historically, CI servers "Pushed" code to production. Your GitHub Actions runner would connect to your Kubernetes cluster and run `kubectl apply`. This creates a massive security vulnerability: your CI server must have admin credentials to your production cluster!

**GitOps** (using tools like ArgoCD or Flux) flips this model to a "Pull" architecture.

1.  Your Kubernetes YAML manifests are stored in a dedicated Git repository.
2.  ArgoCD lives *inside* your secure Kubernetes cluster.
3.  ArgoCD constantly watches the Git repository. If the Git repo says "Deploy Image V2", but the cluster is running "Image V1", ArgoCD detects the drift and automatically pulls the new state into the cluster.

**The Benefit:** Your CI server no longer needs production credentials. Git becomes the single source of truth for your entire cluster state.

## 4. Advanced Deployment Strategies

### Blue-Green Deployment
*   Maintain two identical environments: Blue (currently live) and Green (idle).
*   Deploy the new version to Green. Run tests.
*   If everything is good, flip the router to instantly direct all user traffic to Green. If it breaks, flip the router back to Blue.

### Canary Deployment
*   Named after the "canary in the coal mine."
*   Deploy the new version to a small subset of servers.
*   Route a tiny percentage of user traffic (e.g., 1%) to the new version.
*   Monitor error rates closely. If it's stable, slowly increase traffic to 10%, 50%, 100%. If errors spike, instantly roll back the 1%.
