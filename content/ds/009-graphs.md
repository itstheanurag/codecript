---
title: Relational Models: Graphs
order: 9
---

# Graphs: Modeling Complex Relationships

A **Graph** is a non-linear data structure consisting of **Vertices** (Nodes) and **Edges** (Connections between nodes). Graphs are the most versatile data structure, capable of modeling everything from social networks and maps to dependency trees and recommendation engines.

---

## 1. Key Classifications

- **Directed (Digraph) vs. Undirected**: Does the edge have a specific direction (A → B)?
- **Weighted vs. Unweighted**: Does the edge have a cost, distance, or "Weight" associated with it?
- **Cyclic vs. Acyclic**: Can you start at a node and follow a path back to itself? (A Directed Acyclic Graph, or **DAG**, is a critical concept in build systems and task scheduling).

---

## 2. Representations in Memory

Choosing the right representation depends on the **Densitity** of the graph (the ratio of edges to vertices).

### I. Adjacency Matrix
A 2D array where `matrix[i][j] = 1` if an edge exists between node $i$ and node $j$.
- **Pros**: O(1) time to check if an edge exists.
- **Cons**: O(V²) space complexity. Very wasteful for "Sparse" graphs where most nodes are not connected.

### II. Adjacency List
An array of lists, where `list[i]` contains all neighbors of node $i$.
- **Pros**: O(V + E) space complexity; highly efficient for sparse graphs. This is the industry standard for most applications.
- **Cons**: O(V) time to check if a specific edge exists (must scan the list).

---

## 3. Fundamental Traversals

### I. Breadth-First Search (BFS)
Explores level-by-level using a **Queue**.
- **Use Case**: Finding the **Shortest Path** in an unweighted graph.

### II. Depth-First Search (DFS)
Explores as deep as possible along each branch before backtracking using a **Stack** (or Recursion).
- **Use Case**: Detecting cycles, topological sorting, and pathfinding.

---

## 4. Complexity Summary

| Operation | Adjacency List | Adjacency Matrix |
| :--- | :--- | :--- |
| **Space** | O(V + E) | O(V²) |
| **Add Vertex** | O(1) | O(V²) |
| **Add Edge** | O(1) | O(1) |
| **Check Edge** | O(V) | O(1) |
| **Traversal** | O(V + E) | O(V²) |

---

## Interview Pro-Tips: Topological Sort
A frequent Graph interview question: **"How do you determine the order of tasks that have dependencies?"**
- **The Answer**: **Topological Sort**. This only works on **Directed Acyclic Graphs (DAGs)**. Use DFS to find the finishing times of nodes and reverse the result, or use **Kahn’s Algorithm** (BFS with in-degrees). If the algorithm finds a cycle, the tasks cannot be ordered.

---

## Technical Summary
1. `Vertices/Edges`: The atoms of connectivity.
2. `Density`: Determines whether to use a Matrix or a List.
3. `DAG`: The foundation of modern task scheduling and CI/CD pipelines.
4. `BFS/DFS`: The two ways to navigate the relationship web.
