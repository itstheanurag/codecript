---
title: Memory Management
order: 11
---

Understanding how JavaScript stores and moves data in memory is essential for preventing bugs where data changes unexpectedly.

## 1. Pass by Value (Primitives)

When you assign a **Primitive Type** (String, Number, Boolean, null, undefined, Symbol) to a variable, the actual **value** is stored in memory. When you copy it to another variable, a completely new copy of that value is created.

```javascript
let x = 10;
let y = x; // y gets a copy of the value 10

y = 20; // Changing y does NOT affect x
console.log(x); // 10
console.log(y); // 20
```

---

## 2. Pass by Reference (Objects & Arrays)

Unlike primitives, **Objects and Arrays** are stored by reference. When you assign an object to a variable, you aren't storing the object itself—you are storing a **memory address** (a pointer) to where the object sits in memory.

When you copy it, you are just copying that address. Both variables now point to the **same object**.

```javascript
const user1 = { name: "Alice" };
const user2 = user1; // user2 points to the SAME memory address as user1

user2.name = "Bob";

console.log(user1.name); // "Bob" (Uh oh! user1 changed too)
```

---

## 3. Cloning Objects & Arrays

To prevent unintended side effects, you often need to create a **copy** of an object rather than a new reference.

### I. Shallow Copy

A shallow copy creates a new object, but nested objects still point to the original references.

- **Spread Operator `{...obj}` or `[...arr]`**:

  ```javascript
  const original = { name: "Alice", details: { age: 25 } };
  const copy = { ...original };

  copy.name = "Bob"; // original.name is still "Alice" (Safe)
  copy.details.age = 30; // original.details.age becomes 30 (NOT safe!)
  ```

### II. Deep Copy

A deep copy creates a completely independent copy of the entire structure, including all nested levels.

- **`structuredClone()` (Modern & Recommended)**:
  Available in modern browsers and Node.js 17+.

  ```javascript
  const deepCopy = structuredClone(original);
  deepCopy.details.age = 40; // original.details.age is still 25 (Safe!)
  ```

- **`JSON.parse(JSON.stringify())` (The "Old" Way)**:
  Works for simple data, but fails with Functions, Dates, or `undefined`.

  ```javascript
  const deepCopy = JSON.parse(JSON.stringify(original));
  ```

---

## Summary Table

| Feature              | Pass by Value               | Pass by Reference                  |
| :------------------- | :-------------------------- | :--------------------------------- |
| **Data Types**       | Primitives (Num, String...) | Objects, Arrays, Functions         |
| **Stored in Memory** | The actual value            | The memory address                 |
| **Copying**          | Creates a new value         | Creates a new pointer to same data |
| **Change Impact**    | Independent                 | Shared                             |

---

> [!IMPORTANT]
> **Always ask yourself**: "Do I need to modify the original data, or should I work on a copy?" In modern frameworks like React, working on copies (**immutability**) is the golden rule.

