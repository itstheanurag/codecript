---
title: Web Servers & Proxies
order: 2
---

When a user's browser makes an HTTP request to `api.yourstartup.com`, it does not directly hit your Node.js or Python application code. 

Between the open internet and your application sits a **Reverse Proxy**. 

## 1. What is a Reverse Proxy?

A standard proxy (Forward Proxy) sits in front of a *client* and protects their identity (like a VPN). A **Reverse Proxy** sits in front of a *server* and protects the server.

The Reverse Proxy receives all incoming internet traffic, inspects it, and then explicitly forwards the valid requests to the hidden internal application servers.

### Why do we need them?
*   **SSL Termination:** Encrypting and decrypting HTTPS traffic is CPU-intensive. The reverse proxy handles all the cryptography, decrypts the request, and sends plain HTTP to your internal app server. This frees up your app to just run business logic.
*   **Load Balancing:** If you have 5 Node.js servers, the reverse proxy distributes incoming requests evenly across all 5 using algorithms like Round Robin or Least Connections.
*   **Caching:** The proxy can cache static assets (images, CSS) or even API responses. If 1,000 users request the homepage, the proxy serves it instantly from memory without ever bothering the backend.
*   **Security:** Hides your internal network topology. Attackers only see the IP of the proxy, not the IPs of your actual application servers.

## 2. The Heavyweights: Nginx vs HAProxy vs Envoy

### Nginx (Engine-X)
The undisputed king of web servers. It powers over a third of all websites globally. It uses an asynchronous, event-driven architecture, meaning a single Nginx worker can handle tens of thousands of concurrent connections using very little memory.
*   **Best for:** General-purpose reverse proxying, serving static files, and basic load balancing.

### HAProxy (High Availability Proxy)
While Nginx is a web server that *can* load balance, HAProxy is a dedicated, pure load balancer. It is renowned for absolute rock-solid reliability and extreme performance.
*   **Best for:** Highly complex load balancing rules, TCP-level routing (Layer 4), and massive enterprise workloads.

### Envoy
Created by Lyft, Envoy is the modern challenger designed specifically for microservice architectures and Kubernetes. It is configured dynamically via APIs (rather than static config files) and has first-class support for advanced protocols like gRPC and HTTP/2.
*   **Best for:** Cloud-native environments, Service Meshes (like Istio), and dynamic container orchestration.

## 3. Layer 4 vs Layer 7 Proxying

When configuring a proxy, you must choose at which layer of the OSI model it operates:

*   **Layer 4 (Transport):** The proxy only looks at the IP address and the Port (TCP/UDP). It does not look at the HTTP data. It is blazing fast, but "blind."
*   **Layer 7 (Application):** The proxy actually decrypts and reads the HTTP request. It can route traffic based on the URL path (`/api` goes to Server A, `/images` goes to Server B), read cookies, and inspect headers. Slower, but significantly smarter.
