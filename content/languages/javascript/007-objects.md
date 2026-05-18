---
title: Key-Value Storage: Objects
order: 7
---

In JavaScript, almost everything is an **Object** (or behaves like one). An object is a standalone entity with properties and type. A property is an association between a name (or key) and a value.

---

## 1. Object Creation and Literals

The most common way to create an object is using the **Object Literal** syntax.

```javascript
const user = {
    id: 1,
    username: "jdoe",
    greet: function() { console.log("Hi!"); }
};
```

- **Keys**: Always converted to strings or symbols.
- **Values**: Can be any data type, including other objects or functions.

---

## 2. Accessing Properties: Dot vs. Bracket

- **Dot Notation (`obj.prop`)**: Clean and fast, but requires the property name to be a valid identifier.
- **Bracket Notation (`obj["prop"]`)**: Flexible. Allows access via variables, strings with spaces, or special characters.

---

## 3. Reference and Identity

As discussed in Module 2, objects are **Reference Types**. Two objects are only equal if they point to the same memory location, even if their values are identical.

```javascript
const obj1 = { val: 1 };
const obj2 = { val: 1 };
console.log(obj1 === obj2); // false

const obj3 = obj1;
console.log(obj1 === obj3); // true
```

---

## 4. Useful Object Methods (ES6+)

- **`Object.keys(obj)`**: Returns an array of the object's keys.
- **`Object.values(obj)`**: Returns an array of the object's values.
- **`Object.assign(target, ...sources)`**: Copies properties from source objects to a target.
- **`Object.freeze(obj)`**: Makes an object immutable (shallowly).

---

## Interview Pro-Tips: Shorthand Properties
Modern JavaScript allows you to omit the value if the key and variable name are the same. This makes your code significantly cleaner.

```javascript
const username = "alice";
const user = {
    username, // Identical to username: username
    id: 1
};
```

---

## Technical Summary
1. `Prototype`: Every object has a hidden `[[Prototype]]` link to its parent (covered in Module 19).
2. `Complexity`: Accessing properties is O(1) on average due to internal hash mapping.
3. `Mutation`: Avoid direct mutations in modern frameworks (React/Vue); prefer creating new objects using the **Spread Operator** (`{...obj}`).
