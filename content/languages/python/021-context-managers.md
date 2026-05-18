---
title: Resource Management
order: 21
---

In software development, managing external resources—such as file handles, database connections, or network sockets—is a critical task. If resources aren't closed properly, it can lead to memory leaks and system instability. 

Python uses **Context Managers** to ensure that resources are automatically and reliably cleaned up.

---

## 1. The `with` Statement

The `with` statement simplifies resource management by wrapping the execution of a block of code with methods defined by a context manager.

```python
# The standard way to open a file
with open("data.txt", "r") as f:
    content = f.read()
# The file is AUTOMATICALLY closed here, even if an error occurs inside the block
```

---

## 2. The Context Manager Protocol

An object becomes a context manager by implementing two magic methods:

- **`__enter__(self)`**: This executes before the block starts. Its return value is bound to the variable after the `as` keyword.
- **`__exit__(self, exc_type, exc_val, exc_tb)`**: This executes after the block finishes (or if an exception occurs). It receives information about any raised errors, allowing it to perform cleanup or suppress the error.

---

## 3. Creating Custom Context Managers

You can build your own context managers to handle custom resources like database transactions or timing code execution.

```python
class Timer:
    def __enter__(self):
        self.start = time.time()
        return self

    def __exit__(self, *args):
        self.end = time.time()
        print(f"Elapsed: {self.end - self.start}")

with Timer():
    # Code to measure
    do_heavy_work()
```

---

## 4. The `@contextmanager` Utility

For simpler cases, you can use the `contextlib` module to create a context manager using a **Generator**. This is often more readable than a full class.

```python
from contextlib import contextmanager

@contextmanager
def temporary_file():
    f = open("temp.txt", "w")
    try:
        yield f # The code inside the "with" block executes here
    finally:
        f.close() # Cleanup logic
```

---

## Interview Pro-Tips: RAII Pattern
Context managers are Python's version of the **RAII (Resource Acquisition Is Initialization)** pattern from C++. They provide a deterministic way to manage the lifecycle of a resource, ensuring that the "release" logic is always coupled with the "acquisition" logic.

---

## Technical Summary
1. `Deterministic Cleanup`: Guaranteed execution of the `__exit__` logic.
2. `Error Handling`: `__exit__` can determine whether to suppress an exception by returning `True`.
3. `Stackability`: You can use multiple context managers in a single `with` statement: `with A() as a, B() as b:`.
