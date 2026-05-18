---
title: Modern Concurrency Models
order: 4
---

Manually managing mutexes and threads is error-prone and leads to the deadlocks we discussed in the previous section. Modern languages have abstracted these concepts into higher-level concurrency models to make writing concurrent code safer and significantly more efficient.

## 1. The Event Loop (Node.js / Python Asyncio)

This model uses a **single-threaded** architecture to achieve massive concurrency without the overhead of OS-level context switching.

> [!TIP]
> **ELI5: The Fast-Food Cashier**
> Imagine a fast-food restaurant. 
> *   **Multi-threading:** You have 10 cashiers (Threads). A customer orders, and the cashier walks to the back, cooks the burger, and brings it back. While cooking, the cashier is blocked. If 11 people show up, the 11th must wait.
> *   **The Event Loop (Node.js):** You have 1 incredibly fast cashier (The Single Thread). A customer orders. The cashier shouts the order to the kitchen (asynchronous I/O), gives the customer a buzzer (a Callback/Promise), and *immediately* takes the next customer's order. When the kitchen finishes a burger, the buzzer rings, and the cashier hands it to the customer in between taking orders.
> 
> One cashier can handle thousands of concurrent orders, *as long as they never go to the kitchen to cook the burger themselves*.

*   **Pros:** Extremely lightweight. No mutexes needed because application code is single-threaded (no race conditions over shared memory). Perfect for I/O-heavy workloads like web servers querying databases.
*   **Cons:** Terrible for CPU-bound tasks. If the cashier suddenly decides to cook a burger themselves (e.g., complex image processing in Node.js), the entire line stops. The Event Loop is blocked.

### Code Example: Node.js Non-Blocking I/O
```javascript
const fs = require('fs');

console.log("1. Taking order (Start)");

// This is an asynchronous, non-blocking call.
// Node offloads the file reading to the OS, and continues to the next line immediately.
fs.readFile('/path/to/massive/file.txt', (err, data) => {
    // This callback is executed much later, when the OS finishes reading the file.
    console.log("3. Order is ready (File read complete)");
});

console.log("2. Taking next customer's order (File is being read in the background)");
```

## 2. Communicating Sequential Processes (CSP) / Goroutines

Popularized by the Go programming language. CSP focuses on the channels of communication between processes rather than the processes themselves.

*   **Goroutines:** Lightweight, user-space threads managed by the Go runtime, not the Operating System. They start with an initial stack of just 2KB (compared to an OS thread's 1-2MB). You can easily run millions of them on a laptop.
*   **Channels:** The conduit through which Goroutines communicate and synchronize. Instead of locking shared memory with a Mutex, you pass data through channels.
*   **The Go Mantra:** *"Do not communicate by sharing memory; instead, share memory by communicating."*

```mermaid
architecture-beta
    group app(cloud)[Go Application]

    group g1(server)[Goroutine 1] in app
    group g2(server)[Goroutine 2] in app
    service chan(database)[Channel] in app

    g1:R --> L:chan
    g2:L <-- R:chan
```

### Code Example: Go Channels
```go
package main

import "fmt"

func worker(done chan bool) {
	fmt.Println("Worker: Doing hard work...")
	// Send a boolean 'true' into the channel to signal we are done
	done <- true
}

func main() {
	// Create an unbuffered channel of type boolean
	doneChannel := make(chan bool)

	// Start the concurrent worker
	go worker(doneChannel)

	// The main thread will block here, waiting to receive a value from the channel
	<-doneChannel
	fmt.Println("Main: Worker finished, exiting program.")
}
```

## 3. Actor Model (Erlang / Akka)

The Actor model is a mathematical model of concurrent computation that treats "Actors" as the universal primitives of concurrent computation.

*   **How it Works:** An Actor is an isolated entity that encapsulates state and behavior. Actors *do not share memory*. The only way they can interact is by sending asynchronous messages to each other's "mailboxes".
*   **Pros:** Eliminates race conditions entirely (no shared state). Highly scalable across multiple machines (distributed systems naturally fit the message-passing paradigm). Unprecedented fault tolerance.
*   **Cons:** Requires a major paradigm shift in how you design software. Tracing execution paths across thousands of asynchronous messages can be difficult.
