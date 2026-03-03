---
title: Variables and Data Types
order: 2
---

Imagine you're building a simple calculator. You need a way to "remember" the numbers the user types in so you can add them together later. In programming, we use **Variables** to store these pieces of information.

A variable is essentially a named container for a value.

## JavaScript Keywords

Before we learn how to create variables, it's important to understand **Keywords**.

In any programming language, keywords are "reserved words" that have a special meaning to the computer. Because JavaScript uses these words to perform specific actions, you cannot use them as names for your variables.

For example, `let`, `const`, and `var` are keywords that tell JavaScript you are about to declare a variable. Other keywords include `if`, `for`, `function`, and `return`.

## Rules for Naming Variables (Identifiers)

In programming, the name you give to a variable is called an **Identifier**. JavaScript has strict rules that you must follow; if you break these, your code will crash before it even runs.

### The Strict Rules (Must Follow)

- **Case Sensitivity:** JavaScript is case-sensitive. `myVariable`, `myvariable`, and `MYVARIABLE` are three completely different containers.
- **Allowed Characters:** Identifiers can contain letters (A-Z, a-z), digits (0-9), underscores (`_`), and dollar signs (`$`).
- **Start Restrictions:** A variable name **cannot start with a digit**. It must start with a letter, an underscore, or a dollar sign.
  - Valid: `let _score;`
  - Valid: `let $price;`
  - Valid: `let user1;`
  - Invalid: `let 1user;` (Error: Invalid or unexpected token)
- **No Spaces:** Variable names cannot contain spaces.
- **Reserved Keywords:** As mentioned before, you cannot use reserved keywords like `let`, `function`, or `class` as your variable names.

## Creating Variables: Declaration vs. Initialization

There are two steps to making a variable ready for use:

1. **Declaration:** Telling the computer, "I'm going to need a container named `score`." Use a keyword like `let` or `const` to start this process.
2. **Initialization:** Putting an initial value into the container: `score = 0`.

In JavaScript, we often do both at once:

```javascript
let score = 0; // Declaration and Initialization
```

## Three Ways to Declare: `var`, `let`, and `const`

Historically, JavaScript only had `var`. Modern JavaScript (ES6+) introduced `let` and `const`, which are much safer and more predictable.

### 1. `const` (The Default Choice)

`const` stands for "constant." Use this for values that **should not change** after they are set.

```javascript
const pi = 3.14159;
const birthYear = 1995;

// This will throw an error:
// pi = 4;
```

**Pro Tip:** Use `const` by default. It makes your code easier to reason about because you know the value won't be swapped out unexpectedly.

### 2. `let` (For Values That Change)

Use `let` when you know a variable's value **will need to be reassigned** later.

```javascript
let currentScore = 10;
currentScore = 15; // Perfectly fine!
```

### 3. `var` (The Legacy Way - Avoid This)

`var` is the old way of doing things. It has some "quirky" behaviors regarding **Scope** that can lead to subtle bugs. In modern development, you should almost never use `var`.

---

## A Quick Note on Scope

**Scope** determines where a variable is accessible in your code.

- `let` and `const` are **Block Scoped** (they only exist inside the `{}` where they were born).
- `var` is **Function Scoped**.

We'll dive deep into these differences and why they matter in our upcoming [Scopes and Hoisting](/languages/javascript/scopes) page.

## JavaScript Data Types

Now that we know _how_ to store data, let's look at _what_ we can store. JavaScript is "dynamically typed," meaning a variable can hold a number one minute and a string the next (though this is usually avoided).

### Primitive Types (The Basic Building Blocks)

| Type          | Description                                                    | Example                   |
| :------------ | :------------------------------------------------------------- | :------------------------ |
| **String**    | Textual data                                                   | `"Hello"`, `'JS'`         |
| **Number**    | Integers and decimals                                          | `42`, `3.14`, `-10`       |
| **Boolean**   | Logical values                                                 | `true`, `false`           |
| **Undefined** | A variable that has been declared but not yet assigned a value | `let x;` (x is undefined) |
| **Null**      | Represents the intentional absence of any object value         | `let user = null;`        |
| **BigInt**    | For very large integers                                        | `9007199254740991n`       |
| **Symbol**    | Unique and immutable identifiers                               | `Symbol('id')`            |

### Checking Types with `typeof`

You can use the `typeof` operator to check what's inside a variable:

```javascript
console.log(typeof "Alice"); // "string"
console.log(typeof 42); // "number"
console.log(typeof true); // "boolean"
```

## Variables vs. Values

It's important to distinguish between the **variable** (the box) and the **value** (what's inside the box).

```javascript
let name = "Alice";
```

- `name` is the **variable identifier**.
- `"Alice"` is the **string value**.

---

**Ready for more?** Next, we'll learn how to perform actions with this data in [Functions and Logic](/languages/javascript/functions).
