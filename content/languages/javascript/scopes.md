---
title: Scopes and Hoisting
order: 7
---

In the previous section, we mentioned that `var`, `let`, and `const` have different "scopes." In this section, we'll explore what that actually means and how JavaScript handles variable visibility.

## What is Scope?

Scope is the current context of execution in which values and expressions are "visible" or can be referenced. If a variable is not in the current scope, it is unavailable for use.

JavaScript has three main types of scope:

1. **Global Scope:** Variables declared outside any function or block. They are accessible from anywhere in your code.
2. **Function Scope:** Variables declared inside a function. They are only accessible within that function.
3. **Block Scope (ES6+):** Variables declared with `let` or `const` inside a block `{ }`. They are only accessible within that block.

## Global Scope

```javascript
const globalVar = "I'm global";

function checkGlobal() {
  console.log(globalVar); // Works!
}

checkGlobal();
console.log(globalVar); // Works!
```

## Function Scope (The `var` Way)

Variables declared with `var` are "function-scoped."

```javascript
function testFunctionScope() {
  var functionScoped = "I'm inside a function";
  console.log(functionScoped); // Works!
}

testFunctionScope();
// console.log(functionScoped); // Uncaught ReferenceError: functionScoped is not defined
```

## Block Scope (The `let` and `const` Way)

Variables declared with `let` and `const` are "block-scoped." A block is any code between curly braces `{ }`.

```javascript
if (true) {
  let blockScoped = "I'm inside a block";
  const alsoBlockScoped = "Me too";
  var notBlockScoped = "I'm actually function-scoped!";

  console.log(blockScoped); // Works!
}

// console.log(blockScoped); // Uncaught ReferenceError
console.log(notBlockScoped); // Works! (This is why var can be dangerous)
```

## What is Hoisting? (The "Teacher" Analogy)

Imagine you are in a classroom. Before the teacher (JavaScript) starts the lesson, they walk around the room and look at everyone's name tags.

Even if you haven't started "working" yet (initialization), the teacher already knows you are in the room because they saw your name tag (declaration) and put it at the top of their list.

**In technical terms:** Hoisting is a JavaScript mechanism where variable and function declarations are moved to the top of their containing scope during the compile phase. This happens before any code is actually executed.

### Hoisting with `var`

Variables declared with `var` are hoisted and initialized with `undefined`.

```javascript
console.log(x); // undefined (No error!)
var x = 5;
```

### Hoisting with `let` and `const`

Variables declared with `let` and `const` are also hoisted, but they are **not initialized**. They exist in a "Temporal Dead Zone" (TDZ) from the start of the block until the declaration is processed.

```javascript
// console.log(y); // Uncaught ReferenceError: Cannot access 'y' before initialization
let y = 10;
```

---

## Best Practices

1. **Always use `const` or `let`**: Avoid `var` to prevent scope-related bugs and confusing hoisting behavior.
2. **Declare variables at the top of their scope**: Even though hoisting exists, declaring variables at the top makes your code much more readable.
3. **Minimize Global Variables**: Relying on global variables can lead to naming collisions and hard-to-debug code.
