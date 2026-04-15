---
title: Divide and Conquer: Merge Sort
order: 5
---

# Merge Sort: Recursive Parallelism

**Merge Sort** is an efficient, general-purpose, and comparison-based sorting algorithm. It is based on the **Divide and Conquer** paradigm, where the main problem is recursively broken down into smaller sub-problems until they are simple enough to solve directly.

---

## 1. The Core Mechanism: Three Steps

1. **Divide**: Split the unsorted list into $N$ sublists, each containing one element (a list of one element is considered sorted).
2. **Conquer**: Recursively sort the sublists.
3. **Merge**: Repeatedly merge sublists to produce new sorted sublists until there is only one sublist remaining—the full sorted array.

---

## 2. Complexity Analysis

| Scenario | Time Complexity | Space Complexity |
| :--- | :--- | :--- |
| **Best Case** | O(N log N) | O(N) |
| **Average Case** | O(N log N) | O(N) |
| **Worst Case** | O(N log N) | O(N) |

- **Guaranteed Performance**: Unlike QuickSort, Merge Sort is guaranteed to be $O(N \log N)$ even in the worst-case scenario.
- **Space Overhead**: This is the "Price" of Merge Sort. Because it requires a temporary array to perform the merge step, it has a space complexity of **O(N)**. This makes it less suitable for systems with extremely limited memory.
- **Stable**: It preserves the relative order of equal elements.

---

## 3. Implementation (Top-Down)

```javascript
function mergeSort(arr) {
  if (arr.length <= 1) return arr;

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  return merge(left, right);
}

function merge(left, right) {
  let result = [];
  let lIdx = 0, rIdx = 0;

  while (lIdx < left.length && rIdx < right.length) {
    if (left[lIdx] <= right[rIdx]) {
      result.push(left[lIdx]);
      lIdx++;
    } else {
      result.push(right[rIdx]);
      rIdx++;
    }
  }

  return result.concat(left.slice(lIdx)).concat(right.slice(rIdx));
}
```

---

## 4. Interview Pro-Tips: Why not QuickSort?
If an interviewer asks why you would choose Merge Sort over QuickSort (which is often faster in practice):
1. **Stability**: If the sort MUST be stable, Merge Sort is the standard choice.
2. **Linked Lists**: Merge Sort is extremely efficient for sorting Linked Lists because it doesn't require random access (indexing), and you can perform the merge without the O(N) extra space by just re-linking pointers.
3. **External Sorting**: When sorting massive datasets that don't fit in RAM (Disk-based sorting), Merge Sort is the foundation because it processes data in chunks.

---

## Technical Summary
1. `Divide & Conquer`: Recursive decomposition.
2. `O(N log N)`: Deterministic time complexity.
3. `O(N) Space`: Requires auxiliary memory for merging.
4. `Merge`: The key operation where the sorting actually happens.
