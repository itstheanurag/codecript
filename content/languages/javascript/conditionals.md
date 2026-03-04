---
title: Conditionals
order: 4
---

**Conditionals** are the decision-making tools in your code. They allow your program to execute different blocks of logic based on specific criteria, giving you control over the "flow" of your application.

Mastering conditionals means understanding precisely when a block of code is **invoked** (executed) and when it is **skipped**.

## 1. The `if...else` Statement

The `if` statement is the most common way to branch your logic. It evaluates a condition and runs the associated block of code ONLY if that condition is _truthy_.

### How it Works (Invocation Rules)

- **`if` block**: Invoked if the condition is `true` (or truthy).
- **`else if` block**: Invoked if the previous conditions were `false` AND its own condition is `true`.
- **`else` block**: The ultimate fallback. Invoked only if EVERY preceding condition in the chain was `false`.

```javascript
let temperature = 25;

if (temperature > 30) {
  console.log("It's hot outside!"); // Skipped
} else if (temperature > 20) {
  console.log("It's a pleasant day."); // Invoked!
} else {
  console.log("It's cold outside."); // Skipped
}
```

> [!IMPORTANT]
> **Short-Circuit Logic:** Once a condition in an `if...else if` chain is met, JavaScript executes that block and ignores the rest of the chain entirely. This means the order of your conditions matters!

---

## 2. The `switch` Statement

The `switch` statement is best used when you have a single variable compared against many possible values. It's often cleaner and more performant than a long `if...else if` chain.

### Invocation and the "Break" Rule

- **Matching**: The `switch` expression is compared against each `case` using **Strict Equality (`===`)**.
- **Invocation**: Once a match is found, invocation starts from that case.
- **The `break` keyword**: This is crucial. If you don't include `break`, JavaScript will continue executing the next cases automatically—even if they don't match! This is called **Fall-through**.
- **`default`**: Similar to `else`, this runs if no case matches.

```javascript
let day = "Monday";

switch (day) {
  case "Monday":
    console.log("Start of the work week."); // Invoked!
    break; // Stops invocation here.
  case "Friday":
    console.log("Weekend is near.");
    break;
  default:
    console.log("Just another day.");
}
```

---

## 3. The Ternary Operator (`? :`)

The ternary operator is the only operator in JavaScript that takes three operands. It is used as a one-line alternative to `if...else`.

**Syntax:** `condition ? expressionIfTrue : expressionIfFalse`

### Invocation Rules

The ternary operator is extremely efficient because it only evaluates (invokes) the expression that matches the condition.

```javascript
let age = 15;
let canVote = age >= 18 ? "Yes" : "No";

console.log(canVote); // "No"
```

**Why use it?**

- Use it for simple assignments or returning values based on a condition.
- Avoid nesting ternaries (`a ? b : c ? d : e`), as they become nearly impossible to read.

---

## 4. Truthy vs. Falsy

To understand if a block will be invoked, you must know what JavaScript considers "true."

| Falsy Values (Skipped)   | Truthy Values (Invoked)  |
| :----------------------- | :----------------------- |
| `false`                  | `true`                   |
| `0`, `-0`, `0n` (BigInt) | Any number other than 0  |
| `""` (Empty string)      | `"Hello"`, `" "` (Space) |
| `null`                   | `[]` (Empty array)       |
| `undefined`              | `{}` (Empty object)      |
| `NaN`                    | `function() {}`          |

> [!TIP]
> You can "preview" how a condition will be treated by using the `Boolean()` function or the double-bang operator: `!!value`.
