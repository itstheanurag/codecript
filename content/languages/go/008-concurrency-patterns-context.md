---
title: Advanced Concurrency Patterns
order: 8
---

Writing a goroutine is easy; coordinating thousands of them is the real challenge. Go provides several patterns and a specialized `context` package to manage the lifecycle, cancellation, and metadata of concurrent operations.

---

## 1. The Context Package: Lifecycle Management

The `context` package is the standard way to carry deadlines, cancellation signals, and other request-scoped values across API boundaries and between goroutines.

- **Cancellation Chain**: If you cancel a parent context, all derived children contexts are canceled automatically. This is essential for preventing **Goroutine Leaks** when a user disconnects or an operation times out.

```go
ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
defer cancel() // Always release context resources

select {
case <-doWork(ctx):
    fmt.Println("Work finished")
case <-ctx.Done():
    fmt.Println("Timed out:", ctx.Err())
}
```

---

## 2. WaitGroups: Waiting for Completion

A `sync.WaitGroup` is used to wait for a collection of goroutines to finish executing.

```go
var wg sync.WaitGroup

for i := 0; i < 5; i++ {
    wg.Add(1)
    go func() {
        defer wg.Done()
        doWork()
    }()
}

wg.Wait() // Blocks until all 5 goroutines call Done()
```

---

## 3. The Fan-Out, Fan-In Pattern

- **Fan-Out**: Multiple goroutines reading from the same channel until that channel is closed. This is used to distribute work across CPU cores.
- **Fan-In**: A single goroutine reading from multiple channels and multiplexing the results into a single output stream.

---

## 4. Sync.Once and Atomic Operations

- **`sync.Once`**: Ensures that a piece of code (like a database connection initialization) runs exactly once, even if called from multiple goroutines simultaneously.
- **`sync/atomic`**: High-performance, low-level atomic operations for simple counters. Use this instead of Mutexes when you only need to increment a number across threads.

---

## Interview Pro-Tips: What is a Goroutine Leak?
If an interviewer asks how to debug memory issues in Go:
- **The Answer**: A goroutine leak occurs when a goroutine is started but never exits (e.g., it's waiting on a channel that will never be sent to). 
- **The Solution**: Always pass a `context.Context` to your concurrent functions and listen to `<-ctx.Done()`. Use the `pprof` tool to visualize the number of running goroutines and find those that have been idling for too long.

---

## Technical Summary
1. `Context`: The standard for safe cancellation and timeouts.
2. `Synchronization`: Use WaitGroups for completion and Mutexes for shared state.
3. `Safety`: Avoid "Naked" goroutines; always have a plan for how they will terminate.
