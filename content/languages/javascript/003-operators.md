---
title: Operators
order: 3
---

Operators are the building blocks of JavaScript expressions. They allow you to manipulate data, perform calculations, and control the flow of your logic. Understanding not just _what_ they do, but _how_ they behave (especially with type coercion) is key to writing bug-free code.

## What is an Operator?

An **Operator** is a special symbol that tells the computer to perform a specific mathematical, logical, or relational operation.

The values that the operator acts upon are called **Operands**.

For example, in the expression `10 + 5`:

- `+` is the **operator** (specifically, an addition operator).
- `10` and `5` are the **operands**.

Depending on how many operands they require, operators are classified as:

- **Unary**: Acts on a single operand (e.g., `+x`, `typeof x`).
- **Binary**: Acts on two operands (e.g., `x + y`, `x > y`).
- **Ternary**: Acts on three operands (only one in JS: `condition ? a : b`).

## 1. Arithmetic Operators

Arithmetic operators perform mathematical calculations.

| Operator | Description        | Why use it?                     | How it works                                              |
| :------- | :----------------- | :------------------------------ | :-------------------------------------------------------- |
| `+`      | Addition           | Sum numbers or join strings     | If either operand is a string, it performs concatenation. |
| `-`      | Subtraction        | Find the difference             | Converts operands to numbers first.                       |
| `*`      | Multiplication     | Multiply values                 | Converts operands to numbers.                             |
| `/`      | Division           | Divide values                   | Result is a float (e.g., `5 / 2` is `2.5`).               |
| `%`      | Modulo (Remainder) | Get the remainder of a division | Useful for checking if a number is even (`n % 2 === 0`).  |
| `**`     | Exponentiation     | Raise to a power                | ES2016 alternative to `Math.pow(x, y)`.                   |

> [!TIP]
> **Type Coercion:** Watch out for the `+` operator. `"5" + 2` results in `"52"` (string), but `"5" - 2` results in `3` (number) because subtraction forces numeric conversion.

---

## 2. Unary Operators

Unary operators take a single operand. They are powerful tools for type checking and quick modifications.

- **`typeof`**: Used to check the data type of a value.

  ```javascript
  typeof "Hello"; // "string"
  typeof 42; // "number"
  ```

- **Increment (`++`) and Decrement (`--`)**: Increases or decreases a value by one.
  - _Prefix_ (`++x`): Increments first, then returns the value.
  - _Postfix_ (`x++`): Returns the value first, then increments.
- **Unary Plus (`+`)**: The fastest way to convert something into a number.

  ```javascript
  +"5"; // 5 (number)
  +true; // 1
  ```

- **`delete`**: Removes a property from an object.
- **`!` (Logical NOT)**: Converts a value to its boolean opposite. `!!` is a common trick to convert any value to a boolean.

---

## 3. Comparison Operators

Comparison operators return a boolean (`true`/`false`).

| Operator   | Name               | How it works (The "Why")                                                                 |
| :--------- | :----------------- | :--------------------------------------------------------------------------------------- |
| `==`       | Equality           | **Loose equality:** Converts operands to the same type before comparing. **Avoid this.** |
| `===`      | Strict Equality    | **Strict equality:** Checks both value AND type. No conversion happens. **Always use.**  |
| `!=`       | Inequality         | Opposite of `==`.                                                                        |
| `!==`      | Strict Inequality  | Opposite of `===`.                                                                       |
| `>`, `<`   | Greater/Less Than  | Compares values. Works with strings alphabetically too.                                  |
| `>=`, `<=` | Greater/Less Equal | Comparison including equality.                                                           |

> [!IMPORTANT]
> **The Strict Rule:** Always prefer `===` and `!==`. Loose equality (`==`) can lead to confusing results like `0 == false` being `true` or `"" == 0` being `true`.

---

## 4. Logical Operators

Logical operators are used to combine multiple conditions.

- **`&&` (AND)**: Returns `true` if both operands are true.
- **`||` (OR)**: Returns `true` if at least one operand is true.
- **Short-circuiting**: JavaScript evaluates logical operators from left to right and stops as soon as the result is determined.
  - `A && B`: If `A` is false, `B` is never even looked at.
  - `A || B`: If `A` is true, `B` is never looked at.

---

## 5. Assignment Operators

Assignment operators settle values into variables.

- **Basic**: `x = 10`
- **Compound**: Combines an operation with assignment.
  - `x += 5` (Same as `x = x + 5`)
  - `x *= 2` (Same as `x = x * 2`)
- **Logical Assignment (ES2021)**:
  - `x ||= y`: Assigns `y` to `x` only if `x` is _falsy_.
  - `x &&= y`: Assigns `y` to `x` only if `x` is _truthy_.
  - `x ??= y`: Assigns `y` to `x` only if `x` is _nullish_ (`null` or `undefined`).

---

## 6. Ternary Operator (`? :`)

The only JavaScript operator that takes three operands. It's a concise way to write an `if...else` statement.

**Syntax:** `condition ? valueIfTrue : valueIfFalse`

```javascript
let age = 20;
let status = age >= 18 ? "Adult" : "Minor";
```

**Why use it?** It makes your code cleaner when you need to assign a value based on a simple condition.

---

## 7. Nullish & Optional Chaining

Modern JavaScript tools to handle missing data gracefully.

- **Nullish Coalescing (`??`)**: Returns the right side if the left side is `null` or `undefined`. Unlike `||`, it treats `0` and `""` as valid values.
- **Optional Chaining (`?.`)**: Safely access nested object properties. If any part of the chain is `null` or `undefined`, it returns `undefined` instead of crashing.

  ```javascript
  const city = user?.address?.city;
  ```

---

## 9. Spread and Rest Operators (`...`)

The syntax `...` is used for two distinct but related operations depending on where it is used.

### The Spread Operator

Used in expressions to **expand** an iterable (like an array or object) into individual elements.

- **Why use it?** To create shallow copies of arrays/objects or to combine them easily.
- **How it works**: It "spreads" the contents of the collection into a new one.

```javascript
const parts = ["shoulders", "knees"];
const lyrics = ["head", ...parts, "and", "toes"];
// ["head", "shoulders", "knees", "and", "toes"]

const user = { name: "Alice", age: 25 };
const updatedUser = { ...user, location: "Global" };
```

### The Rest Operator

Used in destructuring or function parameters to **collect** multiple remaining elements into a single array.

- **Why use it?** To handle an unknown number of inputs or to "pick" specific properties while grouping the rest.
- **How it works**: It gathers everything that hasn't been specifically assigned into a new collection.

```javascript
const [first, ...theRest] = [1, 2, 3, 4];
console.log(theRest); // [2, 3, 4]

function sum(...numbers) {
  return numbers.reduce((acc, n) => acc + n, 0);
}
```

---

## 10. Bitwise Operators

Bitwise operators treat operands as a sequence of 32 bits (zeros and ones). While rarely used in everyday web development, they are essential for performance-critical tasks, flags, or binary file manipulation.
Examples: `&` (AND), `|` (OR), `^` (XOR), `~` (NOT), `<<` (Left Shift).

---

## 11. Operator Precedence

Precedence determines the order in which operators are evaluated. Operators with higher precedence are executed first.

1. **Grouping**: `( )` (Highest)
2. **Member Access**: `obj.prop` / `obj['prop']`
3. **Function Call**: `func()`
4. **Increment/Decrement**: `++`, `--`
5. **Arithmetic**: `**` then `*`, `/`, `%` then `+`, `-`
6. **Comparison**: `<`, `<=`, `>`, `>=` then `===`, `!==`
7. **Logical**: `&&` then `||`
8. **Assignment**: `=` (Lowest)

**Pro Tip:** When in doubt, use parentheses `()` to explicitly define the order. This makes your "how" clear to anyone reading the code.
