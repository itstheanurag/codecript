---
title: Building Web Servers
order: 13
---

# Web Servers: Serving Content with net/http

Go’s standard library provides everything you need to build high-performance web servers without needing external frameworks like Express or Django. The `net/http` package is production-ready and used by massive services at Google, Netflix, and Uber.

---

## 1. Handlers and the ServeMux

The core of a Go web server is the **Handler**. A handler is any type that implements the `http.Handler` interface:

```go
type Handler interface {
    ServeHTTP(ResponseWriter, *Request)
}
```

Most often, we use the `http.HandleFunc` helper for simple logic:

```go
http.HandleFunc("/hello", func(w http.ResponseWriter, r *http.Request) {
    fmt.Fprint(w, "Hello, World!")
})

log.Fatal(http.ListenAndServe(":8080", nil))
```

---

## 2. ResponseWriter and Request

- **`http.ResponseWriter`**: The interface you use to construct your HTTP response (Set headers, status codes, and body).
- **`*http.Request`**: A pointer to the struct containing all client information (URL, method, headers, form data).

### Parsing Request Data:
```go
func handler(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }
    
    name := r.URL.Query().Get("name")
    // ... logic ...
}
```

---

## 3. Serving Static Files

Go makes it incredibly easy to serve local files (HTML, CSS, images) using `http.FileServer`.

```go
fs := http.FileServer(http.Dir("./static"))
http.Handle("/static/", http.StripPrefix("/static/", fs))
```

---

## 4. Why use the Standard Library?

1. **Stability**: The Go compatibility promise ensures your code will work for years.
2. **Standardization**: Every Go developer understands `net/http`.
3. **Performance**: It is highly optimized and non-blocking by default.

---

## Interview Pro-Tips: How does ListenAndServe scale?
If an interviewer asks how a single Go server can handle 10,000 requests simultaneously:
- **The Answer**: `http.ListenAndServe` spawns a **new Goroutine** for every single incoming connection. Because goroutines are lightweight (starting at 2KB), a single process can manage thousands of concurrent requests without the high memory cost of OS-level threads.

---

## Technical Summary
1. `ServeMux`: The multiplexer that routes URLs to handlers.
2. `Handle/HandleFunc`: Registering your logic.
3. `Concurrency`: Each request is isolated in its own goroutine.
