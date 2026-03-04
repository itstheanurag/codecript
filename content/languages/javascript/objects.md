---
title: Objects
order: 8
---

If an Array is a numbered shelf, an **Object** is a labeled box. Objects allow you to group related data and functionality together using **key-value pairs**.

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

1. **Dot Notation**: `user.name` (The most common way).
2. **Bracket Notation**: `user["name"]` (Used when the key is stored in a variable or contains special characters).

---

## 2. Modern Object Syntax

JavaScript has evolved to make writing objects much faster and more concise.

### Property Shorthand

If your variable name matches the object key name, you can skip the colon.

```javascript
const name = "Alice";
// Instead of { name: name }, just use:
const user = { name };
```

### Computed Property Names

You can use a variable as a key directly inside the object literal.

```javascript
const roleKey = "user_role";
const user = {
  [roleKey]: "Admin",
};
// Result: { user_role: "Admin" }
```

---

## 3. The "Why and How" of References

This is one of the most important concepts in JavaScript. **Objects are stored by reference**, not by value.

- **The Why**: When you copy an object, you aren't copying the data; you are copying a "pointer" to the data in memory.
- **The How**: If you modify the copy, the original object changes too!

```javascript
const original = { score: 10 };
const copy = original;

copy.score = 20;
console.log(original.score); // 20! (The original was changed)
```

> [!WARNING]
> To "truly" copy an object without modifying the original, you must create a **Shallow Copy** using the Spread operator: `const copy = { ...original };`.

---

## 4. Manipulating Object Data

JavaScript provides powerful methods for inspecting and transforming objects.

- **`Object.keys(obj)`**: Returns an array of every key name.
- **`Object.values(obj)`**: Returns an array of every value.
- **`Object.entries(obj)`**: Returns an array of `[key, value]` pairs.

```javascript
const scores = { physics: 90, math: 95 };

Object.keys(scores); // ["physics", "math"]
Object.entries(scores); // [ ["physics", 90], ["math", 95] ]
```

---

## 5. Merging and Safely Accessing

### Object Spread

The modern way to merge multiple objects or update specific fields.

```javascript
const defaults = { theme: "dark", notify: true };
const userConfig = { ...defaults, theme: "light" };
// { theme: "light", notify: true }
```

### Optional Chaining (`?.`)

Safely access deep properties without checking if every level exists.

```javascript
const city = user?.address?.city;
// Returns undefined if address is missing, instead of throwing an error.
```
