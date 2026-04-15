---
title: Structs and Methods
order: 3
---

# Composition over Inheritance: Structs

Go is not a "Class-based" language. It does not support traditional class hierarchies. Instead, it uses **Structs** for data encapsulation and **Composition** (embedding) for code reuse. This leads to flatter, more modular architectures.

---

## 1. Defining and Initializing Structs

A `struct` is a typed collection of fields. It is used to group related data into a single unit.

```go
type Project struct {
    ID    int
    Title string
    Code  string
}

// Initialization using a Literal
p := Project{ID: 1, Title: "CodeCript"}
```

---

## 2. Methods: Function with a Receiver

In Go, you can attach functions to structs. These are called **Methods**. A method is simply a function with a special "Receiver" argument defined before the function name.

```go
func (p Project) Display() {
    fmt.Println(p.Title)
}
```

---

## 3. Pointer vs. Value Receivers

This is one of the most important concepts in Go.
- **Value Receiver `(p Project)`**: The method operates on a **Copy** of the struct. Any changes made inside the method will not affect the original.
- **Pointer Receiver `(p *Project)`**: The method operates on the actual memory address of the struct. Changes made inside the method **Will** persist.

```go
func (p *Project) UpdateTitle(newTitle string) {
    p.Title = newTitle // Modifies the original struct
}
```

**Rule of Thumb**: If your struct is large or if you need to modify its state, always use a Pointer Receiver.

---

## 4. Composition (Embedding)

Instead of "Inheriting" from a parent class, Go allows you to **Embed** one struct into another. The child struct automatically Gains access to the fields and methods of the embedded struct.

```go
type User struct {
    Username string
}

type Admin struct {
    User // Anonymous embedding
    Level int
}

a := Admin{}
a.Username = "root" // Directly accessible!
```

---

## Interview Pro-Tips: Struct Alignment and Padding
For senior roles, you might be asked about memory efficiency. Go structs are stored contiguously in memory. To save space, order your fields from largest to smallest (e.g., `int64` then `bool`). This minimizes **Padding** added by the compiler to align memory.

---

## Technical Summary
1. `Struct`: A composite data type.
2. `Receiver`: Defines which "Object" a method belongs to.
3. `Composition`: The standard way to reuse code without the fragility of deep inheritance trees.
