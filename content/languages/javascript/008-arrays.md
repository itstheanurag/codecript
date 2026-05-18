---
title: Ordered Collections: Arrays
order: 8
---

In JavaScript, **Arrays** are list-like objects whose prototype has methods to perform traversal and mutation operations. Unlike arrays in many other languages, JavaScript arrays are **Dynamic**, meaning they can store mixed types and grow/shrink automatically in memory.

---

## 1. Array Basics and Indexing

Arrays use zero-based indexing.

```javascript
const colors = ["red", "green", "blue"];
console.log(colors[0]); // "red"
console.log(colors.length); // 3
```

- **Splicing and Slicing**: 
  - `slice(start, end)`: Returns a **new** array containing a portion of the original (Non-destructive).
  - `splice(index, count, items...)`: Directly **modifies** the array by adding/removing elements (Destructive).

---

## 2. High-Order Array Methods (Functional)

Modern JavaScript development relies heavily on functional methods that treat arrays as immutable data sources.

- **`map()`**: Creates a new array with the results of calling a provided function on every element.
- **`filter()`**: Creates a new array with all elements that pass the test implemented by the provided function.
- **`reduce()`**: Executes a "reducer" function on each element, resulting in a **single output value** (e.g., a sum or an object).

```javascript
const numbers = [1, 2, 3, 4];
const sum = numbers.reduce((acc, curr) => acc + curr, 0); // 10
```

---

## 3. Searching and Sorting

- **`find()`**: Returns the **first** element that satisfies a condition.
- **`includes()`**: Checks if an array contains a specific value (returns Boolean).
- **`sort()`**: Sorts elements in-place. **Warning**: By default, it converts elements to strings before sorting, which leads to `[1, 10, 2]` instead of `[1, 2, 10]`. Always provide a compare function: `(a, b) => a - b`.

---

## 4. Performance: Time Complexity

Understanding the "Cost" of array operations is vital for writing scalable code.

| Operation | Method | Big O |
| :--- | :--- | :--- |
| **Push / Pop** | `push()`, `pop()` | O(1) |
| **Shift / Unshift** | `shift()`, `unshift()` | O(n) (Requires re-indexing) |
| **Access** | `arr[i]` | O(1) |
| **Search** | `find()`, `indexOf()` | O(n) |

---

## Interview Pro-Tips: The Array Spread Operator
Introduced in ES6, the spread operator `[...]` is the industry-standard way to copy or merge arrays without mutating the original.

```javascript
const combined = [...arr1, ...arr2];
```

---

## Technical Summary
1. `Heterogeneity`: Arrays can store different types, but for performance reasons (V8 optimizations), it is best to keep them homogeneous.
2. `Mutability`: Methods like `push`, `pop`, and `splice` modify the array in memory. Functional methods like `map` and `filter` return new arrays.
3. `Stack vs Queue`: Arrays can be used as Stacks (`push/pop`) or Queues (`push/shift`).
