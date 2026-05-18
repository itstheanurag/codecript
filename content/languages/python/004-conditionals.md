---
title: Control Flow: Conditionals
order: 4
---

Control flow refers to the order in which individual statements, instructions, or function calls are executed. The most common way to branch the flow of execution is using **Conditional Statements**.

---

## 1. If, Elif, and Else

Python uses `if`, `elif` (else if), and `else` to execute different blocks of code based on logical conditions.

```python
score = 85

if score >= 90:
    print("Grade: A")
elif score >= 80:
    print("Grade: B")
else:
    print("Grade: C")
```

- **Indentation**: Unlike languages that use curly braces `{}` (C++, Java, JS), Python uses **whitespace indentation** to define the scope of a block. This is enforced by the compiler and is central to Python's design philosophy.

---

## 2. Truthiness and Falsiness

In Python, every object has an inherent Boolean value. This concept is called **Truthiness**.

| Falsy Values | Everything Else (Truthy) |
| :--- | :--- |
| `None` | Any non-zero number |
| `False` | Non-empty strings (`"Hello"`) |
| `0` (and `0.0`) | Non-empty lists, dicts, sets |
| `""` (Empty string) | |
| `[]`, `{}`, `set()` (Empty collections) | |

```python
name = ""
if not name:
    print("Name is empty") # This will execute because "" is Falsy
```

---

## 3. Structural Pattern Matching (Match-Case)

Introduced in Python 3.10, the `match` statement is a powerful way to branch logic based on the structure of data—similar to `switch-case` in other languages but significantly more capable.

```python
status = 404

match status:
    case 200:
        print("Success")
    case 404:
        print("Not Found")
    case 500 | 501: # OR operator in cases
        print("Server Error")
    case _:
        print("Unknown Status") # Default catch-all
```

---

## Interview Pro-Tips: The Ternary Operator
Python supports conditional expressions (often called the ternary operator) for simple one-line branches.

```python
# Result = <Value if True> if <Condition> else <Value if False>
access_allowed = True if age >= 18 else False
```

While efficient, be careful not to nest these too deeply, as it violates the principle of **Readability** (The Zen of Python).
