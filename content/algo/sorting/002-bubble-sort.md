---
title: Exchange Sort: Bubble Sort
order: 2
---

# Bubble Sort: Sequential Exchange

**Bubble Sort** is a basic comparison-based sorting algorithm. It operates by repeatedly stepping through the list, comparing adjacent elements, and swapping them if they are in the incorrect order. This process is repeated until the entire list is sorted.

---

## 1. The Core Mechanism: Adjacent Swaps

The algorithm derives its name from the way larger elements "Bubble up" to the end of the array. 

1. **Pass 1**: Compare `arr[0]` and `arr[1]`. If `arr[0] > arr[1]`, swap them.
2. Repeat for every adjacent pair until the end of the array.
3. After the first pass, the largest element is guaranteed to be in its correct final position at the end.
4. **Subsequent Passes**: Repeat the process for the remaining $N-1$ elements, ignoring the already sorted elements at the end.

---

## 2. Complexity Analysis

| Scenario | Time Complexity | Space Complexity |
| :--- | :--- | :--- |
| **Best Case (Sorted)** | O(N) | O(1) |
| **Average Case** | O(N²) | O(1) |
| **Worst Case (Reverse)** | O(N²) | O(1) |

- **Space**: Bubble Sort is an **In-place** algorithm, meaning it requires only a constant amount O(1) of additional memory space.
- **Stability**: Bubble Sort is **Stable**. It does not change the relative order of equal elements because it only swaps when one element is strictly greater than the other.

---

## 3. The Optimized Implementation

A naive bubble sort always performs $N^2$ comparisons. An optimized version uses a `swapped` flag to detect if the array is already sorted, allowing for an early exit.

```javascript
function bubbleSort(arr) {
  let n = arr.length;
  for (let i = 0; i < n; i++) {
    let swapped = false;
    // Last i elements are already in place
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }
    if (!swapped) break; // Efficiency: Exit if no swaps occurred
  }
  return arr;
}
```

---

## 4. Interview Pro-Tips: Stability and Use Cases
- **Why ask about Bubble Sort?**: Interviewers use this to test your understanding of **Stability**. A stable sort is critical when sorting objects by multiple criteria (e.g., sorting users by "Last Name" and then by "First Name").
- **Best Case O(N)**: Always mention the `swapped` flag optimization. It demonstrates that you consider "Early Exit" scenarios in algorithm design.
- **The "Heavy" Elements**: You might be asked why "Large" elements move to the top quickly but "Small" elements (Turtles) move to the bottom slowly. This leads into more advanced topics like Cocktails Sort.

---

## Technical Summary
1. `Exchange`: The primary operation is swapping.
2. `O(N²)`: Inefficient for large datasets.
3. `In-place`: No additional memory required.
4. `Stable`: Preserves relative order of identical keys.
