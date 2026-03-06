---
title: Objects
order: 7
---

In JavaScript, nearly everything is an **Object**. While variables hold single values, objects are used to store collections of related data and more complex entities. You can think of an object as a **labeled container** where each label (key) points to a specific piece of information (value).

## 1. Object Fundamentals

Objects are defined using "Object Literals" (curly braces `{}`).

```javascript
const user = {
  name: "Alice",
  age: 25,
  isAdmin: true,
};
```

### Accessing Properties

You can access data in an object in two ways:

1. **Dot Notation**: `user.name` (The most common and readable way).
2. **Bracket Notation**: `user["name"]` (Essential when the key is dynamic or contains special characters like spaces).

---

## 2. Objects are Dynamic

One of the most powerful features of JavaScript objects is that they are **not fixed**. You can add, change, or remove properties at any time after the object is created.

```javascript
const laptop = { brand: "Dell" };

// Adding a new property
laptop.model = "XPS 13";

// Modifying an existing property
laptop.brand = "Apple"; // Changed from Dell to Apple

console.log(laptop); // { brand: "Apple", model: "XPS 13" }
```

### Deleting Properties

If you no longer need a property, you can remove it entirely using the `delete` operator.

```javascript
delete laptop.model;
console.log(laptop); // { brand: "Apple" }
```

---

## 3. Object Methods

Objects don't just store data; they can also store **behavior**. When a function is stored as a property of an object, it is called a **Method**.

```javascript
const person = {
  firstName: "John",
  lastName: "Doe",
  greet: function () {
    console.log("Hello!");
  },
  // ES6 Shorthand Method
  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  },
};

person.greet(); // "Hello!"
console.log(person.getFullName()); // "John Doe"
```

> [!NOTE]
> **The `this` keyword**: Inside a method, `this` refers to the **current object**. It allows the method to access other properties belonging to the same object.

---

## 4. Destructuring and Iteration

### Object Destructuring

Destructuring is a concise way to "unpack" properties from an object into distinct variables.

```javascript
const user = { name: "Bob", age: 30 };

// Instead of: const name = user.name; const age = user.age;
const { name, age } = user;

console.log(name); // "Bob"
```

### Iteration: `for...in`

To loop through all the keys in an object, use the `for...in` loop.

```javascript
const scores = { math: 90, science: 85 };

for (let subject in scores) {
  console.log(`${subject}: ${scores[subject]}`);
}
// Outputs: "math: 90", "science: 85"
```

---

## 5. Modern Object Syntax

### Property Shorthand

If your variable name matches the key, you can skip the colon.

```javascript
const color = "red";
const car = { color }; // Same as { color: color }
```

### Computed Property Names

Use variables as keys directly.

```javascript
const key = "isFast";
const car = { [key]: true }; // { isFast: true }
```

---

## 6. Objects are Stored by Reference

Unlike strings or numbers, objects are **stored by reference**. When you copy an object variable, you are copying the "address" of where that object sits in memory, not the object itself.

```javascript
const a = { val: 10 };
const b = a; // b points to the SAME object as a

b.val = 20;
console.log(a.val); // 20!
```

> [!WARNING]
> To create a truly independent copy, use the **Spread Operator**: `const copy = { ...original };`.

---

## 7. Useful Object Methods

- **`Object.keys(obj)`**: Returns a collection of key names.
- **`Object.values(obj)`**: Returns a collection of values.
- **`Object.entries(obj)`**: Returns a collection of `[key, value]` pairs.

---

## 8. Safely Accessing: Optional Chaining (`?.`)

Prevents your code from crashing if a deeply nested property is missing.

```javascript
const city = user?.address?.city; // Returns undefined if address is missing
```
