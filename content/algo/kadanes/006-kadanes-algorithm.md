---
title: Kadane's Algorithm
order: 6
---

Kadane's Algorithm is a legendary **Dynamic Programming** / **Greedy** technique used to find the **Maximum Subarray Sum** within a one-dimensional array of numbers.

---

## 1. The Problem

Given an array of integers (can include negative numbers), find the contiguous subarray (containing at least one number) which has the largest sum.

**Example**: `[-2, 1, -3, 4, -1, 2, 1, -5, 4]`
**Output**: `6` (The subarray is `[4, -1, 2, 1]`)

---

## 2. How it Works

The core idea is simple: at each position in the array, we decide whether to:
1.  **Extend** the current subarray.
2.  **Start a new** subarray at the current element.

We pick whichever gives a larger sum.

```mermaid
graph LR
    A[Start] --> B[Current Sum = arr[0]]
    B --> C[Max Sum = arr[0]]
    C --> Next{"Next Element?"}
    Next -- Yes --> Decision{"Extend or Restart?"}
    Decision -- Extend --> E[currSum += element]
    Decision -- Restart --> R[currSum = element]
    E & R --> Up["Update MaxSum if currSum > maxSum"]
    Up --> Next
    Next -- No --> End[Return MaxSum]
```

---

## 3. Complexity Analysis

| Scenario | Time Complexity | Space Complexity |
| :------- | :-------------- | :--------------- |
| **Best** | O(N)            | O(1)             |
| **Average** | O(N)         | O(1)             |
| **Worst** | O(N)           | O(1)             |

*Kadane's is the most optimal solution. A brute-force approach would take O(N^2).*

---

## 4. Implementation (Javascript)

```javascript
/**
 * Kadane's Algorithm Implementation
 * @param {number[]} nums
 * @returns {number} - Maximum subarray sum
 */
function maxSubArray(nums) {
  if (nums.length === 0) return 0;

  let maxSoFar = nums[0];
  let currentMax = nums[0];

  for (let i = 1; i < nums.length; i++) {
    // Decision: Should we start fresh or add to existing?
    currentMax = Math.max(nums[i], currentMax + nums[i]);
    
    // Update global maximum
    maxSoFar = Math.max(maxSoFar, currentMax);
  }

  return maxSoFar;
}

// Example:
console.log(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4])); // 6
```

---

## 5. Variations

-   **Maximum Product Subarray**: Similar logic, but you must track both the current `max` and current `min` (because two negatives can make a positive).
-   **Circular Subarray Sum**: Find the maximum sum in a circular array (wraps around). Hint: `max(kadane(arr), total_sum - kadane(-arr))`.
-   **Smallest Subarray Sum**: Simply flip the logic to find the minimum.

---

## 6. Interview Pro-Tips

### The Core Decision in One Line
At each index, ask: "Is it better to start fresh here, or extend the previous subarray?"
```javascript
currentMax = Math.max(nums[i], currentMax + nums[i]);
```
This single line *is* Kadane's algorithm. Memorize it cold.

### What If All Numbers Are Negative?
The algorithm handles this naturally — `maxSoFar` starts at `nums[0]`, so even in an all-negative array it returns the least negative element (the "maximum"). No special case needed.

### Tracking the Actual Subarray
If asked to return the subarray itself (not just the sum), track the start and end indices:
- Reset `start` index when you restart (i.e., when `nums[i] > currentMax + nums[i]`).
- Update `end` index whenever `currentMax > maxSoFar`.

### What Interviewers Are Testing
- Can you explain the "extend or restart" decision clearly?
- Do you handle all-negative arrays correctly?
- Can you extend Kadane's to the Max Product Subarray variant (tracking both min and max)?
- Do you know the O(N³) brute force → O(N²) prefix sums → O(N) Kadane's progression?

---

## Key Takeaway

Kadane's Algorithm turns a complex "Range" problem into a simple "State" problem. By only caring about the *previous best*, we can solve the entire array in a single pass.
