---
title: Interfaces and Duck Typing
order: 4
---

In Go, an **Interface** is a set of method signatures. Unlike languages like Java or C#, where a class must explicitly declare that it "implements" an interface, Go uses **Implicit Implementation**. 

If a type defines all the methods required by an interface, it satisfies that interface automatically.

---

## 1. Defining and Using Interfaces

An interface is a contract. It doesn't care *what* a Type is; it only cares *what it can do*.

```go
type Writer interface {
    Write([]byte) (int, error)
}

func SaveDocument(w Writer, data []byte) {
    w.Write(data)
}
```

- **Polymorphism**: The `SaveDocument` function can accept a `File`, a `NetworkConn`, or a `Buffer`—as long as they have a `Write` method.

---

## 2. Interface Internals: `iface` and `eface`

Under the hood, an interface is a **Two-Word Data Structure** (8 bytes each on a 64-bit system).

1. **The Type Word**: Points to information about the underlying concrete type (its name, methods, etc.).
2. **The Data Word**: A pointer to the actual data (the struct or value).

- **`iface`**: Used for interfaces with methods.
- **`eface`**: Used for the empty interface (`interface{}` or `any`), which has no methods and can hold any type.

---

## 3. The Empty Interface (`any`)

Introduced in Go 1.18, `any` is an alias for `interface{}`. Use this when you need a function to accept absolutely any type. However, because you lose type safety, you must use **Type Assertions** or **Type Switches** to get the actual value back.

```go
func HandleAnything(val any) {
    switch v := val.(type) {
    case string:
        fmt.Println("String:", v)
    case int:
        fmt.Println("Int:", v)
    }
}
```

---

## 4. Why Implicit Implementation is Powerful?

1. **Decoupling**: You can define an interface in the "Consuming" package rather than the "Providing" package. You don't need permission from the original library author to mock their types.
2. **Mocking**: Testing becomes significantly easier. You can swap a real database for a "Mock" struct that satisfies the same interface.

---

## Interview Pro-Tips: Why is `interface{}` not the same as `nil`?
A common "Gotcha": An interface variable is only `nil` if **both** its type and its data are `nil`.
If you store a `nil` pointer to a struct inside an interface, the interface itself is **NOT** `nil` because its "Type" word is populated. This can lead to unexpected behavior in `if val != nil` checks.

---

## Technical Summary
1. `Implicit`: Satisfied by behavior, not declaration.
2. `Any`: The universal container (use sparingly).
3. `Contract`: Interfaces allow you to write generic code that works across multiple unrelated types.
