---
title: Exception Handling
order: 17
---

Errors are an inevitable part of software development. In JavaScript, we manage errors through **Exceptions**. An uncaught exception will "Bubble Up" the call stack and eventually terminate the script if it reaches the global scope without being handled.

---

## 1. The `try...catch...finally` Block

The primary syntax for handling errors is the `try-catch` block.

```javascript
try {
    const data = JSON.parse(untrustedJson);
} catch (error) {
    console.error("Malformed JSON:", error.message);
} finally {
    console.log("Cleanup: closing database connection.");
}
```

- **`try`**: Wraps the code that might fail.
- **`catch`**: Executes if an error occurs. It receives the **Error Object**.
- **`finally`**: Executes regardless of the outcome (success or failure). It is the perfect place for "Cleanup" logic.

---

## 2. The Error Object

When an error occurs, JavaScript creates a specialized **Error Object**.
- **`message`**: A human-readable description of the error.
- **`name`**: The type of error (e.g., `TypeError`, `ReferenceError`, `SyntaxError`).
- **`stack`**: A string showing the sequence of function calls (The Stack Trace) that led to the error. This is invaluable for debugging.

---

## 3. Propagation: Error Bubbling

If an error is thrown inside a function and is NOT caught, the engine stops the function, moves up to the **Caller** function, and looks for a `catch` there. This continues until:
1. It is caught by a `try...catch`.
2. It reaches the **Global Execution Context**, triggering a browser console error or a Node.js crash.

---

## 4. Custom Error Classes

For production applications, you should extend the built-in `Error` class to create domain-specific error types.

```javascript
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = "ValidationError";
    }
}

throw new ValidationError("Username too short");
```

---

## Interview Pro-Tips: Async Error Handling
Remember that `try...catch` does NOT work for asynchronous callbacks or standard Promises unless you use `await`.
- **Wrong**: `try { setTimeout(() => { throw new Error(); }); } catch(e) {}` (The error happens after the catch block has finished).
- **Correct**: Using `.catch()` on the Promise or using `await` inside a `try...catch`.

---

## Technical Summary
1. `Throwing`: Use the `throw` keyword to manually trigger an error.
2. `Immutability`: Error objects once thrown should be treated as diagnostic data.
3. `Best Practice`: Always catch specific errors if possible, and avoid empty `catch` blocks which "Swallow" bugs.
