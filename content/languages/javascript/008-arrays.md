---
title: Arrays
order: 8
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

## 2. Searching and Finding

Modern JavaScript provides direct ways to locate items or check their existence without manual loops.

### I. Finding Elements: `find()` and `findIndex()`

- **`find()`**: Returns the **first element** that satisfies a condition. If nothing is found, it returns `undefined`.
- **`findIndex()`**: Returns the **index** of the first element that satisfies a condition, or `-1` if not found.

```javascript
const users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
];

const user = users.find((u) => u.id === 2); // { id: 2, name: "Bob" }
const index = users.findIndex((u) => u.name === "Alice"); // 0
```

### II. Existence Check: `includes()`

Returns `true` if an array contains a specific value. It is much more readable than the older `indexOf() !== -1`.

```javascript
const fruits = ["Apple", "Orange"];
console.log(fruits.includes("Apple")); // true
```

### III. Logical Checks: `some()` and `every()`

- **`some()`**: Returns `true` if **at least one** element passes the test.
- **`every()`**: Returns `true` if **all** elements pass the test.

```javascript
const ages = [18, 20, 15, 25];
const hasMinor = ages.some((age) => age < 18); // true
const allAdults = ages.every((age) => age >= 18); // false
```

---

## 3. Transformation and Accumulation

These methods allow you to process and transform data fluently.

### I. Transformation: `map()`

Creates a **new array** by applying a function to every element.

```javascript
const numbers = [1, 2, 3];
const doubled = numbers.map((n) => n * 2); // [2, 4, 6]
```

### II. Filtering: `filter()`

Creates a **new array** with only the elements that pass a test.

```javascript
const scores = [45, 80, 20, 90];
const highScores = scores.filter((s) => s > 70); // [80, 90]
```

### III. Accumulation: `reduce()`

Boils an array down to a **single value** (like a sum, an object, or a string).

```javascript
const costs = [10, 20, 30];
const total = costs.reduce((sum, current) => sum + current, 0); // 60
```

> [!TIP]
> **Always provide an initial value** (like `0` above) to prevent errors on empty arrays!

### IV. Flattening: `flat()` and `flatMap()`

- **`flat()`**: Flattens nested arrays.
- **`flatMap()`**: Combines `map()` and `flat()` into one efficient step.

```javascript
const nested = [1, [2, 3]];
const simple = nested.flat(); // [1, 2, 3]

const words = ["Hello", "World"];
const letters = words.flatMap((w) => w.split("")); // ["H", "e", "l", "l", "o", "W", "o", "r", "l", "d"]
```

---

## 4. Modern Utilities

### Modern Indexing: `at()`

Allows you to access elements using positive or **negative** indices (index from the end).

```javascript
const colors = ["Red", "Green", "Blue"];
console.log(colors.at(0)); // "Red"
console.log(colors.at(-1)); // "Blue" (last item)
```

### Creating Arrays: `Array.from()` and `Array.of()`

- **`Array.from()`**: Creates an array from an array-like or iterable object (e.g., a Set).
- **`Array.of()`**: Creates an array from a variable number of arguments.

```javascript
const str = "hello";
const chars = Array.from(str); // ["h", "e", "l", "l", "o"]

const nums = Array.of(1, 2, 3); // [1, 2, 3]
```

---

## 5. Destructuring and Spread

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

## 6. ES2023: Non-Mutating Methods

The latest JavaScript version added "safe" versions of mutating methods. These return a **new array** instead of changing the original.

- **`toSorted()`**: Non-mutating version of `sort()`.
- **`toReversed()`**: Non-mutating version of `reverse()`.
- **`toSpliced()`**: Non-mutating version of `splice()`.
- **`with(index, value)`**: Returns a new array with the element at `index` replaced by `value`.

```javascript
const original = ["C", "B", "A"];
const sorted = original.toSorted(); // ["A", "B", "C"]
console.log(original); // ["C", "B", "A"] (unchanged)

const replaced = original.with(0, "D"); // ["D", "B", "A"]
```

---

## 7. Mutating vs. Non-Mutating Methods

Understanding which methods change the original array is critical for preventing bugs.

| Non-Mutating (Safe)              | Mutating (Changes original) |
| :------------------------------- | :-------------------------- |
| `map()`, `filter()`, `reduce()`  | `push()`, `pop()`           |
| `concat()`, `slice()`, `join()`  | `splice()`, `reverse()`     |
| **`toSorted()`, `toReversed()`** | `sort()`, `shift()`         |
| **`toSpliced()`, `with()`**      | `unshift()`                 |

> [!IMPORTANT]
> **React/Modern Frameworks:** Always prefer **Non-Mutating** methods. If you need to use a mutating method like `sort()`, create a copy first: `[...myArray].sort()`.
