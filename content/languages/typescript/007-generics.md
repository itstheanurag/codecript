---
title: Generics: Creating Reusable Types
order: 7
---

One of the most powerful features of TypeScript is **Generics**. They allow you to create components that work over a variety of types rather than a single one, while still maintaining full type safety.

## The Problem: Avoiding `any`

Imagine you want a function that returns the first element of an array. Without generics, you might use `any`:

```typescript
function getFirst(arr: any[]): any {
  return arr[0];
}
```

The problem? You lose all type information. If you pass an array of strings, TypeScript thinks the result is `any`, not a `string`.

## The Solution: Type Parameters

Generics allow us to capture the type of the argument as a **Type Parameter** (usually represented as `T`).

```typescript
function getFirst<T>(arr: T[]): T {
  return arr[0];
}

const names = ["Alice", "Bob"];
const firstName = getFirst(names); // TypeScript knows firstName is a string!
```

---

## Generic Interfaces

Generics aren't just for functions. You can use them to create reusable data structures.

```typescript
interface Box<T> {
  content: T;
}

const stringBox: Box<string> = { content: "Hello" };
const numberBox: Box<number> = { content: 123 };
```

## Generic Constraints

Sometimes you want a generic, but you need to ensure the type has certain properties. You can use the `extends` keyword to add a constraint.

```typescript
interface Lengthy {
  length: number;
}

function logLength<T extends Lengthy>(item: T) {
  console.log(item.length);
}

logLength("Hello"); // OK (strings have length)
logLength([1, 2, 3]); // OK (arrays have length)
logLength(42); // ERROR: Type 'number' does not have a 'length' property
```

---

## When to Use Generics?

For JavaScript developers, generics can feel abstract. A good rule is: **Use a generic whenever a function or class needs to handle different types of data while preserving the relationship between those types.**

Common examples include:

- API response wrappers: `ApiResponse<T>`
- State management hooks: `useState<User>()`
- Utility functions for arrays or objects.

With Generics, you've unlocked the full power of TypeScript's type system!
