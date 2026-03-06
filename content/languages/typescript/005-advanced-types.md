---
title: Advanced Types: Unknown and Never
order: 5
---

As you move beyond basic types, TypeScript provides tools to handle truly unpredictable or impossible situations. Two of the most important are `unknown` and `never`.

## The `unknown` Type

In the "Basic Types" chapter, we discussed the `any` type and how it essentially turns off TypeScript. The `unknown` type is its **safer sibling**.

Like `any`, you can assign anything to an `unknown` variable. However, unlike `any`, you **cannot use it** until you prove what it is.

```typescript
let value: unknown = "Hello";

// This will cause an error:
// value.toUpperCase();

// You must narrow the type first:
if (typeof value === "string") {
  console.log(value.toUpperCase()); // OK!
}
```

> [!TIP]
> Use `unknown` for data coming from outside your app (like API responses) where you want to force yourself to validate the data before using it.

---

## The `never` Type

The `never` type represents values that **should never exist**. It is commonly used in two scenarios:

### 1. Functions that never return

A function that throws an error or has an infinite loop returns `never`.

```typescript
function throwError(msg: string): never {
  throw new Error(msg);
}
```

### 2. Exhaustive Checking

`never` can be used to ensure you've handled every possible case in a union.

```typescript
type Direction = "North" | "South";

function move(dir: Direction) {
  switch (dir) {
    case "North":
      return "Going North";
    case "South":
      return "Going South";
    default:
      // If we add "East" to Direction but forget to handle it here,
      // TypeScript will flag this line as an error.
      const _exhaustiveCheck: never = dir;
      return _exhaustiveCheck;
  }
}
```

## Type Assertions

Sometimes you know more about a value's type than TypeScript does. In these cases, you can use a **Type Assertion** (often called "casting" in other languages).

```typescript
const myCanvas = document.getElementById("main_canvas") as HTMLCanvasElement;
```

> [!CAUTION]
> Treat type assertions like `any`. Use them sparingly, as they are a way of telling the compiler "Trust me, I know what I'm doing," which can lead to runtime errors if you're wrong.

In the next chapter, we'll dive into how to dynamically extract and use keys from your objects using **keyof**.
