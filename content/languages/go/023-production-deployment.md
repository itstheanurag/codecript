---
title: Production Deployment
order: 23
---

# Shipping Go: From Code to Production

One of Go's greatest practical advantages is its simplicity in deployment. Because Go compiles into a single static binary with no external runtime dependencies (unlike Java, Python, or Node.js), deploying a Go application is often as simple as copying a single file to a server.

---

## 1. Creating Static Binaries

To ensure your binary runs on minimal Linux distributions (like Alpine), you should compile it to be statically linked, including all necessary C libraries.

```bash
CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .
```

- **`CGO_ENABLED=0`**: Disables the use of C libraries, making the binary portable.

---

## 2. Docker: Multi-Stage Builds

The industry standard for deploying Go is the **Multi-Stage Docker Build**. This allows you to compile your code in a heavy environment (with all the Go tools) and then copy only the resulting small binary into a tiny, secure production image.

```dockerfile
# Stage 1: Build
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY . .
RUN go build -o myapp

# Stage 2: Final Image
FROM alpine:latest
COPY --from=builder /app/myapp /myapp
ENTRYPOINT ["/myapp"]
```

- **Result**: A production image that is often under 20MB, compared to several hundred MBs for other languages.

---

## 3. Health Checks and Monitoring

Production services must be "Observable."
- **Health Checks**: Expose a `/health` endpoint for Kubernetes or load balancers to verify your service is alive.
- **Metrics**: Use the `prometheus` client library to expose internal metrics like request counts, error rates, and DB latency.

---

## 4. Graceful Re-deploys

When updating your service, you must ensure that in-flight requests are finished before the application shuts down.

- **The Pattern**: Catch the `SIGTERM` signal, stop accepting new connections, wait for active connections to finish (using `http.Server.Shutdown`), and then exit.

---

## Interview Pro-Tips: Why use Scratch images?
If an interviewer asks about the smallest possible Docker image:
- **The Answer**: You can use the `scratch` image (an empty starting point). If your Go binary is statically compiled (`CGO_ENABLED=0`), it can run on a completely empty filesystem. This results in the **highest security** possible, as there are no shells, libraries, or utilities for an attacker to exploit if they breach your app.

---

## Technical Summary
1. `Multi-Stage`: Separate build and runtime environments.
2. `Static`: Zero-dependency binaries.
3. `Alpine/Scratch`: Targeted, minimal base images for security and speed.
4. `Signal Handling`: The key to zero-downtime deployments.
 flagship
 flagship
