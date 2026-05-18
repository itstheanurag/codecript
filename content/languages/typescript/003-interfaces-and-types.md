---
title: Defining Shapes: Interfaces and Types
order: 3
---

In TypeScript, there are two primary ways to define the "Shape" of an object: **Interfaces** and **Type Aliases**. While they are very similar, they have distinct behaviors that make them better suited for different architectural scenarios.

---

## 1. Interfaces: The Extendable Contract

An `interface` is the standard way to describe the structure of an object. Their primary strength is their ability to be **Extended** via inheritance.

```typescript
interface User {
    id: number;
    username: string;
}

interface Admin extends User {
    permissions: string[];
}
```

- **Open for Extension**: Interfaces can be merged. If you define an interface with the same name twice, TypeScript will "Merge" them into one. This is essential for polyfilling or extending third-party libraries.

---

## 2. Type Aliases: The Flexible Alias

A `type` alias is a name for any type—not just objects, but also primitives, unions, and tuples. Their primary strength is their **Composability**.

```typescript
type ID = number | string; // Union type
type Point = { x: number; y: number };

type AppConfig = {
    apiKey: string;
} & Point; // Intersection operator
```

- **Closed for Extension**: Unlike interfaces, types cannot be redeclared once they are defined.

---

## 3. When to use which?

### Use **Interface** when:
- You are defining the API of a library or a shared data model.
- You need to use the `extends` keyword for hierarchical structures.
- You want to take advantage of **Declaration Merging**.

### Use **Type** when:
- You are using Union types (`|`) or Intersection types (`&`).
- You are defining complex function signatures or tuples.
- You need a simple alias for a primitive or a specific literal value.

---

## 4. Optional and Readonly Properties

Both systems allow you to control the accessibility of properties:
- **Optional (`?`)**: The property doesn't have to exist on the object.
- **Readonly (`readonly`)**: The property cannot be modified after it is initialized.

```typescript
interface Document {
    readonly id: string;
    title: string;
    tags?: string[];
}
```

---

## Interview Pro-Tips: Declaration Merging
If an interviewer asks "What is one thing an interface can do that a type cannot?", mention **Declaration Merging**. This allows you to add new properties to existing types (like `window` or `ProcessEnv`) without modifying the original source code.

---

## Technical Summary
1. `Interface`: The industry standard for object shapes and inheritance.
2. `Type Alias`: Used for unions, intersections, and primitives.
3. `Structural`: Both systems are structural—if the shape matches, the type matches.
