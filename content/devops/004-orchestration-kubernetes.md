---
title: Orchestration (Kubernetes)
order: 4
---

Docker is perfect for running a few containers on a single machine. But what happens when you need to run thousands of containers across a cluster of hundreds of servers, automatically scale them based on traffic, and replace them if they crash?

This is where Container Orchestration is required, and **Kubernetes (K8s)** is the undisputed king.

> [!TIP]
> **ELI5: The Symphony Orchestra**
> *   **Containers (The Musicians):** They know how to play their specific instrument (run their specific code) perfectly. But if 100 musicians play whatever they want, whenever they want, it's noise.
> *   **Kubernetes (The Conductor):** The conductor doesn't play an instrument. They look at the sheet music (Your YAML Configuration) and tell the violins when to start, tell the trumpets to play louder (Scale Up), and if a flute player faints (Container Crashes), the conductor immediately points to a backup flute player to take over (Self-Healing).

## 1. The Kubernetes Architecture

Kubernetes operates on a Master/Worker node architecture.

### The Control Plane (Master Node - The Conductor)
The brain of the cluster.
*   **API Server:** The front-end. All communication (from you, or from internal nodes) goes through it.
*   **etcd:** A distributed, highly-available key-value store containing the entire state and configuration of the cluster. If `etcd` dies, the cluster dies.
*   **Scheduler:** Watches for newly created Pods and selects a suitable Worker Node for them to run on based on CPU/Memory availability.

### The Worker Nodes (The Musicians)
The machines that actually run your application workloads.
*   **Kubelet:** An agent running on every node that ensures containers are actually running and healthy.
*   **Kube-Proxy:** Maintains network rules on nodes, allowing network communication to your Pods.

## 2. Core Kubernetes Objects

You define what you want the cluster to look like using Declarative YAML files.

*   **Pod:** The smallest deployable object. A Pod encapsulates one container (or a few tightly-coupled ones). *Rule of thumb: One Pod = One instance of your app.*
*   **Deployment:** You rarely manage Pods directly. A Deployment tells K8s: "I want exactly 3 replicas of my web app." If a node crashes and a Pod dies, the Deployment automatically spins up a new one (Self-Healing).
*   **StatefulSet:** Like a Deployment, but for apps that require persistent state (like Databases). It guarantees stable network IDs and persistent storage across restarts.
*   **Service:** Pods are ephemeral—they die and get recreated with new IP addresses constantly. A Service provides a stable, permanent IP address and load balances traffic across all healthy Pods.
*   **ConfigMap & Secret:** Decouples configuration (environment variables, passwords) from your image, allowing you to use the exact same Docker image in Staging and Production.

## 3. Helm Charts

Writing thousands of lines of raw K8s YAML files is exhausting. **Helm** is the package manager for Kubernetes (think `npm` or `pip`). 

Instead of writing 10 YAML files to deploy Redis, you can simply run `helm install redis bitnami/redis`. Helm uses templates to automatically generate all the necessary K8s manifests for you.
