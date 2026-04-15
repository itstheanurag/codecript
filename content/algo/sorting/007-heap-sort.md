---
title: Selection Sort with Heaps: Heap Sort
order: 7
---

# Heap Sort: Comparison via Binary Heap

**Heap Sort** is a comparison-based sorting algorithm that can be thought of as an improvement over Selection Sort. Instead of scanning the entire unsorted section to find the maximum element (O(N)), it uses a **Binary Heap** data structure to find and extract the maximum in O(log N) time.

---

## 1. The Core Mechanism: Two Phases

1. **Build a Max-Heap**: Transform the input array into a Max-Heap. As discussed in the Data Structures module, this is done in **O(N)** time using Floyd's algorithm.
2. **Extract and Sort**:
    - Swap the root (the largest element) with the last element in the array.
    - Reduce the "heap size" by 1.
    - **Heapify** the new root to restore the heap property (O(log N)).
    - Repeat until the heap is empty.

---

## 2. Complexity Analysis

| Scenario | Time Complexity | Space Complexity |
| :--- | :--- | :--- |
| **Best Case** | O(N log N) | O(1) |
| **Average Case** | O(N log N) | O(1) |
| **Worst Case** | O(N log N) | O(1) |

- **Deterministic**: Heap Sort has a very consistent performance. It doesn't have a degraded O(N²) worst-case like QuickSort.
- **In-Place**: It sorts the array directly without requiring any auxiliary memory (O(1) space).
- **Unstable**: Heap Sort is **Unstable**. The process of building and extracting from the heap can easily change the relative order of equal elements.

---

## 3. Implementation

```javascript
function heapSort(arr) {
  let n = arr.length;

  // 1. Build Max-Heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arr, n, i);
  }

  // 2. Extract elements from heap one by one
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]]; // Move current root to end
    heapify(arr, i, 0); // Restore heap on reduced array
  }
  return arr;
}

function heapify(arr, n, i) {
  let largest = i;
  let l = 2 * i + 1;
  let r = 2 * i + 2;

  if (l < n && arr[l] > arr[largest]) largest = l;
  if (r < n && arr[r] > arr[largest]) largest = r;

  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    heapify(arr, n, largest);
  }
}
```

---

## 4. Interview Pro-Tips: Heap Sort vs. QuickSort
If an interviewer asks why we usually prefer QuickSort even though HeapSort has a better worst-case (O(N log N) vs O(N²)):
- **The Answer**: **Cache Performance**. QuickSort moves linearly through memory, which is highly cache-friendly. Heap Sort constantly jumps between parent and child indices (e.g., from index 0 to 100 to 200), leading to frequent "Cache Misses." In large real-world datasets, these cache misses make Heap Sort significantly slower than QuickSort.

---

## Technical Summary
1. `Heap`: Using a structure to accelerate finding the maximum.
2. `O(N log N)`: Consistent, reliable performance.
3. `O(1) Space`: Memory efficient.
4. `Unstable`: Not suitable if relative order must be preserved.
