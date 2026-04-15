---
title: Goroutines and Channels
order: 7
---

# Concurrency: The CSP Model

Go's primary selling point is its built-in support for high-performance concurrency. Instead of the complex, memory-heavy threads found in other languages, Go uses **Goroutines** and **Channels** based on the **Communicating Sequential Processes (CSP)** model.

The core philosophy is: *"Do not communicate by sharing memory; instead, share memory by communicating."*

---

## 1. Goroutines: Multiplexed Threads

A **Goroutine** is a lightweight thread managed by the **Go Runtime**, not the Operating System. 

- **Stack Size**: While an OS thread starts with ~1MB of stack, a Goroutine starts with only **2KB**, which can grow and shrink dynamically.
- **Multiplexing**: The Go Scheduler (the **M:P:N Scheduler**) multiplexes thousands of Goroutines onto a small number of actual OS threads, allowing for massive concurrency with minimal overhead.

```go
go doWork() // Starts a new goroutine
```

---

## 2. Channels: The Pipe for Data

Channels are the pipes that connect goroutines. They provide a synchronized way for goroutines to send and receive values, effectively handling synchronization and locking for you.

- **Unbuffered Channels**: Synchronous. The sender blocks until the receiver is ready, and vice versa. This is used for guaranteed delivery.
- **Buffered Channels**: Asynchronous. The sender can send up to `N` values without a receiver being ready. Once the buffer is full, the sender blocks.

```go
ch := make(chan int)    // Unbuffered
ch := make(chan int, 10) // Buffered (Capacity 10)
```

---

## 3. Directional Channels and Selection

Go allows you to define channels that can only send or only receive, which improves type safety in your API.

- `chan<- int`: Send-only.
- `<-chan int`: Receive-only.

The **`select`** statement is used to wait on multiple channel operations. It blocks until one of its cases can run.

```go
select {
case msg := <-ch1:
    fmt.Println("Received", msg)
case ch2 <- "hi":
    fmt.Println("Sent hi")
default:
    fmt.Println("No communication")
}
```

---

## Interview Pro-Tips: Channel Closedness
If an interviewer asks what happens when a channel is closed:
1. **Sending to a closed channel**: Causes a **Panic**.
2. **Receiving from a closed channel**: Returns the zero-value of the type (e.g., `0` for int) and a second boolean `false` (e.g., `val, ok := <-ch`).
3. **Closing a closed channel**: Causes a **Panic**.
4. **Conclusion**: Always ensure only **one** goroutine (the sender) is responsible for closing a channel.

---

## Technical Summary
1. `Concurrency`: Handling multiple tasks (not necessarily at the same time).
2. `Parallelism`: Executing multiple tasks simultaneously (on multi-core CPUs).
3. `CSP`: A mathematical approach to concurrency that avoids the need for manual Mutexes and Locks in most cases.
