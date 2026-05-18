---
title: CI/CD Pipelines
order: 3
---

# CI/CD Pipelines

Continuous Integration and Continuous Deployment (CI/CD) is the automated process that takes code from a developer's laptop to running reliably in production.

> [!TIP]
> **ELI5: The Car Factory Assembly Line**
> *   **Without CI/CD (The Artisan):** One person builds a car from scratch in their garage. They forget to tighten the brakes, drive it on the highway, and crash.
> *   **With CI/CD (The Factory):** A robot puts on the wheels. Another robot immediately tests if they spin (Automated Testing). If a wheel falls off, the assembly line stops instantly, an alarm sounds (Build Failed), and the broken car never reaches the dealership (Production).

## 1. Continuous Integration (CI)

**The Goal:** Detect integration errors as quickly as possible.

**The Process:**
1.  Developer pushes code to a branch.
2.  A CI server (e.g., GitHub Actions) detects the push.
3.  The CI server pulls the code, builds it, and runs the entire automated testing suite.
4.  If any test fails, the build turns "Red," the team is alerted, and the code cannot be merged.

## 2. Continuous Delivery vs. Continuous Deployment (CD)

*   **Continuous Delivery:** Code that passes CI is built into a deployable artifact (like a Docker image). It is *ready* to be deployed at any time, but requires a human to click "Deploy".
*   **Continuous Deployment:** Every change that passes CI is released to customers *automatically*, with zero human intervention. Requires extreme confidence in tests.

## 3. Advanced Deployment Strategies

Deploying by turning off the old server and turning on the new one results in downtime. Modern CI/CD utilizes advanced routing to deploy safely.

### Blue-Green Deployment
*   Maintain two identical environments: Blue (currently live) and Green (idle).
*   Deploy the new version to Green. Run tests.
*   If everything is good, flip the router to instantly direct all user traffic to Green.
*   If it breaks, flip the router back to Blue.

### Canary Deployment
*   Named after the "canary in the coal mine."
*   Deploy the new version to a small subset (e.g., 1 Pod out of 100).
*   Route a tiny percentage of user traffic (e.g., 1%) to the new version.
*   Monitor error rates closely. If it's stable, slowly increase traffic to 10%, 50%, 100%. If errors spike, instantly roll back the 1%.
