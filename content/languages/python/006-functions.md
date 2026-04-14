---
title: Functions and Scope
order: 6
---

Functions are the building blocks of reusable code. In Python, functions are **First-Class Objects**, meaning they can be passed around, assigned to variables, and returned from other functions.

---

## 1. Defining a Function

Use the `def` keyword followed by the function name and parentheses.

```python
def greet(name):
    """Greets the person with their name."""
    return f"Hello, {name}!"

msg = greet("Antigravity")
print(msg) # Hello, Antigravity!
```

- **Docstrings**: The string inside `""" """` is a docstring. It's used to document what the function does and can be accessed via `help(greet)`.
- **Return**: If a function doesn't have a `return` statement, it returns `None` by default.

---

## 2. Arguments and Parameters

Python offers incredible flexibility in how you pass data to functions:

### Positional vs. Keyword
- **Positional**: Arguments matched by order. `greet("Alice")`
- **Keyword**: Arguments matched by name. `greet(name="Alice")`

### *args and **kwargs (The "Packing" Trick)
- `*args`: Collects extra positional arguments into a **Tuple**.
- `**kwargs`: Collects extra keyword arguments into a **Dictionary**.

```python
def student_info(*grades, **details):
    print(grades)  # (90, 85, 88)
    print(details) # {'name': 'Alice', 'id': 101}

student_info(90, 85, 88, name="Alice", id=101)
```

---

## 3. Function Scope: The "LEGB" Rule

Where a variable is defined determines where it can be accessed. Python searches for variables in this specific order:

1. **Local (L)**: Items defined inside the current function.
2. **Enclosing (E)**: Items in the "parent" function (for nested functions).
3. **Global (G)**: Items defined at the top level of the file.
4. **Built-in (B)**: Names pre-defined by Python (like `len` or `print`).

> [!WARNING]
> To modify a global variable inside a function, you must use the `global` keyword. To modify an enclosing variable, use `nonlocal`. Avoid using these if possible, as they make code harder to debug.

---

## 4. Lambda Functions (Anonymous)

For small, one-line functions, you can use the `lambda` keyword.

```python
# add = lambda <args>: <expression>
add = lambda x, y: x + y
print(add(5, 3)) # 8
```
*Lambdas are often used as arguments to higher-order functions like `sort()` or `map()`.*

---

## 5. Interview Pro-Tips

### Don't use Mutable Default Arguments
This is a classic Python interview "Gotcha."
```python
# AVOID THIS:
def add_item(item, list=[]):
    list.append(item)
    return list
```
In Python, the default list is created **only once** when the function is defined, not every time it's called. Every call to `add_item` will share the *same* list!
**Solution**: Use `list=None` and check `if list is None: list = []`.

### Functions are Objects
In Python, you can store functions in a list or pass them as arguments to other functions. This is the foundation of **Functional Programming** and **Decorators**.

### Recursive Functions
Python has a **recursion limit** (usually 1,000). If you write a recursive function (like DFS or factorial), be aware that it will hit a `RecursionError` if it goes too deep.

### What Interviewers Are Testing
- Can you explain how `*args` and `**kwargs` work?
- Do you understand the LEGB scope rule?
- Have you ever fallen into the "Mutable Default Argument" trap?

---

## Key Takeaway

Functions in Python are powerful and flexible. By mastering arguments, scope, and the "functions-as-objects" philosophy, you'll be ready for everything from simple scripts to complex decorators.
