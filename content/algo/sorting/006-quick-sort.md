---
title: Partition Sort: Quick Sort
order: 6
---

# Quick Sort: In-Place Partitioning

**Quick Sort** is a highly efficient, comparison-based sorting algorithm that uses a Divide and Conquer strategy. While it has a worse theoretical worst-case performance than Merge Sort, in practice it is often **faster** due to its low constant factors and superior cache locality.

---

## 1. The Core Mechanism: Partitioning

The heart of Quick Sort is the "Partition" operation.

1. **Pick a Pivot**: Choose an element from the array (e.g., the last element).
2. **Partition**: Reorder the array so that all elements **smaller** than the pivot are on the left, and all elements **larger** are on the right.
3. **Recurse**: Apply the same logic to the left and right sub-arrays independently.

---

## 2. Complexity Analysis

| Scenario | Time Complexity | Space Complexity |
| :--- | :--- | :--- |
| **Best Case** | O(N log N) | O(log N) |
| **Average Case** | O(N log N) | O(log N) |
| **Worst Case** | O(N²) | O(log N) |

- **Worst Case Scenario**: This occurs when the pivot is consistently the smallest or largest element (e.g., sorting an already sorted array with the last element as the pivot).
- **Space Complexity**: Quick Sort is an **In-place** algorithm. It requires O(log N) space purely for the **Recursion Stack**, but it does not require an auxiliary array like Merge Sort.
- **Stability**: Standard Quick Sort is **Unstable**.

---

## 3. Implementation (Lomuto Partition)

```javascript
function quickSort(arr, low = 0, high = arr.length - 1) {
    if (low < high) {
        let pIdx = partition(arr, low, high);
        quickSort(arr, low, pIdx - 1);
        quickSort(arr, pIdx + 1, high);
    }
    return arr;
}

function partition(arr, low, high) {
    let pivot = arr[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    return i + 1;
}
```

---

## 4. Interview Pro-Tips: Optimizing the Pivot
A common follow-up question: **"How do you prevent the O(N²) worst case?"**
- **The Answer**: Use a better pivot selection strategy.
    1. **Randomized QuickSort**: Pick a random element as the pivot. The probability of consistently picking the worst pivot is mathematically negligible.
    2. **Median-of-Three**: Pick the median of the first, middle, and last elements. This usually results in more balanced partitions.
- **Hybrid Approach**: Switch to Heapsort if the recursion depth becomes too great (this is called **Introsort**).

---

## Technical Summary
1. `Partition`: The single most important operation.
2. `Pivot`: The variable that determines the efficiency of the split.
3. `In-Place`: Superior memory efficiency compared to Merge Sort.
4. `Unstable`: Choosing efficiency over stability.
