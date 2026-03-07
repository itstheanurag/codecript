---
title: Closures and Currying
order: 12
---

A **Closure** is one of those concepts that "clicks" and suddenly everything about JavaScript's architecture makes sense. It is the backbone of data privacy and functional programming in JS.

## 1. What is a Closure?

A closure is the combination of a function bundled together (enclosed) with references to its surrounding state (the **lexical environment**).

Simply put: **A function "remembers" the variables that were in its scope when it was created, even if you run that function later from a different scope.**

```javascript
function outer() {
  let count = 0;
  return function inner() {
    count++; // inner() has access to count because of closure
    console.log(count);
  };
}

const counter = outer();
counter(); // 1
counter(); // 2
```

---

## 2. Practical Use Cases

### I. Data Privacy (Encapsulation)

Closures allow you to create "private" variables that cannot be accessed or modified from the outside.

```javascript
function createBankAccount(initialBalance) {
  let balance = initialBalance; // Private variable

  return {
    deposit(amount) {
      balance += amount;
      return balance;
    },
    getBalance() {
      return balance;
    },
  };
}

const myAccount = createBankAccount(100);
console.log(myAccount.getBalance()); // 100
// console.log(myAccount.balance); // undefined! No direct access.
```

### II. Function Factories

Create specialized versions of the same function.

```javascript
function multiplier(factor) {
  return function (num) {
    return num * factor;
  };
}

const double = multiplier(2);
const triple = multiplier(3);

console.log(double(5)); // 10
console.log(triple(5)); // 15
```

---

## 3. Currying

**Currying** is a functional programming technique where a function with multiple arguments is transformed into a series of functions that each take a single argument. It relies heavily on closures.

```javascript
// Regular function
const sum = (a, b) => a + b;

// Curried function
const curriedSum = (a) => (b) => a + b;

console.log(curriedSum(1)(2)); // 3
```

### Why use Currying?

1. **Partial Application**: Allows you to fix some arguments and reuse the function.
2. **Readability**: Can make code cleaner when passing specialized functions as callbacks.

```javascript
const log = (date) => (type) => (msg) =>
  console.log(`[${date.getTime()}] [${type}] ${msg}`);

const logNow = log(new Date());
const logError = logNow("ERROR");

logError("Something went wrong!"); // [Timestamp] [ERROR] Something went wrong!
```

---

## 4. Memory Considerations

Because closures keep a reference to their outer scope, the variables in that outer scope cannot be **Garbage Collected** as long as the closure exists.

> [!CAUTION]
> If you have thousands of large closures staying in memory unnecessarily, it can lead to **Memory Leaks**. Always be mindful of when a closure is no longer needed!

Now that you understand how functions "remember" their surroundings, you're ready to explore how JavaScript manages the lifecycle of these objects in **[Memory Management](./013-memory-management)**.
