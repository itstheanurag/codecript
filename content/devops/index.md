---
title: DevOps & Infrastructure
order: 11
---

Writing code is only half the battle. A senior engineer must understand how that code is packaged, deployed, secured, monitored, and scaled in a production environment. 

This section covers the essential infrastructure concepts that bridge the gap between "it works on my machine" and "it works in production for millions of users."

## What's Inside?

### The Foundations
- **[Linux & Networking Basics](./001-linux-and-networking)**: Process management, file permissions, and debugging network connectivity.
- **[Web Servers & Proxies](./002-web-servers-and-proxies)**: The heavyweights (Nginx, HAProxy, Envoy) and Layer 4 vs Layer 7 routing.

### Containers & Orchestration
- **[Containerization (Docker)](./003-containerization-docker)**: Isolated environments, Images vs Containers, and multi-stage builds.
- **[Orchestration (Kubernetes)](./004-orchestration-kubernetes)**: The control plane, Pods, Deployments, and Self-Healing systems.

### Cloud Architecture
- **[Cloud Primitives & IAM](./005-cloud-primitives-and-iam)**: VPCs, Subnets, Object Storage, and the Principle of Least Privilege.
- **[Serverless Architecture (FaaS)](./006-serverless-architecture)**: AWS Lambda, Cold Starts, and Edge Computing.
- **[Infrastructure as Code (IaC)](./007-infrastructure-as-code)**: Treating infrastructure like software with Terraform and HCL.

### Shipping & Operating
- **[CI/CD & GitOps](./008-ci-cd-and-gitops)**: Automated testing, Blue-Green deployments, and pull-based CD using ArgoCD.
- **[Monitoring & Observability](./009-monitoring-and-observability)**: The three pillars (Logs, Metrics, Traces) and OpenTelemetry.

> "If it hurts, do it more often. Bring the pain forward." — Jez Humble (Continuous Delivery)
