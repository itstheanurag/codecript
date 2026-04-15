---
title: Control Flow: Conditionals
order: 4
---

# Conditionals: Logic and Decision Branches

Control flow determines the order in which statements are executed in a script. JavaScript provides several structures for branching execution based on the evaluation of expressions.

---

## 1. The `if...else` Statement

The most fundamental control structure. It executes a block of code if a specified condition is **Truthy**.

```javascript
const score = 85;

if (score >= 90) {
    console.log("Grade: A");
} else if (score >= 80) {
    console.log("Grade: B");
} else {
    console.log("Grade: C");
}
```

---

## 2. Truthiness and Falsiness

In JavaScript, every value has an inherent boolean state. A value is **Falsy** if it is one of the following eight:

1. `false`
2. `0` (and `-0`, `0n`)
3. `""` (Empty string)
4. `null`
5. `undefined`
6. `NaN`

**Everything else is Truthy**, including empty arrays `[]` and empty objects `{}`. This is a common point of confusion for developers coming from languages like Python.

---

## 3. The `switch` Statement

Used for multiple branches based on a single value. It performs a **Strict Equality (`===`)** check.

```javascript
const role = "admin";

switch (role) {
    case "admin":
        initAdminDashboard();
        break; // Crucial to prevent "fall-through"
    case "editor":
        initEditor();
        break;
    default:
        initGuest();
}
```

---

## 4. Logical Assignment (ES2021)

Modern JavaScript provides concise operators that combine logical checks with assignment.

- **`||=`**: Assigns if the variable is falsy.
- **`&&=`**: Assigns if the variable is truthy.
- **`??=`**: Assigns if the variable is nullish (`null` or `undefined`).

---

## Interview Pro-Tips: Switch vs. Object Maps
While `switch` is fine, senior developers often replace complex conditional logic with **Object Maps** or **Lookup Tables** for better readability and performance.

```javascript
// Instead of switch:
const roleActions = {
    admin: () => initAdmin(),
    editor: () => initEditor(),
    guest: () => initGuest()
};

const action = roleActions[role] || roleActions.guest;
action();
```

---

## Technical Summary
1. `Branching`: Evaluating expressions to decide the next path of execution.
2. `Comparison`: Always use strict operators inside conditionals to avoid coercion bugs.
3. `Early Return`: In functions, prefer returning early rather than nesting multiple `if/else` blocks.
