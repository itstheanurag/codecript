---
title: Functional Closures
order: 12
---

# Closures: Persistence and Memory

A **Closure** is arguably the most powerful feature of JavaScript. It is the combination of a function and the **Lexical Environment** in which that function was declared. 

Simply put: A closure allows a function to "Remember" the variables from its parent scope, even after the parent function has finished executing.

---

## 1. How Closures Work

When a function is defined inside another function, the inner function maintains a reference to the outer function’s variables. When the outer function returns the inner function, that reference is **Persisted** in memory.

```javascript
function createCounter() {
    let count = 0; // This variable lives in the closure
    return function() {
        count++;
        return count;
    };
}

const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2
```

- **Persistence**: The variable `count` is not garbage-collected because the returned function still holds a reference to it.
- **Privacy**: The variable `count` cannot be accessed or modified from anywhere except through the returned function. This is how we implement **Private Variables** in JavaScript.

---

## 2. Currying: Partial Application

**Currying** is a functional programming technique where a function that takes multiple arguments is transformed into a series of functions that each take a **Single Argument**.

```javascript
// Non-curried
const add = (a, b) => a + b;

// Curried
const curriedAdd = (a) => (b) => a + b;

const addFive = curriedAdd(5);
console.log(addFive(10)); // 15
```

- **Use Case**: This is incredibly useful for creating non-generic functions from generic ones (Specialization) and for handling data transformations in pipelines.

---

## 3. Practical Applications

1. **Information Hiding**: Creating modules with private state.
2. **Function Factories**: Creating specialized functions with pre-set configurations.
3. **Memoization**: Storing the results of expensive function calls within a closure to avoid re-calculation.

---

## Interview Pro-Tips: Closures and Memory Leaks
While closures are powerful, they can lead to **Memory Leaks** if not managed correctly. If a closure holds a reference to a massive object (like a large DOM tree or a huge array) and that closure is stored in a global variable, the massive object will **never be garbage-collected**.

To prevent this, ensure that closures only capture the specific data they need, or manually set references to `null` when they are no longer required.

---

## Technical Summary
1. `Lexical Environment`: The scope in which a function was "Born."
2. `State Persistence`: Variables survive the completion of their parent context.
3. `Encapsulation`: The standard way to protect data before the introduction of private class fields (`#`).
