---
title: Prototypes and Inheritance
order: 17
---

Many developers find JavaScript's inheritance confusing because it doesn't work like "traditional" class-based languages (like Java or C++). Instead, JavaScript uses a system called **Prototypical Inheritance**.

## 1. What is a Prototype?

Every object in JavaScript has a secret link to another object, called its **Prototype**. When you try to access a property or method that doesn't exist on an object, JavaScript automatically looks for it in that object's prototype.

### `__proto__` vs `prototype`

- **`__proto__`**: The actual link an _instance_ has to its prototype.
- **`prototype`**: A property that only exists on _constructor functions_. It defines what the `__proto__` of future instances will be.

```javascript
const animal = { eats: true };
const rabbit = { jumps: true };

// Setting the prototype manually (the old way)
rabbit.__proto__ = animal;

console.log(rabbit.jumps); // true (found on rabbit)
console.log(rabbit.eats); // true (found on animal via prototype chain)
```

---

## 2. The Prototype Chain

This "linking" doesn't stop at one level. Prototypes can have their own prototypes, creating a **Prototype Chain**. This chain eventually ends at `Object.prototype`, which has a prototype of `null`.

> [!NOTE]
> This is why almost every object has access to methods like `.toString()` or `.hasOwnProperty()`—they are inherited from the top-level `Object.prototype`.

---

## 3. Modifying Built-in Prototypes (Polyfilling)

Because JavaScript is dynamic, you can actually add your own methods to the blueprints of built-in objects like `Array`, `String`, or `Number`.

```javascript
// Adding a custom method to all Arrays
Array.prototype.first = function () {
  return this[0];
};

const nums = [10, 20, 30];
console.log(nums.first()); // 10
```

> [!WARNING]
> While powerful, **"polluting" the global prototype** is generally considered bad practice in large libraries because it can cause conflicts if another library (or the browser itself) adds a method with the same name.

---

## 4. Overwriting Existing Methods

You can also overwrite a built-in method by defining it yourself. This is how you might change behavior or fix a bug in a specific environment.

```javascript
// Overwriting the default toString for a specific object type
function User(name) {
  this.name = name;
}

User.prototype.toString = function () {
  return `User: ${this.name}`;
};

const me = new User("Alice");
console.log(me.toString()); // "User: Alice" (instead of "[object Object]")
```

## 5. Shadowing Properties

If you define a property on an instance that has the same name as one in its prototype, the instance's property "shadows" (hides) the prototype's property.

```javascript
const parent = { color: "red" };
const child = Object.create(parent);

child.color = "blue"; // This shadows the parent's color

console.log(child.color); // "blue"
console.log(parent.color); // "red" (parent remains unchanged)
```

Prototypes are the engine that powers JavaScript objects. Understanding them is essential before moving on to **Classes**, which are actually just a cleaner "sugar" over this prototype system.

Next, we'll look at a more niche but powerful feature: **Generator Functions**.
