---
title: Containerization (Docker)
order: 3
---

Historically, deploying software was a nightmare of dependency conflicts. Code that ran perfectly on a developer's Mac would crash on the Linux production server because the server had the wrong version of Python installed, or a conflicting system library.

**Docker** solved the "it works on my machine" problem by packaging the application *and its entire environment* into a single, isolated, portable box called a Container.

## 1. Virtual Machines vs. Containers

To understand Docker, you must understand what it replaced.

### Virtual Machines (VMs)
A VM uses a Hypervisor to emulate actual hardware. If you run 3 VMs on a server, you are booting up 3 completely independent Operating Systems (Guest OS), each requiring their own CPU allocation, memory, and boot time. 
*   **Pros:** Total isolation. High security.
*   **Cons:** Extremely heavy. Booting takes minutes. Gigabytes of wasted RAM just running the Guest Operating Systems.

### Containers
Containers do not emulate hardware. They run directly on the Host OS and share the same kernel. They use Linux features like `namespaces` (for isolation) and `cgroups` (for resource limiting) to create isolated processes.
*   **Pros:** Instant boot times (milliseconds). Extremely lightweight (megabytes, not gigabytes). You can run thousands of containers on a single machine.
*   **Cons:** Weaker isolation boundaries than VMs. All containers must share the host's OS kernel architecture (you cannot run a Windows container on a Linux kernel without virtualization).

## 2. Core Docker Concepts

### Images
An Image is a read-only template containing your code, runtime (e.g., Node.js), system tools, libraries, and settings. It is the blueprint.

### Containers
A Container is a runnable instance of an Image. You can spin up 100 identical containers from a single image.

### Dockerfile
A text document containing all the commands a user could call on the command line to assemble an image.

### Docker Compose
A tool for defining and running multi-container Docker applications. Instead of running 3 massive `docker run` commands for your frontend, backend, and database, you define them in a `docker-compose.yml` file and spin them all up together on an isolated network using `docker compose up`.

## 3. Best Practices for Dockerfiles

*   **Use Lightweight Base Images:** Prefer Alpine Linux (`node:18-alpine`) over full Debian images to minimize size and reduce security risks (fewer installed tools = smaller attack surface).
*   **Multi-Stage Builds:** Compile code in a heavy environment, but only copy the compiled binary into the final production image.

```dockerfile
# Go Multi-Stage Build Example
FROM golang:1.20 AS builder
WORKDIR /app
COPY . .
# Build the binary inside the container
RUN go build -o main .

FROM alpine:latest
WORKDIR /app
# Only copy the final tiny binary, leaving the heavy Go compiler behind!
COPY --from=builder /app/main .
CMD ["./main"]
```
