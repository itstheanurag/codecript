---
title: LIFO: Stacks
order: 4
---

A **Stack** is a linear data structure that follows a specific order in which operations are performed. The order is **LIFO** (Last-In, First-Out)—meaning the last element added to the stack is the first one to be removed.

---

## 1. Core Operations

A stack is a restricted data structure; you can only interact with the "Top" element.

- **`push(item)`**: Adds an item to the top of the stack.
- **`pop()`**: Removes and returns the top item.
- **`peek()` / `top()`**: Returns the top item without removing it.
- **`isEmpty()`**: Returns a boolean indicating if the stack has no elements.

All core operations are **O(1)** (Constant Time).

---

## 2. Implementations

### I. Array-based Stack
Uses a dynamic array to store elements. 
- **Pros**: Fast, high cache locality.
- **Cons**: Occasional O(N) cost during resizing.

### II. Linked List-based Stack
Each element is a node pointing to the one below it.
- **Pros**: Truly constant time for all operations (no resizing).
- **Cons**: Higher memory overhead due to pointers.

---

## 3. Practical Applications

1. **The Function Call Stack**: Every time a programming language calls a function, a "Frame" containing local variables and the return address is **Pushed** onto the system stack. When the function returns, the frame is **Popped**.
2. **Undo/Redo Logic**: Every action in a text editor is pushed onto a stack. "Undo" simply pops the last action.
3. **Expression Evaluation**: Parsing mathematical expressions (Reverse Polish Notation) and balancing parentheses `(([]))`.
4. **Backtracking**: Storing the state while exploring paths in algorithms (like DFS).

---

## Interview Pro-Tips: The Stack Overflow
A common interview topic: **"What is a Stack Overflow?"**
- **The Answer**: The system's "Call Stack" has a fixed, finite size. If a program has deep recursion (especially infinite recursion), it will keep pushing new frames onto the stack until it exceeds the reserved memory. This triggers a **Stack Overflow Error**, crashing the application. To prevent this, developers use iteration or "Tail Call Optimization" (if the language supports it).

---

## Technical Summary
1. `Vertical`: Think of a stack of physical plates.
2. `O(1)`: Efficient access to the most recent data.
3. `Context`: Used heavily by compilers and runtimes for flow control.
