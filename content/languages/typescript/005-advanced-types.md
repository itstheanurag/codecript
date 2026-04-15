---
title: Advanced Type Patterns
order: 5
---

# Advanced Types: Literal, Union, and Intersections

Once you master the basic types, you can combine them to create complex, highly specific type signatures. This allows you to model real-world data and logic with extreme precision.

---

## 1. Union Types (`|`)

A union type allows a value to be one of several types. This is the most common way to handle variables that can take multiple forms (e.g., a function that accepts either a `string` or a `number`).

```typescript
function printId(id: number | string) {
    console.log("Your ID is: " + id);
}
```

---

## 2. Literal Types

Literal types allow you to specify exact values that a variable must have—not just the "Type," but the **Specific Value**.

```typescript
let alignment: "left" | "right" | "center";
alignment = "left"; // Works
// alignment = "top"; // Error: Type '"top"' is not assignable to type '"left" | "right" | "center"'
```

---

## 3. Intersection Types (`&`)

An intersection type creates a new type by combining multiple existing types. The new type will have **All** properties of all the intersected types.

```typescript
type Draggable = { drag: () => void };
type Resizable = { resize: () => void };

type UIComponent = Draggable & Resizable;
```

---

## 4. Type Guards and Narrowing

When using union types, you often need to "Narrow" the type to a specific one before you can perform operations on it. TypeScript uses **Type Guards** to do this safely.

- **`typeof`**: Used for primitive types.
- **`instanceof`**: Used for class instances.
- **`in`**: Used to check for the existence of a property on an object.

```typescript
function process(val: string | number) {
    if (typeof val === "string") {
        console.log(val.toUpperCase()); // TS knows 'val' is definitely a string here
    }
}
```

---

## Interview Pro-Tips: Discriminated Unions
This is a core pattern in Redux and state management. You add a common property (a "Tag" or "Discriminant") to several related interfaces to make narrowing them extremely efficient and type-safe inside a `switch` statement.

```typescript
interface Success { status: "success"; data: string; }
interface Failure { status: "error"; message: string; }

type Response = Success | Failure;
```

---

## Technical Summary
1. `Unions`: "Either A or B."
2. `Intersections`: "Both A and B."
3. `Literals`: Precise values as types.
4. `Narrowing`: Proving to the compiler which type you are currently working with.
