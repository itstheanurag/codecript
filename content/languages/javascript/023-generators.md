---
title: Generators and Iteration
order: 23
---

# Generators: Pausable Execution

A **Generator** is a special type of function that can be paused and resumed, allowing for the creation of memory-efficient iterators and complex asynchronous flows. Unlike a regular function that runs to completion, a generator "Yields" values one at a time.

---

## 1. Syntax: The `function*` and `yield`

Generators are defined using the `function*` syntax and use the `yield` keyword to return a value and suspend execution.

```javascript
function* numberSequence() {
    yield 1;
    yield 2;
    yield 3;
}

const gen = numberSequence(); // Returns a Generator Object
console.log(gen.next().value); // 1
```

---

## 2. The Iteration Protocol

A generator object is both an **Iterable** and an **Iterator**.
- **`next()`**: Returns an object with two properties: `value` (the yielded data) and `done` (a boolean indicating if the generator has finished).
- **Infinite Sequences**: Because generators only calculate values on demand, they can represent infinite sequences (like a random number stream) without exhausting memory.

---

## 3. Communication: Passing values back

Generators are two-way streets. Not only can they yield values to the caller, but the caller can also send values **Back** into the generator through the `next(value)` method.

```javascript
function* conversationalist() {
    const name = yield "What is your name?";
    console.log(`Hello, ${name}`);
}

const gen = conversationalist();
gen.next(); // Starts the generator
gen.next("Alice"); // Sends "Alice" into the variable 'name'
```

---

## 4. Asynchronous Generators

Modern JavaScript supports `async function*`, which allows you to `yield` promises. This is commonly used for processing streams of data or results from paginated APIs.

```javascript
async function* fetchPages(url) {
    while (url) {
        const response = await fetch(url);
        const data = await response.json();
        yield data.items;
        url = data.nextPage;
    }
}
```

---

## Interview Pro-Tips: Generators vs. Async/Await
If an interviewer asks about the relationship between them:
- **The Answer**: Historically, generators were used with "Co-routines" (like the library `co`) to implement async/await before it was natively supported by the language. Under the hood, **async/await is powered by a combination of generators and promises**.

---

## Technical Summary
1. `Suspension`: Local context (variables, pointer) is preserved between yields.
2. `Lazy Evaluation`: Processing items only when consumed.
3. `Stream Processing`: Ideal for handling datasets too large to fit in a single array.
