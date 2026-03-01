---
title: Understanding Big O Notation
excerpt: A beginner-friendly guide to time and space complexity analysis — the foundation of writing efficient code.
date: 2026-02-28
readTime: 8 min read
tags: [Algorithms, Fundamentals]
---

Big O notation is the language we use to describe the performance of an algorithm. It tells us how the runtime or memory usage grows as the input size increases.

## Why It Matters

When you write code that works on 10 items, it might feel instant. But what happens when those 10 items become 10 million? Big O gives us the vocabulary to reason about that.

## Common Complexities

### O(1) — Constant Time

The operation takes the same amount of time regardless of input size. Accessing an array element by index is O(1).

```javascript
function getFirst(arr) {
  return arr[0]; // Always one operation
}
```

### O(n) — Linear Time

The time grows proportionally to the input. A simple loop through an array is O(n).

```javascript
function findMax(arr) {
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) max = arr[i];
  }
  return max;
}
```

### O(n²) — Quadratic Time

Nested loops over the same data. Bubble sort is a classic example.

### O(log n) — Logarithmic Time

Binary search is the gold standard. Each step halves the search space.

```javascript
function binarySearch(arr, target) {
  let low = 0,
    high = arr.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}
```

## Rules of Thumb

1. **Drop constants** — O(2n) is just O(n)
2. **Drop non-dominant terms** — O(n² + n) is just O(n²)
3. **Different inputs = different variables** — Two separate arrays means O(a + b), not O(n)

## Space Complexity

Big O isn't just about time. The same notation applies to how much extra memory your algorithm uses. Creating a new array of size n? That's O(n) space.

## Wrapping Up

Understanding Big O is a prerequisite for every technical interview and for writing production-grade software. Start by identifying the loops in your code, and you'll build intuition quickly.
