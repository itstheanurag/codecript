---
title: Selection Sort
order: 3
---

# Selection Sort: Minimum Extraction

**Selection Sort** is a simple, comparison-based sorting algorithm. It works by dividing the input list into two parts: a sorted sublist which is built up from left to right, and a remaining unsorted sublist. In each iteration, the algorithm finds the **Minimum** element from the unsorted part and swaps it with the first element of that part.

---

## 1. The Core Mechanism

1. **Find**: Search the unsorted part of the array to find the smallest element.
2. **Swap**: Exchange this smallest element with the first element of the unsorted part.
3. **Advance**: Move the boundary between the sorted and unsorted parts one position to the right.

---

## 2. Complexity Analysis

| Scenario | Time Complexity | Space Complexity |
| :--- | :--- | :--- |
| **Best Case** | O(N²) | O(1) |
| **Average Case** | O(N²) | O(1) |
| **Worst Case** | O(N²) | O(1) |

- **No Best Case**: Unlike Bubble Sort or Insertion Sort, Selection Sort **always** performs the same number of comparisons ($\frac{N(N-1)}{2}$), even if the array is already sorted.
- **Minimizing Swaps**: Selection Sort performs only **O(N)** swaps in the worst case. This makes it useful in scenarios where the cost of writing to memory (swapping) is much higher than the cost of comparing.

---

## 3. Implementation

```javascript
function selectionSort(arr) {
  let n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    // Find the minimum element in the remaining unsorted array
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }
    // Swap the found minimum element with the first element
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
  }
  return arr;
}
```

---

## 4. Interview Pro-Tips: Why is it Unstable?
- **Stability**: Selection Sort is generally **Unstable**.
- **The Reason**: When you swap the minimum element with the element at the beginning of the unsorted section, you might "Jump" over other equal elements, changing their relative order.
- **Example**: Consider `[2a, 2b, 1]`. The `1` will be swapped with `2a`, resulting in `[1, 2b, 2a]`. The relative order of `2a` and `2b` has been reversed.

---

## Technical Summary
1. `Select`: The primary operation is finding the minimum.
2. `O(N²)`: Always quadratic, regardless of input state.
3. `Unstable`: Does not preserve relative order.
4. `Min Swaps`: Best for systems with expensive write operations.
