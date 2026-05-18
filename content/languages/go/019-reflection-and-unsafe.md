---
title: Reflection and Unsafe
order: 19
---

In Go, **Reflection** is the ability of a program to examine its own structure, notably types and values, at runtime. This powers many core features of the language (like the `encoding/json` package) but should be used sparingly in your own code due to its complexity and performance cost.

---

## 1. The Three Laws of Reflection

1. **Reflection goes from interface value to reflection object**: You use `reflect.TypeOf` and `reflect.ValueOf` to inspect a value.
2. **Reflection goes from reflection object to interface value**: You use the `.Interface()` method to get the original value back.
3. **To modify a reflection object, the value must be settable**: You must pass a **Pointer** to the value if you intend to change it.

---

## 2. Inspecting Types and Tags

Reflection is most commonly used to read struct tags or to build generic validation frameworks.

```go
u := User{ID: 1}
t := reflect.TypeOf(u)

field, _ := t.FieldByName("ID")
fmt.Println(field.Tag.Get("json")) // "id"
```

---

## 3. The `unsafe` Package

The `unsafe` package provides a way to bypass Go's type safety and work directly with memory pointers. It is essentially a bridge to C-like memory management.

- **Pointer Arithmetic**: Moving a fixed number of bytes in memory.
- **Conversion**: Turning a `[]byte` into a `string` without copying (a common performance optimization for Zero-Copy I/O).

**WARNING**: Code using `unsafe` is not guaranteed to be compatible across different Go versions or hardware architectures and can crash your program with memory corruption if not handled perfectly.

---

## 4. DeepEqual

Because Go's standard equality operator (`==`) cannot compare slices or maps, the `reflect.DeepEqual` function is often used to check if two complex data structures are identical.

```go
if reflect.DeepEqual(slice1, slice2) {
    // They match!
}
```

**Note**: `DeepEqual` is significantly slower than manual comparison because it must recursively traverse every field of the objects.

---

## Interview Pro-Tips: Why is Reflection slow?
If an interviewer asks about the downsides of reflection:
- **The Answer**: Reflection requires the Go runtime to perform several hidden memory allocations and to look up type metadata in internal tables. It also prevents the compiler from performing many optimizations (like inlining). In performance-critical paths, always prefer **Interfaces** or **Code Generation** over Reflection.

---

## Technical Summary
1. `reflect.Type`: The metadata describing a type.
2. `reflect.Value`: The actual data container.
3. `unsafe.Pointer`: A pointer that ignores the Go type system.
4. `Settability`: The requirement that a variable must be addressable to be modified via reflection.
