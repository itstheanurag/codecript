---
title: DevOps & Infrastructure
description: Learn how production systems are actually run: Linux debugging, reverse proxies, Docker, Kubernetes, cloud IAM, Terraform, CI/CD, and observability.
order: 11
---

Shipping code is half the job. The other half is getting it onto a machine, keeping it there, and knowing what to do when it breaks. DevOps is that half: Linux, networks, containers, cloud, pipelines, and signals.

These lessons are written so you can **debug a real box**, not so you can recite a glossary. Each page walks through how the thing works, the config or commands you would actually use, and the failure modes that show up in production.

## What's Inside?

### The Foundations
- **[Linux & Networking Basics](./001-linux-and-networking)**: Processes, signals, systemd, permissions, and the DNS → firewall → listen debug path.
- **[Web Servers & Proxies](./002-web-servers-and-proxies)**: Reverse proxies, TLS termination, a real Nginx config, and Layer 4 vs Layer 7.

### Containers & Orchestration
- **[Containerization (Docker)](./003-containerization-docker)**: Namespaces vs VMs, image layers, production Dockerfiles, Compose networking.
- **[Orchestration (Kubernetes)](./004-orchestration-kubernetes)**: Control plane, Deployments, Services, probes, and CrashLoopBackOff.

### Cloud Architecture
- **[Cloud Primitives & IAM](./005-cloud-primitives-and-iam)**: VPCs, public vs private subnets, security groups, S3, and least-privilege roles.
- **[Serverless Architecture](./006-serverless-architecture)**: How functions run, cold starts, concurrency vs database connections, when not to use it.
- **[Infrastructure as Code](./007-infrastructure-as-code)**: Terraform plan/apply/state, drift, secrets, and replaces that delete data.

### Shipping & Operating
- **[CI/CD & GitOps](./008-ci-cd-and-gitops)**: A real pipeline, SHA-tagged images, rolling/canary/blue-green, pull-based GitOps.
- **[Monitoring & Observability](./009-monitoring-and-observability)**: SLIs/SLOs, RED/USE, structured logs, traces, and alerts that do not train people to ignore pages.

> "If it hurts, do it more often. Bring the pain forward." — Jez Humble (Continuous Delivery)
