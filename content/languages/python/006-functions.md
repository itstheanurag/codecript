---
title: Modular Code: Functions
order: 6
---

Functions are the primary building blocks of modular programming. They allow you to encapsulate a block of code into a single, named unit that can be executed from anywhere in your program.

---

## 1. Defining and Calling Functions

In Python, functions are defined using the `def` keyword. A function can accept input data (parameters) and return data as a result.

```python
def calculate_area(width, height):
    """
    Computes the area of a rectangle.
    """
    return width * height

# Application: Invoking the function
area = calculate_area(10, 5)
```

---

## 2. Argument Types

Python provides several ways to pass data into functions:

- **Positional Arguments**: Assigned based on the order they are passed.
- **Keyword Arguments**: Explicitly named during the call (e.g., `calculate_area(height=5, width=10)`).
- **Default Parameters**: Used if no argument is provided. 
  ```python
  def greet(name, msg="Hello"):
      print(f"{msg}, {name}")
  ```
- **Arbitrary Arguments (`*args`, `**kwargs`)**: Allow a function to accept any number of positional or keyword arguments. This is useful for building flexible decorators or wrappers.

---

## 3. Scope and Namespacing (LEGB Rule)

When you access a variable inside a function, Python follows the **LEGB rule** to find its value:
1. **L**ocal: Inside the function.
2. **E**nclosing: In the scope of nested functions.
3. **G**lobal: At the top level of the script.
4. **B**uilt-in: Python’s pre-defined names (like `len` or `print`).

---

## 4. Lambda Functions: Anonymous Logic

For simple, one-line transformations, Python supports **Lambda functions**. These are functions without a name, typically used as arguments to other functions like `map`, `filter`, or `sort`.

```python
# lambda <parameters> : <expression>
square = lambda x: x**2
print(square(5)) # 25
```

---

## Interview Pro-Tips: Functions are First-Class Objects
In Python, functions are "First-Class Objects." This means you can:
- Assign them to variables.
- Pass them as arguments to other functions.
- Return them from other functions.

This is the foundation of **Functional Programming** and **Decorators** in Python.

---

## Technical Summary
1. `Abstraction`: Hiding complex logic behind a simple name.
2. `Immutability`: Be careful passing mutable objects (like lists) as default arguments. They are initialized only once, which can lead to unexpected behavior.
3. `Type Hinting`: Use `def func(name: str) -> bool` to make your code more readable and safer.
