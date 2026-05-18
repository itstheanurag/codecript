---
title: Utility Types and Templates
order: 8
---

TypeScript provides several global utility types to facilitate common type transformations. These are implemented using the Mapped Types and Conditional Types we discussed in previous modules, allowing you to create variations of your existing interfaces without redundancy.

---

## 1. Partial and Required

- **`Partial<T>`**: Constructs a type with all properties of `T` set to optional. This is essential for "Update" operations where you might only be sending a few fields.
- **`Required<T>`**: The opposite of Partial; it makes all properties mandatory.

```typescript
interface User { id: number; name: string; }

function updateUser(id: number, fields: Partial<User>) {
    // fields can be { name: "Alice" } or even {}
}
```

---

## 2. Readonly and Record

- **`Readonly<T>`**: Makes all properties of the type immutable. Attempting to reassign a property will result in a compile-time error.
- **`Record<K, T>`**: Constructs an object type with properties of type `K` and values of type `T`. This is the professional way to define "Maps" or "Dictionaries."

```typescript
const roles: Record<number, string> = {
    1: "Admin",
    2: "Member"
};
```

---

## 3. Pick and Omit

These are used to create "Subsets" of an existing interface by either choosing specific keys or excluding them.

- **`Pick<T, K>`**: Creates a type by picking a set of properties `K` from `T`.
- **`Omit<T, K>`**: Creates a type by removing a set of properties `K` from `T`.

```typescript
type UserPreview = Pick<User, "name">; // Only contains 'name'
type UserWithoutId = Omit<User, "id">; // Contains everything EXCEPT 'id'
```

---

## 4. ReturnType and Parameters

For advanced meta-programming, you can extract types directly from functions.
- **`ReturnType<T>`**: Obtains the return type of a function type.
- **`Parameters<T>`**: Obtains the core parameter types of a function as a tuple.

---

## Interview Pro-Tips: Do Utility types affect runtime?
If an interviewer asks about the performance impact of using `Partial` or `Omit`:
- **The Answer**: No. Like all TypeScript types, Utility Types are strictly for **Compile-time safety**. They are completely erased during transpilation and have zero impact on the size or speed of the final JavaScript bundle.

---

## Technical Summary
1. `Utility Types`: Standardized transformations for object shapes.
2. `Consistency`: They allow you to maintain a "Single Source of Truth" for your data models.
3. `Self-Documentation`: Using `Pick` or `Partial` clearly communicates to other developers how a function expects to interact with an object.
