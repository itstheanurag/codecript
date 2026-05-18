---
title: Generics and Type Parameters
order: 20
---

Introduced in Go 1.18, **Generics** (Parametric Polymorphism) allows you to write functions and data structures that work with multiple types while maintaining full compile-time type safety. Before generics, Go developers had to use interfaces or code duplication to achieve similar results.

---

## 1. Type Parameters

Generics use square brackets `[]` to define a "Type Parameter." This parameter acts as a placeholder for a concrete type that will be specified when the function is called.

```go
func MapValues[K comparable, V any](m map[K]V) []V {
    var result []V
    for _, v := range m {
        result = append(result, v)
    }
    return result
}
```

- **`K comparable`**: A built-in constraint that allows any type that supports `==` and `!=` (required for map keys).
- **`V any`**: An alias for `interface{}`, allowing any type.

---

## 2. Type Constraints: Interface-based

You can define your own constraints using interfaces. This allows you to restrict a generic function to types that support specific operations.

```go
type Number interface {
    int | int64 | float64
}

func Sum[T Number](nums []T) T {
    var total T
    for _, n := range nums {
        total += n
    }
    return total
}
```

- **Union Types (`|`)**: Used inside an interface to specify a "Type Set."

---

## 3. Generic Data Structures

Generics are extremely useful for building reusable data structures like Stacks, Queues, or Linked Lists.

```go
type Stack[T any] struct {
    items []T
}

func (s *Stack[T]) Push(item T) {
    s.items = append(s.items, item)
}
```

---

## 4. Why use Generics?

1. **Safety**: Replaces the need for `interface{}` and type assertions, catching errors at compile-time.
2. **Performance**: Avoids the runtime overhead of reflection and interface boxing for simple primitive types.
3. **Readability**: Expresses intent more clearly than generic interface-based logic.

---

## Interview Pro-Tips: Why square brackets?
If an interviewer asks why Go uses `[]` instead of `<>` for generics:
- **The Answer**: The Go team chose square brackets because angle brackets `<>` are heavily used for comparison operators in Go, and parsing them as type parameters would have made the compiler significantly more complex and slower. Square brackets provided a clean, unambiguous syntax for the parser.

---

## Technical Summary
1. `Type Parameters`: Placed in `[]` after the function or type name.
2. `Constraints`: Define the set of allowed types.
3. `comparable`: A special constraint for types that can be used as map keys.
4. `any`: The universal constraint.
