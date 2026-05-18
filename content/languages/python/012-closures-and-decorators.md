---
title: Advanced Functions: Decorators
order: 12
---

Python treats functions as **First-Class Citizens**, allowing them to be passed as arguments, returned from other functions, and nested inside one another. This flexibility leads to two powerful patterns: **Closures** and **Decorators**.

---

## 1. Lexical Closures

A **Closure** occurs when a nested function remembers and has access to the variables in its enclosing scope, even after the enclosing function has finished executing.

```python
def make_multiplier(n):
    def multiplier(x):
        return x * n # 'n' is remembered from the outer scope
    return multiplier

double = make_multiplier(2)
print(double(5)) # 10
```

- **Persistence**: The value `2` is stored in the `double` function's memory (specifically in the `__closure__` attribute).
- **Use Case**: Closures are often used to replace simple classes with a single method, reducing overhead and improving readability.

---

## 2. Introduction to Decorators

A **Decorator** is a higher-order function that takes another function as an argument and extends its behavior without explicitly modifying it. 

Think of it as **"Wrapping"** a function in extra logic—like adding logging, timing, or authentication.

```python
def logger(func):
    def wrapper(*args, **kwargs):
        print(f"Calling function: {func.__name__}")
        return func(*args, **kwargs)
    return wrapper

@logger
def say_hello(name):
    print(f"Hello, {name}")

say_hello("Alice")
```
The `@logger` syntax is "syntactic sugar" for `say_hello = logger(say_hello)`.

---

## 3. Preserving Metadata with `functools.wraps`

When you wrap a function, the original function's name and docstring are lost and replaced by the wrapper's metadata. In professional code, you must use `@functools.wraps` to preserve this identity.

```python
from functools import wraps

def debug(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper
```

---

## 4. Decorators with Arguments

To create a decorator that accepts its own parameters (e.g., `@retry(times=3)`), you need an extra layer of nesting. The outer function takes the arguments and returns the actual decorator.

---

## Interview Pro-Tips: Common Decorator Use Cases
If an interviewer asks where you've used decorators, mention these industry standards:
1. **Authentication/Authorization**: Checking if a user is logged in before allowing access to a web route (`@login_required`).
2. **Caching/Memoization**: Storing the results of expensive function calls to avoid recalculating them (`@functools.lru_cache`).
3. **Logging**: Automatically tracking who called which function and when.
4. **Rate Limiting**: Preventing an API from being called too many times in a short window.

---

## Technical Summary
1. `Higher-Order Functions`: Functions that operate on other functions.
2. `Closure State`: Stored in `func.__closure__`.
3. `Decorators`: A clean way to separate "Cross-Cutting Concerns" (like logging) from the core business logic.
