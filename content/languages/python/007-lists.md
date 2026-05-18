---
title: Ordered Collections: Lists
order: 7
---

A **List** is Python's most versatile collection type. It is an ordered, mutable sequence of items. Under the hood, Python lists are implemented as **Dynamic Arrays**, meaning they can grow and shrink in memory automatically.

---

## 1. Creating and Modifying Lists

Lists are defined using square brackets `[]`. They can contain mixed data types, although it is best practice to keep them homogeneous for predictable processing.

```python
tech_stack = ["Python", "Flask", "Docker"]

# Modification (Mutable)
tech_stack[1] = "Django"
```

---

## 2. Accessing Data: Slicing and Indexing

Python supports powerful indexing and slicing mechanisms for data retrieval.

- **Zero-based indexing**: `list[0]` is the first item.
- **Negative indexing**: `list[-1]` is the last item.
- **Slicing**: `list[start:stop:step]` returns a new sub-list.
  ```python
  nums = [0, 1, 2, 3, 4, 5]
  print(nums[1:4]) # [1, 2, 3] (Exclusive of the stop index)
  print(nums[::-1]) # [5, 4, 3, 2, 1, 0] (Reverses the list)
  ```

---

## 3. List Methods and Performance

Understanding the time complexity (Big O) of list operations is critical for senior roles.

| Operation | Method | Time Complexity |
| :--- | :--- | :--- |
| **Append** | `list.append(x)` | O(1) (Amortized) |
| **Pop** | `list.pop()` | O(1) (From the end) |
| **Insert/Delete** | `list.insert(i, x)` | O(n) (Shifts all subsequent elements) |
| **Search** | `x in list` | O(n) |

---

## 4. Sorting and Manipulation

- **`sort()`**: Sorts the list in-place (O(n log n) using Timsort).
- **`sorted()`**: Returns a new sorted list, leaving the original unchanged.
- **`reverse()`**: Reverses the list in-place.

---

## Interview Pro-Tips: List Identity and Copying
A common mistake in interviews is confusing a **Reference** with a **Copy**.

```python
a = [1, 2, 3]
b = a          # Both point to the same object in memory
c = a.copy()   # Creates a shallow copy (new object)

a.append(4)
print(b) # [1, 2, 3, 4]
print(c) # [1, 2, 3]
```

Always use `.copy()` or `list(a)` when you want to modify a sequence without affecting the original.

---

## Technical Summary
1. `Dynamic Array`: Internally, Python allocates more space than needed to allow for O(1) appends.
2. `Mutability`: Modifying a list affects all variables that reference it.
3. `Heterogeneity`: While allowed, avoid mixing types unless strictly necessary for the application logic.
