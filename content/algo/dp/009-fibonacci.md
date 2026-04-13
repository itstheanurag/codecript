---
title: Fibonacci (Dynamic Programming)
order: 9
---

The **Fibonacci Sequence** is the classic "Hello World" of Dynamic Programming. It perfectly demonstrates how we can turn a slow, exponential recursive algorithm into a fast, linear one.

---

## 1. The Intuition: "Those who forget the past..."

Imagine you are calculating the 5th Fibonacci number.
To find $F(5)$, you need $F(4)$ and $F(3)$. 
To find $F(4)$, you need $F(3)$ and $F(2)$. 

Notice that you are calculating **$F(3)$** multiple times! In fact, as $N$ grows, you end up recalculating the same "sub-problems" billions of times.

Dynamic Programming is simply **remembering** the answers to sub-problems so we never have to calculate them twice.

---

## 2. Four Stages of Optimization

### Stage 1: Naive (Slow)
Pure recursion with no memory. 
- **Time**: $O(2^N)$
- **Issue**: Redundant work.

### Stage 2: Memoization (Top-Down)
Recursion + a "memo" (dictionary/array). 
- **Check**: Before calculating $F(N)$, check if it's already in the memo.
- **Time**: $O(N)$
- **Issue**: Recursion stack depth.

### Stage 3: Tabulation (Bottom-Up)
Iterative approach. Fill an array from 0 up to $N$.
- **Time**: $O(N)$
- **Space**: $O(N)$

### Stage 4: Space Optimized (Perfect)
Only keep track of the **last two** numbers.
- **Time**: $O(N)$
- **Space**: $O(1)$

---

## 3. Complexity Comparison

| Method | Time | Space | Note |
| :------- | :--- | :---- | :--- |
| **Naive** | O(2^N) | O(N) | Practically unusable for N > 40 |
| **Memoization**| O(N) | O(N) | Easy to implement via recursion |
| **Tabulation** | O(N) | O(N) | Iterative, no stack overflow |
| **Optimized** | O(N) | O(1) | **Industry Standard** |

---

## 4. Multi-Language Implementation (Optimized)

```language-code-tabs
[
  {
    "label": "Javascript",
    "language": "javascript",
    "code": "function fib(n) {\n    if (n <= 1) return n;\n    let prev2 = 0, prev1 = 1;\n    \n    for (let i = 2; i <= n; i++) {\n        let current = prev1 + prev2;\n        prev2 = prev1;\n        prev1 = current;\n    }\n    return prev1;\n}"
  },
  {
    "label": "Python",
    "language": "python",
    "code": "def fib(n):\n    if n <= 1: return n\n    a, b = 0, 1\n    for _ in range(2, n + 1):\n        a, b = b, a + b\n    return b"
  },
  {
    "label": "Java",
    "language": "java",
    "code": "class Solution {\n    public int fib(int n) {\n        if (n <= 1) return n;\n        int prev2 = 0, prev1 = 1;\n        for (int i = 2; i <= n; i++) {\n            int curr = prev1 + prev2;\n            prev2 = prev1;\n            prev1 = curr;\n        }\n        return prev1;\n    }\n}"
  }
]
```

---

## Key Takeaway

Fibonacci illustrates the two core requirements for DP:
1.  **Overlapping Subproblems**: You calculate the same thing many times.
2.  **Optimal Substructure**: The answer to a big problem ($F(5)$) can be built from the answers to smaller ones ($F(4)$ and $F(3)$).
