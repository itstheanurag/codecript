---
title: FIFO: Queues
order: 5
---

# Queues: First-In, First-Out (FIFO)

A **Queue** is a linear data structure that follows the **FIFO** (First-In, First-Out) principle. This means the first element added to the queue will be the first one to be removed, similar to a line of people waiting for service.

---

## 1. Core Operations

A queue focuses on two ends: the **Front** (for removal) and the **Rear** (for insertion).

- **`enqueue(item)`**: Adds an item to the **Rear** of the queue.
- **`dequeue()`**: Removes and returns the item from the **Front**.
- **`front()` / `peek()`**: Returns the item at the front without removing it.
- **`isFull()` / `isEmpty()`**: Checks the current state of the queue.

All core operations are **O(1)** (Constant Time).

---

## 2. Advanced Variations

### I. Circular Queue
In a standard array-based queue, once the "Rear" reaches the end of the array, you can't add more items even if there is space at the front (due to dequeues). A **Circular Queue** connects the last position back to the first, maximizing memory usage.

### II. Deque (Double-Ended Queue)
Supports insertion and deletion from **Both** ends. It is a highly flexible structure that can act as both a Stack and a Queue.

### III. Priority Queue
Elements are removed based on their **Priority** rather than their arrival time. These are typically implemented using **Heaps** (see Module 8).

---

## 3. Practical Applications

1. **Breadth-First Search (BFS)**: Queues are the engine behind BFS. They store the "Neighbors" of a node that need to be visited next, ensuring we explore level-by-level.
2. **CPU Scheduling**: Operating systems use queues to manage the order in which processes are executed (Round Robin).
3. **Task Queues**: Systems like Celery or RabbitMQ use queues to handle background jobs asynchronously.
4. **Buffering**: Managing data streams (like video streaming or printer spooling) where the speed of production and consumption varies.

---

## Interview Pro-Tips: Implementing a Queue using Stacks
A classic interview logic puzzle: **"How do you implement a Queue using only two Stacks?"**
- **The Answer**: 
    1. For `enqueue`, simply push the item onto **Stack A**.
    2. For `dequeue`, if **Stack B** is empty, pop everything from **Stack A** and push it into **Stack B** (this reverses the order). Then pop from **Stack B**.
- **Performance**: While a single dequeue might take O(N) when moving elements, the **Amortized** cost over many operations remains **O(1)**.

---

## Technical Summary
1. `Linear`: Standard order of arrival.
2. `Pointers`: Tracks `head` and `tail` for O(1) efficiency.
3. `Synchronization`: Queues are the primary tool for decoupled communication between different parts of a system.
