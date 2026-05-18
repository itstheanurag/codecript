---
title: Declarations and Types
order: 2
---

In JavaScript, variable declaration has evolved significantly. Understanding the differences between `var`, `let`, and `const`—and how the engine handles memory for different types—is fundamental to technical excellence.

---

## 1. Declarations: `var`, `let`, and `const`

| Keyword | Scope | Hoisted? | Reassignable? |
| :--- | :--- | :--- | :--- |
| **`var`** | Function | Yes (to `undefined`) | Yes |
| **`let`** | Block `{}` | Yes (TDZ) | Yes |
| **`const`** | Block `{}` | Yes (TDZ) | No |

### The Temporal Dead Zone (TDZ)
Unlike `var`, which is initialized as `undefined` when hoisted, `let` and `const` variables are not initialized. Any attempt to access them before their declaration results in a `ReferenceError`. This period is known as the **Temporal Dead Zone**.

---

## 2. Primitive vs. Reference Types

JavaScript divides its types into two categories based on how they are stored in memory.

### I. Primitives (Stored by Value)
Stored directly on the **Stack**. They are immutable.
- `Number`, `String`, `Boolean`, `Null`, `Undefined`, `Symbol`, `BigInt`.

### II. Reference Types (Stored by Reference)
The variable stores a pointer (on the stack) to the actual data stored on the **Heap**.
- `Object`, `Array`, `Function`, `Date`, `RegExp`.

---

## 3. The "Gotcha" of `const` with Objects

A common interview question: **Can you change the properties of a `const` object?**
- **The Answer**: Yes. `const` prevents **Reassignment** (changing the pointer), but it does not prevent **Mutation** of the underlying object in the heap.

```javascript
const user = { name: "Alice" };
user.name = "Bob"; // Works
// user = { name: "Charlie" }; // Error: Assignment to constant variable
```

---

## 4. Dynamic and Weak Typing

JavaScript is **Weakly Typed**, meaning it performs implicit type conversion (coercion) when operators are used between different types.

```javascript
console.log(1 + "2"); // "12" (Number is coerced to string)
console.log(5 - "2"); // 3 (String is coerced to number)
```

---

## Interview Pro-Tips: `typeof` Quirks
- `typeof null`: Returns `"object"`. This is a legacy bug in JavaScript that was never fixed to avoid breaking the web.
- `typeof NaN`: Returns `"number"`. `NaN` (Not a Number!) is technically a numeric type used to represent undefined mathematical results.

---

## Technical Summary
1. `Memory`: Primitives are copied by value; objects are copied by reference.
2. `Immutability`: Use `Object.freeze()` if you want to make an object truly immutable (shallowly).
3. `Best Practice`: Default to `const`. Use `let` only if you explicitly need to reassign a variable. Never use `var` in modern development.
