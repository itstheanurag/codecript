---
title: Scope and Hoisting
order: 11
---

Understanding how JavaScript finds variables and when it initializes them is critical for avoiding the "undefined" bugs that plague beginners.

## 1. Scope: Where can I access it?

**Scope** determines the accessibility of variables. JavaScript has three main types:

1. **Global Scope**: Variables declared outside any function or block. They are accessible everywhere.
2. **Function Scope**: Variables declared inside a function are only accessible within that function.
3. **Block Scope** (`let`, `const`): Introduced in ES6, variables declared inside `{}` (like in an `if` statement or `for` loop) are only accessible inside that block.

```javascript
{
  var globalVar = "I am everywhere";
  let blockVar = "I am trapped here";
}
console.log(globalVar); // "I am everywhere"
console.log(blockVar); // ReferenceError!
```

---

## 2. Lexical Scope and Shadowing

JavaScript uses **Lexical Scope**, meaning the scope is determined by where the code is written, not where it is called. Inner scopes have access to outer scopes, but not vice-versa.

**Shadowing** occurs when you declare a variable in an inner scope with the same name as one in an outer scope.

```javascript
let name = "Alice";

function greet() {
  let name = "Bob"; // This shadows the outer 'name'
  console.log(name);
}

greet(); // "Bob"
console.log(name); // "Alice"
```

---

## 3. Hoisting: The "Lifting" Mechanic

**Hoisting** is JavaScript's behavior of moving declarations to the top of their scope during the memory creation phase.

### I. Variable Hoisting (`var`)

Variables declared with `var` are hoisted and initialized as `undefined`.

```javascript
console.log(x); // undefined (it's hoisted!)
var x = 5;
```

### II. `let` and `const` (The TDZ)

While `let` and `const` are hoisted, they are **not initialized**. They stay in a **Temporal Dead Zone (TDZ)** from the start of the block until the declaration is reached.

```javascript
console.log(y); // ReferenceError! (TDZ)
let y = 10;
```

### III. Function Hoisting

Function declarations are hoisted entirely, meaning you can call them even before they are defined in the code.

```javascript
sayHi(); // "Hi!"

function sayHi() {
  console.log("Hi!");
}
```

> [!CAUTION]
> **Function Expressions** (like `const sayHi = function() {}`) follow the rules of the variable they are assigned to (`let`/`const`) and are **not** hoisted as functions.

---

## 4. Why does this matter?

Hoisting is why you can call functions before they are written, but it's also why using `var` can lead to confusing results. Modern best practice is to **use `const` by default, `let` when you must, and avoid `var` entirely.**

Next, we'll see how scope allows functions to perform a nearly magical feat: **[Closures and Currying](./012-closures-and-currying)**.
