---
title: Interfaces and Type Aliases
order: 3
---

While primitive types are useful, most of our time in JavaScript is spent working with objects. In TypeScript, we can define the blueprint for an object using **Interfaces** or **Type Aliases**.

## Using Interfaces

An `interface` is the most common way to define the shape of an object.

```typescript
interface User {
  id: number;
  username: string;
  email: string;
}

const newUser: User = {
  id: 1,
  username: "gaurav_dev",
  email: "gaurav@example.com",
};
```

If you forget a property or add one that doesn't belong, TypeScript will alert you immediately.

### Optional Properties

Sometimes a property isn't required. You can mark it as optional using a `?`.

```typescript
interface User {
  id: number;
  username: string;
  bio?: string; // This property is now optional
}
```

### Readonly Properties

You can prevent a property from being modified after it's created.

```typescript
interface User {
  readonly id: number;
  username: string;
}

const user = { id: 1, username: "alice" };
user.id = 2; // ERROR: Cannot assign to 'id' because it is a read-only property
```

---

## Type Aliases

A **Type Alias** is another way to name a type. It's often used for things other than just objects, such as unions or primitives.

```typescript
type ID = string | number; // This variable can be a string OR a number
type Point = {
  x: number;
  y: number;
};
```

### Union Types

One of the most powerful features of TypeScript is the `|` (OR) operator, allowing a variable to hold multiple types of values.

```typescript
type Status = "success" | "error" | "loading";

let currentStatus: Status = "loading";
currentStatus = "success"; // OK
currentStatus = "pending"; // ERROR: Type '"pending"' is not assignable to type 'Status'
```

## Interface vs. Type: Which one should I use?

For a JavaScript developer, they often seem identical. Here's a simple rule of thumb:

1.  **Use `interface`** for object structures. Interfaces are better for "extending" (adding more properties later) and are slightly more performant in large codebases.
2.  **Use `type`** for complex logic, unions, or mapping types.

In the next chapter, we'll dive into how to use these types to make your **Functions** safer and easier to read.
