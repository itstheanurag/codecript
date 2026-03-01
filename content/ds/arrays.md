---
title: Arrays
order: 1
---

Arrays are the most fundamental data structure — a contiguous block of memory storing elements of the same type.

## Key Operations

| Operation | Average | Worst |
| --------- | ------- | ----- |
| Access    | O(1)    | O(1)  |
| Search    | O(n)    | O(n)  |
| Insert    | O(n)    | O(n)  |
| Delete    | O(n)    | O(n)  |

## When to Use Arrays

- You need fast random access by index
- The size of the collection is known or rarely changes
- You want cache-friendly sequential iteration

## Dynamic Arrays

Languages like JavaScript, Python, and Java provide dynamic arrays (Array, list, ArrayList) that resize automatically. Under the hood, they allocate a larger buffer and copy elements when capacity is exceeded — an amortized O(1) append operation.

## Common Patterns

- **Two pointers** — start from both ends and move inward
- **Sliding window** — maintain a window over a subarray
- **Prefix sums** — precompute cumulative sums for range queries
