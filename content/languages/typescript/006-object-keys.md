---
title: Accessing Object Keys: keyof and Lookup Types
order: 6
---

In dynamic JavaScript, we often access object properties using variables (e.g., `user[someKey]`). In TypeScript, we use the `keyof` operator to ensure these dynamic accesses are safe.

## The `keyof` Operator

The `keyof` operator takes an object type and produces a string or numeric literal union of its keys.

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

// Key becomes: "id" | "name" | "email"
type UserKey = keyof User;

let myKey: UserKey = "name"; // OK
myKey = "password"; // ERROR: Type '"password"' is not assignable to type 'UserKey'
```

### Why is this useful?

Imagine a function that gets a property from an object. Without `keyof`, TypeScript wouldn't know if the key exists.

```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K) {
  return obj[key];
}
```

---

## Indexed Access Types (Lookup Types)

We can also use types to "look up" the type of a specific property in another type. This is similar to how you access a value in an object, but done at the **type level**.

```typescript
interface AppConfig {
  db: {
    host: string;
    port: number;
  };
  server: {
    port: number;
  };
}

// DbConfig becomes: { host: string; port: number; }
type DbConfig = AppConfig["db"];

// PortType becomes: number
type PortType = AppConfig["server"]["port"];
```

> [!TIP]
> This is extremely powerful for maintaining a **single source of truth**. If you update the `AppConfig` interface, every lookup type that references it will update automatically.

### Indexed Access for Arrays

You can also get the type of elements in an array by using `[number]`.

```typescript
const MyArray = [
  { name: "Alice", age: 30 },
  { name: "Bob", age: 25 },
];

// UserItem becomes: { name: string, age: number }
type UserItem = (typeof MyArray)[number];
```

## Mapping over Keys (Basics)

You can even create new types based on the keys of an existing one. This is called **Mapped Types**.

```typescript
interface User {
  id: number;
  name: string;
}

// Every property in User becomes optional
type OptionalUser = {
  [K in keyof User]?: User[K];
};
```

_(Note: TypeScript actually provides a built-in for this called `Partial<User>`!)_

By mastering `keyof` and indexed access, you can write code that is dynamic like JavaScript but strictly checked like a typed language. In the final chapter, we'll bring it all together with **Generics**.
