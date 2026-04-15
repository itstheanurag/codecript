---
title: Logical Ordering: Topological Sort
order: 15
---

# Dependency Resolution: Topological Sort

**Topological Sort** is a linear ordering of vertices in a **Directed Acyclic Graph (DAG)** such that for every directed edge $uv$, vertex $u$ comes before $v$ in the ordering. This is the foundational algorithm for dependency resolution in build systems (like Make or Webpack) and task scheduling.

---

## 1. Requirement: DAG (No Cycles)

Topological Sort is **only** possible if the graph is a DAG.
- If there is a **Cycle** (e.g., A depends on B, and B depends on A), there is no valid linear ordering.
- **Interviewer Tip**: Topological Sort algorithms are often used as a way to **detect cycles** in a directed graph.

---

## 2. Algorithms for Topological Sort

### I. Kahn’s Algorithm (BFS-based)
This algorithm uses the concept of **In-degree** (the number of edges pointing to a node).
1. Calculate the in-degree of every vertex.
2. Add all vertices with in-degree 0 to a **Queue**.
3. While the queue is not empty:
   - Dequeue vertex $u$ and add it to the result.
   - For every neighbor $v$ of $u$, decrement its in-degree.
   - If $v$'s in-degree becomes 0, add it to the queue.
- **Fail Check**: If the result size is less than the total number of vertices, a cycle was detected.

### II. DFS-based Algorithm
1. Perform a Depth-First Search on the graph.
2. When a node’s neighbors have been fully explored (it is "Finished"), push it onto a **Stack**.
3. After exploring all nodes, the stack (when popped) provides the topological order.

---

## 3. Complexity Analysis

| Metric | Complexity | Description |
| :--- | :--- | :--- |
| **Time** | O(V + E) | Every vertex and edge is processed exactly once. |
| **Space** | O(V) | To store in-degrees and the queue/stack. |

---

## 4. Practical Applications

1. **Package Managers**: Determining the order to install `npm` or `pip` packages so dependencies are met.
2. **Build Systems**: Compiling source files in the correct sequence.
3. **Course Prerequisites**: Finding a valid sequence of university courses.
4. **Data Pipelines**: Executing data transformation steps where some steps depend on the output of others.

---

## Interview Pro-Tips: Kahn's vs. DFS
If an interviewer asks which one is better:
- **Kahn's Algorithm**: Superior for **Cycle Detection** because it explicitly counts the vertices processed. It is also easier to implement iteratively.
- **DFS**: More elegant and concise if you are already comfortable with recursion, but harder to detect cycles without using "Color Coding" (White/Gray/Black node states).

---

## Technical Summary
1. `Linear Order`: Satisfying all predecessor constraints.
2. `In-degree`: The number of remaining dependencies for a node.
3. `DAG`: The only type of graph where this sort is defined.
4. `O(V+E)`: Highly efficient linear time performance.
