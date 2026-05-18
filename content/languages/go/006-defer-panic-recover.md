---
title: Control Flow: Defer and Panic
order: 6
---

Go provides a unique set of control flow keywords for handling resource cleanup and unexpected runtime failures. While `defer` is a core part of daily Go programming, `panic` and `recover` are reserved for exceptional circumstances.

---

## 1. Defer: The Cleanup Stack

The `defer` keyword schedules a function call to run immediately **after the surrounding function returns**. 

- **LIFO Order**: If you have multiple `defer` statements, they are executed in a Stack (Last-In, First-Out) order. 
- **Variable Evaluation**: The arguments to a deferred function are evaluated **immediately** (when the `defer` line is reached), not when the function actually runs.

```go
func processFile(name string) {
    f, _ := os.Open(name)
    defer f.Close() // Guaranteed to run even if an error occurs later
    
    // Process the file...
}
```

---

## 2. Panic: Unrecoverable Errors

`panic` is used to stop the ordinary flow of control. When a function calls `panic`, its execution stops, any deferred functions are executed, and then control returns to its caller. This continues up the stack until the program crashes.

- **When to use?**: Only for truly unrecoverable errors (e.g., a critical configuration file is missing, or a programmer error like out-of-bounds array access).

---

## 3. Recover: Regaining Control

`recover` is a built-in function that regains control of a panicking goroutine. It is **ONLY useful inside a deferred function**.

- During normal execution, `recover` returns `nil`.
- During a panic, `recover` captures the value passed to `panic` and stops the unwinding process.

```go
func safeExecute() {
    defer func() {
        if r := recover(); r != nil {
            fmt.Println("Recovered from panic:", r)
        }
    }()
    
    panic("Something went wrong!")
}
```

---

## 4. Best Practices

- **Avoid Package-Level Panics**: Your library should never panic unless it’s a `Must` function (e.g., `template.Must`). Always return `error` values instead.
- **Always Defer Closures**: If you are closing a resource that might return an error (like a database transaction), consider checking that error inside a deferred closure rather than a simple call.

---

## Interview Pro-Tips: Scoped Defer
A common mistake is putting `defer` inside a long-running loop. Because `defer` only runs when the **Function** returns (not when the loop iteration ends), you can quickly exhaust file descriptors or memory.
- **The Solution**: Wrap the loop body in a small anonymous function so the `defer` triggers on every iteration.

---

## Technical Summary
1. `Defer`: Efficient and readable resource management.
2. `Panic`: A nuclear option for unrecoverable state.
3. `Recover`: A safety net for web servers and long-running processes to prevent a single request from crashing the whole application.
