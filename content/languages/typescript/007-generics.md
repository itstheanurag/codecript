---
title: Reusable Components: Generics
order: 7
---

# Generics: Parametric Polymorphism

**Generics** are one of the most powerful features of TypeScript. They allow you to create components that are reusable across a variety of types while still maintaining full type safety. Instead of working with a fixed type, you work with a **Type Variable**.

---

## 1. Defining a Generic Function

Imagine you have a function that returns the first element of an array.

- **Non-Generic**: To support both numbers and strings, you might use `any[]`, but then you lose the specific type information of the result.
- **Generic**: You use a type variable `<T>` to "Capture" the type of the input and use it for the output.

```typescript
function getFirst<T>(list: T[]): T {
    return list[0];
}

const firstNum = getFirst([1, 2, 3]); // firstNum is inferred as 'number'
const firstName = getFirst(["Alice", "Bob"]); // firstName is inferred as 'string'
```

---

## 2. Generic Constraints

Sometimes you want a generic to work with multiple types, but you need those types to have certain properties (e.g., a `.length` property). You can use the `extends` keyword to define a **Constraint**.

```typescript
interface Lengthwise {
    length: number;
}

function logLength<T extends Lengthwise>(item: T): void {
    console.log(item.length);
}
```

---

## 3. Generic Classes and Interfaces

Generics are not limited to functions; they are widely used in classes and interfaces to create flexible data structures.

```typescript
interface ApiResponse<Data> {
    status: number;
    payload: Data;
}

const userResponse: ApiResponse<User> = { /* ... */ };
```

---

## 4. Default Type Parameters

You can provide a default type for a generic, which is used if no type is explicitly provided or inferred.

```typescript
interface QueryResult<T = string> {
    data: T;
}
```

---

## Interview Pro-Tips: Why use Generics?
If an interviewer asks what problems generics solve:
1. **DRY (Don't Repeat Yourself)**: You don't have to write 10 versions of the same function for 10 different types.
2. **Type Preservation**: Unlike `any`, generics preserve the connection between input and output types, enabling better IDE autocomplete and safety.
3. **Abstraction**: They allow you to build complex libraries (like React or TypeORM) that work seamlessly with whatever types the end-developer provides.

---

## Technical Summary
1. `Variable Types`: Using `<T>` to represent an unknown type that will be provided at call-time.
2. `Constraints`: Restricting generics to certain shapes.
3. `Inference`: TypeScript can usually determine the type of `T` automatically based on the arguments passed to the function.
