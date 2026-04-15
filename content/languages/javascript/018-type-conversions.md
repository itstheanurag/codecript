---
title: Coercion and Type Conversion
order: 18
---

# Type Conversion: Implicit and Explicit

JavaScript is a **Dynamically and Weakly Typed** language. This means variables are not bound to a specific type, and the engine will perform implicit type conversion (Coercion) to satisfy the needs of an operator or statement.

---

## 1. Explicit Type Conversion

Explicit conversion occurs when a developer manually converts a value from one type to another using built-in constructors.

- **String Conversion**: `String(value)` or `.toString()`
- **Number Conversion**: `Number(value)`, `parseInt(value)`, or `parseFloat(value)`
- **Boolean Conversion**: `Boolean(value)`

---

## 2. Implicit Coercion (The "Hidden" Conversion)

Coercion happens automatically when an operator is used with incompatible types.

### String Coercion
The `+` operator triggers string coercion if one operand is a string.
```javascript
"5" + 2; // "52"
"5" + true; // "5true"
```

### Numeric Coercion
Mathematical operators other than `+` (like `-`, `*`, `/`) trigger numeric coercion.
```javascript
"5" - 2; // 3
"5" * "2"; // 10
true + 1; // 2 (true becomes 1)
```

---

## 3. Truthy and Falsy Logic

Coercion is most commonly seen in conditional statements. Any value in a conditional is coerced to a Boolean.

**The 8 Falsy Values**:
- `false`, `0`, `-0`, `0n` (BigInt zero), `""` (Empty string), `null`, `undefined`, `NaN`.

**Everything else is Truthy**, including non-empty strings, numbers, empty objects `{}`, and empty arrays `[]`.

---

## 4. The `ToPrimitive` Algorithm

When an object is coerced into a primitive (e.g., `obj + 2`), JavaScript uses the internal `ToPrimitive` algorithm.
1. It looks for a `[Symbol.toPrimitive]` method.
2. If not found, it calls `valueOf()` and `toString()` until it receives a primitive result.

---

## Interview Pro-Tips: Equality and Coercion
If an interviewer asks why `[] == ![]` is true:
1. `![]` is coerced to `false` (because `[]` is truthy).
2. The expression becomes `[] == false`.
3. The array `[]` is coerced to an empty string `""`.
4. The remaining expression `"" == false` is true because both coerce to `0`.
**The Lesson**: Always use strict equality (`===`) to bypass these confusing and bug-prone coercion rules.

---

## Technical Summary
1. `Coercion`: Automatic conversion by the engine.
2. `Explicit`: Manual conversion by the developer.
3. `Identity`: Coercion can change the value but not the identity of the original variable.
