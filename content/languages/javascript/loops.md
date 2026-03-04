---
title: Loops
order: 5
---

In programming, we often need to perform a task multiple times—like printing every name in a list of a thousand users. Without **Loops**, you'd have to write the same line of code over and over again. Loops allow you to write a block of code once and tell the computer to repeat it as many times as needed.

This concept is called **Iteration**, and it's essential for keeping your code DRY (Don't Repeat Yourself).

## 1. The Traditional `for` Loop

The `for` loop is the classic way to repeat code. It uses a counter to keep track of how many times the loop has run.

### When to use for

Use a traditional `for` loop when you know **exactly how many times** you need to iterate, or when you specifically need the **index** (the current count) of the iteration.

```javascript
for (let i = 0; i < 5; i++) {
  console.log("Iteration number: " + i);
}
```

- **Initialization**: `let i = 0` (Sets up the counter).
- **Condition**: `i < 5` (The loop runs as long as this is true).
- **Increment**: `i++` (Increases the counter after each run).

---

## 2. Iterating Over Collections: `for...of`

Introduced in modern JavaScript (ES6), the `for...of` loop is the cleanest way to iterate over **iterable** objects like Arrays, Strings, Maps, and Sets.

### When to use for...of

Use `for...of` when you want to **process every element** in a collection and don't care about the index.

```javascript
const colors = ["Red", "Green", "Blue"];

for (const color of colors) {
  console.log(color);
}
```

> [!CAUTION]
> **Plain Objects are NOT iterable:** You cannot use `for...of` directly on a plain object like `{ name: "Alice" }`. Doing so will throw a `TypeError`.

**Pro Tip:** If you want to use `for...of` with an object, you can convert its parts into an array first:

- `Object.keys(user)` -> iterate over keys.
- `Object.values(user)` -> iterate over values.
- `Object.entries(user)` -> iterate over `[key, value]` pairs.

---

## 3. Inspecting Objects: `for...in`

The `for...in` loop is designed to iterate over the **properties (keys)** of an object.

### When to use for...in

Use `for...in` for **debugging or inspecting** the data inside an object.

```javascript
const user = { name: "Alice", age: 25, role: "Admin" };

for (const key in user) {
  console.log(key + ": " + user[key]);
}
```

> [!CAUTION]
> **When NOT to use:** Never use `for...in` to iterate over an **Array**. It iterates over indexes as strings and might pick up inherited properties, which can lead to unexpected bugs. Use `for...of` for Arrays instead.

---

## 4. Condition-Based: `while`

The `while` loop is simpler than the `for` loop. It only takes a condition and keeps running as long as that condition is `true`.

### When to use while

Use `while` when you **don't know exactly how many times** the loop will run, and the exit depends on a dynamic condition (like waiting for a certain data value).

```javascript
let count = 0;
while (count < 3) {
  console.log("Counting: " + count);
  count++; // Don't forget to update the condition!
}
```

> [!WARNING]
> **Infinite Loops:** If the condition never becomes `false`, the loop will run forever and crash your browser. Always ensure your code eventually breaks the condition!

---

## 5. Execution First: `do...while`

A `do...while` loop is exactly like a `while` loop, except it runs the code block **at least once** before even checking the condition.

### When to use do...while

Use `do...while` when you need the logic to **run at least once** regardless of the initial state—such as asking a user for input until it's valid.

```javascript
let response;
do {
  response = prompt("Type 'exit' to stop:");
} while (response !== "exit");
```

---

## Summary: Which Loop Should I Use?

| Scenario                             | Best Choice  |
| :----------------------------------- | :----------- |
| Iterating a specific number of times | `for` loop   |
| Iterating over an Array or String    | `for...of`   |
| Iterating over Object properties     | `for...in`   |
| Running until a condition changes    | `while`      |
| Running at least once                | `do...while` |
