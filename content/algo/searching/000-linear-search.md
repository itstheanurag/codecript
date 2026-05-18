---
title: Linear Search
order: 0
---

**Linear Search** is the most basic search algorithm. It works by checking every element of a list sequentially until the target element is found or the end of the list is reached.

---

## 1. The Core Mechanism

1. **Iterate**: Start from the first element of the array.
2. **Compare**: Check if the current element is equal to the target.
3. **Found**: If a match is found, return the index.
4. **Advance**: If not, move to the next index and repeat.
5. **Not Found**: If the loop completes without finding a match, return -1.

---

## 2. Complexity Analysis

| Scenario | Time Complexity | Space Complexity |
| :--- | :--- | :--- |
| **Best Case** | O(1) | O(1) |
| **Average Case** | O(N) | O(1) |
| **Worst Case** | O(N) | O(1) |

- **Best Case**: The target is at the very first index.
- **Worst Case**: The target is at the last index or does not exist in the array.

---

## 3. Implementation

```javascript
function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return i;
    }
  }
  return -1;
}
```

---

## 4. Characteristics and Use Cases

1. **Unsorted Data**: Linear search is the only option for searching through data that has no inherent order.
2. **Simplicity**: Extremely easy to implement and debug.
3. **Small Datasets**: On very small arrays (e.g., < 10 items), Linear Search can be faster than Binary Search due to its lower constant overhead (no mid-point calculations).
4. **Data Stream**: Useful when data is arriving in a stream and you need to find a value as it arrives.

---

## Interview Pro-Tips: Linear vs. Binary Search
- **The Tradeoff**: Always mention that while Linear Search is slower for large datasets ($O(N)$ vs $O(\log N)$), it requires **No Pre-processing**. Binary search requires the array to be sorted ($O(N \log N)$ cost if the array is unsorted).
- **Early Exit**: If you are searching in a **Sorted Array** using Linear Search, you can stop as soon as you see a value **Greater** than the target, which improves the average-case performance slightly.

---

## Technical Summary
1. `Sequential`: Checks every slot one-by-one.
2. `Brute Force`: The simplest search approach.
3. `Universal`: Works on any data, regardless of order.
4. `O(N)`: Performance decreases linearly with dataset size.
