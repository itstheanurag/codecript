---
title: Introduction to TypeScript
order: 1
---

If you've spent any time building web applications, you've likely encountered the "undefined is not a function" error or spent hours debugging a typo in a property name. While JavaScript is incredibly flexible and powerful, its dynamic nature can sometimes lead to runtime surprises.

**TypeScript (TS)** was created to solve exactly these problems.

## What is TypeScript?

At its core, TypeScript is **JavaScript with syntax for types**. It is a strongly typed superset of JavaScript, which means two important things:

1.  **Strictly Additive:** TypeScript doesn't change how JavaScript runs. It adds a "type layer" on top of it.
2.  **Transpilation:** Browsers don't understand TypeScript. TS code must be "transpiled" into regular JavaScript before it can be executed.

> [!TIP]
> Think of TypeScript as a **highly advanced linter** that catches errors before you even run your code.

## Why TypeScript? (The JS Developer's perspective)

As a JavaScript developer, you might wonder: _"Why should I add more complexity to my workflow?"_ Here are the primary advantages:

### 1. Catch Errors Early

In JavaScript, many errors only surface when the user interacts with your app. TypeScript catches these at **compile-time**. If you try to call a method that doesn't exist or pass a string where a number is expected, TS will complain immediately.

### 2. Supercharged Refactoring

Renaming a function or changing an object's structure in a large JS codebase is terrifying. In TypeScript, if you change a type definition, the compiler will point out every single place in your app that needs to be updated.

### 3. Better Tooling and IntelliSense

Because TypeScript understands your data structures, your editor (like VS Code) can provide incredibly accurate auto-completion. You no longer have to constantly switch between files to remember if a property was named `user_id` or `userId`.

### 4. Self-Documenting Code

Types act as documentation. When you see a function signature like `function getUser(id: string): User`, you immediately know what it expects and what it returns without having to read the implementation logic.

## TypeScript vs. JavaScript: The Key Difference

The fundamental difference lies in **when** types are checked:

| Feature         | JavaScript                                  | TypeScript                       |
| :-------------- | :------------------------------------------ | :------------------------------- |
| **Typing**      | Dynamic (checked at runtime)                | Static (checked at compile-time) |
| **Errors**      | Discovered by the user                      | Discovered by the developer      |
| **Flexibility** | Extremely high (variables can change types) | Disciplined (types are enforced) |

## Moving Forward

In this series, we won't waste time relearning variables or loops. Instead, we will focus on the **TypeScript-specific features** that will make your JavaScript code more robust, predictable, and easier to maintain.

We'll start by looking at how TypeScript automatically figures out types through **Type Inference** and how you can manually define them.
