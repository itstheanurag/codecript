---
title: Error Handling
order: 17
---

Errors are part of life for any developer. If you don't handle them, your app will crash. JavaScript provides a powerful mechanism called `try...catch` to handle these errors gracefully.

## 1. The `try...catch` Block

The fundamental way to handle errors in JavaScript is with a `try...catch` block.

```javascript
try {
  // Code that might throw an error
  const result = riskyOperation();
  console.log(result);
} catch (error) {
  // Code to run if an error occurs
  console.error("An error happened:", error.message);
} finally {
  // Code that runs no matter what (Optional)
  console.log("Cleanup complete.");
}
```

- **`try`**: You "try" to run the code inside this block.
- **`catch`**: if an error occurs, the execution stops in the `try` block and jumps here. The `error` object contains details like the `message` and the `stack` trace.
- **`finally`**: This block always runs, whether there was an error or not. It's perfect for closing database connections or hiding loading spinners.

---

## 2. Throwing Custom Errors

Sometimes you want to create your own errors when your app's logic is violated (e.g., a user enters a negative age). You can use the `throw` keyword for this.

```javascript
function checkAge(age) {
  if (age < 0) {
    throw new Error("Age cannot be negative!");
  }
  return `Age is ${age}`;
}

try {
  checkAge(-5);
} catch (e) {
  console.log(e.name); // "Error"
  console.log(e.message); // "Age cannot be negative!"
}
```

---

## 3. Asynchronous Error Handling

Error handling works differently for asynchronous code depending on whether you are using Promises or Async/Await.

### With Async/Await (Recommended)

You can use standard `try...catch` blocks, making the code very readable.

```javascript
async function fetchUser() {
  try {
    const res = await fetch("https://api.github.com/users/octocat");
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}
```

### With Promises

You use the `.catch()` method at the end of your promise chain.

```javascript
fetch("...")
  .then((res) => res.json())
  .catch((err) => console.error(err));
```

---

## 4. Why handle errors?

1. **Better User Experience**: Instead of a blank screen or a frozen app, you can show a friendly message: _"Oops, something went wrong. Please try again."_
2. **Debugging**: Errors provide a "Trace" that tells you exactly which line of code failed and why.
3. **Security**: Proper error handling prevents your app from leaking sensitive server details in the browser console.

---

> [!IMPORTANT]
> **Always handle your errors**. An unhandled promise rejection or a thrown error that isn't caught can lead to unpredictable behavior in your application.
