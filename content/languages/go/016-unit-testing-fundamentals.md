---
title: Unit Testing Fundamentals
order: 16
---

# Testing: The Standard Library Approach

In Go, testing is a first-class citizen. You don't need external libraries or assertion frameworks to write robust tests. The standard library `testing` package, combined with the `go test` command, provides everything needed to build production-grade test suites.

---

## 1. Writing Your First Test

All tests in Go follow a strict set of rules:
- **File Name**: Must end in `_test.go` (e.g., `math_test.go`).
- **Function Name**: Must start with `Test` followed by a capitalized name.
- **Signature**: Must accept a single parameter of type `*testing.T`.

```go
func TestAdd(t *testing.T) {
    result := Add(2, 3)
    expected := 5
    
    if result != expected {
        t.Errorf("Expected %d, but got %d", expected, result)
    }
}
```

---

## 2. Table-Driven Tests (The Go Way)

Table-driven testing is the idiomatic way to write multiple test cases for a single function without duplicating logic.

```go
func TestAbs(t *testing.T) {
    cases := []struct {
        name     string
        input    int
        expected int
    }{
        {"positive", 10, 10},
        {"negative", -5, 5},
        {"zero", 0, 0},
    }

    for _, tc := range cases {
        t.Run(tc.name, func(t *testing.T) {
            got := Abs(tc.input)
            if got != tc.expected {
                t.Errorf("Abs(%d) = %d; want %d", tc.input, got, tc.expected)
            }
        })
    }
}
```

- **`t.Run`**: Creates sub-tests, allowing you to run specific cases from the command line and providing clearer failure reports.

---

## 3. The `go test` Command

- `go test ./...`: Runs all tests in the current directory and all sub-packages.
- `go test -v`: Runs tests in "Verbose" mode, showing every test name and its output.
- `go test -cover`: Calculates the "Code Coverage" (what percentage of your code is reached by tests).

---

## 4. Initialization and Cleanup

- **`TestMain`**: A special function that runs once before any tests in a package, useful for setting up a database or loading configuration.
- **`t.Cleanup`**: A built-in helper to register cleanup tasks (like closing a database connection) that run after the test finishes.

---

## Interview Pro-Tips: Why no Assert() function?
If an interviewer asks why Go doesn't have `assert.Equal(expected, result)`:
- **The Answer**: Go’s creators believed that "Assertion" libraries lead to lazy, uninformative error messages. In Go, you are encouraged to write clear, descriptive error messages that explain **why** the test failed, which makes debugging significantly faster in large systems.

---

## Technical Summary
1. `testing.T`: The object used to report failures and control test state.
2. `Errorf`: Standard way to report a non-fatal failure.
3. `Fatalf`: Stops the current test immediately if a critical invariant is violated.
4. `Structural`: Tests are kept in the same package as the code they test.
