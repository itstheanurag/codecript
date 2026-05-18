---
title: Iteration and Control Flow
order: 5
---

Iteration is the repeated execution of a set of statements. JavaScript offers multiple ways to loop through data, each suited for different data structures and performance requirements.

---

## 1. Traditional Loops: `for` and `while`

These provide the most granular control over the iteration process.

- **`for` loop**: Best for iterating a specific number of times.
- **`while` loop**: Best when the number of iterations is dependent on a dynamic condition.
- **`do...while`**: Ensures the code block runs **at least once** before checking the condition.

---

## 2. Iterating over Objects and Arrays

Modern JavaScript provides specialized loops for different data types:

### I. `for...of` (The Modern Standard)
Used for iterating over **Iterables** (Arrays, Strings, Sets, Maps). It provides the actual **Value** of each element.
```javascript
const fruits = ["apple", "banana", "cherry"];
for (const fruit of fruits) {
    console.log(fruit);
}
```

### II. `for...in` (The Object Explorer)
Used for iterating over the **Enumerable Properties** (Keys) of an object. 
- **Warning**: Do not use this for arrays! It iterates over the indices (as strings) and may include inherited properties from the prototype chain.

---

## 3. Functional Iteration: `forEach`

The `forEach` method is a built-in array method that executes a provided function once for each array element.

```javascript
fruits.forEach((fruit, index) => {
    console.log(`${index}: ${fruit}`);
});
```

- **Limitation**: You cannot use `break` or `continue` inside a `forEach`. If you need to stop early, use a `for...of` loop.

---

## 4. Performance and Efficiency

- **O(n) Complexity**: Most loops are linear in time complexity relative to the size of the dataset.
- **Optimization**: For massive arrays, a traditional `for` loop with a cached length (`let i=0, len=arr.length`) is historically the fastest, though modern engines (V8) have optimized `for...of` to be nearly identical in speed.

---

## Interview Pro-Tips: The `for...in` trap
If an interviewer asks why you shouldn't use `for...in` for arrays:
1. It iterates over the **Keys** (0, 1, 2 as strings), not the values.
2. It is slower because it traverses the entire **Prototype Chain**.
3. The iteration order is not guaranteed to be consistent across different engines.
Always use `for...of` or `forEach` for arrays.

---

## Technical Summary
1. `Iterable`: An object that implements the `[Symbol.iterator]` method.
2. `Control`: Use `break` to exit early and `continue` to skip the rest of the current iteration.
3. `Paradigm`: Functional methods (`map`, `filter`, `reduce`) are often preferred over manual loops for better readability and declustered state.
