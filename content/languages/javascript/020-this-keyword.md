---
title: The Execution Context: this
order: 20
---

The `this` keyword is one of the most powerful and often misunderstood concepts in JavaScript. Unlike variable scope, which is determined where the code is **Written** (Lexical), the value of `this` is primarily determined by **How** a function is **Invoked** (Contextual).

---

## 1. The Default and Global Binding

- **Global Context**: Outside of any function, `this` refers to the global object (`window` in browsers, `global` in Node.js).
- **Simple Function Call**: In a plain function call (e.g., `greet()`), `this` defaults to the global object. However, in **Strict Mode** (`"use strict"`), `this` will be `undefined`.

---

## 2. Implicit Binding (The Dot Rule)

When a function is called as a method of an object, `this` points to the object that "Owns" the method call—essentially, the object before the dot.

```javascript
const user = {
    name: "Alice",
    greet() { console.log(this.name); }
};

user.greet(); // 'this' points to user. Output: "Alice"
```

---

## 3. Explicit Binding: `call`, `apply`, and `bind`

You can manually override the contextual binding using these three methods:

- **`call(thisArg, arg1, ...)`**: Invokes the function immediately with the specified `this` and individual arguments.
- **`apply(thisArg, [argsArray])`**: Invokes the function immediately with the specified `this` and an array of arguments.
- **`bind(thisArg, arg1, ...)`**: Returns a **New Function** with `this` permanently bound to the specified object. It does not invoke the function immediately.

---

## 4. Arrow Functions and Lexical `this`

Arrow functions do NOT have their own `this` context. Instead, they capture the `this` value of the enclosing lexical scope at the time they are defined.

- **Non-Rebindable**: You cannot change the `this` of an arrow function using `call`, `apply`, or `bind`. 
- **Use Case**: This makes them ideal for callbacks (like `setTimeout`) inside object methods where you want to maintain access to the object's properties.

---

## Interview Pro-Tips: High-Priority Binding
If an interviewer asks what `this` will be in a complex scenario, remember the priority order:
1. **`new` Binding**: `this` is the new object.
2. **Explicit Binding** (`call/apply/bind`): `this` is the manually specified object.
3. **Implicit Binding** (Object method): `this` is the object before the dot.
4. **Default Binding**: `this` is the global object (or `undefined` in strict mode).

---

## Technical Summary
1. `Contextual`: Value is determined at call-time.
2. `Lexical`: Arrow functions inherit `this` from where they are defined.
3. `Hard Binding`: `bind()` creates a permanent association that cannot be overridden.
