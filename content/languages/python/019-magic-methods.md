---
title: Dunder Methods
order: 19
---

In Python, **Magic Methods** (also called **Dunder Methods** because they start and end with "Double Underscores") are special functions that allow your custom objects to interact with Python's built-in operators and syntax.

They are the mechanism behind **Operator Overloading**.

---

## 1. Lifecycle: `__new__` vs `__init__`

- **`__new__(cls, ...)`**: The actual **Constructor**. It is a static method that creates and returns a new instance of the class. It is rarely overridden, except in advanced cases like Singletons or immutable subclasses.
- **`__init__(self, ...)`**: The **Initializer**. It is called after the object has been created to set its initial state.

---

## 2. Representation: `__str__` vs `__repr__`

- **`__str__`**: Should return a readable string intended for the **End User** (used by `print()` and `str()`).
- **`__repr__`**: Should return an unambiguous string intended for **Developers** and debugging. Ideally, `eval(repr(obj)) == obj`.

---

## 3. Operator Overloading

You can define how your objects behave when used with mathematical or comparison operators.

| Method | Operator | Purpose |
| :--- | :--- | :--- |
| `__add__` | `+` | Addition |
| `__sub__` | `-` | Subtraction |
| `__eq__` | `==` | Equality |
| `__lt__` | `<` | Less Than |
| `__len__` | `len()` | Returns length |
| `__getitem__` | `obj[key]` | Indexing/Slicing |

```python
class Vector:
    def __init__(self, x, y):
        self.x, self.y = x, y

    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)

v1 = Vector(1, 2)
v2 = Vector(3, 4)
v3 = v1 + v2 # Internally calls v1.__add__(v2)
```

---

## 4. The `callable` Pattern: `__call__`

By implementing the `__call__` method, you can make an object behave like a function.

```python
class Adder:
    def __init__(self, n):
        self.n = n
    def __call__(self, x):
        return self.n + x

add_five = Adder(5)
print(add_five(10)) # 15
```

---

## Interview Pro-Tips: Why use Dunder methods?
Dunder methods allow your classes to feel like **Native Python Types**. This consistency is a core part of the "Pythonic" style. Instead of writing `my_list.get_length()`, you write `len(my_list)`. Instead of `v1.add_vector(v2)`, you write `v1 + v2`.

---

## Technical Summary
1. `Dunder Methods`: Pre-defined hooks that Python calls behind the scenes.
2. `Duck Typing`: Python doesn't care about the object's class; it cares if the object has the required magic method (e.g., if it has `__iter__`, it can be used in a `for` loop).
3. `Overloading`: Be careful not to change the expected behavior of operators (e.g., don't make `+` perform subtraction).
