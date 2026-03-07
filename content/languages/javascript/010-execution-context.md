---
title: How JavaScript Works
order: 10
---

To truly master JavaScript, you must understand what happens "under the hood" when your code runs. In JavaScript, everything happens inside an **Execution Context**.

Think of the Execution Context as a big container where all the code is evaluated and executed.

## 1. The Two Phases of Execution

When you run a JavaScript program, the engine creates a **Global Execution Context** and processes your code in exactly two phases:

### Phase 1: Memory Creation Phase (Hoisting)

In this phase, JavaScript skims through the entire code before executing a single line. it sets aside memory for all variables and functions.

- **Variables**: They are assigned a special value called `undefined`.
- **Functions**: The entire function body is stored in memory.

### Phase 2: Code Execution Phase

Now, the engine goes through the code line-by-line. This is where the actual values are assigned to variables and functions are executed.

```javascript
var n = 2;
function square(num) {
  var ans = num * num;
  return ans;
}
var square2 = square(n);
```

| Phase            | `n`         | `square`      | `square2`   |
| :--------------- | :---------- | :------------ | :---------- |
| **1. Memory**    | `undefined` | `{ fn body }` | `undefined` |
| **2. Execution** | `2`         | `{ fn body }` | `4`         |

---

## 2. Function Execution Context

Every time you **invoke** (call) a function, a brand new **Function Execution Context** is created. It goes through the same two phases (Memory and Execution) but only for the code inside that function.

Once the function finishes its job (reaches the `return` statement or the end), its execution context is completely **deleted**.

---

## 3. The Call Stack

JavaScript handles the creation and deletion of these multiple execution contexts using a **Call Stack**.

It follows the **LIFO (Last-In, First-Out)** principle:

1. **Global context** is pushed to the bottom of the stack first.
2. When a **function is called**, its context is pushed on top of the stack.
3. If that function calls **another function**, that new context is pushed on top again.
4. When a function **finishes**, its context is popped off the stack.
5. Once the entire program is done, the **Global context** is popped off, and the stack is empty.

> [!IMPORTANT]
> **Single Threaded**: JavaScript has only **one** Call Stack. This means it can only do one thing at a time. If the stack is blocked by a heavy calculation, the entire page "freezes."

---

## 4. What is Hoisting?

Hoisting is a result of the **Memory Creation Phase**. Because JavaScript allocates memory for variables and functions before running the code, you can sometimes access them before they are declared in the source.

```javascript
console.log(getName); // [Function: getName]
console.log(x); // undefined

var x = 7;
function getName() {
  console.log("JavaScript Mastery");
}
```

> [!WARNING]
> While `var` is hoisted as `undefined`, variables declared with `let` and `const` are also hoisted but placed in a **Temporal Dead Zone**, meaning you cannot access them until their declaration is reached.

To understand how JavaScript handles these rules across different levels of your code, check out the next chapter on **[Scope and Hoisting](./011-scope-and-hoisting)**.
