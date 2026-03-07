---
title: Generator Functions
order: 23
---

Normal JavaScript functions follow a "Run-to-Completion" model: once they start, they don't stop until they finish or return. **Generators** break this rule.

A Generator is a function that can **pause** its execution and resume it later, yielding multiple values over time.

## 1. Syntax: The Asterisk (`*`)

To define a generator, you add an asterisk after the `function` keyword. To pause it, you use the `yield` keyword.

```javascript
function* numberSequence() {
  console.log("Start");
  yield 1;
  console.log("Middle");
  yield 2;
  console.log("End");
}
```

## 2. The Iterator Object

When you call a generator, it **does not run the code**. Instead, it returns a special **Iterator object**. You control the execution by calling the `.next()` method on this object.

```javascript
const gen = numberSequence();

console.log(gen.next()); // { value: 1, done: false }
console.log(gen.next()); // { value: 2, done: false }
console.log(gen.next()); // { value: undefined, done: true }
```

---

## 3. Why Use Generators?

While they might look like simple arrays, generators have two massive advantages:

### I. Iterating over "Infinity"

Because they only generate values when asked, you can create sequences that never end without crashing your computer.

```javascript
function* idGenerator() {
  let id = 1;
  while (true) {
    yield id++;
  }
}

const ids = idGenerator();
console.log(ids.next().value); // 1
console.log(ids.next().value); // 2
```

### II. Memory Efficiency

If you need to process 1,000,000 items, an array would store all of them in memory at once. A generator processes them **one by one**, using almost no memory.

---

## 4. Communication with Generators

Generators aren't just one-way streets. You can pass values _back_ into the generator when you call `.next()`.

```javascript
function* greet() {
  const name = yield "What is your name?";
  yield `Hello, ${name}!`;
}

const g = greet();
console.log(g.next().value); // "What is your name?"
console.log(g.next("Alice").value); // "Hello, Alice!"
```

---

## 5. Generators and `for...of`

Since generators return iterators, they work perfectly with the `for...of` loop. The loop will automatically call `.next()` until `done` is true.

```javascript
function* steps() {
  yield "Step 1";
  yield "Step 2";
}

for (let step of steps()) {
  console.log(step);
}
```

Generators provide a powerful way to handle data streams and complex async logic. With this, you have covered almost every major internal architecture of JavaScript!