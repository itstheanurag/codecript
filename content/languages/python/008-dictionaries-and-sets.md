---
title: Dictionaries and Sets
order: 8
---

Dictionaries and Sets are Python's high-performance **Hash-Based** collections. They allow for near-instant (O(1)) data retrieval, making them essential for writing efficient algorithms.

---

## 1. Dictionaries (The Key-Value Map)

A **Dictionary** stores associations between "Keys" and "Values." Think of it like a real dictionary: you look up a "Word" (Key) to find its "Definition" (Value).

```python
# Keys must be immutable (Strings, Numbers, Tuples)
user = {
    "name": "Antigravity",
    "role": "Assistant",
    "version": 1.0
}

print(user["name"]) # Antigravity
```

### The Hashing Mystery
Under the hood, Python runs the key through a **Hash Function** to find its location in memory. This is why lookups are so fast!

```mermaid
graph LR
    Key[Key: 'name'] --> HashFunc[Hash Function]
    HashFunc --> Index[Index: 5]
    Index --> Bucket[Bucket 5: 'Antigravity']
    
    style Bucket fill:#0369a1,color:#fff
```

---

## 2. Sets (The Unique Collection)

A **Set** is a collection of unique items. It's essentially a dictionary with only keys and no values.

```python
langs = {"Python", "JS", "C++", "Python"}
print(langs) # {'Python', 'JS', 'C++'} (Duplicates are gone!)
```
*Sets are perfect for checking membership (`item in my_set`) or performing math-like operations (Union, Intersection).*

---

## 3. Key Operations & Complexity

| Operation | Average | Worst Case | Note |
| :--- | :--- | :--- | :--- |
| **Lookup** | O(1) | O(n) | Constant on average. |
| **Insert** | O(1) | O(n) | Constant on average. |
| **Delete** | O(1) | O(n) | Constant on average. |

---

## 4. Interview Pro-Tips

### Use Dictionaries to avoid O(n²) loops
If you find yourself searching through a list inside another loop, consider storing the list data in a Dictionary first. Converting a list to a dictionary takes O(n), but lookups then become O(1). This is the #1 optimization trick in coding interviews.

### Dictionary Order
As of Python 3.7+, **dictionaries maintain insertion order**. This means when you iterate over a dict, it will return items in the same order they were added. (Sets, however, do NOT maintain order).

### Missing Keys: `.get()` vs `[]`
- `my_dict["color"]`: Throws a `KeyError` if the key is missing.
- `my_dict.get("color")`: Returns `None` (or a default) if the key is missing.
Use `.get()` when you aren't 100% sure the key exists to prevent your program from crashing.

### Hashability
A key must be **Hashable** (immutable). This is why you can use a Tuple as a dictionary key, but you **cannot** use a List.

### What Interviewers Are Testing
- Can you explain how a Hash Map works at a high level?
- Do you know how to use Sets to remove duplicates efficiently?
- Do you understand the performance difference between `item in list` (O(n)) and `item in set` (O(1))?

---

## Key Takeaway

Dictionaries and Sets are the **optimization backbone** of Python. By leveraging hashing, they turn slow search problems into instant lookups, allowing you to solve complex algorithmic puzzles with ease.
