---
title: Union Find (Disjoint Set)
order: 16
---

**Union-Find**, also known as **Disjoint Set Union (DSU)**, is a specialized data structure that keeps track of elements partitioned into several non-overlapping (disjoint) subsets.

---

## 1. The Intuition: "Social Networks"

Imagine a room full of strangers.
1. At the start, everyone is their own "group" of 1.
2. If Person A and Person B realize they have the same hobby, they "link up." Now they are ONE group.
3. If Person B later links with Person C, then Person A and Person C are now automatically in the same group, because they are connected through B.

Union-Find allows us to quickly answer two questions:
- **Union**: "Can we merge these two groups?"
- **Find**: "Is Person A in the same group as Person C?"

---

## 2. How we go about it: Paths and Roots

Instead of storing groups in lists, we store them as **Trees**.
- Every person points to a **"Parent."**
- The person at the very top of the tree is the **"Root"** (the group representative).
- If two people have the same Root, they are in the same group!

### The Two Power-Up Optimizations:

1.  **Path Compression (Find)**: When you look for someone's Root, make everyone along the way point *directly* to the Root. This flattens the tree and makes future searches instant.
2.  **Union by Rank/Size (Union)**: When merging two trees, always attach the shorter tree under the root of the taller one. This prevents the tree from becoming a long, slow line.

---

## 3. Complexity Analysis

With both optimizations, Union-Find is legendarily fast.

| Operation | Time Complexity | Note |
| :------- | :-------------- | :--- |
| **Union** | O(α(N))         | Almost O(1) |
| **Find**  | O(α(N))         | Almost O(1) |

> **α(N)** is the Inverse Ackermann function. For any value of N smaller than the number of atoms in the universe, α(N) is **less than 5**. It is functionally constant time.

---

## 4. Multi-Language Implementation

```language-code-tabs
[
  {
    "label": "Javascript",
    "language": "javascript",
    "code": "class UnionFind {\n    constructor(n) {\n        this.parent = Array.from({ length: n }, (_, i) => i);\n        this.rank = new Array(n).fill(1);\n    }\n\n    find(i) {\n        if (this.parent[i] === i) return i;\n        // Path Compression\n        return this.parent[i] = this.find(this.parent[i]);\n    }\n\n    union(i, j) {\n        let rootI = this.find(i);\n        let rootJ = this.find(j);\n\n        if (rootI != rootJ) {\n            // Union by Rank\n            if (this.rank[rootI] < this.rank[rootJ]) {\n                this.parent[rootI] = rootJ;\n            } else if (this.rank[rootI] > this.rank[rootJ]) {\n                this.parent[rootJ] = rootI;\n            } else {\n                this.parent[rootI] = rootJ;\n                this.rank[rootJ]++;\n            }\n            return true;\n        }\n        return false;\n    }\n}"
  },
  {
    "label": "Python",
    "language": "python",
    "code": "class UnionFind:\n    def __init__(self, n):\n        self.parent = list(range(n))\n        self.rank = [1] * n\n\n    def find(self, i):\n        if self.parent[i] == i:\n            return i\n        # Path Compression\n        self.parent[i] = self.find(self.parent[i])\n        return self.parent[i]\n\n    def union(self, i, j):\n        root_i = self.find(i)\n        root_j = self.find(j)\n        if root_i != root_j:\n            if self.rank[root_i] < self.rank[root_j]:\n                self.parent[root_i] = root_j\n            elif self.rank[root_i] > self.rank[root_j]:\n                self.parent[root_j] = root_i\n            else:\n                self.parent[root_i] = root_j\n                self.rank[root_j] += 1\n            return True\n        return False"
  },
  {
    "label": "Java",
    "language": "java",
    "code": "class UnionFind {\n    int[] parent, rank;\n    public UnionFind(int n) {\n        parent = new int[n];\n        rank = new int[n];\n        for (int i = 0; i < n; i++) parent[i] = i;\n    }\n\n    public int find(int i) {\n        if (parent[i] == i) return i;\n        return parent[i] = find(parent[i]); // Path compression\n    }\n\n    public boolean union(int i, int j) {\n        int rootI = find(i);\n        int rootJ = find(j);\n        if (rootI != rootJ) {\n            if (rank[rootI] < rank[rootJ]) parent[rootI] = rootJ;\n            else if (rank[rootI] > rank[rootJ]) parent[rootJ] = rootI;\n            else {\n                parent[rootI] = rootJ;\n                rank[rootJ]++;\n            }\n            return true;\n        }\n        return false;\n    }\n}"
  }
]
```

---

## 5. Why use it?

- **Connectivity**: Can Computer A send a packet to Computer B?
- **Cycle Detection**: In an undirected graph, if you try to `union(A, B)` and they already share the same root, you just found a cycle!
- **Image Processing**: Finding "connected components" of pixels in a digital image.

---

## 6. Interview Pro-Tips

### Always Use Both Optimisations Together
Path Compression alone reduces Find to near O(1). Union by Rank alone keeps trees shallow. **Together**, they give the legendary O(α(N)) — effectively constant time. In interviews, always state both optimisations by name to show you know the full solution.

### Cycle Detection in Undirected Graphs
The trick is simple: when you try to `union(u, v)`, if `find(u) === find(v)` (they already share the same root), adding edge `u-v` would create a cycle. This is the cleanest cycle-detection approach for undirected graphs and is used in Kruskal's MST algorithm.

### Connected Components Count
Initialise a `count = n` (one component per node). Every time `union` successfully merges two groups (returns `true`), decrement `count`. At the end, `count` is the number of connected components. This is used in "Number of Islands" (treating each cell as a node) and similar problems.

### What Interviewers Are Testing
- Can you implement `find` with path compression?
- Can you implement `union` with rank/size?
- Do you know the amortized complexity?
- Can you apply Union-Find to cycle detection or connected components counting?

---

## Key Takeaway

Union-Find is a "Magic" data structure. It manages groups and connectivity with near-perfect performance, making it the go-to tool for any problem involving **merging and sets**.
