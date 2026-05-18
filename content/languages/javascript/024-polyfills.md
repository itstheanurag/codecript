---
title: Backward Compatibility
order: 24
---

JavaScript evolves much faster than the browsers people use. When you use a modern feature like `Array.prototype.flat()` or `Promise.allSettled()`, it will work in Chrome 120 but crash in older versions. 

**Polyfilling** is the practice of providing modern functionality on older browsers that do not natively support it.

---

## 1. Polyfills vs. Transpilers

It is important to understand the two different ways we handle compatibility:

- **Transpilers (Babel)**: These handle **Syntax** changes. They rewrite your code at build-time (e.g., turning an `() =>` arrow function into a standard `function()`).
- **Polyfills (core-js)**: These handle **API** changes. They add missing methods to the global environment at runtime (e.g., adding `String.prototype.includes` if it's missing).

---

## 2. How a Polyfill is Written

A polyfill typically starts with a "Feature Check." If the feature already exists, the script does nothing. If it's missing, it implements the logic manually using older, supported features.

```javascript
if (!Array.prototype.includes) {
    // Implementing the polyfill manually
    Array.prototype.includes = function(searchElement) {
        // ... logic using for loops and equality ...
    };
}
```

---

## 3. The Performance Cost

While polyfills are essential for reach, they come with a cost:
- **Bundle Size**: Every polyfill adds to the amount of code the user has to download.
- **Pollution**: Polyfills modify global prototypes, which can occasionally lead to conflicts with other libraries.

---

## 4. Modern Approach: `core-js` and `browserslist`

In professional development, we don't write polyfills manually. We use tools like **Babel** and **core-js**.
- **`browserslist`**: You define which browsers you want to support (e.g., "> 0.5%, last 2 versions, not dead").
- **`babel-preset-env`**: Automatically detects which polyfills are needed based on your target browsers and only includes those in your production bundle.

---

## Interview Pro-Tips: Shim vs. Polyfill
If asked for the difference:
- **Polyfill**: Replicates a **Standard** API that hasn't arrived in the browser yet.
- **Shim**: A broader term for any library that modifies an existing environment to provide a new API, regardless of whether it's a future standard. All polyfills are shims, but not all shims are polyfills.

---

## Technical Summary
1. `Feature Detection`: Checking for the existence of an API before using it.
2. `core-js`: The industry-standard library for JavaScript polyfills.
3. `Selective Polyfilling`: Using "User-Agent" sniffing to serve different bundles to old and new browsers (e.g., Polyfill.io service model).
