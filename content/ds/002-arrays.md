---
title: Contiguous Memory: Arrays
order: 2
---

# Arrays: Static and Dynamic

An **Array** is a collection of elements of the same type stored in **Contiguous Memory** locations. It is the most fundamental data structure, providing the building blocks for more complex structures like Hash Tables and Heaps.

---

## 1. Static Arrays

In a static array, the size is fixed at the time of creation.
- **Access (O(1))**: Because the memory is contiguous, the address of any element can be calculated using a simple formula: `BaseAddress + (Index * ElementSize)`.
- **Search (O(N))**: Unless the array is sorted, you must check every element.

---

## 2. Dynamic Arrays (Vector / ArrayList)

Modern languages provide **Dynamic Arrays** that can resize themselves as elements are added. 

### How Resizing Works:
1. When the internal capacity is reached, the structure allocates a **New, Larger** block of memory (usually 2x the current size).
2. It copies all existing elements to the new block.
3. It frees the old memory block.

**Amortized Complexity**: While a single "Insert" that triggers a resize is O(N), the vast majority of inserts are O(1). On average, the append operation is considered **O(1) Amortized**.

---

## 3. Memory Alignment and Performance

Arrays are highly efficient because of **Cache Locality**. 
- CPUs fetch data from RAM in "Cache Lines" (typically 64 bytes). 
- When you access `arr[0]`, the CPU likely pulls `arr[1]` through `arr[7]` into its cache simultaneously. 
- Sequential iteration over an array is significantly faster than any other data structure.

---

## 4. Basic Operations (Complexity)

| Operation | Complexity | Description |
| :--- | :--- | :--- |
| **Random Access** | O(1) | Direct access via index. |
| **Append** | O(1)* | O(1) average; O(N) when resizing. |
| **Insertion** | O(N) | Requires shifting subsequent elements. |
| **Deletion** | O(N) | Requires shifting elements to fill the gap. |

---

## Interview Pro-Tips: Array Resizing
If an interviewer asks why we double the size (growth factor of 2) during a resize:
- **The Answer**: A growth factor of 2 ensures that the cost of copying elements is spread out enough to maintain **O(1) amortized time**. If we only added a fixed amount of space (e.g., +10 slots), the total cost of copying would become **O(N²)** over time, which would be disastrous for performance.

---

## Technical Summary
1. `Contiguous`: Stored as a single chunk in RAM.
2. `Indexing`: The key to O(1) access.
3. `Shifting`: The reason insertions and deletions are expensive.
4. `Amortization`: The mathematical proof that dynamic arrays are efficient.
