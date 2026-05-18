---
title: Data Types and Slices
order: 2
---

Go is a **Statically Typed** language, which means the type of every variable must be known at compile time. While its basic types (strings, ints, booleans) are standard, its approach to collections—specifically the distinction between **Arrays** and **Slices**—is a core part of its performance model.

---

## 1. Arrays: Fixed-Size Storage

In Go, an array is a numbered sequence of elements of a specific length.
- **Fixed Size**: Once defined, the size of an array cannot change.
- **Value Type**: Assigning one array to another or passing it to a function creates a **Complete Copy** of the data. This is often inefficient for large datasets.

```go
var scores [5]int // An array of exactly 5 integers
```

---

## 2. Slices: Dynamic Views

A **Slice** is a much more common and powerful structure. Slices are "Wrappers" or "Descriptors" for arrays. 
- **Reference-like Behavior**: Slices don't store data; they point to an underlying array. Passing a slice to a function is very fast because it only passes the descriptor (The "Slice Header").

```go
// A slice header consists of:
type SliceHeader struct {
    Data uintptr // Pointer to the underlying array
    Len  int     // Current number of elements
    Cap  int     // Maximum number of elements before reallocating
}
```

---

## 3. Creating and Growing Slices

- **Literal**: `colors := []string{"red", "blue"}`
- **Make**: `nums := make([]int, 0, 10)` // Length 0, Capacity 10
- **Append**: Use the `append()` function to grow a slice. If the capacity is reached, Go automatically allocates a new, larger underlying array and copies the data.

```go
nums := []int{1, 2}
nums = append(nums, 3) 
```

---

## 4. Sub-slicing (Slicing the Slice)

You can create a new slice from an existing one using the `[start:stop]` syntax. Both slices will point to the **Same** memory location in the underlying array. Changing one will affect the other.

```go
original := []int{0, 1, 2, 3, 4}
view := original[1:3] // [1, 2]
view[0] = 99
fmt.Println(original[1]) // 99!
```

---

## Interview Pro-Tips: Len vs Cap
If an interviewer asks what happens when you append to a full slice:
- **The Answer**: Go allocates a new array (usually double the size), copies the existing elements, and updates the slice's pointer and capacity. This is why you should always re-assign the result: `s = append(s, x)`.

---

## Technical Summary
1. `Static Types`: Enforced at compile time.
2. `Slice Header`: A small struct that points to a large array.
3. `Zero-Value`: The zero value for a slice is `nil`, which has `len` and `cap` of 0.
