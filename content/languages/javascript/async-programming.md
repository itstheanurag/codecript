---
title: Async Programming
order: 4
---

JavaScript is single-threaded but handles asynchronous operations through an event loop.

## Callbacks

The original async pattern — pass a function to be called later:

```javascript
setTimeout(() => {
  console.log("Runs after 1 second");
}, 1000);
```

Callbacks become unmanageable when nested deeply ("callback hell").

## Promises

A Promise represents a value that may not be available yet:

```javascript
fetch("/api/users")
  .then((res) => res.json())
  .then((users) => console.log(users))
  .catch((err) => console.error(err))
  .finally(() => console.log("Done"));
```

### Creating Promises

```javascript
function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

delay(1000).then(() => console.log("1 second passed"));
```

## Async/Await

Syntactic sugar over promises — makes async code look synchronous:

```javascript
async function getUsers() {
  try {
    const res = await fetch("/api/users");
    const users = await res.json();
    return users;
  } catch (err) {
    console.error("Failed:", err);
  }
}
```

## Promise.all

Run multiple async operations in parallel:

```javascript
const [users, posts] = await Promise.all([
  fetch("/api/users").then((r) => r.json()),
  fetch("/api/posts").then((r) => r.json()),
]);
```

## Key Rules

- `await` can only be used inside `async` functions
- Always handle errors with `try/catch` or `.catch()`
- Use `Promise.all` for independent parallel operations
- Use sequential `await` when operations depend on each other
