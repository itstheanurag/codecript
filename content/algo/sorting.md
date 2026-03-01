---
title: Sorting Algorithms
order: 1
---

Sorting is a fundamental operation. Choosing the right algorithm depends on input size, memory constraints, and whether the data is partially sorted.

## Comparison-Based Sorts

### Quick Sort

- **Average:** O(n log n), **Worst:** O(n²)
- In-place, not stable
- Best general-purpose sort; fast in practice due to cache locality

### Merge Sort

- **Always:** O(n log n)
- Not in-place (requires O(n) extra space), stable
- Great for linked lists and when stability matters

### Heap Sort

- **Always:** O(n log n)
- In-place, not stable
- Useful when you need guaranteed O(n log n) with no extra memory

## Non-Comparison Sorts

### Counting Sort — O(n + k)

Works when the range of values (k) is small. Counts occurrences and reconstructs the sorted array.

### Radix Sort — O(d × n)

Sorts digit by digit. Excellent for integers or fixed-length strings.

## Choosing a Sort

- **Small arrays (<50 elements):** Insertion sort
- **General purpose:** Quick sort or your language's built-in sort
- **Stability required:** Merge sort
- **Known small range:** Counting sort
