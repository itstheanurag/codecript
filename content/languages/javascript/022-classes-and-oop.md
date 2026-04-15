---
title: ES6 Classes and OOP
order: 22
---

# Classes: Syntactic Sugar for Prototypes

Introduced in ES6 (ES2015), the `class` keyword provides a much cleaner and more familiar syntax for implementing Object-Oriented Programming (OOP) in JavaScript. However, it is important to remember that it does NOT introduce a new object model—it is purely **Syntactic Sugar** over the existing Prototypal Inheritance model.

---

## 1. Class Declaration and Constructors

A class acts as a template for creating objects. It encapsulates data (properties) and behavior (methods) into a single unit.

```javascript
class Admin {
    constructor(username) {
        this.username = username;
    }

    logIn() {
        console.log(`${this.username} logged in.`);
    }
}

const admin = new Admin("boss");
```

---

## 2. Inheritance: `extends` and `super`

Classes make inheritance significantly easier than the manual prototype linking used in constructor functions.

- **`extends`**: Used to create a child class that inherits from a parent.
- **`super()`**: Used to call the constructor of the parent class. It must be called before using `this` in a child constructor.

```javascript
class SuperAdmin extends Admin {
    constructor(username, permissions) {
        super(username); // Calls the Admin constructor
        this.permissions = permissions;
    }
}
```

---

## 3. Static Methods and Properties

Static members are attached to the **Class itself**, not to instances of the class. They are commonly used for utility functions that don't depend on the state of a specific object.

```javascript
class MathUtils {
    static add(a, b) { return a + b; }
}
MathUtils.add(5, 5); // Called on the Class
```

---

## 4. Private Fields (ES2020)

For years, JavaScript developers used the underscore convention (`_private`) to signal that a property shouldn't be accessed from outside. Modern JavaScript now has native support for **Private Fields** using the `#` prefix.

```javascript
class BankAccount {
    #balance = 0; // Private field

    deposit(amount) {
        this.#balance += amount;
    }
}
```

---

## Interview Pro-Tips: Class vs Constructor
If an interviewer asks what the difference is:
1. **Syntax**: Classes are cleaner and support `extends` natively.
2. **Strict Mode**: Classes are always in strict mode.
3. **Hoisting**: Unlike function declarations, classes are NOT hoisted.
4. **Method Enumerability**: Methods defined in a class are non-enumerable by default (cleaner `Object.keys()`).

---

## Technical Summary
1. `Syntax Sugar`: Classes bridge the gap between JS and traditional OOP languages.
2. `Immutability`: Methods are automatically placed on the prototype for memory efficiency.
3. `Encapsulation`: Private fields provide true hard-privacy for object internal state.
 flagship
 flagship
