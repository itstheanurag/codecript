---
title: Modular Code: Functions
order: 6
---

# Functions: Execution and Scope

Functions are the building blocks of any JavaScript application. They are first-class objects, meaning they can be passed as arguments, returned as values, and assigned to variables.

---

## 1. Declarations vs. Expressions

There are two primary ways to define a function in JavaScript:

### I. Function Declaration
Hoisted to the top of their scope. They can be called before they are defined in the code.
```javascript
function greet() { return "Hello"; }
```

### II. Function Expression
Not hoisted. They are treated like variables and are subject to the Temporal Dead Zone (TDZ).
```javascript
const greet = function() { return "Hello"; };
```

---

## 2. Arrow Functions (ES6)

Arrow functions provide a more concise syntax and have a critical difference in how they handle the `this` keyword.

- **Concise Syntax**: Implicit return for one-line expressions.
- **Lexical `this`**: Arrow functions do NOT have their own `this`. They inherit `this` from the surrounding parent scope (Lexical Scope). This makes them perfect for callbacks and handlers.

```javascript
const add = (a, b) => a + b;
```

---

## 3. Parameters and Arguments

- **Default Parameters**: Set a fallback value if an argument is missing.
- **Rest Parameters (`...args`)**: Capture all remaining arguments into a single array.
- **The `arguments` Object**: A legacy, array-like object available inside non-arrow functions that contains all passed arguments.

---

## 4. Higher-Order Functions

A **Higher-Order Function** is a function that either takes one or more functions as arguments or returns a function as its result. This is the foundation of **Functional Programming** in JavaScript.

```javascript
const compute = (a, b, operation) => operation(a, b);
const result = compute(5, 3, (x, y) => x * y);
```

---

## Interview Pro-Tips: Hoisting and Functions
If an interviewer asks why a function call is failing:
1. Check if it's a **Function Expression** called before assignment.
2. Check if it's an **Arrow Function** defined within an object (it might be pointing to the wrong `this`).
3. Check for **Shadowing**—a local variable with the same name as a higher-scope function.

---

## Technical Summary
1. `First-Class`: Functions can be treated like any other value (number, string).
2. `Scope`: Functions create their own execution context (covered in Module 10).
3. `Best Practice`: Use Arrow functions for simple operations and Lexical `this`; use Declarations for top-level logic and standard methods.
