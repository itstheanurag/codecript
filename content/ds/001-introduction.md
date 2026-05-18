---
title: Introduction to Data Structures
order: 1
---

In computer science, a **Data Structure** is a specialized format for organizing, processing, retrieving, and storing data. Choosing the right data structure is the difference between an application that scales to millions of users and one that crashes under minimal load.

---

## 1. Abstract Data Types (ADT) vs. Data Structures

It is important to distinguish between the "Interface" and the "Implementation."

- **Abstract Data Type (ADT)**: A theoretical model that describes **what** operations can be performed (e.g., a "List" must support adding and removing items).
- **Data Structure**: The actual implementation of that model in memory (e.g., an "Array" or a "Linked List").

---

## 2. Memory Models: Contiguous vs. Linked

All data structures are ultimately built using two physical memory layouts:

### I. Contiguous Memory (Arrays)
Data is stored in a single, continuous block of memory. 
- **Benefit**: Extremely fast random access (O(1)) and high **Cache Locality**.
- **Drawback**: Fixed size; resizing requires allocating a new block and copying all data.

### II. Linked Memory (Nodes/Pointers)
Data is stored in scattered blocks (Nodes), each containing a pointer to the next.
- **Benefit**: Dynamic size; inserting or deleting an item only requires updating pointers.
- **Drawback**: Slow sequential access (O(N)) and high memory overhead for pointers.

---

## 3. The Big O Notation: Measuring Performance

We judge a data structure's efficiency based on two metrics:
1. **Time Complexity**: How the execution time grows as the data set increases.
2. **Space Complexity**: How much additional memory is required.

**The Golden Rule**: Always aim for O(1) (Constant) or O(log N) (Logarithmic) operations for critical paths. Avoid O(N²) (Quadratic) wherever possible.

---

## Interview Pro-Tips: Why does cache locality matter?
If an interviewer asks why a `for` loop over an Array is faster than one over a Linked List:
- **The Answer**: **CPU Caching**. Because arrays are contiguous, when the CPU loads one element, it proactively loads the next several elements into its high-speed L1/L2 cache. With a Linked List, the nodes are scattered across the RAM, forcing the CPU to perform a slow "Memory Fetch" for every single node.

---

## Technical Summary
1. `Storage`: How we hold data in RAM.
2. `Operations`: Search, Insert, Delete, and Update.
3. `Tradeoffs`: Speed vs. Memory. No single data structure is perfect for every scenario.
