---
title: Functions
order: 4
---

Functions are first-class citizens in JavaScript — they can be stored in variables, passed as arguments, and returned from other functions.

## Function Declaration

```javascript
function greet(name) {
  return `Hello, ${name}!`;
}
```

Declarations are **hoisted** — you can call them before they appear in the code.

## Function Expression

```javascript
const greet = function (name) {
  return `Hello, ${name}!`;
};
```

Expressions are **not hoisted** — they must be defined before use.

## Arrow Functions

```javascript
const greet = (name) => `Hello, ${name}!`;

// With body
const add = (a, b) => {
  const sum = a + b;
  return sum;
};
```

Arrow functions don't have their own `this` — they inherit it from the enclosing scope.

## Default Parameters

```javascript
function createUser(name, role = "viewer") {
  return { name, role };
}

createUser("Alice"); // { name: "Alice", role: "viewer" }
createUser("Bob", "admin"); // { name: "Bob", role: "admin" }
```

## Rest Parameters

```javascript
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}

sum(1, 2, 3, 4); // 10
```

## Closures

A function that "remembers" variables from its outer scope:

```javascript
function createCounter() {
  let count = 0;
  return {
    increment: () => ++count,
    getCount: () => count,
  };
}

const counter = createCounter();
counter.increment(); // 1
counter.increment(); // 2
counter.getCount(); // 2
```
