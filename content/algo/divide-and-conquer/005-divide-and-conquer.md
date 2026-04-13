---
title: Divide and Conquer
order: 5
---

**Divide and Conquer** is a powerful algorithmic paradigm based on multi-branched recursion. It works by breaking down a problem into two or more sub-problems of the same or related type, until these become simple enough to be solved directly.

---

## 1. The Three Steps

1.  **Divide**: Break the problem into smaller sub-problems.
2.  **Conquer**: Solve the sub-problems recursively. If they are small enough, solve them directly (Base Case).
3.  **Combine**: Merge the solutions of the sub-problems to get the final solution to the original problem.

---

## 2. Classic Examples

### Sorting
- **Merge Sort**: Divides the array into two halves, sorts them, and merges them.
- **Quick Sort**: Partitions the array into two parts around a pivot and sorts them.

### Searching
- **Binary Search**: Divides the search range in half each time.

### Mathematics
- **Strassen’s Algorithm**: Complex matrix multiplication.
- **Karatsuba Algorithm**: Fast multiplication of large integers.

---

## 3. Comparison with other Paradigms

| Paradigm | Strategy | When to use? |
| :------- | :------- | :----------- |
| **Divide & Conquer** | Solves independent sub-problems. | Sorting, Searching. |
| **Dynamic Programming** | Solves overlapping sub-problems (memoization). | Optimization (Shortest path, Knapsack). |
| **Greedy** | Makes the best local choice at each step. | Minimal Spanning Trees, Huffman coding. |

---

## 4. Why Use It?

-   **Parallelism**: Since sub-problems are often independent, they can be solved on different processors/cores simultaneously.
-   **Memory Access**: It often results in very "cache-friendly" code because it works on small segments of data that fit into the CPU cache.

---

## 5. Master Theorem

The **Master Theorem** is used to determine the time complexity of Divide and Conquer algorithms that follow this recurrence:
`T(n) = aT(n/b) + f(n)`

-   **Merge Sort**: `T(n) = 2T(n/2) + O(n)` → Result: **O(N log N)**
-   **Binary Search**: `T(n) = T(n/2) + O(1)` → Result: **O(log N)**

---

## Key Takeaway

Divide and Conquer is about **Simplification**. By turning one large, scary problem into ten tiny, manageable ones, we can solve complex tasks with elegant recursive code.
