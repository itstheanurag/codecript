---
title: Operators
order: 3
---

Operators are used to perform operations on variables and values. In JavaScript, we have several types of operators that allow us to manipulate data, perform calculations, and make logical decisions.

## Arithmetic Operators

Arithmetic operators are used to perform mathematical calculations.

| Operator | Description        | Example        |
| :------- | :----------------- | :------------- |
| `+`      | Addition           | `5 + 2 // 7`   |
| `-`      | Subtraction        | `5 - 2 // 3`   |
| `*`      | Multiplication     | `5 * 2 // 10`  |
| `/`      | Division           | `10 / 2 // 5`  |
| `%`      | Modulo (Remainder) | `5 % 2 // 1`   |
| `**`     | Exponentiation     | `5 ** 2 // 25` |

### The `+` Operator with Strings

In JavaScript, the `+` operator is also used for string concatenation.

```javascript
let message = "Hello" + " " + "World"; // "Hello World"
```

## Assignment Operators

Assignment operators are used to assign values to JavaScript variables.

| Operator | Example  | Equivalent to |
| :------- | :------- | :------------ |
| `=`      | `x = y`  | `x = y`       |
| `+=`     | `x += y` | `x = x + y`   |
| `-=`     | `x -= y` | `x = x - y`   |
| `*=`     | `x *= y` | `x = x * y`   |
| `/=`     | `x /= y` | `x = x / y`   |

## Comparison Operators

Comparison operators are used in logical statements to determine equality or difference between variables or values. They return a boolean (`true` or `false`).

| Operator | Description                             | Example              |
| :------- | :-------------------------------------- | :------------------- |
| `==`     | Equal to (checks value only)            | `5 == "5" // true`   |
| `===`    | Strict equal to (checks value and type) | `5 === "5" // false` |
| `!=`     | Not equal to                            | `5 != 8 // true`     |
| `!==`    | Strict not equal to                     | `5 !== "5" // true`  |
| `>`      | Greater than                            | `5 > 2 // true`      |
| `<`      | Less than                               | `5 < 2 // false`     |
| `>=`     | Greater than or equal to                | `5 >= 5 // true`     |
| `<=`     | Less than or equal to                   | `5 <= 5 // true`     |

> [!IMPORTANT]
> Always prefer `===` and `!==` over `==` and `!=`. The strict operators avoid unexpected type coercion bugs.

## Logical Operators

Logical operators are used to determine the logic between variables or values.

| Operator | Description | Example                         |
| :------- | :---------- | :------------------------------ |
| `&&`     | Logical AND | `(5 < 10 && 2 > 1) // true`     |
| `\|\|`   | Logical OR  | `(5 == 5 \|\| 5 == 10) // true` |
| `!`      | Logical NOT | `!(5 == 5) // false`            |

## The Nullish Coalescing Operator (`??`)

The `??` operator returns the first argument if it is not `null` or `undefined`. Otherwise, it returns the second argument.

```javascript
let name = null;
let text = "missing";
let result = name ?? text; // "missing"
```

## The Optional Chaining Operator (`?.`)

The `?.` operator returns `undefined` if an object is `null` or `undefined`, instead of throwing an error.

```javascript
const user = { name: "Alice" };
console.log(user.address?.city); // undefined (no error)
```

---
