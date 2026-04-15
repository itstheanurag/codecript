---
title: Networking: HTTP Clients
order: 12
---

# HTTP Clients: Communicating with the World

Go was built by Google to solve internet-scale problems, so its networking primitives are first-class citizens. The `net/http` package provides a robust, production-ready HTTP client that handles connection pooling, TLS, and timeouts out of the box.

---

## 1. Simple GET Requests

The simplest way to fetch data is using `http.Get`.

```go
resp, err := http.Get("https://api.example.com/data")
if err != nil {
    log.Fatal(err)
}
defer resp.Body.Close()

body, _ := io.ReadAll(resp.Body)
```

**CRITICAL**: You must always close the response body (`resp.Body.Close()`). If you don't, you will leak network connections, eventually exhausting the destination server's capacity or your own.

---

## 2. Robust Clients with Timeouts

In a professional environment, you should **NEVER** use the default `http.Client` (which `http.Get` uses internally). The default client has no timeout, meaning your application could hang forever if the server doesn't respond.

```go
client := &http.Client{
    Timeout: 10 * time.Second,
}

req, _ := http.NewRequest("GET", url, nil)
resp, err := client.Do(req)
```

---

## 3. Adding Headers and Query Params

For more complex requests (POST, PUT) or those requiring authentication, use `http.NewRequest`.

```go
req, _ := http.NewRequest("GET", url, nil)
req.Header.Set("Authorization", "Bearer xxxx")
req.Header.Set("Content-Type", "application/json")

// Adding Query Parameters
q := req.URL.Query()
q.Add("limit", "10")
req.URL.RawQuery = q.Encode()
```

---

## 4. Understanding Context in Networking

As discussed in Module 8, the `context` package is vital for networking. It allows you to cancel a request if the user disconnects or if the operation is taking too long.

```go
ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()

req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
resp, err := client.Do(req)
```

---

## Interview Pro-Tips: Connection Pooling
If an interviewer asks how Go handles many concurrent requests efficiently:
- **The Answer**: Go's `http.Transport` (used by the Client) automatically maintains a **Connection Pool** (Keep-Alive). It reuses existing TCP connections for future requests to the same host, avoiding the heavy "Three-way handshake" overhead for every single request. Using a custom configured `http.Client` allows you to tune how many idle connections are kept open (`MaxIdleConns`).

---

## Technical Summary
1. `Client`: The primary object for making requests.
2. `Request`: Allows full control over verbs, headers, and body.
3. `Timeout`: Essential for production safety.
4. `Body.Close()`: The golden rule of Go networking.
