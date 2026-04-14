---
title: Error Handling
order: 17
---

Modern software must handle the unexpected. In Python, errors are handled through **Exceptions**—objects that represent an error condition. Python's philosophy is: **It's better to try and fail than to check every possible error beforehand.**

---

## 1. The `try-except` Block

The core of error handling in Python uses four keywords:

```python
try:
    # 1. Code that might fail
    x = 1 / 0
except ZeroDivisionError:
    # 2. Runs ONLY if a ZeroDivisionError happens
    print("Can't divide by zero!")
else:
    # 3. Runs ONLY if the try block succeeded
    print("Success!")
finally:
    # 4. Runs ALWAYS (perfect for cleanup)
    print("Cleanup complete.")
```

---

## 2. The Pythonic Way: "EAFP"

In many languages, you check if a file exists before opening it (**LBYL**: Look Before You Leap). 
Python prefers **EAFP**: **Easier to Ask for Forgiveness than Permission.**

- **LBYL (Avoid this)**: `if path.exists(): open(path)` 
- **EAFP (Do this)**: `try: open(path) except FileNotFoundError: ...`

**Why?** EAFP is faster because it avoids redundant checks, and it's safer because it prevents "Race Conditions" (where a file is deleted in the millisecond between you checking it and you opening it).

---

## 3. Custom Exceptions

For large applications, "built-in" errors like `ValueError` aren't specific enough. You should create your own.

```python
class InsufficientFundsError(Exception):
    """Raised when a bank account has low balance."""
    pass

def withdraw(amount, balance):
    if amount > balance:
        raise InsufficientFundsError(f"Needed {amount}, but had {balance}")
```

---

## 4. Interview Pro-Tips

### Don't use "Bare Excepts"
**Never** do this: `except: pass`. 
This will catch *every* possible error, including the user pressing `Ctrl+C` to stop the program or system-level memory errors. **Always specify the error** you are looking for: `except ValueError:`.

### Exception Chaining
If you catch an error and want to raise a different one, use `raise ... from error`. This preserves the "Traceback," allowing you to see exactly where the original problem started.

### The `finally` Guarantee
A common interview question: "If I put `return` inside the `try` block, does the `finally` block still run?"
- **Answer**: **Yes**. The `finally` block is guaranteed to run before the function returns. This is why it's the perfect place to close database connections or files.

### What Interviewers Are Testing
- Do you understand the `try/except/else/finally` flow?
- Can you explain why EAFP is preferred in Python?
- Do you know how to create and raise custom exceptions?

---

## Key Takeaway

Error handling isn't just about preventing crashes—it's about **program control**. By using specific exceptions and the EAFP philosophy, you can write resilient code that handles real-world chaos gracefully.
