---
title: Data Structures
order: 2
---

Python has several powerful built-in data structures.

## Lists

Ordered, mutable collections.

```python
fruits = ["apple", "banana", "cherry"]
fruits.append("date")
print(fruits[0]) # apple
```

## Dictionaries

Key-value pairs (hash maps).

```python
user = {
    "name": "Gaurav",
    "role": "Developer"
}
print(user["name"]) # Gaurav
```

## Tuples

Ordered, immutable collections.

```python
point = (10, 20)
# point[0] = 15  # This would throw an error
```

## Sets

Unordered collections of unique elements.

```python
tags = {"python", "coding", "python"}
print(tags) # {"python", "coding"}
```
