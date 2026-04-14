---
title: Modern Type Hinting
order: 18
---

While Python remains a dynamically typed language, **Type Hinting** (introduced in 3.5) has transformed how large codebases are written. It allows you to specify what types your functions expect, making your code self-documenting and "Type Safe" during development.

---

## 1. Basic Type Annotations

You can annotate variables, function parameters, and return types using colon `:` and arrow `->` syntax.

```python
# variable: type = value
age: int = 25

def greet(name: str) -> str:
    return f"Hello, {name}"
```

> [!NOTE]
> **Python does NOT enforce types at runtime**. If you pass an integer to `greet(name: str)`, Python will not crash. Type hints are for **Static Analysis Tools** (like MyPy) and for your IDE.

---

## 2. Using the `typing` module

For complex types like lists or optional values, Python provides the `typing` module (though Python 3.9+ allows using built-ins directly).

```python
from typing import List, Optional, Dict, Union

# A list of integers
scores: List[int] = [90, 85, 88]

# A value that could be a string OR None
username: Optional[str] = None

# A value that could be an Int or a Float
price: Union[int, float] = 19.99
```

---

## 3. Why use Type Hints?

1. **Catch Bugs Early**: Tools like `mypy` can find "Type Errors" before you ever run your code.
2. **Superior Autocomplete**: Your IDE (VS Code, PyCharm) can provide perfect suggestions because it knows exactly what methods on `username` are available.
3. **Readability**: Other developers don't have to guess what `x` and `y` are; the code tells them.

---

## 4. Interview Pro-Tips

### Python 3.9+ improvements
In older Python, you had to import `List` from `typing`. In modern Python (3.9+), you can just use the lowercase built-in types:
- `names: list[str] = ["Alice", "Bob"]`

### `Any` vs `Object`
- **`Any`**: Tells the type checker: "Don't check this. Anything goes." Use sparingly!
- **`object`**: Tells the type checker: "This is a generic object. I can only do things to it that are common to all objects."

### Type Hinting for Classes (`Self`)
Starting in Python 3.11, you can use the `Self` type to indicate that a method returns an instance of the class it belongs to—perfect for "Fluent Interfaces" (Chaining).

### What Interviewers Are Testing
- Do you understand that Type Hints are **not** enforced at runtime?
- Can you explain the benefits for large teams?
- Are you aware of tools like MyPy or Pydantic?

---

## Key Takeaway

Type Hinting is the **"Guardrail"** for modern Python. By adding a small amount of extra text, you gain massive improvements in code safety, maintainability, and developer productivity.
