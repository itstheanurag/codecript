---
title: Queues
order: 5
---

A **Queue** is a linear data structure that follows the **FIFO (First In, First Out)** principle. It's like a line of people waiting for a movie—the first person to arrive is the first one to get a ticket.

---

## 1. The Intuition: "A Checkout Line"

Imagine a **Queue at a supermarket**.
1. When a new customer arrives, they join the **back** of the line. (**Enqueue**)
2. When the cashier is ready, they serve the person at the **front** of the line. (**Dequeue**)
3. The person who has been waiting the *longest* is the one served *first*. (**FIFO**)

---

## 2. Key Operations & Complexity

| Operation | Time Complexity | Description |
| :--- | :--- | :--- |
| **Enqueue** | O(1) | Add an item to the back. |
| **Dequeue** | O(1) | Remove an item from the front. |
| **Peek** | O(1) | Look at the front item without removing it. |
| **isEmpty** | O(1) | Check if the queue is empty. |

---

## 3. Multi-Language Implementation

```language-code-tabs
[
  {
    "label": "Javascript",
    "language": "javascript",
    "code": "// Use a dedicated library or a Linked List for O(1) dequeue\n// Array.shift() is O(n)!\nconst queue = [];\nqueue.push(1); // Enqueue\nconst front = queue.shift(); // Dequeue (O(n) in JS arrays)"
  },
  {
    "label": "Python",
    "language": "python",
    "code": "from collections import deque\nqueue = deque()\nqueue.append(1) # Enqueue\nfront = queue.popleft() # Dequeue"
  },
  {
    "label": "Java",
    "language": "java",
    "code": "Queue<Integer> q = new LinkedList<>();\nq.offer(1); // Enqueue\nint front = q.poll(); // Dequeue"
  },
  {
    "label": "C++",
    "language": "cpp",
    "code": "#include <queue>\nstd::queue<int> q;\nq.push(1);\nq.pop();"
  }
]
```

---

## 4. Interview Pro-Tips

### Use Queues for "Processing in Order"
If a problem involves processing tasks in the exact order they arrive (like a printer queue or handling web requests), a Queue is your go-to structure.

### BFS (Breadth-First Search)
The most common use of a Queue in interviews is for **BFS on trees or graphs**. BFS explores level-by-level, and a Queue is required to keep track of which nodes to visit next in the correct order.

### The "O(n) shift" trap
In many languages (like Javascript), using `shift()` on an array is **O(n)** because every other element has to move one spot to the left. In an interview, always mention that you'd use a **Linked List** or a **Circular Buffer** to achieve true **O(1)** dequeue performance.

### Variations: Priority Queue & Deque
- **Priority Queue**: Items are served based on priority, not just arrival time (implemented with a Heap).
- **Deque (Double-Ended Queue)**: You can add or remove from *both* ends.

### What Interviewers Are Testing
- Do you know the difference between LIFO and FIFO?
- Can you explain why a simple array might not be the best implementation for a Queue?
- Do you understand the role of Queues in BFS?

---

## Key Takeaway

Queues are the essence of **fairness** in computer science. They ensure that whoever waits longest is served first, and they are critical for any system that handles asynchronous data or level-by-level exploration.
