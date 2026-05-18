---
title: The Python Execution Model
order: 10
---

To understand Python deeply, you must understand how it handles data in memory. Unlike "Value-based" languages (like C), Python uses a "Reference-based" model. 

In Python, **Variables are not boxes; they are names (Labels) attached to Objects.**

---

## 1. Everything is an Object

In Python, every piece of data—be it a number, a string, a function, or even a class—is an object.
- Each object has an **Identity** (its address in memory).
- Each object has a **Type**.
- Each object has a **Value**.

```python
x = 10
print(id(x))   # Memory Address
print(type(x)) # <class 'int'>
```

---

## 2. Assignment is Binding

When you write `x = [1, 2, 3]`, you aren't putting a list into a box called `x`. Instead, you are creating a list object in memory and then **Binding** the name `x` to it.

If you then say `y = x`, you aren't copying the list. You are simply binding a second name (`y`) to the **exact same object**.

---

## 3. Mutability and Side Effects

This reference model is why mutability is so important in Python.

| Type | Examples | Behavior |
| :--- | :--- | :--- |
| **Immutable** | `int`, `str`, `tuple` | Cannot change after creation. |
| **Mutable** | `list`, `dict`, `set` | Can be changed in-place. |

If multiple names are bound to the same mutable object, changing the object via one name affects all others.

```python
a = [1, 2, 3]
b = a
a.append(4) 
print(b) # [1, 2, 3, 4] - b was "pointing" to the same list!
```

---

## 4. Passing Arguments to Functions

Python uses a model called **"Pass-by-Object-Reference"** (or Pass-by-Sharing).

- When you pass an immutable object (like a string), it feels like "Pass-by-value" because the function can't change the original.
- When you pass a mutable object (like a list), the function *can* modify the original object in the caller's scope.

---

## Interview Pro-Tips: The `is` vs `==` Distinction
- `==` checks for **Equality** (Are the values the same?).
- `is` checks for **Identity** (Are they the exact same object in memory?).

```python
list1 = [1, 2]
list2 = [1, 2]

print(list1 == list2) # True
print(list1 is list2) # False (They live at different addresses)
```

---

## Technical Summary
1. `Binding`: Variables are references, not containers.
2. `Shared State`: Be careful with mutable default arguments in functions—they are shared across all calls.
3. `Object Lifecycle`: Python tracks objects via "Reference Counting" (covered in Module 13).
