---
title: Asynchronous Programming
order: 16
---

Asynchronous programming is the cornerstone of responsive JavaScript applications. It allows the engine to initiate long-running operations—like network requests or file reads—and continue executing other code while waiting for the result.

---

## 1. The Evolutions: From Callbacks to Promises

### I. Callbacks
The original way to handle async was by passing a function (callback) to another function.
- **Problem**: "Callback Hell"—deeply nested functions that are unreadable and impossible to debug.

### II. Promises (ES6)
A **Promise** is an object representing the eventual completion (or failure) of an asynchronous operation and its resulting value.
- **States**: `Pending`, `Fulfilled`, or `Rejected`.
- **Chaining**: Using `.then()` and `.catch()` to handle results sequentially.

---

## 2. The Modern Standard: Async/Await (ES2017)

Async/Await is "Syntactic Sugar" over Promises. It allows you to write asynchronous code that looks and behaves like synchronous code, making it significantly easier to read and maintain.

```javascript
async function fetchData() {
    try {
        const response = await fetch("https://api.example.com/data");
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error("Failed to fetch:", error);
    }
}
```

- **`async`**: Re-wraps the return value of the function in a Promise.
- **`await`**: Pauses the execution of the function until the Promise settles.

---

## 3. Handling Parallelism: `Promise.all`

Sometimes you want to fire off multiple requests at once and wait for **all** of them to finish.

```javascript
const [user, posts] = await Promise.all([
    fetchUser(id),
    fetchPosts(id)
]);
```

- **Optimization**: This is much faster than awaiting them one-by-one, as the requests happen in parallel.

---

## 4. The Microtask Queue Priority

As discussed in Module 15, Promise callbacks are placed in the **Microtask Queue**. 
- The Event Loop will execute **ALL** pending microtasks before processing the next macrotask (like a `setTimeout`).
- This is why Promises feel more "Immediate" than timers.

---

## Interview Pro-Tips: Error Handling in Async
If an interviewer asks how to handle errors in an `async` function:
- **The Answer**: Always use `try...catch` blocks. If you don't catch the error inside the `async` function, it will result in an "Unhandled Promise Rejection," which can crash the process in environments like Node.js.

---

## Technical Summary
1. `Promise`: An object-based representation of a future value.
2. `Async/Await`: A way to linearize asynchronous logic.
3. `Non-Blocking`: Async operations are offloaded to Web APIs (browser) or libuv (Node.js).
