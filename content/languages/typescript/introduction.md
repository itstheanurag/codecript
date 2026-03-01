---
title: Introduction
order: 1
---

TypeScript is a typed superset of JavaScript that compiles to plain JavaScript. It adds static types to help you catch errors early and write more maintainable code.

## Why TypeScript?

- **Type Safety**: Catch errors at compile time, not runtime.
- **Better Tooling**: Autocompletion, easier refactoring, and better documentation.
- **Large Scale**: Essential for large codebases where tracking types manually is impossible.

## Relationship to JavaScript

TypeScript is a "superset." Every valid JavaScript program is also a valid TypeScript program. TypeScript just adds an extra layer of "type annotations" on top.

```typescript
// JavaScript
function add(a, b) {
  return a + b;
}

// TypeScript
function add(a: number, b: number): number {
  return a + b;
}
```

## Compilation

Browsers don't run TypeScript. You must "compile" (or transpiled) it to JavaScript using the `tsc` compiler or tools like Vite, ESBuild, or SWC.
