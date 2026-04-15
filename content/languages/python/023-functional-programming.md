---
title: Functional Programming
order: 23
---

# Functional Programming: Declarative Logic

While Python is primarily an Object-Oriented language, it incorporates many features from **Functional Programming (FP)**. Functional programming treats computation as the evaluation of mathematical functions and avoids changing-state and mutable data.

---

## 1. Core Principles of FP in Python

- **First-Class Functions**: Functions can be passed as arguments, returned as values, and stored in variables.
- **Pure Functions**: A function that returns the same output for the same input and has no "side effects" (like modifying a global variable).
- **Immutability**: Preferring data structures that cannot be changed once created (like `tuples` and `frozensets`).

---

## 2. The Power Trio: `map`, `filter`, and `reduce`

- **`map(func, iterable)`**: Applies a function to every item in an iterable.
- **`filter(func, iterable)`**: Returns items from an iterable for which the function returns `True`.
- **`reduce(func, iterable)`**: Sequentially applies a function to items to reduce the iterable to a single cumulative value (found in `functools`).

```python
from functools import reduce

nums = [1, 2, 3, 4, 5]

squares = list(map(lambda x: x**2, nums))
evens = list(filter(lambda x: x % 2 == 0, nums))
total = reduce(lambda x, y: x + y, nums)
```

---

## 3. High-Level Utilities: `itertools` and `functools`

- **`itertools`**: Provides iterators for efficient looping (e.g., `chain`, `cycle`, `product`).
- **`functools.partial`**: Allows you to "freeze" some of a function's arguments, creating a new, simpler function.
- **`functools.lru_cache`**: A decorator that automatically caches function results (memoization), which is a classic FP optimization.

---

## 4. Declarative vs. Imperative

- **Imperative (How)**: Using loops and state changes to calculate a result.
- **Declarative (What)**: Using transformations and filters to describe the result you want.

---

## Interview Pro-Tips: Why use FP?
If an interviewer asks about the benefits of a functional approach:
1. **Concurrency**: Immutable data structures are inherently thread-safe because they cannot be modified.
2. **Testability**: Pure functions are predictable and easy to unit test.
3. **Brevity**: Logic that takes 10 lines in a nested loop can often be expressed in 1 line using `map` or a comprehension.

---

## Technical Summary
1. `Lambdas`: Small, anonymous functions used for one-off logic.
2. `Side Effects`: Avoiding modifications to external state improves reliability.
3. `Pythonic Balance`: Python encourages a pragmatic mix of OOP and FP. Use comprehensions where possible, as they are often more readable than `map` and `filter`.
