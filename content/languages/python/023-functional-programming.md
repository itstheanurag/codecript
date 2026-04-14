---
title: Functional Programming
order: 23
---

While Python is not a "pure" functional language like Haskell, it provides several tools that allow you to write code in a **Functional Style**. This approach focuses on using functions as parameters and avoiding "Global State."

---

## 1. Map, Filter, and Reduce

The "Big Three" of functional programming are all present in Python:

| Function | Purpose | Example |
| :--- | :--- | :--- |
| **`map(fn, iterable)`** | Apply a function to every item. | `map(abs, [-1, 2, -3])` |
| **`filter(fn, iterable)`** | Keep only items where `fn` is True.| `filter(is_even, nums)` |
| **`reduce(fn, iterable)`** | "Fold" a list into a single value. | `reduce(add, [1, 2, 3])` |

> [!NOTE]
> `reduce` is not a built-in function in Python 3; you must import it from the `functools` module. This was a deliberate choice by Python's creator to encourage more readable code.

---

## 2. The Pythonic Way: Comprehensions

In modern Python, we almost always use **List Comprehensions** instead of `map` or `filter`. They are more readable and often faster.

| Functional | List Comprehension (Preferred) |
| :--- | :--- |
| `map(str.upper, names)` | `[n.upper() for n in names]` |
| `filter(bool, list)` | `[x for x in list if x]` |

---

## 3. High-Order Functions in `functools`

The `functools` module is the home for advanced functional tools:

### `@lru_cache` (Memoization)
Automatically caches the results of a function. If you call `fibonacci(10)` twice, the second time it returns the result instantly without recalculating.

### `partial()`
Allows you to "Freeze" برخی (some) arguments of a function to create a new, simpler function.
```python
from functools import partial
int2 = partial(int, base=2) # Creates a function that specifically parses binary
print(int2('101')) # 5
```

---

## 4. Interview Pro-Tips

### Lambdas are local only
Lambda functions are great but limited to a single expression. If you need logic that spans multiple lines, you **must** use a regular `def` function.

### Immutability for Safety
Functional programming encourages **Immutability**. Instead of changing a list, create a new one. This makes your code much easier to test and reason about in multi-threaded environments.

### The "Readable" Functional Coder
Interviewers check: "If a comprehension becomes longer than 80 characters or has more than two nested loops, convert it back into a regular `for` loop." Readability is the highest goal in Python.

### What Interviewers Are Testing
- Do you know how to use `map()` and `filter()`?
- Can you reach for a List Comprehension over multiple nested loops?
- Do you know how to use `lru_cache` to optimize performance?

---

## Key Takeaway

Functional programming in Python is about **purity and clarity**. By treating functions as objects and using comprehensions to transform data, you can write code that is concise, efficient, and free from the side effects that plague larger systems.
