---
title: The Core Type System
order: 2
---

# Basic Types: Annotations and Inference

The foundation of TypeScript is its ability to define the **Type** of data a variable or constant can hold. This prevents logical errors where an application might try to treat a string like a number or an object like an array.

---

## 1. Type Annotations

A type annotation explicitly tells the compiler what type a variable should be.

```typescript
let username: string = "alice";
let count: number = 42;
let isActive: boolean = true;
```

---

## 2. Type Inference

TypeScript is intelligent. If you initialize a variable with a value, the compiler will **Infer** the type for you. You don't always need to write explicit annotations.

```typescript
let score = 100; // TypeScript infers 'number'
// score = "high"; // Error: Type 'string' is not assignable to type 'number'
```

**Best Practice**: Rely on inference for simple variables; use explicit annotations for function parameters and complex return types.

---

## 3. Arrays and Tuples

### I. Arrays
You can define arrays of a specific type.
```typescript
let list: number[] = [1, 2, 3];
let names: Array<string> = ["Alice", "Bob"]; // Generic syntax
```

### II. Tuples
A tuple is a fixed-length array where each element has a **Specific Type** at a **Specific Position**. This is commonly used for data pairs like GPS coordinates or state management hooks.

```typescript
let contact: [string, number];
contact = ["Alice", 123456]; // Works
// contact = [123456, "Alice"]; // Error: Type mismatch at positions 0 and 1
```

---

## 4. Enums: Named Constants

Enums allow a developer to define a set of named constants. This makes it easier to document intent and creates a set of distinct cases.

```typescript
enum TaskStatus {
    Todo,
    InProgress,
    Done
}

let current: TaskStatus = TaskStatus.Todo;
```

- **Numeric Enums**: Default to 0, 1, 2...
- **String Enums**: Allow you to provide meaningful, human-readable values.

---

## Interview Pro-Tips: Type Inference vs. Explicit
If an interviewer asks when to use which:
- **Inference**: Use for local variables with immediate assignment. It keeps the code clean and readable.
- **Explicit**: Use for function signatures (Input/Output), class properties, and cases where the variable is declared before its value is known. This ensures the "Contracts" of your application are clear and durable.

---

## Technical Summary
1. `Safety`: Prevents runtime type errors.
2. `Tuples`: Fixed-shape arrays for structured data.
3. `Enums`: Improving code readability by using semantic names for numeric/string states.
