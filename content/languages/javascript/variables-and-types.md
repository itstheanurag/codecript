---
title: Variables and Types
order: 2
---

JavaScript has three ways to declare variables and seven primitive types.

## Declarations

```javascript
const name = "Alice"; // block-scoped, can't be reassigned
let age = 25; // block-scoped, can be reassigned
var legacy = true; // function-scoped, avoid in modern code
```

**Rule of thumb:** Use `const` by default. Use `let` only when you need to reassign. Never use `var`.

## Primitive Types

| Type        | Example             |
| ----------- | ------------------- |
| `string`    | `"hello"`           |
| `number`    | `42`, `3.14`        |
| `bigint`    | `9007199254740991n` |
| `boolean`   | `true`, `false`     |
| `undefined` | `undefined`         |
| `symbol`    | `Symbol("id")`      |
| `null`      | `null`              |

## Type Checking

```javascript
typeof "hello"; // "string"
typeof 42; // "number"
typeof true; // "boolean"
typeof undefined; // "undefined"
typeof null; // "object" (infamous JS bug)
typeof {}; // "object"
typeof []; // "object" (use Array.isArray())
```

## Type Coercion

JavaScript automatically converts types in certain contexts — this is called coercion:

```javascript
"5" + 3; // "53" (string concatenation)
"5" - 3; // 2    (numeric subtraction)
"5" == 5; // true (loose equality, coerces)
"5" === 5; // false (strict equality, no coercion)
```

**Always use `===`** for comparisons to avoid surprises.
