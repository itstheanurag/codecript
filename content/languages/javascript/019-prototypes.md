---
title: Prototypal Inheritance
order: 19
---

# Prototypes: The Engine of Inheritance

In JavaScript, inheritance is not class-based as it is in Java or C++. Instead, it is **Prototype-based**. Objects can inherit properties and methods directly from other objects through an internal link known as the **Prototype Chain**.

---

## 1. The Prototype Chain (`[[Prototype]]`)

Every object in JavaScript has a hidden property called `[[Prototype]]` (exposed in most browsers as `__proto__`). 
- When you attempt to access a property on an object, the engine first looks at the object itself.
- If the property is not found, the engine follows the link to the object's **Prototype**.
- This continues up the chain until the property is found or the chain ends at `null` (the top of the chain, usually `Object.prototype`).

This process is called **Property Delegation**.

---

## 2. `.prototype` vs. `__proto__`

A common point of confusion:
- **`__proto__`**: A property of **Instances**. It points to the actual prototype being used for lookups.
- **`.prototype`**: A property of **Constructor Functions**. This is a template object that will be used as the `__proto__` for any new instances created using the `new` keyword.

```javascript
function Person(name) { this.name = name; }
const alice = new Person("Alice");

console.log(alice.__proto__ === Person.prototype); // true
```

---

## 3. Method Sharing and Memory

The primary benefit of prototypes is memory efficiency.
- If you define a method inside a constructor (`this.greet = function...`), every instance creates a **New Copy** of that function. With 10,000 users, you have 10,000 functions in memory.
- If you define the method on the **Prototype** (`Person.prototype.greet = ...`), all 10,000 instances **Share** a single function in memory.

---

## 4. Prototypal vs. Classical Inheritance

- **Classical**: Classes are blueprints. Objects are copies of those blueprints. Changing a class after objects are created doesn't affect existing objects.
- **Prototypal**: Inheritance is a live link. If you add a method to a prototype, all existing instances immediately get access to that method because they "Delegate" the call at runtime.

---

## Interview Pro-Tips: How does `new` work?
If an interviewer asks what happens when you call `new Constructor()`:
1. A new, empty object `{}` is created.
2. The object's `__proto__` is linked to `Constructor.prototype`.
3. The `Constructor` is called with `this` bound to the new object.
4. The new object is returned (unless the constructor returns a different object).

---

## Technical Summary
1. `Delegation`: Looking up properties in a parent object.
2. `Live Links`: Prototypes provide a dynamic relationship between instances and their parents.
3. `Shadowing`: Defining a property on an instance "Masks" the property on the prototype.
