---
title: Middleware and Context
order: 14
---

Middleware is a design pattern used to execute code before or after a request reaches its primary handler. It is the professional way to handle cross-cutting concerns like logging, authentication, rate limiting, and performance tracking.

---

## 1. What is Middleware in Go?

In Go, middleware is simply a function that takes an `http.Handler` and returns a new `http.Handler`. This "Wraps" the original handler with extra logic.

```go
func LoggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        log.Printf("Request: %s %s", r.Method, r.URL.Path)
        next.ServeHTTP(w, r) // Call the original handler
    })
}
```

---

## 2. Chaining Middleware

You can chain multiple middleware functions together to build a robust processing pipeline.

```go
handler := http.HandlerFunc(MyRealLogic)
protected := AuthMiddleware(LoggingMiddleware(handler))

http.Handle("/", protected)
```

---

## 3. Context Propagation

The `context` package is indispensable in web servers. It allows you to:
1. **Pass Data**: Carry request-scoped values (like a User ID or Trace ID) through the middleware chain.
2. **Handle Cancellation**: If a user closes their tab, the context is canceled, and your server can stop expensive work (like database queries) immediately.

### Passing values:
```go
// In Auth Middleware
ctx := context.WithValue(r.Context(), "user_id", 42)
next.ServeHTTP(w, r.WithContext(ctx))

// In Request Handler
userID := r.Context().Value("user_id").(int)
```

---

## 4. Panic Recovery Middleware

A web server should never crash because of a single request. Professional servers always include a "Recovery" middleware at the top of the stack to catch panics and return a `500 Internal Server Error`.

```go
func Recovery(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        defer func() {
            if err := recover(); err != nil {
                http.Error(w, "Panic recovered", 500)
            }
        }()
        next.ServeHTTP(w, r)
    })
}
```

---

## Interview Pro-Tips: Why use pointers for Context?
If an interviewer asks how to modify a request's context:
- **The Answer**: Contexts are **Immutable**. You cannot modify an existing context. Instead, you use functions like `context.WithValue` to create a **New** child context that wraps the parent, and then use `r.WithContext(newCtx)` to update the request reference.

---

## Technical Summary
1. `Wrapper`: Middleware is just a function returning a handler.
2. `Pipeline`: Each middleware decides whether to call the next one.
3. `Context`: The source of truth for request-scoped lifecycle and data.
 flagship
 flagship
