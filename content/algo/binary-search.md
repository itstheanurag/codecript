---
title: Binary Search
order: 2
---

Binary search finds a target value in a sorted array by repeatedly halving the search space. It runs in O(log n) time.

## The Classic Template

```javascript
function binarySearch(arr, target) {
  let low = 0;
  let high = arr.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);

    if (arr[mid] === target) return mid;
    if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }

  return -1; // not found
}
```

## Variations

- **Find first occurrence** — when target is found, continue searching left
- **Find last occurrence** — when target is found, continue searching right
- **Find insertion point** — return `low` when not found
- **Search on answer** — binary search on the answer space, not the array

## Common Pitfalls

1. Off-by-one errors in `low` and `high` updates
2. Integer overflow in `(low + high) / 2` — use `low + (high - low) / 2` instead
3. Forgetting that the input must be sorted
