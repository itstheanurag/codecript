---
title: Logical and Mathematical Operators
order: 3
---

Operators in JavaScript are used to transform data and evaluate logic. Beyond basic arithmetic, JavaScript's operator set includes powerful tools for handling null values and managing complex conditional logic.

---

## 1. Equality: `==` vs `===`

One of the most common pitfalls for developers is the distinction between loose and strict equality.

- **Loose Equality (`==`)**: Performs **Type Coercion** before comparing. This leads to unpredictable results (e.g., `0 == ""` is true).
- **Strict Equality (`===`)**: Compares both **Value and Type** without coercion. This is the industry standard for safe code.

```javascript
5 == "5";  // true (The string is coerced to a number)
5 === "5"; // false (Types are different: number vs string)
```

---

## 2. Arithmetic and Increment

JavaScript supports standard arithmetic operators (`+`, `-`, `*`, `/`, `%`) and the exponentiation operator (`**`).

### Prefix vs Postfix Increment
- **`x++`**: Returns the value of `x` **before** incrementing.
- **`++x`**: Returns the value of `x` **after** incrementing.

---

## 3. Logical Operators and Short-Circuiting

The `&&` (AND) and `||` (OR) operators use **Short-Circuit Evaluation**.
- **`A && B`**: If `A` is falsy, `B` is never evaluated because the result must be false.
- **`A || B`**: If `A` is truthy, `B` is never evaluated because the result must be true.

This behavior is frequently used for "Guard Clauses" or setting default values.

---

## 4. Modern Operators: Nullish and Optional

ES2020 introduced two operators that significantly simplify handling missing data:

- **Nullish Coalescing (`??`)**: Returns the right-hand side ONLY if the left-hand side is `null` or `undefined`. Unlike `||`, it allows `0` and `""` to be treated as valid values.
- **Optional Chaining (`?.`)**: Allows you to read the value of a property deep within a chain of connected objects without having to check if every bridge in the chain is valid.

```javascript
const name = user?.profile?.firstName ?? "Anonymous";
```

---

## Interview Pro-Tips: The `+` Operator Overloading
The `+` operator in JavaScript is **Overloaded**.
1. If both operands are numbers, it performs **Addition**.
2. If at least one operand is a string, it performs **Concatenation**, coercing the other operand to a string if necessary.

---

## Technical Summary
1. `Coercion`: Understand the rules of implicit conversion to avoid "Schrödinger's variables."
2. `Immutability`: Operators like `+` return a **new** value; they do not modify the original operands.
3. `Precedence`: Remember the order of operations (MDN has the definitive table).
