---
title: Functions and Type Annotations
order: 4
---

Functions are the workhorses of JavaScript. In TypeScript, we add types to function **parameters** and **return values** to ensure they are used correctly throughout our application.

## Parameter Typing

In JavaScript, you can pass anything to a function. In TypeScript, you define exactly what is allowed.

```typescript
function greet(name: string) {
  return `Hello, ${name}!`;
}

greet("Alice"); // OK
greet(42); // ERROR: Argument of type 'number' is not assignable to parameter of type 'string'
```

## Return Type Annotations

While TypeScript can often infer what a function returns, it's a best practice to be explicit. It helps prevent accidental changes to a function's behavior.

```typescript
function add(a: number, b: number): number {
  return a + b;
}
```

If you try to return a string from the `add` function above, TypeScript will throw an error.

### The `void` Type

If a function doesn't return anything (like a `console.log` helper), we use the `void` type.

```typescript
function logMessage(message: string): void {
  console.log(message);
}
```

---

## Arrow Functions

Typing arrow functions follows the same logic, but the syntax looks a bit different.

```typescript
const multiply = (x: number, y: number): number => {
  return x * y;
};
```

## Functions with Objects (Interfaces)

This is where TypeScript really shines. You can pass objects that follow a specific interface to a function.

```typescript
interface Product {
  name: string;
  price: number;
}

function displayPrice(product: Product) {
  console.log(`${product.name} costs $${product.price}`);
}
```

## Optional and Default Parameters

Just like with interfaces, you can have optional parameters in functions.

```typescript
function greet(name: string, greeting?: string) {
  return `${greeting || "Hello"}, ${name}!`;
}

// Or using ES6 default values (TS infers the type from the default value)
function welcome(name: string, msg = "Welcome") {
  return `${msg}, ${name}`;
}
```

By adding types to your functions, you eliminate a massive category of "undefined" and "null" errors before your code even reaches the browser.
