---
title: Maximum Subarray: Kadane's Algorithm
order: 6
---

# Optimal Subarray Sum: Kadane's Algorithm

**Kadane's Algorithm** is an efficient dynamic programming technique used to solve the **Maximum Subarray Sum** problem. Given a one-dimensional array of numbers, the goal is to find the contiguous subarray that has the largest sum.

---

## 1. The Core Logic: Extend or Restart

At every index $i$ in the array, the algorithm makes a binary decision:
1. **Extend**: Add the current element to the maximum subarray ending at $i-1$.
2. **Restart**: Ignore the previous subarray and start a new one beginning at the current element.

**The Recurrence Relation**: 
$LocalMax[i] = max(arr[i], arr[i] + LocalMax[i-1])$

The global maximum is simply the maximum of all $LocalMax$ values encountered during the single pass.

---

## 2. Complexity Analysis

| Scenario | Time Complexity | Space Complexity |
| :--- | :--- | :--- |
| **All Scenarios** | O(N) | O(1) |

- **Time**: The algorithm processes each element exactly once.
- **Space**: Kadane's is O(1) because it only needs to store two variables: the "Current Maximum" and the "Global Maximum." No auxiliary arrays are required.

---

## 3. Implementation

```javascript
function maxSubArray(nums) {
  if (nums.length === 0) return 0;

  // Initialize both to the first element
  let globalMax = nums[0];
  let localMax = nums[0];

  for (let i = 1; i < nums.length; i++) {
    // Core Decision: Extend or Restart
    localMax = Math.max(nums[i], localMax + nums[i]);
    
    // Update global result
    if (localMax > globalMax) {
      globalMax = localMax;
    }
  }

  return globalMax;
}
```

---

## 4. Variations to Know

- **Max Product Subarray**: Finding the contiguous subarray with the largest product. This requires tracking both a `localMax` and a `localMin` because two negative numbers can produce a positive product.
- **Circular Subarray Sum**: Finding the maximum sum where the array can wrap around the end. This is solved by taking the maximum of `Kadane(arr)` and `TotalSum - Kadane(invertedArr)`.

---

## 5. Interview Pro-Tips: Edge Cases
- **All-Negative Arrays**: If the array consists entirely of negative numbers, Kadane's will correctly return the "least negative" (maximum) single element.
- **Empty Array**: Always clarify with the interviewer whether an empty array is possible and what it should return ($0$ or an error).
- **Subarray Bounds**: If you are asked to return the **Indices** of the subarray rather than just the sum, you must update a `start` and `end` variable whenever you "Restart" the local maximum or update the global maximum.

---

## Technical Summary
1. `Greedy/DP`: Kadane's represents a greedy choice (local optimization) that solves a DP problem (global optimization).
2. `Single Pass`: Optimal linear time performance.
3. `O(1) Space`: Minimal memory footprint.
4. `Contiguous`: Only works for contiguous elements; for non-contiguous unique elements, use a Greedy approach or a different DP state.
