---
title: Exception Handling
order: 17
---

Errors in Python are managed through **Exceptions**. An exception is a signal that an error has occurred during the execution of a program. If not handled correctly, an exception will propagate up the call stack and eventually terminate the program.

---

## 1. Try, Except, Else, and Finally

The core structure for handling errors in Python is the `try-except` block.

```python
try:
    # Code that might raise an error
    value = 10 / 0
except ZeroDivisionError as e:
    # Handle specific error
    print(f"Error: {e}")
else:
    # Runs ONLY if no exception was raised
    print("Success!")
finally:
    # ALWAYS runs (useful for cleanup like closing files)
    print("Cleanup complete.")
```

---

## 2. EAFP vs. LBYL

One of the most characteristic aspects of Python coding style is the comparison between these two philosophies:

- **EAFP (Easier to Ask for Forgiveness than Permission)**: This is the **Pythonic** standard. You assume things will work and wrap them in a `try` block. It is generally faster because you don't perform unnecessary checks.
- **LBYL (Look Before You Leap)**: You check if an operation is safe *before* doing it (e.g., `if path.exists():`). This can lead to race conditions (TOCTOU: Time of check to time of use).

---

## 3. The Exception Hierarchy

All exceptions in Python are objects that inherit from the `BaseException` class.
- **`Exception`**: The base class for almost all common errors.
- **`RuntimeException`**, **`ValueError`**, **`TypeError`**, etc.: Specialized subclasses.

**Best Practice**: Always catch specific exceptions. Never use a blank `except:` or `except Exception:`, as this can catch (and hide) critical system errors like `KeyboardInterrupt` (Ctrl+C).

---

## 4. Raising and Custom Exceptions

You can manually trigger an exception using the `raise` keyword. For professional applications, you should define your own exception classes to improve debuggability.

```python
class InsufficientFundsError(Exception):
    """Raised when an account balance is too low."""
    pass

def withdraw(amount):
    if amount > balance:
        raise InsufficientFundsError(f"Tried to withdraw {amount}")
```

---

## Interview Pro-Tips: Exception Chaining
Introduced in Python 3, you can use `raise ... from ...` to chain exceptions. This is useful when you catch one error but want to raise a more high-level business error while preserving the "Original" cause for the logs.

```python
try:
    do_database_stuff()
except DatabaseError as e:
    raise ServiceError("Failed to fetch user") from e
```

---

## Technical Summary
1. `Propagation`: Uncaught exceptions move up the stack to the global level.
2. `Cleanup`: Always use `finally` or `context managers` (Module 21) to ensure resource cleanup regardless of errors.
3. `Narrowness`: Only wrap the specific line of code that might fail in a `try` block.
