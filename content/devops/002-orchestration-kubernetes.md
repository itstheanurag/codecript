---
title: Orchestration (Kubernetes)
order: 2
---

# Orchestration (Kubernetes)

Docker is great for running a few containers on a single machine. But what happens when you need to run thousands of containers across a cluster of hundreds of servers? 

This is where Container Orchestration is required, and **Kubernetes (K8s)** is the undisputed king.

> [!TIP]
> **ELI5: The Symphony Orchestra**
> *   **Containers (The Musicians):** They know how to play their specific instrument (run their specific code) perfectly. But if 100 musicians play whatever they want, whenever they want, it's noise.
> *   **Kubernetes (The Conductor):** The conductor doesn't play an instrument. They look at the sheet music (Your YAML Configuration) and tell the violins when to start, tell the trumpets to play louder (Scale Up), and if a flute player faints (Container Crashes), the conductor immediately points to a backup flute player to take over (Self-Healing).

## 1. The Kubernetes Architecture

Kubernetes operates on a Master/Worker node architecture.

### The Control Plane (Master Node - The Conductor)
The brain of the cluster.
*   **API Server:** The front-end. All communication goes through it.
*   **etcd:** A distributed key-value store containing the entire state of the cluster.
*   **Scheduler:** Watches for newly created Pods and selects a node for them to run on.

### The Worker Nodes (The Musicians)
The machines that actually run your application workloads.
*   **Kubelet:** An agent that ensures containers are running.
*   **Kube-Proxy:** Maintains network rules, allowing communication to your Pods.

## 2. Core Kubernetes Objects

### Pod
The smallest deployable object. A Pod encapsulates one container (or a few tightly-coupled ones). 
*   *Rule of thumb:* One Pod = One instance of your app.

### Deployment
You rarely manage Pods directly. A Deployment tells K8s: "I want exactly 3 replicas of my web app." If a node crashes and a Pod dies, the Deployment automatically spins up a new one (Self-Healing).

### Service
Pods are ephemeral—they die and get recreated with new IP addresses constantly. A Service provides a stable, permanent IP address and DNS name. It acts as an internal load balancer.

### Ingress
An Ingress manages external access to the services in a cluster. It routes internet traffic (e.g., `api.example.com`) to the correct internal Service.

## 3. Why Kubernetes?

*   **Automated Rollouts/Rollbacks:** You deploy a new version. K8s slowly replaces the old Pods with new ones. If the new version crashes, it automatically rolls back (Zero-Downtime Deployments).
*   **Horizontal Autoscaling:** Based on CPU utilization, K8s can automatically spin up more Pods to handle a traffic spike, and spin them down to save money later.
