---
title: Scope and Namespacing
order: 11
---

# Scope: The LEGB Hierarchy

In Python, **Scope** determines the visibility of an identifier (variable) within different parts of your code. A **Namespace** is a mapping from names to objects—effectively, it’s where Python "looks up" your variables.

---

## 1. The LEGB Resolution Rule

When you access a variable, Python searches for it in a specific order:

1. **L (Local)**: Defined inside a function or a lambda.
2. **E (Enclosing)**: Defined in the scope of a nested function.
3. **G (Global)**: Defined at the top level of the module (file).
4. **B (Built-in)**: Names pre-loaded into Python (e.g., `len`, `int`, `Exception`).

If Python reaches the "Built-in" level and still hasn't found the name, it raises a `NameError`.

---

## 2. Modifying Global and Enclosing Variables

By default, functions can **read** global variables but cannot **modify** them. If you try to assign a value to a global variable inside a function, Python creates a new *local* variable with that name.

To modify a variable from a higher scope, you must use the `global` or `nonlocal` keywords.

```python
count = 0

def increment():
    global count # Tells Python to use the global 'count', not create a new local one
    count += 1
```

```python
def outer():
    x = "outer"
    def inner():
        nonlocal x # Targets the variable in the nearest enclosing scope
        x = "inner"
    inner()
```

---

## 3. The `globals()` and `locals()` Tools

You can actually inspect Python's internal mappings at any time.
- **`globals()`**: Returns a dictionary of the current module's global namespace.
- **`locals()`**: Returns a dictionary of the local namespace (useful for debugging inside functions).

---

## 4. Name Masking (Shadowing)

Shadowing occurs when a variable in a local scope has the same name as one in an outer scope. This "masks" the outer variable, making it inaccessible without special tools like `globals()`.

**Worst Practice**: Shadowing built-in names. Never name a variable `list` or `str`, as it will break Python's ability to use the actual `list()` or `str()` constructors in that scope.

---

## Interview Pro-Tips: Why avoid `global`?
While the `global` keyword exists, it is generally considered a "code smell" in professional software. Relying on global state makes code harder to:
1. **Test**: Functions become dependent on outside state.
2. **Debug**: Any part of the program can change the variable unexpectedly.
3. **Parallelize**: Shared mutable state leads to race conditions.

Prefer passing variables as **parameters** and returning the result.

---

## Technical Summary
1. `Namespace`: A collection of names currently defined in the program.
2. `Lifetime`: Local variables are destroyed when a function returns; global variables persist until the script ends.
3. `Lookups`: Python lookups are "Static" (Lexical)—the scope is determined by where the code is written, not where it is called.
