---
title: Memory Management Internals
order: 13
---

# Garbage Collection and Memory Lifecycle

Memory management in JavaScript is automated, but it is not magic. Developers who understand how the engine allocates and reclaims memory are better equipped to build high-performance, leak-free applications.

---

## 1. The Memory Lifecycle

Every time you create a variable, function, or object, the JS engine follows a three-step cycle:

1. **Allocation**: The engine reserves memory for the new data.
2. **Usage**: The program reads or writes to that memory.
3. **Release**: Once the memory is no longer needed, it is "released" (freed) for future use.

---

## 2. Stack vs. Heap Allocation

### I. The Stack (Fast, Static)
Used for primitive values (`number`, `string`, `boolean`, `null`, `undefined`) and **Execution Contexts**. It follows a strict LIFO order and has a fixed size (managed by the OS).

### II. The Heap (Flexible, Dynamic)
Used for objects and arrays. Since their size is not known at compile time, they are allocated in the Heap—a large, unstructured pool of memory. Variables on the Stack hold **References** (pointers) to locations in the Heap.

---

## 3. Garbage Collection: Mark-and-Sweep

The JavaScript engine uses an automatic **Garbage Collector (GC)** to determine which memory to release. The most common algorithm used today is **Mark-and-Sweep**.

1. **Roots**: The GC starts with a set of "roots" (global variables and active function contexts).
2. **Marking**: It traverses the entire memory graph, marking every object it can "reach" from those roots.
3. **Sweeping**: Any object that is NOT marked as reachable is considered garbage and its memory is reclaimed.

---

## 4. Common Causes of Memory Leaks

Even with a GC, code can "leak" reachability, preventing memory from being reclaimed:

- **Dangling Timers/Intervals**: Forgetting to call `clearInterval()` even after the callback is no longer needed.
- **Detached DOM Nodes**: Keeping a JS reference to a DOM element that has been removed from the visible page.
- **Accidental Globals**: Variables declared without `var`, `let`, or `const` become properties of the `window` object and live forever.
- **Unclosed Closures**: As discussed in Module 12, storing closures that capture large objects.

---

## Interview Pro-Tips: Tracking Performance
If an interviewer asks how you've handled memory issues:
1. **Chrome DevTools (Memory Tab)**: Explain how you use **Heap Snapshots** to see which objects are taking up the most space.
2. **Allocation Timelines**: Discuss how you identify "GC Thrashing"—when the garbage collector runs too frequently because of rapid, temporary object creation.

---

## Technical Summary
1. `Automated`: GC handles most cleanup, but doesn't remove "reachable" junk.
2. `Immutability`: Creating new objects frequently increases heap pressure.
3. `Best Practice`: Nullify large object references when they are no longer needed, and always clean up event listeners and intervals.
