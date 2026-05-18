---
title: Containerization (Docker)
order: 1
---

The phrase "It works on my machine" is the historical bane of software engineering. Containerization solves this by packaging the application and all its dependencies into a standardized, isolated unit.

## 1. Virtual Machines vs. Containers

> [!TIP]
> **ELI5: The House vs. The Apartment Building**
> *   **Virtual Machine (The House):** You buy land (Hardware), build a foundation, install plumbing, and build the walls (Guest Operating System). It's incredibly heavy, takes months to build, but it's completely isolated.
> *   **Container (The Apartment):** The building foundation and plumbing already exist (The Host OS Kernel). You just rent an empty room (User Space) and put your specific furniture (Application Code) inside. It takes 5 seconds to move in, and you can fit 100 apartments in the space of 1 house.

### Virtual Machines
A VM runs a full "guest" Operating System (OS) on top of a hypervisor.
*   **Heavyweight:** Consumes gigabytes of RAM before your application even starts.
*   **Slow:** Booting takes minutes.

### Containers
Containers run directly on the host machine's OS kernel but exist in isolated user spaces.
*   **Lightweight:** They share the host OS kernel. Measured in megabytes.
*   **Fast:** Starting a container takes milliseconds.

## 2. Core Docker Concepts

### Images
A Docker Image is a read-only, immutable template. It includes the application code, runtime, libraries, and environment variables.

### Layers
Docker Images are built in layers. 

```mermaid
architecture-beta
    group container(cloud)[Docker Image]
    service app(server)[App Code Layer] in container
    service deps(database)[Dependencies Layer (npm install)] in container
    service os(database)[OS Layer (Alpine Linux)] in container
    
    app:B -- T:deps
    deps:B -- T:os
```

*   **Caching:** Docker caches these layers. If you change your application code (the top layer), Docker doesn't rebuild the OS or dependencies below it. This makes builds incredibly fast.

### Containers
A Container is a runnable instance of an Image. You can run hundreds of identical containers from a single image.

## 3. Best Practices for Dockerfiles

*   **Use Lightweight Base Images:** Prefer Alpine Linux (`node:18-alpine`) over full Debian images to minimize size and reduce security risks.
*   **Multi-Stage Builds:** Compile code in a heavy environment, but only copy the compiled binary into the final production image.

```dockerfile
# Go Multi-Stage Build Example
FROM golang:1.20 AS builder
WORKDIR /app
COPY . .
RUN go build -o main .

FROM alpine:latest
WORKDIR /app
# Only copy the final tiny binary, leaving the heavy Go compiler behind!
COPY --from=builder /app/main .
CMD ["./main"]
```
