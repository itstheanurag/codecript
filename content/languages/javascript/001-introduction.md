---
title: The Language of the Web
order: 1
---

**JavaScript** (JS) is a high-level, interpreted programming language that conforms to the **ECMAScript** specification. Originally created by Brendan Eich in 1995 to add interactivity to web pages, it has evolved into a versatile, multi-paradigm language that powers everything from client-side browsers to high-performance servers (Node.js).

---

## 1. What makes JavaScript Unique?

- **Prototype-based**: Unlike class-based languages (Java, C++), JavaScript uses prototypes for inheritance—objects can inherit properties directly from other objects.
- **Dynamic and Weakly Typed**: You don't declare variable types, and types can change at runtime.
- **Single-Threaded**: JavaScript executes code in a single thread using an **Event Loop** (Module 15) to handle asynchronous operations without blocking.
- **First-Class Functions**: Functions are treated as objects; they can be stored in variables and passed as arguments.

---

## 2. The Execution Environment: Engines and Runtimes

JavaScript code is executed by an **Engine** (the most famous being Google's **V8**).
- **Compilation**: Modern engines use **JIT (Just-In-Time) compilation** to translate JS code into machine code at runtime for high performance.
- **The Runtime**: Browsers (like Chrome/Safari) or server environments (Node/Deno) provide the "Context" (Web APIs, File System access) for the engine to run.

---

## 3. ECMAScript Versions (ES6+)

While the language was stagnant for many years, the release of **ES6 (ES2015)** introduced massive improvements that modernized the language:
- **Arrow Functions**: Concise function syntax.
- **Classes**: Syntactic sugar over prototypes.
- **Modules**: `import` and `export` statements.
- **Promises**: Native support for asynchronous programming.

---

## 4. Interview Pro-Tips: JS vs Java
A classic (but simple) interview question: **Is JavaScript related to Java?**
- **The Answer**: No. The naming was a marketing tactic by Netscape to capitalize on the popularity of Java in the 90s. Beyond some basic C-style syntax, their underlying architectures (Memory management, Inheritance, Execution models) are completely different.

---

## Technical Summary
1. `Multi-Paradigm`: Supports imperative, functional, and object-oriented styles.
2. `Event-Driven`: Optimized for user interactions and I/O operations.
3. `Universal`: The only language that runs natively in all major web browsers.
