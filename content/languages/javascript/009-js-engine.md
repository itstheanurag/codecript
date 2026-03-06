---
title: The JS Engine Anatomy
order: 9
---

JavaScript is a high-level language, but computers don't understand "JavaScript"—they only understand machine code (`0`s and `1`s). The **JS Engine** is the specialized program that bridges this gap.

## 1. A Bit of History

In 1995, **Brendan Eich** created JavaScript for the Netscape Navigator browser in just 10 days. Back then, it was a simple **Interpreted** language—the engine would read and execute code line-by-line, which was slow.

As web apps became more complex (like Gmail and Google Maps), browsers needed something faster. This led to the creation of **V8** by Google in 2008, which introduced **Just-In-Time (JIT) Compilation**, forever changing the performance of the web.

---

## 2. Different Engines

Every browser has its own engine to handle JavaScript:

| Engine             | Developed By | Used In                             |
| :----------------- | :----------- | :---------------------------------- |
| **V8**             | Google       | Chrome, Edge, Node.js, Deno         |
| **SpiderMonkey**   | Mozilla      | Firefox (The first-ever JS engine!) |
| **JavaScriptCore** | Apple        | Safari, Bun                         |
| **Chakra**         | Microsoft    | Internet Explorer (Legacy)          |

---

## 3. The Anatomy of V8

Modern engines like V8 are incredibly sophisticated. Here is how they turn your code into raw speed:

### Step 1: Parsing & AST

The **Parser** reads your code and checks for syntax errors. If everything is correct, it creates an **Abstract Syntax Tree (AST)**—a tree-like representation of your code's logic.

### Step 2: The Interpreter (Ignition)

V8's interpreter, called **Ignition**, takes the AST and converts it into **Bytecode**. This allows the code to start running almost instantly without waiting for complex optimizations.

### Step 3: The JIT Compiler (TurboFan)

While the code is running, a "Profiler" identifies **Hot Code** (parts of your code that run over and over again). The optimizing compiler, **TurboFan**, takes this hot code and compiles it into highly efficient **Machine Code**.

### Step 4: De-optimization

If the engine's assumptions about your code change (e.g., a function suddenly receives a string instead of a number), it "de-optimizes" the code and falls back to the interpreter.

---

## 4. Orinoco: Garbage Collection

V8 also includes a component called **Orinoco** that handles memory management. It automatically looks for "dead" objects (data that is no longer reachable in your code) and clears them from memory, preventing memory leaks.

---

> [!IMPORTANT]
> Because of JIT compilation, JavaScript is no longer "just an interpreted language." It is a hybrid that combines the startup speed of an interpreter with the execution speed of a compiler.

