---
title: Error Handling Patterns
order: 5
---

# Errors as Values: The Go Philosophy

One of the most defining characteristics of Go is its approach to error handling. Go does not use `try/catch` exceptions. Instead, it treats **Errors as Values**. This design forces developers to deal with errors as part of the normal execution flow, leading to more robust and predictable code.

---

## 1. The `error` Interface

An error in Go is simply any type that satisfies the built-in `error` interface:

```go
type error interface {
    Error() string
}
```

---

## 2. The Standard Pattern: Return and Check

Most functions in Go return a result and an error as the final return value. The conventional way to handle this is the "Check and Return Early" pattern.

```go
val, err := DoSomething()
if err != nil {
    return fmt.Errorf("could not do thing: %w", err)
}
// Proceed with success logic
```

- **Early Return**: By handling the error and returning immediately, the "Happy Path" of your logic remains un-nested and easy to read.

---

## 3. Error Wrapping and Sentinel Errors

- **Sentinel Errors**: Pre-defined error variables (e.g., `sql.ErrNoRows`) used for checking specific error conditions.
- **Error Wrapping**: Using `%w` in `fmt.Errorf` to add context to an error while "Wrapping" the original error inside it. This allows you to inspect the original cause later using `errors.Is` or `errors.As`.

```go
if errors.Is(err, os.ErrNotExist) {
    // Handle file not found
}
```

---

## 4. Custom Error Types

For complex errors that need to carry extra metadata (like an error code or a field name), you can define a custom struct that implements the `Error() string` method.

```go
type APIError struct {
    Code    int
    Message string
}

func (e *APIError) Error() string {
    return fmt.Sprintf("API Error %d: %s", e.Code, e.Message)
}
```

---

## Interview Pro-Tips: Why no Exceptions?
If an interviewer asks why Go doesn't have `try/catch`:
- **The Answer**: Exceptions hide control flow and often lead to developers "Swallowing" errors without handling them. In Go, error handling is **Explicit**. You can't miss an error because it's right there in the function signature. This makes auditing code for reliability much easier.

---

## Technical Summary
1. `Validation`: Errors are just data.
2. `Propagation`: Always add context when returning an error up the stack.
3. `Best Practice`: Avoid "If err != nil { return err }" boilerplate by using specialized error-handling patterns or custom types where it adds value.
