---
title: Scope and Hoisting
order: 11
---

**Scope** determines where variables and functions are accessible within your code. In JavaScript, scope is **Lexical** (Static)—it is defined by where the code is written, not where it is executed.

---

## 1. Types of Scope

### I. Global Scope
Variables defined outside of any function or block `{}`. They are accessible everywhere in the script.

### II. Function Scope (`var`)
Variables defined within a function are only accessible inside that function. `var` is function-scoped.

### III. Block Scope (`let`, `const`)
Introduced in ES6, variables defined within any curly braces `{}` (such as `if` statements or `for` loops) are only accessible within those braces.

---

## 2. The Scope Chain

When the engine attempts to access a variable, it starts at the **Current Scope**.
1. If not found, it moves up to the **Outer Lexical Environment**.
2. This process continues until the variable is found or it reaches the **Global Scope**.
3. If it is not found in the Global Scope, a `ReferenceError` is thrown.

This upward-only search process is known as the **Scope Chain**.

---

## 3. Hoisting: The Engine's Pre-scan

As discussed in Module 10, **Hoisting** is the behavior where variable and function declarations are moved to the top of their containing scope during the **Creation Phase** of the execution context.

### Function Hoisting
Function declarations are hoisted with their complete implementation.
```javascript
greet(); // "Hello" (Works!)
function greet() { console.log("Hello"); }
```

### Variable Hoisting
- **`var`**: Initialized as `undefined`. accessing it before declaration returns `undefined`.
- **`let` / `const`**: Hoisted but NOT initialized. They exist in the **Temporal Dead Zone (TDZ)** before their declaration line. Accessing them results in a `ReferenceError`.

---

## Interview Pro-Tips: Var vs Let in Loops
A classic question: **What happens to a `var` inside a loop?**
- `var` is not block-scoped, so it "Leaks" into the function or global scope.
- In a `for` loop, `var i` exists only once for the entire loop.
- In a `for` loop, `let i` is recreated for **Every Iteration**, which is why it works perfectly with asynchronous callbacks (like `setTimeout`).

---

## Technical Summary
1. `Lexical Scope`: Determined at author-time.
2. `Shadowing`: A local variable with the same name as an outer variable "hides" the outer one.
3. `TDZ`: A safety mechanism to prevent the use of uninitialized variables.
