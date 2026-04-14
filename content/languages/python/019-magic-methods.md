---
title: Magic Methods (Dunders)
order: 19
---

**Magic Methods** are special methods that start and end with double underscores, like `__init__`. They are also called **"Dunder Methods"** (Double-Under). These methods allow your custom objects to behave like built-in Python types.

---

## 1. The Core Dunders

| Method | Trigger | Purpose |
| :--- | :--- | :--- |
| **`__init__`** | `obj = MyClass()` | Initializes a new object (Constructor). |
| **`__str__`** | `print(obj)` | Returns a user-friendly string representation. |
| **`__repr__`** | `repr(obj)` | Returns an official string for developers (Debugging). |
| **`__len__`** | `len(obj)` | Allows your object to have a "length." |

---

## 2. Operator Overloading

Have you ever wondered how Python knows that `+` adds numbers but also joins strings? This is **Operator Overloading**, and you can add it to your own classes.

```python
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __add__(self, other):
        # Triggered by 'v1 + v2'
        return Vector(self.x + other.x, self.y + other.y)

    def __str__(self):
        return f"Vector({self.x}, {self.y})"

v1 = Vector(1, 2)
v2 = Vector(3, 4)
print(v1 + v2) # Vector(4, 6)
```

---

## 3. The Callable and Container Dunders

### `__call__` (Making objects functional)
If you implement `__call__`, you can "call" your object like a function: `my_obj()`.

### `__getitem__` (Making objects subscriptable)
If you implement `__getitem__`, you can access your object using square brackets: `my_obj[0]`.

---

## 4. Interview Pro-Tips

### `__str__` vs `__repr__`
An interviewer will almost certainly ask: "What's the difference?"
- **`__str__`**: For customers/end-users. Make it pretty.
- **`__repr__`**: For developers. Make it unambiguous. If possible, `eval(repr(obj))` should recreate the object.

### The "Duck Typing" Connection
Magic methods are the secret sauce of **Duck Typing**. If your object looks like a list (has `__len__` and `__getitem__`), Python will treat it like a list, regardless of its actual class.

### Optimization with `__slots__`
By default, Python storing object attributes in a dictionary (`__dict__`). If you have millions of small objects, you can use `__slots__ = ('x', 'y')` to tell Python exactly what attributes exist, saving a massive amount of memory.

### What Interviewers Are Testing
- Do you understand how Python hooks into your custom classes?
- Can you explain operator overloading?
- Do you know when to use `__repr__` over `__str__`?

---

## Key Takeaway

Magic methods are the bridge between your code and the Python language features. By mastering Dunders, you can create objects that feel like natural, first-class citizens of the Python ecosystem.
