---
title: Priority Managed Trees: Heaps
order: 8
---

# Heaps: Efficient Priority Management

A **Heap** is a specialized **Complete Binary Tree** that satisfies the **Heap Property**. It is the industry-standard structure for implementing **Priority Queues**, where you need to quickly retrieve the element with the highest (or lowest) priority.

---

## 1. The Heap Property

- **Max-Heap**: For every node $i$, the value of $i$ is greater than or equal to the values of its children. The largest element is always at the root.
- **Min-Heap**: For every node $i$, the value of $i$ is less than or equal to the values of its children. The smallest element is always at the root.

---

## 2. The Array Representation

Because a heap is a **Complete** binary tree (all levels are filled except possibly the last, which is filled from left to right), it is most efficiently stored in an **Array** rather than using nodes and pointers.

For an element at index `i`:
- **Left Child**: `2i + 1`
- **Right Child**: `2i + 2`
- **Parent**: `(i - 1) / 2` (Integer division)

---

## 3. Core Operations: Sift-Up and Sift-Down

Maintaining the heap property requires two primary algorithms:

### I. Sift-Up (Bubble Up)
Used during **Insertion**. You add the new element at the end (the first empty leaf) and "bubble it up" by swapping with its parent until the heap property is restored.
- **Complexity**: O(log N)

### II. Sift-Down (Heapify Down)
Used during **Deletion (Extract Max/Min)**. You replace the root with the last element in the array and "sift it down" by swapping it with its largest child until the heap property is restored.
- **Complexity**: O(log N)

---

## 4. Complexity Analysis

| Operation | Complexity | Description |
| :--- | :--- | :--- |
| **Get Max/Min** | O(1) | Root is always at index 0. |
| **Insert** | O(log N) | Requires Sift-Up. |
| **Extract Max/Min** | O(log N) | Requires Sift-Down. |
| **Build Heap** | O(N) | Transforming an unordered array into a heap. |

---

## Interview Pro-Tips: Why O(N) to build a heap?
A common interview question: **"Why is the complexity of Building a Heap O(N) and not O(N log N)?"**
- **The Answer**: While a single "Insert" into an existing heap is O(log N), building from scratch doesn't require N inserts. Instead, we use the "Floyd's Build-Heap" algorithm, which starts from the last non-leaf node and works upwards. Mathematically, the total number of swaps is a convergent series, resulting in a total time of **O(N)**.

---

## Technical Summary
1. `Priority`: Best for "Next most important" tasks.
2. `Complete`: No gaps in the tree structure.
3. `In-Place`: Can be implemented directly within an existing array.
4. `Sift`: The core mechanism for maintaining balance.
