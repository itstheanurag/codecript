---
title: Browser APIs (Web APIs)
order: 12
---

While JavaScript is a powerful language, it doesn't have built-in timers or the ability to "wait." These features are provided by the **Browser Environment** (or Node.js) through **Web APIs**.

When you use `setTimeout` or `fetch`, you aren't talking to the JavaScript engine directly—you are talking to the browser.

## 1. Timers: `setTimeout`

The `setTimeout()` method schedules a function to run after a specific amount of time (in milliseconds).

```javascript
console.log("Start");

setTimeout(() => {
  console.log("Inside Timeout");
}, 2000); // Wait 2 seconds

console.log("End");
```

**Output:**

1. "Start"
2. "End"
3. (2 seconds later) "Inside Timeout"

> [!NOTE]
> Even if you set the time to `0`, the output order stays the same. This is because `setTimeout` is handled by the browser and its callback must wait for the Call Stack to be empty.

---

## 2. Intervals: `setInterval`

The `setInterval()` method calls a function repeatedly with a fixed time delay between each call.

```javascript
let count = 0;
const intervalId = setInterval(() => {
  count++;
  console.log(`Interval count: ${count}`);

  if (count === 5) {
    clearInterval(intervalId); // Stop the interval
    console.log("Stopped!");
  }
}, 1000);
```

---

## 3. Clearing Timers

Every time you create a timer, it returns a unique **ID**. You must use this ID to stop the timer if it's no longer needed, preventing memory leaks or unwanted behavior.

- **`clearTimeout(id)`**: Cancels a timeout.
- **`clearInterval(id)`**: Stops an interval.

---

## 4. Storage API: `localStorage` & `sessionStorage`

Browsers provide a way to store data locally in the user's browser, similar to a mini-database.

- **`localStorage`**: Data is stored with **no expiration date**. Even if you close the browser tab or restart your computer, the data remains.
- **`sessionStorage`**: Data is cleared when the **page session ends** (the tab is closed).

```javascript
// Saving data
localStorage.setItem("theme", "dark");

// Reading data
const currentTheme = localStorage.getItem("theme");

// Removing data
localStorage.removeItem("theme");
```

---

## 5. Network API: `fetch()`

The `fetch()` API is the modern way to make network requests (like getting data from a server or an API). It is built into the browser and returns a **Promise**.

```javascript
fetch("https://api.example.com/data")
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Error:", error));
```

---

## 6. Why doesn't JavaScript "Wait"?

JavaScript is **Single-Threaded**. If `setTimeout` actually paused the execution for 2 seconds, the entire browser tab would freeze—no scrolling, no clicking, nothing.

Instead, the browser takes the request (whether it's a timer or a fetch call), handles the work in the background, and then tells JavaScript: _"Hey, the task is done! Run this callback function when you're free."_

---

> [!IMPORTANT]
> Browser APIs are the bridge between the JS Engine and the computer's capabilities (like network, timers, and the screen).


