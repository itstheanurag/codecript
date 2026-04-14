---
title: The Python Execution Model
order: 10
---

In Python, the way code is executed and how variables interact with memory is unique. Understanding the concept of **Names** vs. **Objects** is the "Aha!" moment for many Python developers.

---

## 1. Variables are just Names

In languages like C++, a variable is like a **Box** that holds data.
In Python, a variable is like a **Post-it Note** (a Name) that you stick onto an **Object** in memory.

```python
x = [1, 2, 3] # Create a list object and stick the label 'x' on it
y = x         # Stick the label 'y' on the SAME list object
```

### The Reference Diagram
Both `x` and `y` now point to the exact same spot in memory. If you change the list using `x`, the change will be visible through `y`!

```mermaid
graph LR
    X[Name: x] --> Obj[List Object: [1,2,3]]
    Y[Name: y] --> Obj
    style Obj fill:#22c55e,color:#fff
```

---

## 2. Shared References and Mutability

This leads to a common confusion:

```python
a = [10]
b = a
a.append(20)

print(b) # [10, 20] -> b was changed!
```

Wait, what if we use an **Immutable** type like an Integer?

```python
a = 10
b = a
a = a + 5 # This creates a NEW int object (15)

print(a) # 15
print(b) # 10 -> b is still 10!
```
*Because Integers are immutable, Python couldn't change the object `10`. It had to create a new object `15` and move the label `a` to it.*

---

## 3. Passing Arguments to Functions

Python uses a mechanism called **"Pass by Object Reference"** (or Pass by Assignment).
- If you pass a **Mutable** object (like a List) to a function and modify it inside, the original list **will be changed**.
- If you pass an **Immutable** object (like a String) and "change" it, you are only changing the local label, so the original **remains the same**.

---

## 4. Interview Pro-Tips

### The `is` vs `==` Mastery
- `==`: Checks if objects have the **same value**.
- `is`: Checks if they are the **exact same object** in memory (`id(a) == id(b)`).
- **Interview Question**: "Why does `a = []; b = []; print(a is b)` return `False`?"
- **Answer**: "Empty lists are mutable. Python creates two distinct list objects in memory so that modifying one doesn't affect the other."

### Shallow vs. Deep Copy
When you want to duplicate a mutable object without a shared reference:
- **Shallow Copy** (`list[:]` or `.copy()`): Copies the container, but nested objects are still shared.
- **Deep Copy** (`copy.deepcopy()`): Recursively copies everything. No references are shared.

### The "Garbage Collection" Trigger
Python uses **Reference Counting**. Every object keeps track of how many "labels" are stuck on it. When that count hits **0**, Python instantly deletes the object and frees the memory.

### What Interviewers Are Testing
- Do you understand that names are just labels?
- Can you predict the side effects of modifying a shared list?
- Do you know the difference between `is` and `==`?

---

## Key Takeaway

Python's execution model is built for **speed of development**. By treating variables as references, Python avoids unnecessary copying of data. As a developer, your job is to know when objects are shared and when they are unique.
