---
title: Load Balancing
order: 1
---

A load balancer distributes incoming network traffic across multiple servers to ensure no single server is overwhelmed.

## Types

### Layer 4 (Transport)

Routes based on IP and TCP/UDP port. Fast but less flexible.

### Layer 7 (Application)

Routes based on HTTP headers, URL paths, cookies. More flexible, can make smarter decisions.

## Algorithms

- **Round Robin** — requests go to servers in order. Simple but ignores server load.
- **Weighted Round Robin** — servers with more capacity get more requests.
- **Least Connections** — sends to the server with fewest active connections.
- **IP Hash** — ensures a client always hits the same server (session affinity).

## Health Checks

Load balancers periodically ping servers. Unhealthy servers are removed from the pool automatically.

## Common Tools

- **Nginx** — HTTP/reverse proxy load balancer
- **HAProxy** — TCP/HTTP load balancer
- **AWS ALB/NLB** — managed cloud load balancers
