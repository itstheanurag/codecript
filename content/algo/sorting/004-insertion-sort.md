---
title: Insertion Sort
order: 4
---

# Insertion Sort: Incremental Ordering

**Insertion Sort** is a simple, comparison-based sorting algorithm that builds the final sorted array one item at a time. It is much less efficient on large lists than more advanced algorithms like QuickSort or MergeSort, but it excels at sorting small datasets or partially sorted arrays.

---

## 1. The Core Mechanism: The "Hand" Analogy

1. **Pick**: Take the next element from the unsorted section.
2. **Compare**: Compare it with the elements in the sorted section (from right to left).
3. **Shift**: Shift the sorted elements one position to the right until you find the correct "insertion" point.
4. **Insert**: Place the element in its correct spot.

---

## 2. Complexity Analysis

| Scenario | Time Complexity | Space Complexity |
| :--- | :--- | :--- |
| **Best Case (Sorted)** | O(N) | O(1) |
| **Average Case** | O(N²) | O(1) |
| **Worst Case (Reverse)** | O(N²) | O(1) |

- **Adaptive**: It is highly efficient for data that is already substantially sorted ($O(N + K)$, where $K$ is the number of inversions).
- **Online**: It can sort a list as it receives it. You don't need the entire dataset upfront; you can insert new elements into the sorted sublist in real-time.
- **Stable**: Like Bubble Sort, it preserves the relative order of equal elements.

---

## 3. Implementation

```javascript
function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    let key = arr[i];
    let j = j = i - 1;

    // Shift elements of arr[0..i-1] that are greater than key
    // one position ahead of their current position
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j = j - 1;
    }
    arr[j + 1] = key;
  }
  return arr;
}
```

---

## 4. Interview Pro-Tips: Why use it in production?
- **Small Array Optimization**: Many production-grade "Hybrid" sorting algorithms (like **Timsort** used in Python/Java or **Introsort** in C++) switch from Merge/QuickSort to Insertion Sort for sub-arrays of small size (typically 10-30 elements) because it has lower overhead and superior cache performance.
- **Low Constant Factors**: On very small arrays, the constant overhead of recursion (in Merge/QuickSort) is higher than the $N^2$ work of Insertion Sort.

---

## Technical Summary
1. `Adaptive`: Performance improves with the degree of sortedness.
2. `O(1) Space`: In-place sorting.
3. `Stable`: Ideal for multi-criteria sorts.
4. `Online`: Can process elements in a stream.
