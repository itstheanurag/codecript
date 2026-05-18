---
title: Synchronization & Locks
order: 2
---

# Synchronization and Locks

Because threads share memory (the kitchen in our house analogy), accessing shared resources (like updating a single bank account balance) must be strictly coordinated. This coordination is called synchronization.

> [!TIP]
> **ELI5: The Talking Stick**
> Imagine a classroom of eager students (Threads) who all want to draw on a single whiteboard (Shared Memory). If they all draw at once, it's a mess (Data Corruption). 
> 
> The teacher introduces a **Mutex** (The Talking Stick). A student must grab the stick to draw. If another student wants to draw, they must wait patiently (Blocked state) until the first student puts the stick down (Releases the lock).

## 1. The Critical Section

A critical section is a specific piece of code that accesses a shared resource and must not be concurrently executed by more than one thread. If multiple threads enter the critical section simultaneously, a race condition occurs.

## 2. Mutexes (Mutual Exclusion)

A Mutex is the most common synchronization primitive. It acts as a strict, binary lock.

*   Before entering a critical section, a thread must `acquire()` (or lock) the mutex.
*   If another thread holds the mutex, the requesting thread is put to sleep (blocked) until the mutex is available.
*   After leaving the critical section, the thread must `release()` (or unlock) the mutex.

### Code Example: Using a Mutex in Go

Here is a practical example showing why a Mutex is required, and how to implement it to prevent data corruption.

```go
package main

import (
	"fmt"
	"sync"
)

var (
	bankBalance = 0 // Shared resource
	mutex       sync.Mutex // The lock
)

func depositMoney(wg *sync.WaitGroup) {
	defer wg.Done() // Signal completion when the function exits

	// --- CRITICAL SECTION START ---
	mutex.Lock() // Grab the talking stick!

	// Read, modify, write
	currentBalance := bankBalance
	// Simulate some processing time
	currentBalance = currentBalance + 100
	bankBalance = currentBalance

	mutex.Unlock() // Put the talking stick down!
	// --- CRITICAL SECTION END ---
}

func main() {
	var wg sync.WaitGroup

	// Let's spawn 100 concurrent deposits
	for i := 0; i < 100; i++ {
		wg.Add(1)
		go depositMoney(&wg)
	}

	wg.Wait() // Wait for all 100 workers to finish
	
	// Because of the Mutex, this will ALWAYS be exactly 10000.
	// Without the Mutex, it would be a random, lower number due to lost updates.
	fmt.Printf("Final Bank Balance: $%d\n", bankBalance)
}
```

## 3. Semaphores

A semaphore is a generalization of a mutex. While a mutex allows exactly *one* thread into a critical section, a semaphore allows a specified *number* (`N`) of threads.

> [!NOTE]
> **ELI5: The Bouncer and the Club**
> A Mutex is a bathroom with one key. A **Semaphore** is a nightclub with a strict capacity of 50 people. The bouncer (the Semaphore) lets people in until the club hits 50. If person 51 shows up, they must wait in line. When someone leaves the club, the bouncer lets the next person in line enter.

*   Internally, a semaphore maintains a counter.
*   `acquire()` decrements the counter. If the counter is 0, the thread blocks.
*   `release()` increments the counter and wakes up a blocked thread.

**Use Case:** Limiting access to a finite resource pool, like allowing a maximum of 10 concurrent database connections or throttling API requests.

## 4. Optimistic vs. Pessimistic Locking

These concepts apply to databases and application-level objects when dealing with concurrency.

### Pessimistic Locking (The Defensive Approach)
Assume conflicts *will* happen. Acquire a lock before reading/writing data and hold it until the transaction is complete. (e.g., locking the row in a database).
*   **Pros:** Guarantees data integrity.
*   **Cons:** Reduces throughput because other requests have to wait in line.

### Optimistic Locking (The "Hope for the Best" Approach)
Assume conflicts are *rare*. Read the data, compute the new value locally, and when saving, verify that no one else modified the data in the meantime (usually by checking a `version` number or timestamp).
*   **Pros:** High throughput, no actual locking mechanism slowing things down.
*   **Cons:** If a conflict occurs, the transaction fails and must be completely retried from scratch.

> [!TIP]
> Use **Pessimistic Locking** when collisions are highly likely (e.g., ticket booking systems for a popular concert). Use **Optimistic Locking** when collisions are rare (e.g., two admins editing a user's profile at the exact same second).
