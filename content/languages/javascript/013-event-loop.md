---
title: The Event Loop
order: 13
---

JavaScript is **Single-Threaded**, meaning it can only do one thing at a time. So how can it handle multiple tasks like fetching data, timers, and user clicks simultaneously? The answer is the **Event Loop**.

## 1. The Big Picture

The Event Loop is the secret manager that coordinates between the **JS Engine** and the **Browser Environment**. It consists of four main parts:

1. **Call Stack**: Where your synchronous code is executed (LIFO).
2. **Web APIs**: Where the browser handles async tasks like `setTimeout` or `fetch` in the background.
3. **Callback Queue (Macrotask Queue)**: Where tasks like `setTimeout` callbacks wait to be executed.
4. **Microtask Queue**: Where high-priority tasks like `Promise` callbacks wait.

---

## 2. How the Event Loop Works

The Event Loop has one simple job: **Watch the Call Stack.**

1. It checks if the **Call Stack** is empty.
2. If it is empty, it checks the **Microtask Queue**. If there are any tasks there, it pushes them to the stack one by one until the queue is empty.
3. Once the Microtask Queue is empty, it checks the **Callback Queue (Macrotask Queue)**. It takes the **first** task and pushes it to the stack.
4. The cycle repeats.

---

## 3. Microtasks vs. Macrotasks (Priority)

Not all asynchronous tasks are equal. **Microtasks have higher priority** than Macrotasks.

- **Microtasks**: `Promises` (`.then`, `.catch`, `.finally`), `MutationObserver`, `queueMicrotask()`.
- **Macrotasks**: `setTimeout`, `setInterval`, `setImmediate` (Node.js), I/O tasks.

### The Priority Rule

The Event Loop will **never** move to the Macrotask Queue until the Microtask Queue is completely empty.

```javascript
console.log("Start");

setTimeout(() => {
  console.log("Timeout (Macrotask)");
}, 0);

Promise.resolve().then(() => {
  console.log("Promise (Microtask)");
});

console.log("End");
```

**Output Order:**

1. `Start` (Synchronous)
2. `End` (Synchronous)
3. `Promise (Microtask)` (Higher priority)
4. `Timeout (Macrotask)` (Lower priority)

---

## 4. Why 0ms isn't actually 0ms?

When you run `setTimeout(..., 0)`, you aren't saying "run this in 0 milliseconds." You are saying "send this to the Web API, and put the callback in the Macrotask Queue as soon as possible."

Even if it takes 0ms to reach the queue, it **must** wait for:

1. All currently running synchronous code in the Call Stack to finish.
2. All pending Microtasks in the Microtask Queue to finish.

---

> [!IMPORTANT]
> **Don't Block the Main Thread**: Since there is only one Call Stack and one Event Loop, if you run a massive `for` loop that takes 10 seconds, the Event Loop cannot check the queues. This is why websites freeze when doing heavy calculations.
