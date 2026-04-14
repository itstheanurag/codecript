---
title: Conditionals
order: 4
---

Conditionals allow your program to make decisions. In Python, this is done using the `if`, `elif`, and `else` keywords, relying on **Indentation** to define what code belongs to which block.

---

## 1. The `if`, `elif`, and `else` Pattern

Python's decision logic is straightforward:

```python
score = 85

if score >= 90:
    print("Grade: A")
elif score >= 80:
    print("Grade: B")
else:
    print("Grade: C/F")
```

- **if**: The first condition to check.
- **elif**: (Short for else-if) Checked only if the previous conditions were False. You can have as many of these as you need.
- **else**: The "catch-all" block if all previous conditions failed.

---

## 2. One-Line "Ternary" Conditional

For simple logic, Python allows you to write the conditional on a single line. This is often used for variable assignment.

```python
# Result = <Value if True> if <Condition> else <Value if False>
status = "Adult" if age >= 18 else "Minor"
```

---

## 3. Structural Pattern Matching (`match`)

Added in **Python 3.10**, the `match` statement is Python's version of a "Switch" statement found in other languages, but with much more power.

```python
def http_status(code):
    match code:
        case 200:
            return "OK"
        case 404:
            return "Not Found"
        case 500:
            return "Server Error"
        case _:
            return "Unknown Error" # Wildcard (_) matches anything
```

---

## 4. Interview Pro-Tips

### Indentation is Syntax
In languages like C++ or Java, indentation is for style. In Python, it is part of the language rules. One extra space or one missing tab will result in an `IndentationError`. In an interview, be very careful with your spacing on the whiteboard!

### Guard Clauses
Instead of nesting many `if` statements inside each other (which creates hard-to-read "Arrow Code"), use **Guard Clauses**. Check for error conditions early and return immediately.
- `if not user: return False`

### Boolean Short-Circuiting
Python is lazy (in a good way).
- If you use `A or B`, and `A` is True, Python won't even look at `B`.
- If you use `A and B`, and `A` is False, Python won't even look at `B`.
This is useful for avoiding errors, like: `if list and list[0] == "Target":`. If `list` is empty, the first part fails, and Python never tries to access `list[0]`, preventing an `IndexError`.

### What Interviewers Are Testing
- Can you use `elif` correctly (avoiding redundant `if` checks)?
- Do you understand the Truthiness of empty collections?
- Can you explain how the `match` statement differs from a simple `if` ladder?

---

## Key Takeaway

Conditional logic in Python is designed to read like a sequence of logical thoughts. By using clean `if/elif` structures and taking advantage of pattern matching, you can build programs that are easy for both computers and humans to understand.
