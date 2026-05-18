---
title: Shortest Path: Dijkstra's Algorithm
order: 14
---

**Dijkstra's Algorithm** is a greedy algorithm used to find the shortest path from a single source vertex to all other vertices in a **Weighted Graph**. It is the foundation for network routing protocols (OSI Layer 3) and map-based navigation systems.

---

## 1. Requirement: Non-Negative Weights

**CRITICAL**: Dijkstra's algorithm only works correctly on graphs where all edge weights are **Non-Negative**. 
- **The Reason**: The greedy logic assumes that adding an edge to a path can only make it "longer." If negative weights exist, a longer path could eventually become shorter, breaking the core invariant. (For negative weights, use the **Bellman-Ford** algorithm).

---

## 2. The Core Mechanism: Relaxation

The algorithm maintains a "Shortest Distance" estimates for all nodes, initialized to Infinity. It then repeatedly:
1. **Select**: Pick the unvisited node with the smallest distance estimate.
2. **Relax**: For all neighbors of this node, check if the path through the current node is shorter than the neighbor's current estimate.
3. **Update**: If it is shorter, update the neighbor's estimate.

---

## 3. Complexity Analysis

Efficiency depends on the data structure used to find the "Minimum Distance" node.

| Implementation | Time Complexity | Use Case |
| :--- | :--- | :--- |
| **Array** | O(V²) | Dense graphs (many edges). |
| **Priority Queue (Min-Heap)** | O((V + E) log V) | Sparse graphs (Standard industry approach). |
| **Fibonacci Heap** | O(E + V log V) | Theoretical optimum (rarely used in practice). |

---

## 4. Implementation (Priority Queue)

```javascript
function dijkstra(graph, startNode) {
    let distances = {};
    let pq = new PriorityQueue(); // Min-Heap

    for (let node in graph) {
        distances[node] = Infinity;
    }
    distances[startNode] = 0;
    pq.enqueue(startNode, 0);

    while (!pq.isEmpty()) {
        let { node: u, priority: dist } = pq.dequeue();

        if (dist > distances[u]) continue; // Optimization: Skip stale values

        for (let neighbor in graph[u]) {
            let weight = graph[u][neighbor];
            let newDist = distances[u] + weight;

            if (newDist < distances[neighbor]) { // RELAXATION
                distances[neighbor] = newDist;
                pq.enqueue(neighbor, newDist);
            }
        }
    }
    return distances;
}
```

---

## 5. Interview Pro-Tips: Comparison with BFS
- **Equality of Weights**: If all edge weights are identical (e.g., all 1), Dijkstra's algorithm becomes exactly **Breadth-First Search (BFS)**. Using a more complex Priority Queue in an unweighted graph is inefficient.
- **Shortest Path to One Node**: If you only need the shortest path to a single target node (not all nodes), you can stop the algorithm as soon as you dequeue that target node from the Priority Queue.
- **A\* Search**: Mention that A* is essentially Dijkstra's plus a "Heuristic" (an estimation of the remaining distance) to bias the search towards the goal.

---

## Technical Summary
1. `Greedy`: Always processing the closest known node.
2. `Relaxation`: Updating neighbors based on better paths.
3. `Min-Heap`: The engine that makes the algorithm efficient for sparse graphs.
4. `Non-Negative`: The fundamental constraint for algorithm correctness.
