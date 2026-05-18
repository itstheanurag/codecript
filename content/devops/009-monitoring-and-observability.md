---
title: Monitoring & Observability
order: 9
---

When a monolith goes down, you usually know exactly where to look. When a distributed microservice architecture goes down, a single user click might touch 15 different services across 5 databases before returning an error. 

Without robust observability, debugging a distributed system is impossible.

## 1. The Three Pillars of Observability

Observability is not just "monitoring if a server is up." It is the ability to understand the internal state of a complex system by examining its external outputs. It relies on three pillars:

### Pillar 1: Metrics
Numbers measured over time. They tell you *if* there is a problem.
*   **Examples:** CPU utilization is at 95%. The API error rate spiked to 12%. The average response time is 500ms.
*   **Tools:** Prometheus (collects the metrics), Grafana (visualizes them in beautiful dashboards).

### Pillar 2: Logs
Immutable, timestamped records of discrete events. They tell you *what* the problem is.
*   **Examples:** `[ERROR] Failed to connect to database at 10.0.0.5: Connection Refused.`
*   **Tools:** The ELK Stack (Elasticsearch, Logstash, Kibana) or Datadog. Logstash collects logs from all your containers, Elasticsearch indexes them for lightning-fast searching, and Kibana provides the UI to search them.

### Pillar 3: Distributed Tracing
A representation of a single user's request as it travels through an entire distributed system. It tells you *where* the problem is.
*   **Examples:** The user clicked "Checkout." The request spent 10ms in the API Gateway, 50ms in the Auth Service, 800ms in the Inventory Service, and 12ms in the Payment Service. Tracing immediately proves the Inventory Service is the bottleneck.
*   **Tools:** Jaeger, Zipkin, OpenTelemetry.

## 2. OpenTelemetry

Historically, if you wanted to send logs to Datadog, you had to install Datadog's proprietary SDK in your code. If you switched to New Relic a year later, you had to rewrite all your code.

**OpenTelemetry (OTel)** is the modern CNCF standard for observability. You instrument your code using the open-source OTel SDK. OTel collects the logs, metrics, and traces, and then you configure the OTel Collector to forward them to *any* backend (Datadog, Prometheus, Honeycomb) without ever changing your application code.

## 3. Alerts and Incident Management

Metrics and Dashboards are useless if nobody is looking at them when a server crashes at 3:00 AM. 

*   **Alertmanager:** Sits on top of Prometheus. You write rules (e.g., "If API Error Rate > 5% for 5 minutes").
*   **PagerDuty:** When Alertmanager fires, it sends a webhook to PagerDuty, which physically calls the cell phone of the engineer who is currently "on-call."

> [!WARNING]
> **Alert Fatigue:** The most common mistake in DevOps is creating too many low-priority alerts. If a developer's phone buzzes 50 times a day for non-critical issues (like CPU hitting 80%), they will eventually ignore a critical alert. Only page a human if a customer-facing issue is actively occurring.
