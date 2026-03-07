---
title: Type Conversions (Coercion)
order: 18
---

JavaScript is a "weakly typed" language, which means it will often try to help you by automatically converting types to make an operation work. While this can be convenient, it's also where the most famous "weird" behaviors of JS live.

## 1. Explicit vs. Implicit Conversion

- **Explicit Conversion:** When you manually convert a value using functions like `Number()`, `String()`, or `Boolean()`.
- **Implicit Conversion (Coercion):** When JavaScript converts the type for you during an operation (like adding a string and a number).

---

## 2. The "Weird" Operators: `+` vs `-`

The `+` operator is overloaded: it handles both **addition** and **string concatenation**. JavaScript prioritizes strings.

### The Addition Case (`+`)

If any operand is a string, JavaScript converts everything else to a string.

```javascript
"5" + 2; // "52" (Number 2 becomes string "2")
"5" + true; // "5true"
5 + null; // 5 (null becomes 0)
5 + undefined; // NaN (undefined becomes NaN in math)
```

### The Subtraction Case (`-`)

The `-` operator (and `*`, `/`) _only_ works with numbers. JavaScript will try to convert everything to a number.

```javascript
"5" - 2; // 3 (String "5" becomes number 5)
"5" - "2"; // 3
"five" - 2; // NaN (Cannot convert "five" to a number)
true - 1; // 0 (true becomes 1)
```

---

## 3. Array and Object Coercion

This is where things get truly strange. When objects or arrays are forced into strings or numbers, they follow specific rules.

```javascript
[] + []; // "" (Empty arrays become empty strings)
[] + {}; // "[object Object]"
{
}
+[]; // 0 (Wait, what? In some consoles, {} is seen as an empty block, not an object)
[1, 2] + [3]; // "1,23" (Arrays are stringified then concatenated)
```

> [!WARNING]
> Never rely on implicit coercion for arrays or objects. It leads to code that is impossible to read and debug.

---

## 4. Truthy and Falsy Values

When a value is used in a logical context (like an `if` statement), it is coerced into a boolean.

**The "Falsy" List:**

- `false`
- `0` (and `-0`, `0n`)
- `""` (empty string)
- `null`
- `undefined`
- `NaN`

**Everything else is "Truthy"**, including empty objects `{}` and empty arrays `[]`.

```javascript
if ([]) {
  console.log("Empty arrays are truthy!"); // This runs
}
```

---

## 5. The "Double Equals" (`==`) Problem

The `==` operator performs coercion before comparing. This is why it is almost universally avoided in favor of `===` (Strict Equality).

```javascript
"5" == 5; // true
null == undefined; // true
0 == false; // true
[] == 0; // true
```

> [!TIP]
> **Rule of Thumb:** Always use `===`. It compares both the **value** and the **type**, preventing these unexpected coercions.

Understanding these conversion rules is the first step toward writing predictable JavaScript. In the next chapter, we'll see where all these "default" behaviors actually come from by exploring **Prototypes**.
