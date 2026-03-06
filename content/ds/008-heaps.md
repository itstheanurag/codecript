---
title: Heaps
order: 8
---

A **Heap** is a special type of tree-based data structure that satisfies the **Heap Property**. It is most commonly used to implement **Priority Queues**, where you need to quickly access the element with the highest (or lowest) priority.

![Pencil sketch of a Max-Heap data structure](/home/gaurav/.gemini/antigravity/brain/0301a085-3412-430f-ae50-3c32dc593579/heaps_ds_sketch_1772819755571.png)

## 1. Types of Heaps

- **Max-Heap:** The value of the parent node is always _greater than or equal to_ the values of its children. The root is the maximum element.
- **Min-Heap:** The value of the parent node is always _less than or equal to_ the values of its children. The root is the minimum element.

---

## 2. Key Operations

| Operation           | Time Complexity | Description                                                       |
| :------------------ | :-------------- | :---------------------------------------------------------------- |
| **Insert**          | O(log n)        | Add an element and "bubble it up" to maintain the heap property.  |
| **Extract Max/Min** | O(log n)        | Remove the root and "bubble down" the new root to maintain order. |

---

## 3. Multi-Language Implementations

```java
import java.util.PriorityQueue;
import java.util.Collections;
// Min-Heap (Default)
PriorityQueue<Integer> minHeap = new PriorityQueue<>();
// Max-Heap
PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Collections.reverseOrder());
```

```cpp
#include <queue>
#include <vector>
// Max-Heap (Default)
std::priority_queue<int> maxHeap;
// Min-Heap
std::priority_queue<int, std::vector<int>, std::greater<int>> minHeap;
```

```python
import heapq
# Min-Heap (Default)
heap = []
heapq.heappush(heap, 10)
min_elem = heapq.heappop(heap)
```

```typescript
// TS doesn't have a built-in heap, often implemented with an array
class MinHeap {
  private heap: number[] = [];
  push(val: number) {
    /* bubble up logic */
  }
  pop(): number {
    /* bubble down logic */ return 0;
  }
}
```

```go
import "container/heap"
// Go requires implementing the heap.Interface (Len, Less, Swap, Push, Pop)
type IntHeap []int
func (h IntHeap) Less(i, j int) bool { return h[i] < h[j] }
```

---

## 4. Why Use Heaps?

- **Priority Scheduling:** Task management in OS.
- **Dijkstra's Algorithm:** Finding the shortest path.
- **Heap Sort:** O(n log n) sorting.

Next, we'll look at the most flexible data structure: **Graphs**.
