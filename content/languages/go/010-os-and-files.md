---
title: OS and File Operations
order: 10
---

# The Operating System: Files and Environment

Go's `os` package provides a platform-independent interface to operating system functionality. Whether you are managing files, reading environment variables, or handling signals, the `os` package is your primary gateway to the host machine.

---

## 1. File I/O: Creation and Reading

Working with files in Go is straightforward but requires explicit error handling to ensure data integrity.

```go
// Creating a file
f, err := os.Create("config.json")
if err != nil {
    log.Fatal(err)
}
defer f.Close()

// Writing data
f.WriteString("{\"active\": true}")
```

- **Permission Bits**: Use `os.OpenFile` for more granular control over flags (`O_APPEND`, `O_WRONLY`) and Unix-style permissions (e.g., `0644`).

---

## 2. Environment Variables

Environment variables are the standard way to pass configuration to production applications (following the "12-Factor App" methodology).

```go
// Setting and Getting
os.Setenv("APP_PORT", "8080")
port := os.Getenv("APP_PORT")

// Handling missing values
val, exists := os.LookupEnv("DB_URL")
if !exists {
    log.Fatal("DB_URL must be defined")
}
```

---

## 3. Command-Line Arguments

Parameters passed to your script are accessible via `os.Args`.
- `os.Args[0]`: The name/path of the executing program.
- `os.Args[1:]`: The actual arguments.

**Pro-Tip**: For complex command-line interfaces, use the standard library `flag` package or popular third-party tools like `Cobra`.

---

## 4. Handling Operating System Signals

In production, your application must handle "Graceful Shutdowns" when the OS sends termination signals (SIGINT, SIGTERM).

```go
sigChan := make(chan os.Signal, 1)
signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)

<-sigChan // Blocks until a signal is received
fmt.Println("Shutting down gracefully...")
```

---

## Interview Pro-Tips: Why defer Close()?
If an interviewer asks why they see `defer f.Close()` everywhere:
- **The Answer**: To prevent **Resource Leaks**. Operating systems have a limit on the number of open files a process can have (File Descriptors). If you open thousands of files and "forget" to close them, your application will eventually crash. Using `defer` ensures the file is closed even if the function reaches a return or panics.

---

## Technical Summary
1. `os.File`: Represents an open file descriptor.
2. `Stat`: Use `os.Stat()` to check if a file exists or to read its metadata (size, modified time).
3. `Graceful Shutdown`: Using signals to ensure no data is lost when the app stops.
