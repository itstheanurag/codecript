---
title: Memory Allocation and GC
order: 22
---

Understanding Go's memory management is the key to writing truly high-performance applications. Go handles memory automatically through a **Garbage Collector (GC)**, but a developer's choices in data structure and function design significantly impact how hard the GC has to work.

---

## 1. Stack vs. Heap Allocation

- **The Stack**: Extremely fast memory. It is used for variables whose lifetime is known at compile time (local variables that don't "escape" their function).
- **The Heap**: Slower, dynamic memory. Used for variables that must survive after a function returns or for very large structures.

---

## 2. Escape Analysis

The Go compiler performs **Escape Analysis** to decide whether a variable should stay on the stack or move to the heap. 

```go
func getID() *int {
    id := 42
    return &id // 'id' escapes to the heap because its pointer is returned
}
```

- **Objective**: As a performance-oriented developer, your goal is to minimize heap escapes. Use `go build -gcflags="-m"` to see exactly why the compiler moved a variable to the heap.

---

## 3. The Garbage Collector: Mark and Sweep

Go uses a **Concurrent Mark and Sweep** garbage collector. It is designed for **Low Latency** (minimal "Stop-the-World" time), making it ideal for web servers where consistent response times are vital.

1. **Marking**: The GC traverses the heap and marks all objects that are still "Reachable" by the program.
2. **Sweeping**: It reclaims the memory of all objects that were NOT marked.

---

## 4. Tuning the GC with GOGC

You can control how aggressively the GC runs using the `GOGC` environment variable. 
- **`GOGC=100` (Default)**: The GC runs when the heap size doubles since the last collection.
- **`GOGC=off`**: Disables the GC entirely (not recommended for production).

---

## 5. Memory Safety

Go is a memory-safe language. It prevents:
- **Dangling Pointers**: You cannot access memory that has been freed.
- **Double Free**: The GC handles freeing, so you can't free memory twice.
- **Buffer Overflows**: Array and slice access is bounds-checked at runtime.

---

## Interview Pro-Tips: What is a "Stop The World" (STW) event?
If an interviewer asks about performance jitters:
- **The Answer**: STW is a phase where the GC must pause all Goroutines to perform certain management tasks. In modern Go, these pauses are virtually imperceptible (often under 1 millisecond), but in languages with older GCs, they can cause long "freezes" that break real-time performance.

---

## Technical Summary
1. `Stack`: Fast, automatic, no GC overhead.
2. `Heap`: Flexible but expensive.
3. `Escape`: Variables "escape" if they are shared outside their local scope.
4. `Pointers`: Using pointers usually triggers heap allocation.
 flagship
 flagship
