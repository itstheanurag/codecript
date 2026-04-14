---
title: Loops and Iterables
order: 5
---

Loops allow you to run the same block of code multiple times. In Python, loops are built around the concept of **Iterables**—any object that can return its elements one at a time.

---

## 1. The `for` Loop (The Workhorse)

The `for` loop in Python isn't like the traditional `for (i=0; i<10; i++)` found in Java/C. Instead, it iterates directly over the items of a collection.

```python
fruits = ["apple", "banana", "cherry"]

for fruit in fruits:
    print(fruit)
```

### Using `range()`
When you *do* need to loop a specific number of times, you use the `range(start, stop, step)` function.

```python
# Loops 0 to 4
for i in range(5):
    print(i)
```

---

## 2. The `while` Loop

A `while` loop continues as long as a condition is **True**. It is best for situations where you don't know exactly how many times you'll need to repeat (e.g., waiting for user input).

```python
count = 0
while count < 3:
    print("Working...")
    count += 1
```

---

## 3. Loop Control: `break` and `continue`

- **break**: Exit the entire loop immediately.
- **continue**: Skip the rest of the *current* iteration and jump to the next one.

```python
for n in range(10):
    if n == 5:
        break # Stops entirely at 5
    if n % 2 == 0:
        continue # Skips even numbers
    print(n)
```

---

## 4. The Interview "Special": `for-else`

Python has a unique feature: you can add an `else` block to a loop. **The else block runs only if the loop finished naturally** (i.e., it was NOT stopped by a `break`).

```python
for item in search_list:
    if item == target:
        print("Found it!")
        break
else:
    print("Item was not in the list.")
```

---

## 5. Interview Pro-Tips

### Use `enumerate()` for Indices
Experienced Pythonistas almost never use `range(len(list))` to get an index. Instead, use `enumerate()`. It gives you both the index and the item cleanly.
- `for i, val in enumerate(my_list):`

### Use `zip()` for Parallel Loops
If you need to iterate over two lists of the same length at the same time, use `zip()`.
- `for name, score in zip(names, scores):`

### List Comprehensions (A Sneak Peek)
Sometimes you don't need a full loop. If you just want to create a new list from an old one, use a **List Comprehension**.
- `doubled = [x * 2 for x in my_list]`
We'll cover these in detail in Module 11!

### Infinite While Loops
In an interview, if you write a `while True:` loop, make sure you have a clear **exit condition** with a `break` inside. Forgetting this is a common "Nervous Coder" mistake that leads to infinite loops.

### What Interviewers Are Testing
- Can you traverse collections using `for`?
- Do you know the difference between `break` and `continue`?
- Can you explain the `for-else` pattern? (This is a great trivia question!)

---

## Key Takeaway

Loops in Python are designed to be "Higher Level." By focusing on the items themselves rather than manual counters, you can write code that is much more expressive and less prone to "Off-by-one" errors.
