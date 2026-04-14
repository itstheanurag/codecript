---
title: Operators and Expressions
order: 3
---

Operators are special symbols used to perform computations on variables and values. In Python, operators are designed to be intuitive and readable.

---

## 1. Arithmetic Operators

Most work exactly like they do in math class:

| Operator | Name | Example | Result |
| :--- | :--- | :--- | :--- |
| `+` | Addition | `5 + 2` | `7` |
| `-` | Subtraction | `5 - 2` | `3` |
| `*` | Multiplication | `5 * 2` | `10` |
| `/` | Division | `5 / 2` | `2.5` (Always returns float) |
| `//` | Floor Division | `5 // 2` | `2` (Rounds down to nearest int) |
| `%` | Modulo | `5 % 2` | `1` (Remainder) |
| `**` | Exponentiation | `5 ** 2` | `25` (5 squared) |

---

## 2. Logical and Comparison Operators

Comparison operators return a **Boolean** (`True` or `False`).

| Operator | Description |
| :--- | :--- |
| `==` | Equal |
| `!=` | Not equal |
| `>` | Greater than |
| `<` | Less than |
| `>=` | Greater or equal |
| `<=` | Less or equal |

### Logical Chain:
Python uses English words for logic instead of symbols like `&&` or `||`.
- `and`: Both must be true.
- `or`: At least one must be true.
- `not`: Reverse the boolean value.

```python
x = 10
print(x > 5 and x < 20) # True
```

---

## 3. The `in` Operator (Membership)

Python has a very powerful operator for checking if an item exists inside a collection (like a list or a string).

```python
name = "Antigravity"
print("Anti" in name) # True

nums = [1, 2, 3]
print(5 in nums)      # False
```

---

## 4. Interview Pro-Tips

### Operator Precedence (PEMDAS)
Just like in math, Python follows rules for which operator happens first. Multiplication/Division happen before Addition/Subtraction. When in doubt, **always use parentheses `()`** to make your intent clear.

### The "Floating Point" trap
Python's `/` division always returns a float. If an interviewer asks you to perform integer math (like finding the index of the middle element in binary search), you **must** use `//`.
- `mid = (low + high) // 2`

### Chained Comparisons
A unique Python "Flex" is chaining comparisons. Instead of `x > 5 and x < 10`, you can write:
- `5 < x < 10`
This is much more readable and highly "Pythonic."

### Truthiness
Every object in Python has an inherent "Truth" value.
- **Falsy**: `0`, `0.0`, `""`, `[]`, `{}`, `set()`, `None`, and `False`.
- **Truthy**: Practically everything else.
- Interviewers love to see if you can use this for clean code: `if names:` is better than `if len(names) > 0:`.

### What Interviewers Are Testing
- Do you know when to use `//` vs `/`?
- Can you explain the difference between `==` and `is` (from the previous module)?
- Do you understand membership testing with `in`?

---

## Key Takeaway

Operators are the **logic gates** of your software. Using Python's English-like logical operators and chained comparisons will help you write code that is not only functional but also elegant and readable.
