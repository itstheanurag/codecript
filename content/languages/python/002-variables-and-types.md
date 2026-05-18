---
title: Variables and Data Types
order: 2
---

In computer programming, a **Variable** is a reserved memory location to store values. This means that when you create a variable, you reserve some space in memory (`RAM`). Based on the data type of a variable, the interpreter allocates memory and decides what can be stored in the reserved memory.

---

## 1. Dynamic Typing in Python

Python is a **Dynamically Typed** language. Unlike languages such as C++ or Java, you do not need to declare the type of a variable when you create one. The type is determined during runtime based on the value assigned to the variable.

```python
# The interpreter assigns the 'integer' type to 'age'
age = 25

# The same variable can later hold a different type
age = "Twenty Five" 
```

---

## 2. Fundamental Data Types

Python provides several built-in data types that are used to define the operations possible on them and the storage method for each of them.

### I. Numeric Types
- **Integers (`int`)**: Whole numbers, positive or negative, without decimals, of unlimited length.
- **Floating Point Numbers (`float`)**: Numbers with one or more decimals. Python also supports scientific notation with `e` to indicate the power of 10.
- **Complex Numbers (`complex`)**: Written with a "j" as the imaginary part (e.g., `3+5j`).

### II. Sequence Types
- **Strings (`str`)**: Contiguous sets of characters represented in quotation marks. Python does NOT have a character type; a single character is simply a string of length 1.
- **Lists & Tuples**: Ordered collections of items (covered in depth in future modules).

### III. Boolean Type (`bool`)
- Represents one of two values: `True` or `False`. Used extensively in conditional logic and flow control.

---

## 3. Variable Naming Conventions (PEP 8)

To maintain a professional codebase, you should follow the **PEP 8** style guide for Python code.

1. **Snake Case**: Separate words with underscores (e.g., `user_profile_id`).
2. **Case Sensitivity**: `Value` and `value` are distinct variables.
3. **No Keywords**: You cannot use reserved keywords (like `if`, `else`, `while`, `def`) as variable names.
4. **Meaningful Identifiers**: Avoid abstract names like `temp` or `x`. Use names that describe the data's purpose.

---

## 4. Deep Dive: Everything is an Object

In Python, **everything is an object**. When you assign `x = 10`, Python creates an integer object with the value `10` and makes the variable `x` a reference (pointer) to that object.

### The `id()` and `type()` functions:
- `id(variable)`: Returns the unique memory address of the object.
- `type(variable)`: Returns the data type of the object.

```python
x = 10
print(id(x))   # Prints the memory location
print(type(x)) # Prints <class 'int'>
```

---

## Interview Pro-Tips: Mutable vs. Immutable
Interviewers frequently ask about the difference between **Mutable** and **Immutable** types.
- **Immutable**: Types that cannot be changed after they are created (`int`, `float`, `str`, `tuple`). If you modify an immutable variable, Python creates a *new* object and updates the variable's reference.
- **Mutable**: Types that can be changed in place (`list`, `dict`, `set`). Modifying them does not change their memory address.
