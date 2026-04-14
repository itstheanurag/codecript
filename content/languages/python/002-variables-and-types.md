---
title: Variables and Data Types
order: 2
---

In Python, everything is an **Object**. This means variables don't just "hold" values; they are names that **point** to objects in memory.

---

## 1. Dynamic Typing

Python is **dynamically typed**. You don't need to specify if a variable is a string or an integer; Python figures it out at runtime.

```python
x = 5       # x is an int
x = "Hello" # Now x is a str
```

> [!IMPORTANT]
> Because Python is dynamic, you must be careful not to accidentally change a variable's type in a way that breaks your logic later (e.g., trying to add a number to a string).

---

## 2. Basic Data Types

Python has several built-in types that handle the most common data:

| Type | Name | Example |
| :--- | :--- | :--- |
| **int** | Integer | `42`, `-7` |
| **float**| Floating Point | `3.14`, `-0.01` |
| **str** | String | `"Python"`, `'Coding'` |
| **bool** | Boolean | `True`, `False` |
| **NoneType**| None | `None` (Null) |

---

## 3. The "Identity" of a Variable

Since everything is an object, every variable has:
1. **Value**: The actual content (e.g., `5`).
2. **Type**: The class it belongs to (e.g., `int`).
3. **Identity**: The unique memory address where the object lives.

```python
x = 10
print(type(x)) # <class 'int'>
print(id(x))   # 1407... (Memory address)
```

---

## 4. Interview Pro-Tips

### Immutable vs. Mutable
This is a high-level interview concept.
- **Immutable Types** (`int`, `float`, `str`, `tuple`, `bool`): Once created, the object's value cannot change. If you "change" a string, Python actually creates a new string object.
- **Mutable Types** (`list`, `dict`, `set`): You can change the contents without creating a new object.

### The "Interning" Optimization
For small integers (usually -5 to 256) and certain strings, Python uses **Interning**. This means multiple variables pointing to the number `5` actually point to the *exact same* object in memory to save space.
- `a = 5; b = 5; print(a is b)` -> `True` (Same object)
- `a = 1000; b = 1000; print(a is b)` -> `False` (Different objects, same value)

### `is` vs `==`
- `==` checks for **Equality** (Are the values the same?).
- `is` checks for **Identity** (Are they the exact same object in memory?).
Always use `==` unless you are specifically checking for `None`.

### What Interviewers Are Testing
- Do you understand that Python variables are references?
- Can you explain the difference between mutable and immutable types?
- Do you know when to use `is` vs `==`?

---

## Key Takeaway

Python's type system is flexible and powerful. By treating everything as an object, it allows for a high level of abstraction, but it's crucial to understand when you are copying a reference versus creating a new value.
