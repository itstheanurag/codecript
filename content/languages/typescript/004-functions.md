---
title: Strongly Typed Functions
order: 4
---

# Functions in TypeScript: Type Safety and Signatures

In JavaScript, functions are highly flexible but often unpredictable. TypeScript addresses this by allowing developers to define **Function Signatures**—explicit contracts that specify exactly what types of arguments a function accepts and what type of value it returns.

By enforcing these contracts at compile time, TypeScript eliminates a whole category of runtime "TypeError" bugs.

---

## 1. Parameter and Return Type Annotations

A basic function in TypeScript requires annotations for both its parameters and its intended return value.

```typescript
function calculateGrossPay(hourlyRate: number, hoursWorked: number): number {
    return hourlyRate * hoursWorked;
}
```

- **Type Checking**: If you pass a string to `calculateGrossPay`, the TypeScript compiler will throw an error immediately.
- **Inference**: If you omit the return type, TypeScript will attempt to infer it based on the `return` statement. However, explicitly defining it is considered a best practice for API documentation and reliability.

---

## 2. Specialized Return Types: `void`, `never`, and `any`

### I. `void`
Used for functions that do not return a value. This is common for side-effect-heavy functions like logging or DOM manipulation.
```typescript
function logTelemetry(data: string): void {
    console.log(`[LOG]: ${data}`);
}
```

### II. `never`
Used for functions that **never finish**. This occurs if a function always throws an error or enters an infinite loop. It represents a value that will never occur.

### III. `any`
A "Bail-out" type that disables type checking. Avoid using this unless you are migrating a legacy codebase or working with extremely unpredictable third-party data.

---

## 3. Optional and Default Parameters

TypeScript allows for flexible function signatures without sacrificing safety.

- **Optional Parameters**: Marked with a `?`. They must come after all required parameters.
- **Default Parameters**: Automatically inferred as the type of their default value.

```typescript
function greetUser(name: string, title?: string, greeting: string = "Hello"): string {
    if (title) return `${greeting}, ${title} ${name}`;
    return `${greeting}, ${name}`;
}
```

---

## 4. Function Overloads

Sometimes a function can be called in multiple ways with different types. TypeScript allows you to define multiple **Overload Signatures** for a single function implementation.

```typescript
function formatData(data: string): string;
function formatData(data: number): string;
function formatData(data: any): string {
    return data.toString();
}
```

---

## Interview Pro-Tips: The Power of `readonly`
When passing objects or arrays to functions, consider using `readonly` modifiers in the signature. This ensures that the function cannot mutate the input, upholding the principle of **Immutability**.

---

### Technical Summary
1. `Signatures`: Define the contract for invocation.
2. `Return Types`: Explicitly state the output expectation (`number`, `void`, `Promise<T>`).
3. `Narrowing`: Use type guards within functions to handle `Union` types safely.
4. `Validation`: Errors are caught at compile time, not at the user's browser.

