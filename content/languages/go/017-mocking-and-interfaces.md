---
title: Mocking and Interfaces
order: 17
---

# Testable Code: Interfaces and Mocks

To write effective unit tests, you must be able to isolate the code you are testing from its dependencies (like a database or an external API). In Go, we achieve this "Isolation" through the use of **Interfaces** and **Mocking**.

---

## 1. Why Interfaces are for Testing

As discussed in Module 4, interfaces in Go are satisfied implicitly. This means you can define an interface in your "Service" package that describes only the methods you need from a "Database" package.

```go
type UserStore interface {
    GetByID(id int) (*User, error)
}

type Service struct {
    store UserStore
}
```

In your production code, you pass a real PostgreSQL connection. In your tests, you pass a **Mock**.

---

## 2. Implementing a Manual Mock

A mock is just a struct that satisfies the interface.

```go
type MockStore struct {
    mockGetByID func(id int) (*User, error)
}

func (m *MockStore) GetByID(id int) (*User, error) {
    return m.mockGetByID(id)
}
```

This allows you to control the exact behavior of the dependency for each specific test case (e.g., "Return a user," "Return an error," or "Timeout").

---

## 3. Mock Generation Tools

For large applications with hundreds of methods, writing manual mocks is tedious. The Go ecosystem has powerful code generation tools to handle this:

- **`mockgen` (Gomock)**: Automatically generates mock implementations based on your interface definitions.
- **`testify/mock`**: A popular alternative that provides a fluent API for setting "Expectations" (e.g., `m.On("GetByID", 1).Return(user, nil)`).

---

## 4. Testing HTTP Handlers

The standard library provides a specialized `httptest` package for testing web handlers without actually starting a server or allocating network ports.

```go
func TestHelloHandler(t *testing.T) {
    req := httptest.NewRequest("GET", "/hello", nil)
    w := httptest.NewRecorder() // A mock ResponseWriter
    
    HelloHandler(w, req)

    if w.Code != http.StatusOK {
        t.Errorf("Expected status 200, got %d", w.Code)
    }
}
```

---

## Interview Pro-Tips: Why mock at the edge?
If an interviewer asks what you should mock:
- **The Answer**: Only mock "The Edge"—your external boundaries like databases, network services, or hardware. Never mock internal "Business Logic" functions or utility packages like `math` or `time`. Mocking internal logic creates "Brittle Tests" that break every time you refactor your private functions, even if the public interface hasn't changed.

---

## Technical Summary
1. `Dependency Injection`: Passing dependencies as interfaces to allow swapping.
2. `httptest.Recorder`: Mocking the HTTP response writer.
3. `Seam`: Interfaces create "Seams" in your code where you can safely insert test logic.
