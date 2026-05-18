---
title: Asynchronous Programming
order: 16
---

Asynchronous programming is a concurrency model that allows a single thread to handle thousands of concurrent tasks by "awaiting" I/O operations instead of blocking. In Python, this is achieved via the `asyncio` library and the `async` / `await` syntax.

---

## 1. The Event Loop Mechanism

Unlike multi-threading, which relies on the operating system to switch between threads, `asyncio` uses a single-threaded **Event Loop**.
- When an asynchronous task hit an I/O operation (like an HTTP request), it "yields" control back to the event loop.
- The event loop then moves on to execute other pending tasks.
- Once the I/O operation is complete, the original task is resumed.

---

## 2. Basic Syntax: `async` and `await`

To make a function asynchronous, you define it with `async def`. To wait for its result, you use the `await` keyword.

```python
import asyncio

async def fetch_api():
    print("Start fetching...")
    await asyncio.sleep(1) # Simulated network delay
    print("Done!")
    return {"data": 123}

# Entry point
async def main():
    result = await fetch_api()

asyncio.run(main())
```

---

## 3. Running Tasks in Parallel

The real power of `asyncio` comes from running multiple coroutines simultaneously using `asyncio.gather`.

```python
async def main():
    # Runs all three tasks concurrently
    results = await asyncio.gather(
        fetch_api(),
        fetch_api(),
        fetch_api()
    )
```

---

## 4. Asyncio vs. Multithreading

- **Shared State**: Because everything runs in a single thread, you don't have to worry about race conditions or managing locks for shared variables.
- **Overhead**: Asyncio has significantly less memory overhead than creating thousands of OS threads.
- **Blocking**: The biggest danger in `asyncio` is **Blocking the Event Loop**. If you run a CPU-intensive `for` loop or a synchronous `time.sleep()` inside an `async` function, the entire event loop stops.

---

## Interview Pro-Tips: The `await` keyword
If an interviewer asks what `await` actually does:
- It **pauses** the execution of the current coroutine.
- It **releases** control back to the event loop.
- It **waits** for the target task to complete and return its result before resuming.

---

## Technical Summary
1. `Coroutine`: A function that can be paused and resumed (`async def`).
2. `Event Loop`: The central manager of all asynchronous tasks.
3. `Best Use Case`: High-concurrency web servers (e.g., FastAPI), scrapers, and chat applications.
