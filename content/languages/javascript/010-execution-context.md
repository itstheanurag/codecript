---
title: The Execution Context
order: 10
---

# Execution Context: How Code is Evaluated

In JavaScript, the **Execution Context** is the environment in which the code is evaluated and executed. Understanding how these contexts are created and managed by the engine is essential for mastering scoping, hoisting, and closures.

---

## 1. Types of Execution Contexts

1. **Global Execution Context (GEC)**: The default context created when the script starts. It creates the `global` object (`window` in browsers) and sets `this` to point to it. There is only one GEC per page.
2. **Function Execution Context (FEC)**: Created every time a function is **Invoked**. Each function has its own context.
3. **Eval Execution Context**: Created when code is executed inside the `eval()` function (generally discouraged in production).

---

## 2. The Two Phases of Context Creation

When a function is called, the engine creates its execution context in two distinct phases:

### Phase 1: The Creation Phase
Before any code is executed, the engine performs a "Scan":
- **Variable Object (VO)**: It creates a memory record for all variables and functions.
- **Hoisting**: Function declarations are stored with their full reference; variables (`var`) are initialized as `undefined`. `let` and `const` remain uninitialized (TDZ).
- **Scope Chain**: It creates a reference to the outer environment (Lexical Scope).
- **`this` Binding**: It determines the value of the `this` keyword.

### Phase 2: The Execution Phase
The engine executes the code line-by-line.
- It assigns values to variables.
- It executes function calls.

---

## 3. The Call Stack

The **Call Stack** is a LIFO (Last In, First Out) data structure that tracks the execution of multiple contexts.

1. When a function is called, its FEC is **Pushed** onto the stack.
2. That context becomes the "Active" context.
3. When the function returns, its FEC is **Popped** off the stack, and control returns to the previous context.

---

## Interview Pro-Tips: Tracking Variable State
If an interviewer asks "What is the value of X here?", they are testing your knowledge of context phases. 
- If the context is in the **Creation Phase**, `var` is `undefined`.
- If it's in the **Execution Phase**, the variable has its assigned value.
- If it's a `let/const` before declaration, it's a `ReferenceError`.

---

## Technical Summary
1. `GEC`: The base context.
2. `FEC`: Created on invocation, not definition.
3. `Call Stack`: Manages the lifecycle of these contexts.
4. `Non-Blocking`: JavaScript uses the Event Loop (Module 15) to ensure the Call Stack doesn't remain blocked by async tasks.
