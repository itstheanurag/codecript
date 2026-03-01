---
title: Syntax Basics
order: 1
---

Go (Golang) is a statically typed, compiled language known for its simplicity and concurrency features.

## Variable Declarations

```go
var name string = "CodeCript"
age := 25 // Short declaration (infer type)
```

## Control Structures

### For Loop (The only loop)

```go
for i := 0; i < 10; i++ {
    fmt.Println(i)
}

// Equivalent to while
for n < 10 {
    n++
}
```

### If/Else

```go
if age > 18 {
    fmt.Println("Adult")
} else {
    fmt.Println("Minor")
}
```

## Functions

```go
func Add(a int, b int) int {
    return a + b
}

// Multiple return values
func Divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, errors.New("cannot divide by zero")
    }
    return a / b, nil
}
```
