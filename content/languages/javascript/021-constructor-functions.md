---
title: Constructor Functions
order: 21
---

Before ES6 introduced the `class` keyword, JavaScript developers used **Constructor Functions** to implement Object-Oriented Programming (OOP). Understanding this is critical because Classes in JavaScript are just "syntactic sugar" over this pattern.

## 1. Defining a Constructor

A constructor function is just a regular function, but by convention, it starts with a **Capital Letter**. It uses the `this` keyword to assign properties to the object being created.

```javascript
function User(name, role) {
  // 'this' refers to the new object being created
  this.name = name;
  this.role = role;
}

// Creating an instance using the 'new' keyword
const admin = new User("Alice", "Admin");
console.log(admin.name); // "Alice"
```

### What does the `new` keyword do?

When you call a function with `new`, JavaScript does four things behind the scenes:

1. Creates a **new empty object** `{}`.
2. Sets the `this` keyword to point to that new object.
3. Links the object's prototype to the function's `.prototype` property.
4. Returns the new object (unless the function returns its own object).

---

## 2. Adding Methods: The Prototype Pattern

While you _could_ add methods inside the constructor, it's inefficient because every instance would have its own copy of the function, wasting memory.

Instead, we add methods to the **`.prototype`** property of the constructor function. This way, all instances **share** a single copy of the method.

```javascript
User.prototype.greet = function () {
  console.log(`Hello, I'm ${this.name} (${this.role})`);
};

admin.greet(); // "Hello, I'm Alice (Admin)"
```

---

## 3. Implementation of Inheritance

Implementing inheritance before Classes required manually linking prototypes and resetting the constructor. This is known as **Prototypal Inheritance**.

```javascript
function Employee(name, role, salary) {
  // 1. "Borrow" the parent constructor using .call()
  User.call(this, name, role);
  this.salary = salary;
}

// 2. Link the prototypes
Employee.prototype = Object.create(User.prototype);

// 3. Fix the constructor reference (otherwise it points to User)
Employee.prototype.constructor = Employee;

const dev = new Employee("Bob", "Developer", 5000);
dev.greet(); // Works! Inherited from User.prototype
```

---

## 4. Modern Perspective

While you will likely use `class` in modern projects, knowing Constructor Functions is essential for:

- **Interviews**: Explaining what "Syntactic Sugar" really means.
- **Legacy Code**: Maintaining older libraries or frameworks.
- **Performance**: In extreme cases, direct prototype manipulation can be slightly faster than class structures.

> [!IMPORTANT]
> The complexity of resetting constructors and manual inheritance is exactly why **Classes** were introduced. To see how much cleaner this becomes, head over to the **[Classes and OOP](./020-classes-and-oop)** chapter.
