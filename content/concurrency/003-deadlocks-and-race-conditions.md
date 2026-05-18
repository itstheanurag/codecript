---
title: Deadlocks & Race Conditions
order: 3
---

Concurrency brings massive performance gains, but it also introduces notoriously difficult bugs that often only appear intermittently in production under high load. The two most common enemies of a concurrent system are Race Conditions and Deadlocks.

## 1. Race Conditions

A race condition occurs when the final outcome of a program depends on the unpredictable, microscopic timing (the "race") of multiple threads trying to access the same data.

### The "Lost Update" Problem

> [!TIP]
> **ELI5: The Joint Bank Account**
> Alice and Bob share a bank account with $100.
> *   **Alice (Thread A)** checks the balance at the ATM: Sees $100.
> *   **Bob (Thread B)** checks the balance on his phone at the exact same millisecond: Sees $100.
> *   **Alice** deposits $50. She calculates $100 + $50 = $150, and tells the bank to save $150.
> *   **Bob** deposits $20. He calculates $100 + $20 = $120, and tells the bank to save $120.
> 
> Depending on whose save request hits the database a millisecond later, the final balance is either $150 or $120. It should be $170. One update was completely lost because they raced each other!

**The Solution:** Use synchronization (like a Mutex, discussed in the previous module) to ensure the "Read -> Modify -> Write" cycle happens as one indivisible (atomic) operation.

## 2. Deadlocks

A deadlock occurs when two or more threads are permanently stuck, waiting for each other to release locks.

### The Classic Deadlock Scenario

> [!TIP]
> **ELI5: The Narrow Bridge**
> Imagine a very narrow, one-lane bridge. 
> *   Car A enters from the Left. 
> *   Car B enters from the Right. 
> *   They meet in the middle. 
> *   Car A cannot move forward until Car B backs up. 
> *   Car B cannot move forward until Car A backs up. 
> *   Neither driver is willing to reverse. 
> 
> They will sit on that bridge forever. That is a Deadlock.

### The Four Coffman Conditions
For a deadlock to mathematically occur in software, **all four** of these conditions must be true at the exact same time:
1.  **Mutual Exclusion:** Resources cannot be shared; only one thread can hold a lock at a time.
2.  **Hold and Wait:** A thread holds one lock while waiting to acquire another lock.
3.  **No Preemption:** A lock cannot be forcibly taken away from a thread by the OS; the thread must release it voluntarily.
4.  **Circular Wait:** A closed chain of threads exists, where Thread 1 waits for a lock held by Thread 2, and Thread 2 waits for a lock held by Thread 1.

### Preventing Deadlocks
The most common strategy is to break the **Circular Wait** condition.
*   **Global Lock Ordering:** Establish a strict rule in your codebase: *If a thread needs multiple locks, it must acquire them in a specific, global order.* For example, always acquire Lock A before Lock B. If everyone follows this rule, a circular wait is mathematically impossible.

### Code Example: A Simulated Deadlock in Go

Here is what a deadlock looks like in code. Go is smart enough to detect a complete deadlock and crash the program, rather than letting it hang forever.

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

func main() {
	var lockA sync.Mutex
	var lockB sync.Mutex
	var wg sync.WaitGroup

	wg.Add(2)

	// Thread 1
	go func() {
		defer wg.Done()
		lockA.Lock()
		fmt.Println("Thread 1 acquired Lock A")
		time.Sleep(time.Millisecond * 10) // Simulate work

		fmt.Println("Thread 1 waiting for Lock B...")
		lockB.Lock() // IT BLOCKS HERE FOREVER
		
		fmt.Println("Thread 1 got both locks!")
		lockB.Unlock()
		lockA.Unlock()
	}()

	// Thread 2
	go func() {
		defer wg.Done()
		lockB.Lock()
		fmt.Println("Thread 2 acquired Lock B")
		time.Sleep(time.Millisecond * 10) // Simulate work

		fmt.Println("Thread 2 waiting for Lock A...")
		lockA.Lock() // IT BLOCKS HERE FOREVER

		fmt.Println("Thread 2 got both locks!")
		lockA.Unlock()
		lockB.Unlock()
	}()

	wg.Wait()
	fmt.Println("Done") // This line will never execute
}
```

## 3. Livelocks & Starvation

### Livelock
A state where threads are not blocked (they are executing), but they are continually reacting to each other's state changes in a way that prevents them from making progress.
*   **Analogy:** Two people meeting in a narrow hallway. Both step to the right to let the other pass. Then both step to the left. They repeat this dance indefinitely. They aren't stopped (like a deadlock), but they aren't getting anywhere either.

### Starvation
Occurs when a thread is perpetually denied access to a resource it needs to proceed, usually because other "higher priority" threads are constantly grabbing the resource first.
*   **Solution:** Implement fair scheduling algorithms (e.g., a First-In-First-Out queue where the longest-waiting thread gets the lock next).
