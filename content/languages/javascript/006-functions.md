---
title: Functions
order: 6
---

Imagine you have a specific recipe for a cake. Instead of writing down every single step every time someone asks for a cake, you just give them the recipe name. In programming, a **Function** is that recipe—a reusable block of code designed to perform a particular task.

## 1. How to Declare a Function

Defining a function is like writing the recipe. You use the `function` keyword, give it a name, and define what it does inside curly braces.

```javascript
function sayHello() {
  console.log("Hello, World!");
}
```

- **`function` keyword**: Tells JavaScript you are creating a function.
- **Name**: `sayHello` is the identifier you'll use to run this code later.
- **Parentheses `()`**: This is where you can define inputs (parameters).
- **Curly Braces `{}`**: The "body" of the function where your actual code lives.

---

## 2. How to Invoke (Call) a Function

Declaring a function doesn't run the code. To actually execute the logic, you must **Invoke** it by using its name followed by parentheses.

```javascript
sayHello(); // This "calls" the function and runs the console.log
```

Without the `()`, you are just referring to the function itself as an object, rather than running it.

---

## 3. Parameters vs. Arguments

- **Parameters**: The placeholders inside the function's parentheses. Think of them as variables that only exist inside the function.
- **Arguments**: The actual values you pass into the function when you call it.

```javascript
// 'name' is the PARAMETER (the placeholder)
function greet(name) {
  console.log(`Hello, ${name}!`);
}

// "Alice" is the ARGUMENT (the actual value)
greet("Alice");
```

---

## 4. Types of Functions

### A. Named Functions (Declarations)

The most common way. These are **Hoisted**, meaning you can call them even before they are defined in your file.

```javascript
announced(); // Works!

function announced() {
  console.log("I am a declaration!");
}
```

### B. Anonymous Functions

A function without a name. These are often used as **Callbacks** (functions passed into other functions, like in loops).

```javascript
setTimeout(function () {
  console.log("I ran after 1 second!");
}, 1000);
```

### C. Function Expressions

When you store a function (usually anonymous) inside a variable. These are **NOT hoisted**.

```javascript
const subtract = function (a, b) {
  return a - b;
};
```

### D. Arrow Functions (ES6)

A modern, shorter syntax for function expressions.

```javascript
const multiply = (a, b) => a * b;
```

---

## 5. Accessing Arguments

Beyond standard parameters, JavaScript offers two ways to handle multiple inputs.

### I. The `arguments` Object

In non-arrow functions, you have access to a built-in `arguments` object that contains every value passed to the function.

```javascript
function logArgs() {
  console.log(arguments[0]); // Accesses first argument passed
}
```

### II. Rest Parameters (`...`)

The modern standard. It collects "the rest" of the arguments into a real array.

```javascript
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}
```

---

## 6. Advanced Concepts

### IIFE (Immediately Invoked Function Expression)

A function that runs as soon as it is defined. Useful for keeping variables private.

```javascript
(function () {
  console.log("I run immediately!");
})();
```

### Closures

A function that "remembers" the environment it was created in.

```javascript
function makeCounter() {
  let count = 0;
  return () => ++count;
}
const count = makeCounter();
console.log(count()); // 1
```
