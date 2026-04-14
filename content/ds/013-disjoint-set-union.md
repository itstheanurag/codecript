---
title: Disjoint Set Union (DSU)
order: 13
---

**Disjoint Set Union (DSU)**, also known as **Union-Find**, is a specialized data structure that keeps track of elements partitioned into several non-overlapping (disjoint) subsets. It is the "Magic" structure for connectivity problems.

---

## 1. The Intuition: "Merging Social Circles"

Imagine a **Party of Strangers**.
1. At the start, the room is full of individuals. Everyone is their own "group" of 1.
2. If Person A and Person B discover they share an interest, they "link up." Now they are ONE group.
3. If Person B later links with Person C, then Person A and Person C are now automatically in the same group, because they are connected through B.
4. DSU allows us to quickly answer two things:
    - **Union**: "Merge these two groups."
    - **Find**: "Is Person A in the same group as Person C?"

---

## 2. The Power-Up Optimizations

Without optimization, DSU can be slow. With these two tricks, it becomes **effectively constant time**:

### 1. Path Compression (The "Shortcut" Trick)
When you look for someone's Root (the group representative), you make everyone along the way point **directly** to that Root. This flattens the tree, making every future search for that group instant.

### 2. Union by Rank/Size (The "Attach to the Master" Trick)
When merging two groups, always attach the **smaller** group to the root of the **larger** one. This prevents the "tree" from becoming a long, slow line.

---

## 3. Key Operations & Complexity

| Operation | Complexity | Why? |
| :--- | :--- | :--- |
| **Find** | O(α(N)) | α(N) is the inverse Ackermann function (effectively constant). |
| **Union** | O(α(N)) | Just a Find + a pointer update. |

> [!NOTE]
> **α(N)** is so slow-growing that for any $n$ smaller than the number of atoms in the universe, it's **less than 5**. For all practical purposes, DSU is O(1).

---

## 4. Multi-Language Implementation (Optimized)

```language-code-tabs
[
  {
    "label": "Javascript",
    "language": "javascript",
    "code": "class DSU {\n  constructor(n) {\n    this.parent = Array.from({ length: n }, (_, i) => i);\n    this.rank = new Array(n).fill(0);\n  }\n\n  find(i) {\n    if (this.parent[i] === i) return i;\n    return (this.parent[i] = this.find(this.parent[i])); // Path Compression\n  }\n\n  union(i, j) {\n    let rootI = this.find(i);\n    let rootJ = this.find(j);\n    if (rootI !== rootJ) {\n      // Union by Rank\n      if (this.rank[rootI] < this.rank[rootJ]) this.parent[rootI] = rootJ;\n      else if (this.rank[rootI] > this.rank[rootJ]) this.parent[rootJ] = rootI;\n      else {\n        this.parent[rootI] = rootJ;\n        this.rank[rootJ]++;\n      }\n    }\n  }\n}"
  },
  {
    "label": "Python",
    "language": "python",
    "code": "class DSU:\n    def __init__(self, n):\n        self.parent = list(range(n))\n        self.rank = [0] * n\n\n    def find(self, i):\n        if self.parent[i] == i:\n            return i\n        self.parent[i] = self.find(self.parent[i]) # Path Compression\n        return self.parent[i]\n\n    def union(self, i, j):\n        root_i = self.find(i)\n        root_j = self.find(j)\n        if root_i != root_j:\n            if self.rank[root_i] < self.rank[root_j]:\n                self.parent[root_i] = root_j\n            elif self.rank[root_i] > self.rank[root_j]:\n                self.parent[root_j] = root_i\n            else:\n                self.parent[root_i] = root_j\n                self.rank[root_j] += 1"
  }
]
```

---

## 5. Interview Pro-Tips

### Look for "Connected Components"
If a problem asks "how many islands are there?" or "find the number of distinct groups," DSU is often the most efficient choice, especially if you can't use BFS/DFS easily.

### Cycle Detection in Undirected Graphs
If you try to `union(u, v)` and you find that `find(u) == find(v)` (they are already in the same group), adding an edge between them **creates a cycle**. This is how **Kruskal's Algorithm** for Minimum Spanning Trees works!

### The "Dynamic Connectivity" Signal
If the problem involves groups that are **merging over time** (e.g., "People are arriving at a party and shaking hands"), DSU is the perfect way to track connectivity in real-time.

### What Interviewers Are Testing
- Can you explain Path Compression and Union by Rank?
- Do you understand the Difference between DSU and BFS/DFS?
- Can you use DSU for cycle detection?

---

## Key Takeaway

DSU is one of the most elegant data structures in computer science. It solves complex connectivity problems with near-zero overhead, making it a "must-know" for competitive programming and high-end technical interviews.
