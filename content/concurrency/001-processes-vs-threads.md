---
title: Processes vs. Threads
order: 1
---

Before diving into synchronization, you must understand the basic units of execution provided by the operating system: Processes and Threads.

> [!TIP]
> **ELI5 (Explain Like I'm 5): The House Analogy**
> Imagine a **Process** is a house. It has its own address, its own locked doors (isolation), and its own kitchen (memory space). If the house burns down, the neighbor's house is fine.
> 
> A **Thread** is a person living inside that house. A single house can have one person, or multiple people (multithreading). All the people in the house share the same kitchen and living room (Shared Memory), but they each have their own private backpack for their personal items (Stack/Registers). Because they share the kitchen, they have to coordinate so they don't try to use the microwave at the exact same time!

## 1. Processes

A process is an instance of a computer program that is being executed.

*   **Isolation:** Each process has its own isolated memory space (heap, stack, data, text segments). A crash in one process generally does not affect others.
*   **Overhead:** Creating and destroying processes is expensive (heavyweight). It requires the OS to allocate brand new memory space.
*   **Inter-Process Communication (IPC):** Because memory is isolated, processes must use complex IPC mechanisms (pipes, sockets, shared memory segments) to talk to each other.

## 2. Threads

A thread is the smallest sequence of programmed instructions that can be managed independently by a scheduler. Threads exist *within* a process.

```mermaid
architecture-beta
    group process(cloud)[Process Memory Space]

    service heap(database)[Shared Heap] in process
    service code(database)[Shared Code/Data] in process

    group t1(server)[Thread 1] in process
    service s1(disk)[Private Stack] in t1

    group t2(server)[Thread 2] in process
    service s2(disk)[Private Stack] in t2

    t1:R --> L:heap
    t2:L --> R:heap
```

*   **Shared Memory:** All threads within a process share the same memory space (the heap, code, and data segments). However, each thread has its own **Stack** (for local variables) and **Registers**.
*   **Overhead:** Creating and destroying threads is much faster (lightweight) than processes.
*   **Communication:** Threads communicate easily by reading and writing to shared variables in the heap.
*   **Risk:** Because memory is shared, one misbehaving thread can crash the entire process or corrupt data for all other threads (race conditions).

## 3. Concurrency vs. Parallelism

These terms are often used interchangeably, but they are fundamentally different.

*   **Concurrency (The Illusion of Simultaneous):** The ability to *manage* multiple tasks at once. Imagine a single chef cooking a 3-course meal. They chop onions, then put the soup on the stove, then while the soup boils, they go back to chopping. They are switching tasks rapidly, managing them all. A single-core CPU does this by rapidly switching between threads (context switching).
*   **Parallelism (Actually Simultaneous):** The ability to *execute* multiple tasks at the exact same instant. Imagine 3 chefs in the kitchen, each cooking one course at the exact same time. This requires hardware with multiple cores.

> [!NOTE]
> You can have concurrency without parallelism (multitasking on a single-core CPU), and parallelism without concurrency (running a single large mathematical computation distributed across multiple cores).

## 4. Context Switching

When the CPU stops executing one thread (or process) and switches to another, it performs a context switch.

1.  Save the state (registers, program counter, stack pointer) of the current thread.
2.  Load the state of the next thread.
3.  Resume execution.

Context switching is pure overhead. While it happens in microseconds, thousands of context switches per second can severely degrade application performance (a phenomenon known as thrashing). This is why modern frameworks (like Go) use lightweight "user-space" threads to avoid OS-level context switching.

### Code Example: Lightweight Concurrency in Go

Here is how easily you can spin up thousands of concurrent tasks in Go using "Goroutines" (Go's version of lightweight threads).

```go
package main

import (
	"fmt"
	"time"
)

// A simple function we want to run concurrently
func printMessage(id int) {
	fmt.Printf("Worker %d started\n", id)
	time.Sleep(time.Millisecond * 500) // Simulate work
	fmt.Printf("Worker %d finished\n", id)
}

func main() {
	// We spin up 3 concurrent workers
	// The 'go' keyword tells the runtime to execute this in a new goroutine
	for i := 1; i <= 3; i++ {
		go printMessage(i)
	}

	// Wait for a moment to let the concurrent workers finish
	// (In a real app, you'd use a WaitGroup instead of Sleep)
	time.Sleep(time.Second * 1)
	fmt.Println("All workers done. Main thread exiting.")
}
```
