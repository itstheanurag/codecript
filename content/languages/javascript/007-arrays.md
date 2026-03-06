---
title: Arrays
order: 7
---

In JavaScript, an **Array** is an ordered collection of values. Think of it like a numbered shelf where you can store anything—numbers, strings, objects, or even other arrays.

Arrays are **Zero-indexed**, meaning the first item is at position `0`, the second at `1`, and so on.

## 1. Basic Operations: The Stack and Queue

JavaScript arrays can act as both **Stacks** (Last-In, First-Out) and **Queues** (First-In, First-Out) using built-in methods.

### Adding and Removing at the End (Stack)

- **`push()`**: Adds one or more elements to the end.
- **`pop()`**: Removes and returns the last element.

```javascript
let fruits = ["Apple", "Banana"];
fruits.push("Orange"); // ["Apple", "Banana", "Orange"]
let last = fruits.pop(); // "Orange", fruits is back to ["Apple", "Banana"]
```

### Adding and Removing at the Start (Queue)

- **`unshift()`**: Adds one or more elements to the beginning.
- **`shift()`**: Removes and returns the first element.

```javascript
fruits.unshift("Strawberry"); // ["Strawberry", "Apple", "Banana"]
fruits.shift(); // "Strawberry", fruits is ["Apple", "Banana"]
```

---

## 2. In-depth: Higher-Order Methods

These are the "power tools" of JavaScript development. They allow you to transform and search through data without writing complex `for` loops.

### I. Transformation: `map()`

Creates a **new array** by applying a function to every element of the original array.

- **Why use it?** When you want to change the format or value of every item.
- **How it works**: It iterates through the array and uses the return value of your function as the new item.

```javascript
const numbers = [1, 2, 3];
const doubled = numbers.map((n) => n * 2); // [2, 4, 6]
```

### II. Filtering: `filter()`

Creates a **new array** containing only the elements that pass a specific test.

- **Why use it?** When you want to remove unwanted items from a collection.

```javascript
const users = [
  { name: "Alice", active: true },
  { name: "Bob", active: false },
];
const activeUsers = users.filter((user) => user.active); // [{ name: "Alice", active: true }]
```

### III. Accumulation: `reduce()`

Executes a "reducer" function on each element, resulting in a **single output value**.

- **Why use it?** When you need to boil down an array into one value (e.g., a total sum, a single object).
- **How it works**: It carries an "accumulator" from one iteration to the next.

```javascript
const costs = [10, 20, 30];
const total = costs.reduce((sum, current) => sum + current, 0); // 60
```

> [!TIP]
> **The Initial Value:** Always provide the second argument to `reduce` (the `0` in the example above). This ensures your code works even if the array is empty!

---

## 3. Destructuring and Spread

Modern JavaScript features make working with arrays incredibly clean.

### Destructuring

"Unpack" values from arrays directly into variables.

```javascript
const [first, second] = ["Red", "Blue", "Green"];
console.log(first); // "Red"
```

### Spread Operator (`...`)

Used to combine arrays or create copies.

```javascript
const basicColors = ["Red", "Blue"];
const allColors = [...basicColors, "Green", "Yellow"];
```

---

## 4. Mutating vs. Non-Mutating Methods

Understanding which methods change the original array is critical for preventing bugs.

| Non-Mutating (Safe)   | Mutating (Changes original) |
| :-------------------- | :-------------------------- |
| `map()`, `filter()`   | `push()`, `pop()`           |
| `concat()`, `slice()` | `splice()`, `reverse()`     |
| `reduce()`, `join()`  | `sort()`, `shift()`         |

> [!IMPORTANT]
> **React/Modern Frameworks:** Always prefer **Non-Mutating** methods. If you need to use a mutating method like `sort()`, create a copy first: `[...myArray].sort()`.
