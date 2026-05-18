---
title: Connectivity: Disjoint Set Union (DSU)
order: 13
---

A **Disjoint Set Union (DSU)**, also known as **Union-Find**, is a specialized data structure that tracks a set of elements partitioned into several non-overlapping (disjoint) subsets. It is most famous for its ability to handle "Connectivity" queries in near-constant time.

---

## 1. Core Operations

DSU relies on two primary operations:

1. **`Find(x)`**: Determines which subset $x$ belongs to. If $Find(x) == Find(y)$, then $x$ and $y$ are in the same component.
2. **`Union(x, y)`**: Joins the subsets containing $x$ and $y$ into a single subset.

---

## 2. Optimizations: The Key to Efficiency

A naive DSU implementation can have O(N) complexity for operations. Professional implementations use two critical optimizations to achieve near-constant performance.

### I. Path Compression
During a `Find(x)` operation, we modify the structure to make every node in the search path point directly to the root. This "flattens" the tree over time.

### II. Union by Rank/Size
When joining two trees, we always attach the **smaller** tree under the root of the **larger** tree. This prevents the formation of deep, skewed trees.

**Complexity**: With both optimizations, the operations have an **Amortized Complexity** of $O(α(N))$, where $α$ is the **Inverse Ackermann Function**. For all practical purposes in our universe ($N < 10^{80}$), $α(N) < 5$.

---

## 3. Practical Applications

1. **Cycle Detection**: Used in Kruskal's algorithm to determine if adding an edge to a Minimum Spanning Tree (MST) will create a cycle.
2. **Dynamic Connectivity**: Keeping track of disconnected components as edges are added to a graph.
3. **Image Processing**: Labelling connected components in a grid of pixels.
4. **Social Networks**: Determining if two users are part of the same extended social circle.

---

## 4. Implementation Snippet (Pseudo-Go)

```go
type DSU struct {
    parent []int
}

func (d *DSU) Find(i int) int {
    if d.parent[i] == i {
        return i
    }
    // Path Compression
    d.parent[i] = d.Find(d.parent[i])
    return d.parent[i]
}

func (d *DSU) Union(i, j int) {
    rootI := d.Find(i)
    rootJ := d.Find(j)
    if rootI != rootJ {
        d.parent[rootI] = rootJ // Simplified Union
    }
}
```

---

## Interview Pro-Tips: DSU vs. DFS/BFS
If an interviewer asks when to use DSU instead of standard traversals:
- **DFS/BFS**: Better for static graphs where you need to find paths or visit all nodes once.
- **DSU**: Better for **Dynamic** scenarios where the graph is changing (edges being added) and you need to answer "Are these two nodes connected?" repeatedly and quickly.

---

## Technical Summary
1. `Union-Find`: The common name for the data structure.
2. `Inverse Ackermann`: The mathematical proof of its extreme efficiency.
3. `Connectivity`: The primary problem DSU solves.
4. `MST`: Kruskal's algorithm is the most common real-world use case.
