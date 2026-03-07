---
title: Asynchronous JavaScript
order: 16
---

JavaScript is a single-threaded language, but most of the things it does (like network calls or timers) are asynchronous. To understand why we need this, let's look at an analogy.

## 1. The Restaurant Analogy

Imagine a restaurant with only **one waiter** (The JS Engine).

- **Synchronous Execution**: The waiter takes an order for Table A, walks to the kitchen, and **stands there** until the food is ready. Only then does he deliver it and move to Table B. The restaurant is slow, and customers are angry.
- **Asynchronous Execution**: The waiter takes an order for Table A, gives it to the kitchen, and **immediately** goes to take the order for Table B. When the kitchen dings the bell (the Callback), the waiter returns to deliver Table A's food.

Asynchronous programming allows JavaScript to "place an order" and keep moving, making the web feel fast and responsive.

---

## 2. The Evolution: Callbacks

The traditional way to handle async was by passing a function as an argument to another function. This is called a **Callback**.

```javascript
function fetchData(callback) {
  setTimeout(() => {
    callback("Data received!");
  }, 2000);
}

fetchData((result) => {
  console.log(result);
});
```

### Callback Hell (The Pyramid of Doom)

When you have multiple async tasks that depend on each other, your code starts crawling to the right, becoming a maintenance nightmare.

```javascript
getData((user) => {
  getProfile(user.id, (profile) => {
    getPosts(profile.id, (posts) => {
      // It keeps going...
    });
  });
});
```

---

## 3. The Solution: Promises

A **Promise** is an object representing the eventual completion (or failure) of an asynchronous operation.

### The Three States

1. **Pending**: Initial state, neither fulfilled nor rejected.
2. **Fulfilled**: Operation completed successfully.
3. **Rejected**: Operation failed.

```javascript
const myPromise = new Promise((resolve, reject) => {
  const success = true;
  if (success) resolve("Success!");
  else reject("Error!");
});

myPromise
  .then((res) => console.log(res))
  .catch((err) => console.error(err))
  .finally(() => console.log("Done"));
```

- **`.then()`**: This runs when the promise is **fulfilled** (successful). It receives the value passed into `resolve()`.
- **`.catch()`**: This runs when the promise is **rejected** (failed). It receives the error or value passed into `reject()`.
- **`.finally()`**: This runs **every time**, regardless of whether the promise was successful or not. It's often used for cleanup tasks like closing a connection or stopping a loading spinner.

### Promise Concurrency Methods

Sometimes you need to handle multiple promises at once. JavaScript provides powerful static methods for this:

| Method                     | Behavior                                        | Pros                                      | Cons                                                         |
| :------------------------- | :---------------------------------------------- | :---------------------------------------- | :----------------------------------------------------------- |
| **`Promise.all()`**        | Waits for all to succeed.                       | Fastest if you need all data.             | **All or nothing**. If one fails, the whole thing rejects.   |
| **`Promise.allSettled()`** | Waits for all to finish, regardless of success. | **Safe**. You get results for everything. | Slower (waits for everything even if some could fail early). |
| **`Promise.race()`**       | Returns the first result (success or failure).  | Good for timeouts.                        | You lose the other results.                                  |
| **`Promise.any()`**        | Returns the first **successful** result.        | Good for redundant servers.               | Rejects only if **all** fail.                                |

> [!TIP]
> Interested in how these work under the hood? See the [Promise Polyfills](./021-polyfills#2-promise-polyfills).

---

## 4. Modern Standard: Async/Await

Introduced in ES2017, `async` and `await` are "syntactic sugar" built on top of Promises. They make asynchronous code look and behave like synchronous code.

```javascript
async function getUserData() {
  try {
    const user = await getData(); // "Awaits" the promise to resolve
    const profile = await getProfile(user.id);
    console.log(profile);
  } catch (error) {
    console.error("Failed to fetch data", error);
  }
}
```

> [!IMPORTANT]
> An `async` function **always** returns a Promise. Even if you return a simple string, it is automatically wrapped in a resolved Promise.
