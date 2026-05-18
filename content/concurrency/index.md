---
title: Concurrency & Multithreading
order: 10
---

# Concurrency & Multithreading

Modern backend engineering relies heavily on concurrent processing. Whether you are handling thousands of web requests, processing large data streams, or optimizing computational workloads, understanding how to manage multiple tasks simultaneously is essential.

In this section, we cover the fundamentals of concurrency, the pitfalls of shared state, and modern patterns for building highly concurrent applications safely.

## What's Inside?

- **[Processes vs. Threads](./001-processes-vs-threads)**: Understanding execution contexts, memory spaces, and context switching.
- **[Synchronization & Locks](./002-synchronization-and-locks)**: Mutexes, semaphores, and managing shared resources safely.
- **[Deadlocks & Race Conditions](./003-deadlocks-and-race-conditions)**: Identifying, preventing, and debugging classic concurrency bugs.
- **[Modern Concurrency Models](./004-modern-concurrency-models)**: The Event Loop, Actor Model, and Goroutines.

> "Concurrency is about dealing with lots of things at once. Parallelism is about doing lots of things at once." — Rob Pike
