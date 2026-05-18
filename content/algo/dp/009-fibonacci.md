---
title: Dynamic Programming: Fibonacci
order: 9
---

The Fibonacci sequence is the classic introduction to **Dynamic Programming (DP)**. It perfectly demonstrates how a problem can be broken down into over-lapping sub-problems, and how "Remembering" previous results can transform exponential time complexity into linear time.

---

## 1. Top-Down Approach (Memoization)

In a naive recursive approach, calculating `fib(5)` requires calculating `fib(4)` and `fib(3)`. However, `fib(4)` *also* requires calculating `fib(3)`. This redundant work leads to an **O(2^N)** complexity.

**Memoization** solves this by storing the result of each calculation in a "Memo" (usually a hash map or array) and looking it up before performing any work.

```javascript
function fib(n, memo = {}) {
  if (n <= 1) return n;
  if (memo[n]) return memo[n];
  
  memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
  return memo[n];
}
```
**Complexity**: O(N) Time, O(N) Space (Recursion Stack + Memo).

---

## 2. Bottom-Up Approach (Tabulation)

Tabulation avoids recursion entirely. It starts from the smallest sub-problems (`fib(0)` and `fib(1)`) and "fills a table" until it reaches the target.

```javascript
function fib(n) {
  if (n <= 1) return n;
  let table = new Array(n + 1).fill(0);
  table[1] = 1;

  for (let i = 2; i <= n; i++) {
    table[i] = table[i - 1] + table[i - 2];
  }
  return table[n];
}
```
**Complexity**: O(N) Time, O(N) Space.

---

## 3. Space Optimization (Iterative)

Since we only ever need the **Last Two Values** to calculate the next Fibonacci number, we can reduce the space complexity from O(N) to O(1).

```javascript
function fib(n) {
  if (n <= 1) return n;
  let prev = 0, curr = 1;

  for (let i = 2; i <= n; i++) {
    let next = prev + curr;
    prev = curr;
    curr = next;
  }
  return curr;
}
```
**Complexity**: O(N) Time, **O(1) Space**.

---

## 4. Complexity Comparison

| Method | Time Complexity | Space Complexity |
| :--- | :--- | :--- |
| **Naive Recursion** | O(2^N) | O(N) |
| **Memoization** | O(N) | O(N) |
| **Tabulation** | O(N) | O(N) |
| **Iterative** | O(N) | O(1) |

---

## Interview Pro-Tips: Identifying DP
- **The Signal**: If a problem asks for "The number of ways..." or "The maximum/minimum of something," and you notice that solving a larger problem depends on the answers to smaller versions of the **same problem**, think DP.
- **Overlapping Subproblems**: If you were to draw a recursion tree and see the same function call happening multiple times (e.g., `f(3)` appearing in multiple branches), Memoization will drastically improve your performance.

---

## Technical Summary
1. `Overlap`: Reusing results of identical sub-problems.
2. `Top-Down`: Solving from the target back to the base case (Memoization).
3. `Bottom-Up`: Solving from the base case forward to the target (Tabulation).
4. `Tabulation`: Generally preferred in performance-critical code to avoid recursion overhead.
