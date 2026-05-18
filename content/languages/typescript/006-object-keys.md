---
title: Introspection and Mapped Types
order: 6
---

One of TypeScript's most powerful features is its ability to perform **Type Introspection**—extracting type information from existing structures. This allows you to build highly dynamic yet completely type-safe code.

---

## 1. The `keyof` Type Operator

The `keyof` operator takes an object type and produces a string or numeric literal union of its keys.

```typescript
interface User {
    id: number;
    name: string;
    email: string;
}

type UserKeys = keyof User; // "id" | "name" | "email"
```

This is essential for functions that access properties dynamically. Instead of accepting any `string`, you can restrict the input to only valid keys of the object.

---

## 2. Indexed Access Types

You can use an index access type to look up a specific property on another type. Think of this as "Reading" the type of a property from a template.

```typescript
type NameType = User["name"]; // string
type IdOrName = User["id" | "name"]; // number | string
```

---

## 3. Mapped Types: Programmatic Transformation

Mapped types allow you to create new types based on the properties of an existing type by "Mapping" over the keys. This is the foundation for many of TypeScript's built-in utility types (like `Partial` or `Readonly`).

```typescript
type Optional<T> = {
    [P in keyof T]?: T[P];
};

type OptionalUser = Optional<User>; // All properties of User are now optional
```

---

## 4. Conditional Types (`extends ? :`)

At the heart of advanced TypeScript is the conditional type, which allows you to choose a type based on a condition—similar to a ternary operator in JavaScript.

```typescript
type IsString<T> = T extends string ? "yes" : "no";
```

---

## Interview Pro-Tips: Why use mapped types?
If an interviewer asks about the benefits of mapped types:
- **The Answer**: They ensure **Consistency**. Instead of manually updating a `PartialUser` interface every time you add a field to the `User` interface, a mapped type will automatically include the new field, making your codebase significantly more maintainable and less error-prone.

---

## Technical Summary
1. `keyof`: Extracting keys as a union.
2. `Indexed Access`: Querying the type of a specific property.
3. `Mapped Types`: Iterating over keys to transform structures.
4. `Scalability`: These tools prevent the need for redundant interface definitions.
