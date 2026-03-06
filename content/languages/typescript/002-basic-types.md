---
title: Basic Types and Type Inference
order: 2
---

In JavaScript, a variable can start as a `string`, change to a `number`, and end up as an `object`. TypeScript brings order to this chaos by ensuring that once a variable's type is established, it stays that way.

## Primitive Types

TypeScript supports the same core primitives as JavaScript. You can manually assign a type by adding a semicolon and the type name after the variable name.

### String

Used for text.

```typescript
let username: string = "Alice";
```

### Number

Used for integers, floating-point numbers, and even hex/binary.

```typescript
let age: number = 25;
let pi: number = 3.14;
```

### Boolean

Standard true/false values.

```typescript
let isMember: boolean = true;
```

### Null and Undefined

In TypeScript, `null` and `undefined` are actually types themselves.

```typescript
let empty: null = null;
let notSet: undefined = undefined;
```

---

## Type Inference: The "Smart" Feature

You might be thinking, _"Do I really have to type `: string` for every single variable? That's a lot of extra work."_

The answer is **no**.

TypeScript is smart enough to watch the first value you assign to a variable and **infer** its type. This is known as **Type Inference**.

```typescript
let greeting = "Hello World"; // TypeScript infers this is a string
greeting = 42; // ERROR: Type 'number' is not assignable to type 'string'
```

> [!IMPORTANT]
> Because of Type Inference, you should only manually annotate types when TypeScript **can't** figure it out (like an empty variable) or when you want to be explicitly clear about your intent.

## The `any` Type (Use with Caution)

Sometimes you might be working with dynamic content or migrating a messy JS codebase. In these rare cases, you can use the `any` type, which effectively turns off type checking for that variable.

```typescript
let mysteryValue: any = "I could be anything";
mysteryValue = 100; // No error
mysteryValue.someRandomMethod(); // No error (but might crash at runtime!)
```

> [!WARNING]
> Using `any` too much defeats the purpose of TypeScript. It should be used as a last resort, not a shortcut.

In the next chapter, we'll look at how to handle more complex data structures using **Interfaces** and **Type Aliases**.
