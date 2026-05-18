---
title: Logarithmic Search: Binary Search
order: 1
---

**Binary Search** is an extremely efficient algorithm for finding an item from a **Sorted** dataset. It follows the Divide and Conquer strategy, repeatedly halving the search space by comparing the target value to the middle element of the array.

---

## 1. Requirement: The Monotonic Property

For Binary Search to function, the input must be **Ordered** (Sorted). Without this property, it is impossible to determine whether the target resides in the left or right half of the current range.

---

## 2. The Core Mechanism

1. **Initialize**: Set two pointers, `left` (index 0) and `right` (index N-1).
2. **Calculate Mid**: Determine the middle index: `mid = left + (right - left) / 2`.
3. **Evaluate**:
    - If `target == arr[mid]`: Search is complete.
    - If `target < arr[mid]`: The target must be in the left segment. Set `right = mid - 1`.
    - If `target > arr[mid]`: The target must be in the right segment. Set `left = mid + 1`.
4. **Repeat**: Continue until `left > right` (Target not found).

---

## 3. Complexity Analysis

| Scenario | Time Complexity | Space Complexity |
| :--- | :--- | :--- |
| **Best Case** | O(1) | O(1) |
| **Average Case** | O(log N) | O(1) |
| **Worst Case** | O(log N) | O(1) |

- **Logarithmic Advantage**: Binary search reduces the search space by half at every step. Even for a dataset of $2^{30}$ items (over 1 billion), Binary Search will find the target in at most 30 steps.

---

## 4. Implementation

```javascript
function binarySearch(nums, target) {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    // Standard approach to prevent integer overflow
    let mid = left + Math.floor((right - left) / 2);
    
    if (nums[mid] === target) return mid;
    
    if (nums[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return -1;
}
```

---

## 5. Advanced Patterns

### I. Find First / Last Occurrence
In a sorted array with duplicates, finding the **First** occurrence requires an additional check: when `target == arr[mid]`, you must store the index and continue searching the **Left** half (`right = mid - 1`) to see if an even earlier match exists.

### II. Binary Search on the Answer Space
This is a critical interview pattern. Instead of searching an array, you binary search on a **Range of Possible Answers**. Example: "Finding the minimum weight capacity required to ship K items in D days."

---

## 6. Interview Pro-Tips: Edge Cases
- **The Overflow Trap**: In languages with fixed-size integers (Java/C++), `(left + right) / 2` can overflow. Always use `left + (right - left) / 2`.
- **Termination Condition**: Ensure you use `left <= right` in the loop condition to avoid missing the middle element in a single-item range.
- **Search Space Reduction**: If you are asked to find an element in a **Rotated Sorted Array**, you can still use Binary Search by determining at each step which half of the array is "Normal" (sorted) and which half contains the "Pivot."

---

## Technical Summary
1. `Sorted`: The immutable requirement for Binary Search.
2. `Logarithmic`: Performance that scales incredibly well with data size.
3. `Middle Index`: The point of deduction.
4. `Pointers`: Dynamically shrinking the search boundaries.
