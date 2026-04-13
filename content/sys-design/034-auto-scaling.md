---
title: Auto-scaling
order: 34
---

In a modern cloud environment, traffic is never constant. It spikes during the day and drops at night.

**Auto-scaling** is the process of automatically adjusting the number of computational resources based on real-time demand.

---

## Why Use Auto-scaling?

-   **Performance**: Ensure users don't experience slow-downs during traffic spikes.
-   **Cost Efficiency**: Don't pay for 100 servers when 5 are enough during the night.
-   **Reliability**: Automatically replace unhealthy instances.

---

## 1. Vertical Auto-scaling (VPA)

Increasing the "size" of an existing machine (CPU/RAM).

-   **Pros**: No architectural changes needed.
-   **Cons**: Requires a restart (Downtime). Hard limit on how big a single machine can get.

---

## 2. Horizontal Auto-scaling (HPA)

Increasing the "number" of machines in your cluster.

-   **Pros**: No downtime. Theoretically infinite scale.
-   **Cons**: Requires a **Load Balancer** and **Stateless Services**.

---

## How It Works (The Metrics)

An auto-scaler monitors specific metrics and triggers an action when a threshold is crossed.

### Common Triggers:
-   **CPU Utilization**: If average CPU > 70% for 5 minutes, add 2 instances.
-   **Memory Usage**: If RAM > 80%, scale up.
-   **Request Count**: Scale based on the number of incoming requests per second (RPS).
-   **Custom Metrics**: Scale based on the size of a Message Queue (e.g., if Kafka backlog is too high).

---

## Predictive Scaling

Advanced auto-scalers use **Machine Learning** to predict traffic patterns.

-   **Example**: If the system knows traffic always spikes at 9:00 AM, it starts spinning up servers at 8:45 AM so they are ready in time.

---

## Challenges (Cool-down Periods)

Scaling takes time (servers need to boot up).

If you scale up every time CPU hits 70%, you might end up in a "Flapping" state where you keep adding and removing servers constantly.

**Solution: Cool-down Period**
Wait for a few minutes after a scaling action before allowing another one. This gives the new servers time to start sharing the load.

---

## Key Takeaways

-   **Horizontal scaling** is the standard for modern distributed systems.
-   Always choose metrics that truly reflect the load (CPU is common, but Queue size is often better for background workers).
-   Use **Cool-down periods** to prevent aggressive and expensive scaling loops.

> Auto-scaling is the "magic" that allows startups to handle unexpected viral growth without manual intervention.
