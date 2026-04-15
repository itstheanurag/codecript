---
title: Concurrency and Parallelism
order: 15
---

# Threads and Processes: Handling Multiple Tasks

Concurrency and Parallelism are often used interchangeably, but they represent different technical approaches to handling multiple tasks.
- **Concurrency**: Dealing with many things at once (e.g., managing multiple network requests).
- **Parallelism**: Doing many things at once (e.g., performing calculation on multiple CPU cores).

---

## 1. The Global Interpreter Lock (GIL)

In CPython (the standard implementation), the **GIL** is a mutex that allows only one thread to execute Python bytecode at a time. This simplifies memory management but creates a bottleneck for CPU-intensive tasks.

- **Impact**: Multi-threading in Python does not provide true parallelism for CPU-bound tasks. However, it is excellent for **I/O-bound** tasks (like waiting for a database or a website).

---

## 2. Multi-threading (`threading`)

Use the `threading` module when your program spends most of its time waiting for external resources (Network, Disk, Input).

```python
import threading

def fetch_data():
    # Simulating a network request
    print("Fetching data...")

thread = threading.Thread(target=fetch_data)
thread.start()
thread.join() # Wait for the thread to finish
```

---

## 3. Multi-processing (`multiprocessing`)

Use the `multiprocessing` module for CPU-intensive tasks (like data analysis or image processing). This module avoids the GIL by giving each process its own Python interpreter and its own memory space.

- **Advantages**: True parallelism on multi-core machines.
- **Costs**: Higher memory overhead and the complexity of Inter-Process Communication (IPC).

---

## 4. Concurrent Futures

The `concurrent.futures` module provides a high-level interface for asynchronously executing callables.

```python
from concurrent.futures import ThreadPoolExecutor

with ThreadPoolExecutor(max_workers=5) as executor:
    results = list(executor.map(fetch_url, url_list))
```

---

## Interview Pro-Tips: Thread Safety
When using multi-threading, you must be careful about **Race Conditions**—when multiple threads try to modify the same variable at the same time.
- **The Solution**: Use **Locks** or **Semaphores**.
```python
lock = threading.Lock()
with lock:
    # This block is "Locked" to one thread at a time
    shared_counter += 1
```

---

## Technical Summary
1. `I/O-Bound`: Use `threading` or `asyncio`.
2. `CPU-Bound`: Use `multiprocessing`.
3. `The GIL`: Exists to prevent race conditions in Python's internal memory management (Reference Counting).
