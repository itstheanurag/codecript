---
title: The "this" Keyword
order: 20
---

The `this` keyword is one of the most powerful yet confusing features of JavaScript. Unlike most other variables, `this` is **not fixed**—its value is determined by **how a function is called**, not where it is defined.

## 1. Global Scope and `globalThis`

In the global execution context (outside of any function), `this` refers to the global object.

- In a **Browser**, the global object is `window`.
- In **Node.js**, the global object is `global`.

To write code that works in both environments, modern JavaScript introduced `globalThis`.

```javascript
console.log(this); // In browser: window
console.log(globalThis); // Always the global object (window or global)
```

---

## 2. Simple Function Calls

In a regular function call, the value of `this` depends on whether you are in **Strict Mode**.

```javascript
function showThis() {
  console.log(this);
}

showThis();
// Non-Strict Mode: globalThis (window/global)
// Strict Mode ('use strict'): undefined
```

---

## 3. Method Calls

When a function is called as a method of an object, `this` refers to the **object that owns the method**.

```javascript
const user = {
  name: "Alice",
  greet() {
    console.log(`Hello, I'm ${this.name}`);
  },
};

user.greet(); // "Hello, I'm Alice" (this is 'user')
```

---

## 4. Arrow Functions and Lexical `this`

Arrow functions are unique because they **do not have their own `this`**. Instead, they inherit `this` from their surrounding (lexical) scope.

```javascript
const user = {
  name: "Bob",
  greet: () => {
    console.log(`Hi, I'm ${this.name}`);
  },
};

user.greet(); // "Hi, I'm undefined" (this is globalThis, not 'user')
```

> [!TIP]
> Use arrow functions when you want to **preserve** the `this` context from the outer scope (like inside a `setTimeout` or an event listener).

---

## 5. Explicit Binding: `call`, `apply`, and `bind`

Sometimes you want to manually tell JavaScript what `this` should be. We use these methods for "Explicit Binding."

1. **`call()`**: Invokes the function immediately with a specified `this`. Arguments are passed individually.
2. **`apply()`**: Invokes the function immediately with a specified `this`. Arguments are passed as an array.
3. **`bind()`**: **Returns a new function** with `this` permanently bound to the specified object. It does not run immediately.

```javascript
function introduce(city, country) {
  console.log(`${this.name} from ${city}, ${country}`);
}

const person = { name: "Charlie" };

introduce.call(person, "Paris", "France");
introduce.apply(person, ["London", "UK"]);

const boundIntro = introduce.bind(person, "Berlin", "Germany");
boundIntro(); // Runs later
```

---

## 6. Constructor Functions and Classes

When using the `new` keyword, `this` refers to the **newly created instance**.

```javascript
class Car {
  constructor(brand) {
    this.brand = brand; // this is the new car object
  }
}

const myCar = new Car("Tesla");
console.log(myCar.brand); // "Tesla"
```

---

## Summary Table

| Context                   | `this` Value                                     |
| :------------------------ | :----------------------------------------------- |
| **Global**                | `globalThis` (`window` or `global`)              |
| **Simple Call**           | `globalThis` (Non-strict) / `undefined` (Strict) |
| **Method Call**           | The object before the dot                        |
| **Arrow Function**        | Inherited from outer scope (Lexical)             |
| **`new` Keyword**         | The new instance being created                   |
| **`call`/`apply`/`bind`** | Manually specified object                        |

> [!IMPORTANT]
> Understanding `this` is essential for building polyfills and working with JavaScript's Object-Oriented patterns. For a deep dive into how these methods are built, see the **[Polyfills](./022-polyfills)** guide.
