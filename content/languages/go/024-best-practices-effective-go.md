---
title: Best Practices: Effective Go
order: 24
---

In Go, there is often only "One Way" to do things. Following the core conventions and idioms of the language—often referred to as being **Gopher-like**—ensures that your code is readable by any Go developer and performs optimally.

---

## 1. Naming Conventions

Go uses visibility-based naming:
- **Exported**: Starts with a Capital letter (`UserService`). Visible to other packages.
- **Unexported**: Starts with a lowercase letter (`userStore`). Local to the current package.

**Best Practice**: Keep names short. Use `i` for loop counters, `r` for readers, and `w` for writers. Use `MixedCaps` (CamelCase) rather than underscores.

---

## 2. Error Handling Best Practices

- **Errors are not strings**: Use the `errors` package or custom types to make your errors inspectable with `errors.As` or `errors.Is`.
- **Don't ignore errors**: Never use `_` to discard an error unless you are absolutely sure it can be safely ignored.
- **Fail Fast**: Return errors as early as possible to keep your code indentation flat.

---

## 3. Package Organization

- **Flat structure**: For small projects, keep all files in the root package.
- **`cmd/`**: Store your application entry points (the `main` functions) in sub-directories of a `cmd/` folder.
- **`pkg/` or `internal/`**: Store your library code. Code in `internal/` cannot be imported by other projects, ensuring your private APIs stay private.

---

## 4. Documentation: The Go Way

Documentation is built into the toolchain. Use standard comments directly above your functions and types.

```go
// CalculateSum returns the addition of two integers.
// Exported functions should always be documented.
func CalculateSum(a, b int) int {
    return a + b
}
```

- **`go doc`**: View documentation for any package or function in your terminal.

---

## 5. Composition over Inheritance

As we’ve discussed, always prefer embedding and interfaces over trying to build deep hierarchy trees. This is the most crucial principle for building maintainable Go systems.

---

## Interview Pro-Tips: What is "Effective Go"?
If an interviewer asks about your coding style:
- **The Answer**: Mention the official "Effective Go" document and the "Go proverbs." Highlight that you prioritize **Simplicity**, **Explicitness**, and **Readability** over "clever" or "magical" code. Mention that you use `gofmt` or `goimports` to ensure your formatting is always standard.

---

## Technical Summary
1. `Simplicity`: Code should be boring and easy to read.
2. `Explicitness`: No hidden magic or global state.
3. `Tooling`: Let `gofmt` handle the formatting debates.
4. `Interface`: Build small, focused interfaces that do one thing well.
