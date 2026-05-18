---
title: Linked Memory: Linked Lists
order: 3
---

A **Linked List** is a linear data structure where elements are not stored in contiguous memory. Instead, each element (a **Node**) contains the data and a **Pointer** (reference) to the next node in the sequence.

---

## 1. Structure of a Node

A node is the fundamental building block of a linked list. In its simplest form, it contains:
- **Data**: The value being stored.
- **Next**: A memory address pointing to the subsequent node.

The list starts with a **Head** pointer. If the head is `null`, the list is empty.

---

## 2. Variations of Linked Lists

### I. Singly Linked List
Each node points only to the next node. Best for minimal memory overhead.

### II. Doubly Linked List
Each node points to both the **Next** and the **Previous** node.
- **Benefit**: Allows bi-directional traversal and O(1) deletion if you already have a reference to the node.
- **Cost**: Doubled memory overhead for pointers.

### III. Circular Linked List
The last node points back to the head. Often used for round-robin scheduling.

---

## 3. Operations and Complexity

| Operation | Complexity | Description |
| :--- | :--- | :--- |
| **Access** | O(N) | Must traverse from the head to reach the i-th element. |
| **Search** | O(N) | Requires sequential scan. |
| **Insertion (at Head)** | O(1) | Only requires updating the new node's pointer and the head. |
| **Insertion (at Tail)** | O(1)* | O(1) if you maintain a 'Tail' pointer; O(N) otherwise. |
| **Deletion** | O(1)* | O(1) if you have the pointer to the node and it's a Doubly Linked List. |

---

## 4. Array vs. Linked List Tradeoffs

1. **Memory**: Linked lists use more memory per element due to pointers.
2. **Allocation**: Arrays require a single large block; Linked Lists can use scattered fragments of memory.
3. **Slicing/Resizing**: Linked Lists are inherently dynamic and never need to "Resize" or copy data.

---

## Interview Pro-Tips: Tortoise and Hare
A classic Linked List question: **"How do you detect a cycle in a linked list?"**
- **The Answer**: Use **Floyd’s Cycle-Finding Algorithm** (Two Pointers). You have a "Slow" pointer moving one step at a time and a "Fast" pointer moving two steps. If there is a cycle, the Fast pointer will eventually "lap" the Slow pointer and they will meet. If the Fast pointer reaches `null`, there is no cycle.

---

## Technical Summary
1. `Non-Contiguous`: Flexible memory usage.
2. `Pointers`: The mechanism for maintaining order.
3. `Overhead`: Each element is larger than its plain data value.
4. `Traversal`: The primary bottleneck (no random access).
