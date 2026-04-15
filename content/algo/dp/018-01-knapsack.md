---
title: The 0/1 Knapsack Problem
order: 18
---

# Combinatorial Optimization: 0/1 Knapsack

The **0/1 Knapsack Problem** is a fundamental problem in combinatorial optimization. Given a set of items, each with a weight and a value, determine the number of each item to include in a collection so that the total weight is less than or equal to a given limit and the total value is as large as possible.

The "0/1" indicates that you cannot break an item; you either take it in its entirety or leave it behind.

---

## 1. Defining the State

To solve this using Dynamic Programming, we define a 2D table `dp[i][w]` where:
- `i` represents the first `i` items considered.
- `w` represents the maximum weight capacity of the knapsack.
- `dp[i][w]` is the **Maximum Value** that can be achieved using a subset of the first `i` items with a total weight no greater than `w`.

---

## 2. The Recurrence Relation

For each item `i` with weight `wi` and value `vi`:

1. **Option 1: Exclude the item**: The value remains the same as for the first `i-1` items at the same weight: `dp[i-1][w]`.
2. **Option 2: Include the item**: Add its value to the maximum value possible for the remaining weight: `vi + dp[i-1][w - wi]`. (This is only possible if `wi <= w`).

**The Decision**: `dp[i][w] = max(Option 1, Option 2)`

---

## 3. Complexity Analysis

| Metric | Complexity | Description |
| :--- | :--- | :--- |
| **Time** | O(N * W) | Where N is the number of items and W is the capacity. |
| **Space** | O(N * W) | To store the 2D results table. |
| **Space (Optimized)** | O(W) | Using a single 1D array by iterating backwards. |

---

## 4. Implementation (Space Optimized)

```javascript
function knapsack(weights, values, capacity) {
  let n = weights.length;
  let dp = new Array(capacity + 1).fill(0);

  for (let i = 0; i < n; i++) {
    // Iterate backwards to avoid using the same item multiple times
    for (let w = capacity; w >= weights[i]; w--) {
      dp[w] = Math.max(dp[w], values[i] + dp[w - weights[i]]);
    }
  }
  return dp[capacity];
}
```

---

## 5. Interview Pro-Tips: Why iterate backwards?
If an interviewer asks why the 1D space optimization requires iterating backwards through the weights:
- **The Answer**: In 0/1 Knapsack, you can only use each item **once**. If you iterated forwards, you would calculate `dp[w]` using a value of `dp[w - weights[i]]` that has *already* been updated for the current item `i` in the same pass. This would accidentally model the **Unbounded Knapsack** problem (where you can take infinite copies of an item). Iterating backwards ensures you are always referencing results from the **Previous** item's pass.

---

## Technical Summary
1. `Decision`: To take or not to take.
2. `Pseudo-Polynomial`: The complexity O(N*W) depends on the numeric value of the capacity, not just the number of items.
3. `Overlapping`: Many weight combinations lead to the same sub-problems.
4. `Backwards Iteration`: The key to 1D space optimization.
