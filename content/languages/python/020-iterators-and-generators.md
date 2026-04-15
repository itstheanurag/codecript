---
title: Efficient Iteration
order: 20
---

# Iterators and Generators: Lazy Evaluation

In Python, efficient memory usage is often achieved through **Lazy Evaluation**—the practice of calculating values only when they are needed. This is implemented via the **Iteration Protocol** and **Generators**.

---

## 1. The Iteration Protocol

An object is "Iterable" if it implements the `__iter__` method, which returns an **Iterator**. An object is an "Iterator" if it implements `__next__`.

```python
nums = [1, 2, 3]
it = iter(nums) # Calls nums.__iter__()

print(next(it)) # 1
print(next(it)) # 2
print(next(it)) # 3
# print(next(it)) # Raises StopIteration
```

---

## 2. Generators: State-Pausable Functions

A **Generator** is a special type of function that returns an iterator. It uses the `yield` keyword instead of `return`.

- When a generator function is called, it doesn't execute the code. It returns a **Generator Object**.
- When `next()` is called on the object, the function executes until it reaches a `yield`.
- The function then **Suspends** its state (variables, instruction pointer) and returns the value.
- The next time `next()` is called, it resumes exactly where it left off.

```python
def count_to_three():
    yield 1
    yield 2
    yield 3

generator = count_to_three()
```

---

## 3. Why use Generators? (Memory Efficiency)

Imagine you need to process a file with 10 million rows.
- **List approach**: Loading all 10 million rows into a list will likely crash your program by exhausting your RAM.
- **Generator approach**: You only ever have **one row** in memory at a time. The generator yields the current row and waits for you to ask for the next one.

---

## 4. Generator Expressions

Similar to list comprehensions, generator expressions allow you to create generators in a single line using parentheses `()`.

```python
# List comprehension (Immediate, memory-heavy)
squares_list = [x**2 for x in range(10**6)]

# Generator expression (Lazy, memory-efficient)
squares_gen = (x**2 for x in range(10**6))
```

---

## Interview Pro-Tips: `yield from`
Introduced in Python 3.3, `yield from` allows a generator to delegate part of its operations to another generator. This is essential for flattening nested structures or building complex "pipelines" of data.

---

## Technical Summary
1. `Lazy Evaluation`: Processing data one item at a time.
2. `State Persistence`: Generators remember their local variables between yields.
3. `Infinite Sequences`: Generators can represent infinite data (like a stream of sensor readings) because they never try to store the whole sequence.
