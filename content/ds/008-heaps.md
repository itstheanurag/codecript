---
title: Heaps
order: 8
---

A **Heap** is a specialized tree-based data structure that satisfies the **Heap Property**. It is the engine behind a **Priority Queue**, allowing you to always access the "most important" (minimum or maximum) element instantly.

---

## 1. The Intuition: "A Corporate Hierarchy"

Imagine a **Company**.
1. In a **Max-Heap**, the CEO (the **Root**) always has a higher salary than their direct reports (**Children**).
2. Those reports likewise have higher salaries than the people they manage.
3. No matter where you are in the company, if you look at your manager, they always earn more (or the same). (**Heap Property**)
4. To find the highest-paid person in the company, you only ever have to look at the top. (**O(1) Peek**)

---

## 2. Min-Heap vs. Max-Heap

| Type | Root Property | Use Case |
| :--- | :--- | :--- |
| **Min-Heap** | Root is the **Minimum** value. | Finding the shortest path (Dijkstra), minimum material cost. |
| **Max-Heap** | Root is the **Maximum** value. | Scheduling the highest-priority tasks, finding "Top K" items. |

---

## 3. Key Operations & Complexity

| Operation | Time Complexity | Why? |
| :--- | :--- | :--- |
| **Peek** | O(1) | The min/max is always at the root. |
| **Insert** | O(log n) | Add to the bottom and "bubble up" to the correct spot. |
| **Pop Root** | O(log n) | Move the last element to root and "bubble down." |
| **Build Heap** | O(n) | A mathematically optimized way to turn an array into a heap. |

---

## 4. Multi-Language Implementation (Standard Library)

```language-code-tabs
[
  {
    "label": "Javascript",
    "language": "javascript",
    "code": "// JS has no built-in Heap! Use a library or array + manual logic\nconst minHeap = []; // Handled with custom bubbles up/down logic"
  },
  {
    "label": "Python",
    "language": "python",
    "code": "import heapq\nheap = [] # Min-Heap by default\nheapq.heappush(heap, 10)\nmin_val = heapq.heappop(heap)\n\n# For Max-Heap, multiply values by -1"
  },
  {
    "label": "Java",
    "language": "java",
    "code": "// Min-Heap (Default)\nPriorityQueue<Integer> minHeap = new PriorityQueue<>();\n// Max-Heap\nPriorityQueue<Integer> maxHeap = new PriorityQueue<>(Collections.reverseOrder());"
  },
  {
    "label": "C++",
    "language": "cpp",
    "code": "#include <queue>\n// Max-Heap (Default)\nstd::priority_queue<int> maxHeap;\n// Min-Heap\nstd::priority_queue<int, vector<int>, greater<int>> minHeap;"
  }
]
```

---

## 5. Interview Pro-Tips

### Use Heaps for "Top K" Problems
Whenever you see a problem asking for the "Top K" largest or smallest items (e.g., "K closest points to origin"), a Heap is almost always the answer. Using a Heap of size $K$ allows you to find the answer in **O(n log K)** time instead of O(n log n) by sorting.

### Memorize the Array Implementation
Heaps are almost always stored in an **Array** rather than actual tree objects.
- For a node at index `i`:
- **Left Child**: `2 * i + 1`
- **Right Child**: `2 * i + 2`
- **Parent**: `Math.floor((i - 1) / 2)`
Interviewers love to see if you can navigate the tree structure using only array indices.

### The "Build Heap" complexity
This is a famous "Gotcha." Building a heap from an unsorted array of size $n$ takes **O(n)** time, not O(n log n). Knowing this shows you understand the math behind the sift-down approach.

### What Interviewers Are Testing
- Do you understand the difference between a Heap and a BST? (Heaps are *not* fully sorted!)
- Can you navigate a heap stored in an array?
- Do you know how to use a Heap to solve priority-based problems?

---

## Key Takeaway

Heaps are the **prioritizers** of data structures. They don't care about sorting everything perfectly—they only care about making sure the *most important* thing is always ready to go.
