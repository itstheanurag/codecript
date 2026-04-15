---
title: Constructor Functions
order: 21
---

# Constructor Patterns: Building Objects

Before the introduction of ES6 classes, **Constructor Functions** were the primary pattern for implementing Object-Oriented Programming (OOP) and code reuse in JavaScript. They act as blueprints for creating multiple objects of the same type.

---

## 1. Defining a Constructor

A constructor is a regular function, but by convention, it starts with a **Capital Letter** to signal that it should be invoked with the `new` keyword.

```javascript
function User(name, email) {
    this.name = name;
    this.email = email;
}

const alice = new User("Alice", "alice@example.com");
```

---

## 2. Shared Logic via Prototypes

As discussed in Module 19, adding methods directly inside the constructor (using `this.greet = ...`) leads to memory inefficiency. The standard practice is to attach methods to the function's **`.prototype`**.

```javascript
User.prototype.greet = function() {
    console.log(`Hello, I'm ${this.name}`);
};
```

This ensures that only one copy of the function exists in memory, shared by all instances of `User`.

---

## 3. The `new` Keyword Mechanics

When you invoke a function with `new`, the engine performs four specific steps:

1. It creates a new, empty object `{}`.
2. It sets the object’s `__proto__` to point to the function’s `.prototype`.
3. It calls the function with `this` bound to the new object.
4. It returns the object (unless the function returns another object).

---

## 4. Why use Constructors today?

While ES6 classes have replaced constructors in most modern applications, understanding them is vital because:
1. **Legacy Systems**: Most enterprise JavaScript written before 2015 uses this pattern.
2. **Polyfills**: Implementing modern features in older environments requires prototype-based constructors.
3. **Internals**: Under the hood, **Classes are just syntactic sugar over constructors**.

---

## Interview Pro-Tips: Instanceof vs Typeof
- `typeof`: Returns `"object"` for both plain objects and instances of constructors. It’s useless for distinguishing between them.
- `instanceof`: Checks the prototype chain. `alice instanceof User` will be `true` because `alice` was created by that constructor.

---

## Technical Summary
1. `Convention`: Capitalization signals constructor intent.
2. `Efficiency`: Always put methods on the prototype, not inside the constructor.
3. `New`: The keyword that handles object creation, linking, and binding.
