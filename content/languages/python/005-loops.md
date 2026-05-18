---
title: Iteration and Loops
order: 5
---

Iteration is the process of executing a block of code multiple times. Python provides two primary loop structures: `for` and `while`. Understanding these, along with Python's iteration protocol, is essential for writing efficient code.

---

## 1. The `for` Loop: Iterating Over Sequences

In Python, the `for` loop is an "Iterator-based" loop. It doesn't just count numbers; it iterates over any **Iterable** object (lists, strings, ranges, etc.).

```python
fruits = ["apple", "banana", "cherry"]

for fruit in fruits:
    print(fruit)
```

### The `range()` Function
When you need to iterate a specific number of times, use `range()`. It generates a sequence of numbers lazily (saving memory).
```python
for i in range(5):        # 0 to 4
    print(i)
```

---

## 2. The `while` Loop: Condition-Based Iteration

The `while` loop continues to execute as long as its condition remains `True`. It is useful when the number of iterations is not known beforehand.

```python
count = 0
while count < 3:
    print(count)
    count += 1
```

**Caution**: Always ensure your `while` loop has a "termination condition" to avoid infinite loops.

---

## 3. Loop Control: `break`, `continue`, and `pass`

- **`break`**: Immediately exits the loop.
- **`continue`**: Skips the current iteration and jumps back to the top of the loop.
- **`pass`**: A null statement that serves as a placeholder. It does nothing but allows the syntax to be valid.

---

## 4. List Comprehensions: Pythonic Iteration

List comprehensions provide a concise way to create lists based on existing iterables. They are generally faster than traditional loops because they are optimized internally by the interpreter.

```python
# Traditional loop
squares = []
for x in range(10):
    squares.append(x**2)

# List Comprehension
squares = [x**2 for x in range(10)]
```

---

## Interview Pro-Tips: The `else` Clause in Loops
Did you know Python loops can have an `else` block?
- The `else` block executes **ONLY if the loop finished naturally** (i.e., it didn't hit a `break`).
- This is incredibly useful for "search" operations.

```python
for item in laundry:
    if item == "sock":
        print("Found a sock!")
        break
else:
    print("No socks found.") # Only runs if the loop completes without breaking
```

---

## Technical Summary
1. `Iterable`: An object capable of returning its members one at a time.
2. `Iterator`: The object that actually performs the iteration (keeps track of where it is).
3. `Efficiency`: Use list comprehensions or generators for large datasets to maximize speed and minimize memory usage.
