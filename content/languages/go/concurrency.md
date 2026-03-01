---
title: Concurrency
order: 2
---

Go is famous for its lightweight concurrency primitives: Goroutines and Channels.

## Goroutines

A "goroutine" is a lightweight thread managed by the Go runtime.

```go
go sayHello() // Runs in background
```

## Channels

Channels are the pipes that connect concurrent goroutines. You can send values into channels from one goroutine and receive them into another.

```go
messages := make(chan string)

go func() { messages <- "ping" }()

msg := <-messages
fmt.Println(msg)
```

## Why it matters?

Go makes it extremely easy to handle thousands of concurrent connections efficiently, which is why it's a favorite for cloud-native backend services.
