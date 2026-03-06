---
title: Stack
order: 4
---

A **Stack** is a linear data structure that follows the **LIFO (Last-In, First-Out)** principle. Think of it like a stack of plates: the last plate you put on top is the first one you'll take off.

![Pencil sketch of a Stack data structure](/home/gaurav/.gemini/antigravity/brain/0301a085-3412-430f-ae50-3c32dc593579/stack_ds_sketch_1772819638284.png)

## 1. Core Operations

- **Push:** Add an item to the top of the stack.
- **Pop:** Remove the top item from the stack.
- **Peek (or Top):** Look at the top item without removing it.

All these operations are performed in **O(1) time**.

---

## 2. Multi-Language Implementations

```java
import java.util.Stack;
public class Main {
    public static void main(String[] args) {
        Stack<Integer> stack = new Stack<>();
        stack.push(10);
        int top = stack.pop();
    }
}
```

```cpp
#include <stack>
#include <iostream>
int main() {
    std::stack<int> s;
    s.push(10);
    s.pop();
    return 0;
}
```

```python
# Lists work as stacks
stack = []
stack.append(10) # push
top = stack.pop() # pop
```

```typescript
const stack: number[] = [];
stack.push(10);
const top = stack.pop();
```

```go
package main
import "fmt"

func main() {
    stack := []int{}
    stack = append(stack, 10) // push
    top := stack[len(stack)-1] // peek
    stack = stack[:len(stack)-1] // pop
}
```

---

## 3. Real-World Use Cases

- **Undo/Redo:** Managing state history.
- **Function Call Stack:** How programming languages keep track of function execution.
- **Backtracking:** Solving puzzles or pathfinding.

Next up, we'll look at the "opposite" of a Stack: the **Queue**.
