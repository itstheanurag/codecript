---
title: Dynamic Programming
order: 3
---

Dynamic programming (DP) solves problems by breaking them into overlapping subproblems and storing the results to avoid redundant computation.

## When to Use DP

A problem is a DP candidate if it has:

1. **Optimal substructure** — the optimal solution contains optimal solutions to subproblems
2. **Overlapping subproblems** — the same subproblems are solved multiple times

## Top-Down (Memoization)

Start with the original problem and recursively break it down. Cache results.

```javascript
const memo = {};
function fib(n) {
  if (n <= 1) return n;
  if (memo[n]) return memo[n];
  memo[n] = fib(n - 1) + fib(n - 2);
  return memo[n];
}
```

## Bottom-Up (Tabulation)

Build solutions from the smallest subproblems upward.

```javascript
function fib(n) {
  const dp = [0, 1];
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n];
}
```

## Classic Problems

- Fibonacci, Climbing Stairs
- 0/1 Knapsack
- Longest Common Subsequence
- Coin Change
- Edit Distance

## Tips

- Draw the recursion tree to identify overlapping subproblems
- Start with brute-force recursion, then add memoization
- Optimize space by only keeping the last few states
