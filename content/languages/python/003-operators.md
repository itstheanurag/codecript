---
title: Arithmetic and Logical Operators
order: 3
---

# Operators: Performing Computations

Operators are specific symbols used to perform operations on variables and values. In Python, operators are categorized based on the type of operation they perform: arithmetic, comparison, logical, and assignment.

---

## 1. Arithmetic Operators

Arithmetic operators are used with numeric values to perform common mathematical operations.

| Operator | Name | Example |
| :--- | :--- | :--- |
| `+` | Addition | `x + y` |
| `-` | Subtraction | `x - y` |
| `*` | Multiplication | `x * y` |
| `/` | Division | `x / y` (Always returns a float) |
| `//` | Floor Division | `x // y` (Returns the largest integer) |
| `%` | Modulus | `x % y` (Remainder of division) |
| `**` | Exponentiation | `x ** y` (Power) |

---

## 2. Comparison Operators

Comparison operators compare two values and return a Boolean (`True` or `False`). These are fundamental for decision-making in code.

- `==` Equal
- `!=` Not equal
- `>` Greater than
- `<` Less than
- `>=` Greater than or equal to
- `<=` Less than or equal to

---

## 3. Logical Operators

Logical operators are used to combine conditional statements.

- `and`: Returns `True` if both statements are true.
- `or`: Returns `True` if at least one statement is true.
- `not`: Reverses the result (True becomes False).

---

## 4. Identity and Membership Operators

These are unique to Python and provide a more readable way to check for equality and existence.

- **`is`**: Returns `True` if both variables point to the same object in memory (compares memory address, not just value).
- **`in`**: Returns `True` if a sequence with the specified value is present in the object.

```python
list1 = [1, 2, 3]
list2 = [1, 2, 3]

print(list1 == list2) # True (Values are the same)
print(list1 is list2) # False (They are different objects in memory)
```

---

## Interview Pro-Tips: The "Short-Circuit" Logic
In Python, logical operators `and` and `or` use **Short-Circuit Evaluation**. 
- In `A and B`, if `A` is false, Python won't even evaluate `B` because the result must be false.
- In `A or B`, if `A` is true, Python won't evaluate `B`.
Understanding this can help you avoid errors (e.g., checking if an object is not None before accessing its attributes).
