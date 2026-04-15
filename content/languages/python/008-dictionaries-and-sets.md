---
title: Unordered Collections: Dicts and Sets
order: 8
---

# Dictionaries and Sets: The Power of Hashing

In Python, **Dictionaries** and **Sets** are high-performance collections built on **Hash Tables**. They provide near-instant data retrieval regardless of the collection's size.

---

## 1. Dictionaries: Key-Value Mapping

A dictionary (`dict`) is a collection of key-value pairs. Since Python 3.7, dictionaries maintain the **Insertion Order** of their keys.

```python
user = {
    "username": "jdoe",
    "email": "john@example.com",
    "is_active": True
}

# Accessing values
print(user["username"])
print(user.get("last_login", "Never")) # Using .get() prevents KeyErrors
```

- **Keys MUST be Hashable**: Only immutable types (strings, numbers, tuples) can be used as dictionary keys.

---

## 2. Sets: The Mathematical Collection

A `set` is an unordered collection of **Unique** items. It is ideal for removing duplicates and performing set operations like Union and Intersection.

```python
ids = {101, 102, 103, 101}
print(ids) # {101, 102, 103} (Duplicate 101 is automatically removed)
```

---

## 3. Performance: The Hash Table Advantage

The primary reason to use a `dict` or `set` is **Speed**. Because they use hashing, searching for an item takes **O(1) (Constant Time)**, whereas searching a list takes **O(n) (Linear Time)**.

| Collection | Add | Search | Delete |
| :--- | :--- | :--- | :--- |
| **List** | O(1)* | O(n) | O(n) |
| **Dict/Set** | O(1) | O(1) | O(1) |

---

## 4. Set Mathematics

Sets in Python map directly to mathematical set theory, providing built-in methods for complex comparisons.

- **Union (`|`)**: Items in either set.
- **Intersection (`&`)**: Items in both sets.
- **Difference (`-`)**: Items in the first set but not the second.
- **Symmetric Difference (`^`)**: Items in either set, but not both.

---

## Interview Pro-Tips: Dictionary Comprehensions
Like list comprehensions, you can create dictionaries in a single, efficient line.

```python
users = ["Alice", "Bob"]
user_ids = {u: i for i, u in enumerate(users)}
# Result: {"Alice": 0, "Bob": 1}
```

This is often used in interview coding challenges to build frequency maps (e.g., counting the occurrences of characters in a string).

---

## Technical Summary
1. `Hash Table`: Under the hood, Python uses the `hash()` value of the key to jump directly to the memory location of the value.
2. `Membership Testing`: `x in my_set` is significantly faster than `x in my_list` for large datasets.
3. `Uniqueness`: Use sets whenever you need to ensure data integrity by preventing duplicates.
