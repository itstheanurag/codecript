---
title: Queue
order: 5
---

A **Queue** is a linear data structure that follows the **FIFO (First-In, First-Out)** principle. Think of it like a line at a grocery store: the first person in line is the first one to be served.

![Pencil sketch of a Queue data structure](/home/gaurav/.gemini/antigravity/brain/0301a085-3412-430f-ae50-3c32dc593579/queue_ds_sketch_retry_1772819662277.png)

## 1. Core Operations

- **Enqueue:** Add an item to the end (rear) of the queue.
- **Dequeue:** Remove the first item from the front of the queue.
- **Peek:** Look at the front item without removing it.

All these operations are performed in **O(1) time**.

---

## 2. Multi-Language Implementations

```java
import java.util.LinkedList;
import java.util.Queue;
public class Main {
    public static void main(String[] args) {
        Queue<Integer> q = new LinkedList<>();
        q.add(10); // enqueue
        int front = q.poll(); // dequeue
    }
}
```

```cpp
#include <queue>
#include <iostream>
int main() {
    std::queue<int> q;
    q.push(10);
    q.pop();
    return 0;
}
```

```python
from collections import deque
queue = deque()
queue.append(10) # enqueue
front = queue.popleft() # dequeue
```

```typescript
const queue: number[] = [];
queue.push(10); // enqueue
const front = queue.shift(); // dequeue
```

```go
package main
import "fmt"

func main() {
    queue := []int{}
    queue = append(queue, 10) // enqueue
    front := queue[0] // peek
    queue = queue[1:] // dequeue
}
```

---

## 3. Real-World Use Cases

- **CPU Scheduling:** Managing tasks in an operating system.
- **IO Buffering:** Data packets arriving at a network card.
- **BFS (Breadth-First Search):** Searching through graph levels.

Next, we'll look at how to store data for near-instant retrieval using **Hash Tables**.
