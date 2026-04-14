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

## 6. Interview Pro-Tips

### Recognise the Pattern — Not Just the Algorithm
Divide and Conquer is a *paradigm*, not a single algorithm. When you see a problem that involves splitting input in half and combining results, your brain should immediately say "D&C." This applies to: sorting, binary search, closest pair of points, counting inversions in an array, and more.

### The Master Theorem — Know the Big Three
When asked for the time complexity of your D&C algorithm, apply the Master Theorem to `T(n) = aT(n/b) + f(n)`:
- **Merge Sort**: `T(n) = 2T(n/2) + O(n)` → **O(N log N)**
- **Binary Search**: `T(n) = T(n/2) + O(1)` → **O(log N)**
- **Naive Matrix Multiply**: `T(n) = 8T(n/2) + O(n²)` → **O(N³)**

### D&C vs. DP — The Key Distinction
Both use recursion and break problems into subproblems. The difference: D&C subproblems are **independent** (results don't overlap). DP subproblems **overlap** (you'd recompute the same thing many times without memoization). If you find yourself recalculating the same subproblem, switch from D&C to DP.

### What Interviewers Are Testing
- Can you identify that a problem has independent sub-structure?
- Can you write the recurrence relation and derive the complexity?
- Do you understand the Divide, Conquer, and Combine steps clearly?
- Can you distinguish D&C from DP?

---

## Key Takeaway

Divide and Conquer is about **Simplification**. By turning one large, scary problem into ten tiny, manageable ones, we can solve complex tasks with elegant recursive code.
