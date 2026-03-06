---
title: Classes and OOP
order: 19
---

JavaScript is fundamentally prototype-based, but for developers coming from languages like Java or Python, the prototype syntax can feel messy. In ES6, JavaScript introduced **Classes**—a cleaner syntax to handle Object-Oriented Programming (OOP).

> [!IMPORTANT]
> Classes in JavaScript are "Syntactic Sugar." Under the hood, they are still using the **Prototype Chain** we discussed in the previous chapter.

## 1. Class Syntax

A class acts as a blueprint for creating objects.

```javascript
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }

  greet() {
    console.log(`Hello, I'm ${this.name}`);
  }
}

const bob = new User("Bob", "bob@example.com");
bob.greet(); // "Hello, I'm Bob"
```

### The `constructor`

The `constructor` is a special method that runs automatically when you create a new instance with the `new` keyword. It's where you initialize an object's properties.

---

## 2. Inheritance (`extends` and `super`)

Classes make it incredibly easy for one class to inherit the properties and methods of another.

```javascript
class Admin extends User {
  constructor(name, email, level) {
    // Calling the constructor of the parent (User)
    super(name, email);
    this.level = level;
  }

  deleteUser(user) {
    console.log(`${this.name} deleted ${user.name}`);
  }
}

const admin = new Admin("Alice", "admin@site.com", 1);
admin.greet(); // Inherited from User
admin.deleteUser(bob); // Specific to Admin
```

---

## 3. Encapsulation: Private Fields

Traditionally, all properties in a JS object were public. Modern JavaScript introduced **Private Fields**, which use the `#` prefix. These cannot be accessed or modified from outside the class.

```javascript
class BankAccount {
  #balance = 0; // Private property

  deposit(amount) {
    this.#balance += amount;
  }

  getBalance() {
    return this.#balance;
  }
}

const account = new BankAccount();
account.deposit(100);
console.log(account.getBalance()); // 100
// console.log(account.#balance); // ERROR: Private field must be declared in an enclosing class
```

---

## 4. Getters and Setters

You can define methods that look like properties using `get` and `set`. This allow you to add logic (like validation) when values are accessed or changed.

```javascript
class Person {
  constructor(name) {
    this._name = name;
  }

  get name() {
    return this._name.toUpperCase();
  }

  set name(newName) {
    if (newName.length > 0) {
      this._name = newName;
    }
  }
}
```

## 5. Static Methods

Static methods belong to the class itself, not to the instances. They are often used for utility functions related to that class.

```javascript
class MathUtils {
  static add(a, b) {
    return a + b;
  }
}

console.log(MathUtils.add(5, 5)); // 10
```

Classes bring structure and readability to JavaScript applications, making it easier to manage complex systems and state. With this, you have mastered the core pillars of modern JavaScript!
