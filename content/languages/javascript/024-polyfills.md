---
title: Polyfills
order: 24
---

A **Polyfill** is a piece of code (usually JavaScript on the Web) used to provide modern functionality on older browsers that do not natively support it.

In interviews, implementing polyfills is a common way to test your understanding of JavaScript internals, prototypes, and edge cases.

## 1. Array Polyfills

Modern array methods like `map`, `filter`, and `reduce` are essential. Here is how they work under the hood.

### `Array.prototype.map`

The `map()` method creates a new array populated with the results of calling a provided function on every element in the calling array.

```javascript
Array.prototype.myMap = function (callback) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    // We pass (element, index, array) to the callback
    result.push(callback(this[i], i, this));
  }
  return result;
};

const nums = [1, 2, 3];
console.log(nums.myMap((n) => n * 2)); // [2, 4, 6]
```

### `Array.prototype.filter`

The `filter()` method creates a shallow copy of a portion of a given array, filtered down to just the elements from the given array that pass the test implemented by the provided function.

```javascript
Array.prototype.myFilter = function (callback) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (callback(this[i], i, this)) {
      result.push(this[i]);
    }
  }
  return result;
};

const scores = [80, 50, 90];
console.log(scores.myFilter((s) => s > 70)); // [80, 90]
```

### `Array.prototype.reduce`

The `reduce()` method executes a user-supplied "reducer" callback function on each element of the array, in order, passing in the return value from the calculation on the preceding element.

```javascript
Array.prototype.myReduce = function (callback, initialValue) {
  let accumulator = initialValue;
  let startIndex = 0;

  // If no initial value is provided, we use the first element
  if (arguments.length < 2) {
    accumulator = this[0];
    startIndex = 1;
  }

  for (let i = startIndex; i < this.length; i++) {
    accumulator = callback(accumulator, this[i], i, this);
  }
  return accumulator;
};

const costs = [10, 20, 30];
console.log(costs.myReduce((sum, curr) => sum + curr, 0)); // 60
```

---

## 2. Promise Polyfills

Understanding how `Promise` methods work is crucial for mastering asynchronous JavaScript.

### `Promise.all`

Returns a single Promise that resolves when all of the promises passed as an iterable have resolved or when the iterable contains no promises. It rejects with the reason of the first promise that rejects.

```javascript
Promise.myAll = function (promises) {
  return new Promise((resolve, reject) => {
    const results = [];
    let completed = 0;

    if (promises.length === 0) return resolve([]);

    promises.forEach((p, index) => {
      // Use Promise.resolve(p) to handle non-promise values
      Promise.resolve(p)
        .then((res) => {
          results[index] = res;
          completed++;
          if (completed === promises.length) resolve(results);
        })
        .catch(reject);
    });
  });
};
```

### `Promise.allSettled`

Returns a promise that resolves after all of the given promises have either fulfilled or rejected, with an array of objects that each describes the outcome of each promise.

```javascript
Promise.myAllSettled = function (promises) {
  return new Promise((resolve) => {
    const results = [];
    let completed = 0;

    if (promises.length === 0) return resolve([]);

    promises.forEach((p, index) => {
      Promise.resolve(p)
        .then((value) => {
          results[index] = { status: "fulfilled", value };
        })
        .catch((reason) => {
          results[index] = { status: "rejected", reason };
        })
        .finally(() => {
          completed++;
          if (completed === promises.length) resolve(results);
        });
    });
  });
};
```

---

## 3. Function Polyfills

Method borrowing and changing the `this` context are core JS concepts.

### `Function.prototype.call`

The `call()` method calls the function with a given `this` value and arguments provided individually.

```javascript
Function.prototype.myCall = function (context, ...args) {
  // Use a unique symbol to avoid property name collisions
  const fnSymbol = Symbol("fn");

  // If no context is provided, default to globalThis (window in browsers)
  context = context || globalThis;

  // Attach the function to the context
  context[fnSymbol] = this;

  // Execute and store the result
  const result = context[fnSymbol](...args);

  // Clean up the temporary property
  delete context[fnSymbol];

  return result;
};
```

### `Function.prototype.apply`

The `apply()` method calls the function with a given `this` value and arguments provided as an array.

```javascript
Function.prototype.myApply = function (context, args = []) {
  const fnSymbol = Symbol("fn");
  context = context || globalThis;

  context[fnSymbol] = this;
  const result = context[fnSymbol](...args);
  delete context[fnSymbol];

  return result;
};
```

### `Function.prototype.bind`

The `bind()` method creates a new function that, when called, has its `this` keyword set to the provided value.

```javascript
Function.prototype.myBind = function (context, ...args) {
  const fn = this;
  return function (...newArgs) {
    return fn.apply(context, [...args, ...newArgs]);
  };
};

const person = { name: "Alice" };
function greet(city) {
  return `Hello, I'm ${this.name} from ${city}`;
}

const boundGreet = greet.myBind(person, "London");
console.log(boundGreet()); // "Hello, I'm Alice from London"
```

---

### When to use `call`, `apply`, and `bind`?

While their polyfills show how they work, understanding _why_ you'd use them is more important for real-world development.

#### 1. Method Borrowing (`call`, `apply`)

You can use a method from one object on another object, even if that object doesn't have that method.

```javascript
const runner = {
  name: "The Flash",
  run: function (speed) {
    console.log(`${this.name} is running at ${speed} mph!`);
  },
};

const turtle = { name: "Franklin" };

// Turtle borrows 'run' from runner
runner.run.call(turtle, 5); // "Franklin is running at 5 mph!"
```

#### 2. Using Built-in Methods on Non-Arrays (`call`, `apply`)

A classic use case is using `Array.prototype` methods on "array-like" objects (like `arguments` or DOM `NodeList`).

```javascript
function listArguments() {
  // arguments is NOT an array, but we can borrow slice to convert it
  const argsArray = Array.prototype.slice.call(arguments);
  return argsArray;
}
```

#### 3. Preservation of `this` (`bind`)

When you pass a method as a callback (e.g., in `setTimeout` or an Event Listener), the `this` context is often lost. `bind` creates a new function with a "locked" context.

```javascript
const user = {
  name: "Bob",
  greet() {
    console.log(`Hi, I'm ${this.name}`);
  },
};

// Error: this will be undefined/global inside setTimeout
setTimeout(user.greet, 1000);

// Success: bind creates a new function where 'this' is always 'user'
const boundGreet = user.greet.bind(user);
setTimeout(boundGreet, 1000);
```

#### Comparison Table

| Method    | Invocation | Argument Format | Result            |
| :-------- | :--------- | :-------------- | :---------------- |
| **call**  | Immediate  | Comma-separated | Value of function |
| **apply** | Immediate  | Single Array    | Value of function |
| **bind**  | **Later**  | Comma-separated | **New Function**  |

These are common interview tasks that test your knowledge of timers and closures.

### `debounce`

Ensures that a function is not called too frequently. It "waits" for a period of inactivity before executing.

```javascript
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}
```

### `throttle`

Ensures that a function is called at most once in a specified time interval.

```javascript
function throttle(fn, limit) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      fn.apply(this, args);
    }
  };
}
```

> [!TIP]
> **Practical Tip:** While you'll rarely write these from scratch in a production app (you'd use libraries like Lodash or built-in methods), knowing how to build them ensures you understand **Execution Context**, **Prototypes**, and **Closures**.
