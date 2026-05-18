---
title: Static Typing in Python
order: 18
---

Python is a **Dynamically Typed** language, meaning variable types are determined at runtime. However, as codebases grow, the lack of explicit types can lead to confusion and bugs. **Type Hinting** (introduced in PEP 484) allows developers to add optional type annotations to their code.

---

## 1. Simple Type Annotations

You can annotate variables, function parameters, and return types using colon `:` and arrow `->` syntax.

```python
def process_user(user_id: int, name: str) -> bool:
    # Logic here
    return True

age: int = 25
```

- **Runtime Impact**: Type hints are **ignored** by the Python interpreter at runtime. They have zero performance cost.
- **Static Analysis**: Tools like **Mypy**, **Pyright**, or your IDE use these hints to find bugs *before* the code runs.

---

## 2. The `typing` Module: Complex Hints

For complex structures like lists or dictionaries, use the built-in `typing` module (or modern built-in types in Python 3.9+).

```python
# Modern Syntax (3.9+)
def get_scores(users: list[str]) -> dict[str, int]:
    return {"Alice": 95}

# Unions (Optional values)
from typing import Union, Optional

def get_total(price: Union[int, float], tax: Optional[float] = None) -> float:
    ...
```

---

## 3. Generic Types and Multi-Tooling

Type hints allow for **Generics**, which let you define tools that work with any type while still maintaining safety. This is common when building reusable data structures or libraries.

```python
from typing import TypeVar, List

T = TypeVar('T') # A placeholder for any type

def get_first(items: List[T]) -> T:
    return items[0]
```

---

## 4. Pydantic and Runtime Validation

While standard type hints are ignored at runtime, libraries like **Pydantic** use them to perform **Runtime Data Validation**. This is the industry standard for modern web development (especially with FastAPI).

```python
from pydantic import BaseModel

class User(BaseModel):
    id: int
    username: str
    email: str

# Pydantic will throw an error if "id" is not an integer
user = User(id="abc", username="jdoe", email="john@example.com")
```

---

## Interview Pro-Tips: Why use Typing?
1. **Self-Documentation**: Your code becomes much easier for other developers (and your future self) to read without jumping between files.
2. **Refactoring Safety**: Your IDE can safely rename variables and identify breaking changes because it knows the types.
3. **Better Tooling**: You get significantly better autocomplete (IntelliSense).

---

## Technical Summary
1. `Gradual Typing`: You can add types to parts of your codebase without having to type everything.
2. `Mypy`: The standard tool for checking type safety in CI/CD pipelines.
3. `Evolution`: Python is moving closer to a "Typed-optional" model to support enterprise-scale software development.
