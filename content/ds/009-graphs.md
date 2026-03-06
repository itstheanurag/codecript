---
title: Graphs
order: 9
---

A **Graph** is a non-linear data structure consisting of **Vertices** (nodes) connected by **Edges**. Graphs are incredibly flexible and can represent everything from social networks to city maps.

![Pencil sketch of a Graph data structure](/home/gaurav/.gemini/antigravity/brain/0301a085-3412-430f-ae50-3c32dc593579/graphs_ds_sketch_retry_1772819793960.png)

## 1. Representation (Adjacency List)

The most common way to store a graph is an **Adjacency List**, where each vertex maintains a list of the vertices it is connected to.

---

## 2. Multi-Language Implementations

```java
import java.util.*;
Map<Integer, List<Integer>> adjList = new HashMap<>();
public void addEdge(int u, int v) {
    adjList.computeIfAbsent(u, k -> new ArrayList<>()).add(v);
}
```

```cpp
#include <vector>
#include <unordered_map>
std::unordered_map<int, std::vector<int>> adjList;
void addEdge(int u, int v) {
    adjList[u].push_back(v);
}
```

```python
from collections import defaultdict
adj_list = defaultdict(list)
def add_edge(u, v):
    adj_list[u].append(v)
```

```typescript
const adjList = new Map<number, number[]>();
function addEdge(u: number, v: number) {
  if (!adjList.has(u)) adjList.set(u, []);
  adjList.get(u)!.push(v);
}
```

```go
type Graph struct {
    adjList map[int][]int
}
func (g *Graph) AddEdge(u, v int) {
    g.adjList[u] = append(g.adjList[u], v)
}
```

---

## 3. Graph Traversals

- **Breadth-First Search (BFS):** Layer-by-layer exploration using a **Queue**.
- **Depth-First Search (DFS):** Deep exploration using a **Stack** or Recursion.

Next, we'll look at a specialized tree used for string searching: the **Trie**.
