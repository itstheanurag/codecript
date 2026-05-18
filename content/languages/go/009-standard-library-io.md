---
title: Standard Library I/O
order: 9
---

Go's input and output (I/O) system is primarily built on two simple but powerful interfaces: `io.Reader` and `io.Writer`. These interfaces allow you to abstract away the source of data—whether it's a file, a network socket, or a simple memory buffer—and write generic, reusable code.

---

## 1. The Core Interfaces

### I. `io.Reader`
Any type that can be read from implements this interface.
```go
type Reader interface {
    Read(p []byte) (n int, err error)
}
```

### II. `io.Writer`
Any type that can be written to implements this interface.
```go
type Writer interface {
    Write(p []byte) (n int, err error)
}
```

---

## 2. Using `bufio` for Efficiency

Reading data one byte at a time is inefficient because each call to the operating system has overhead. The `bufio` package provides a buffered layer that reads large chunks of data into memory at once.

```go
file, _ := os.Open("large_file.txt")
reader := bufio.NewReader(file)

for {
    line, err := reader.ReadString('\n')
    if err == io.EOF {
        break
    }
}
```

---

## 3. Streaming Data with `io.Copy`

One of the most powerful utilities in Go is `io.Copy`. It allows you to "pipe" data from a `Reader` directly into a `Writer` without loading the entire content into memory. This is essential for building high-performance proxies or file uploaders.

```go
// Copies data from source into destination efficiently
io.Copy(destination, source)
```

---

## 4. Closing Resources

Always remember to close your readers/writers if they implement `io.Closer` (like files and network connections). As discussed in Module 6, the `defer` keyword is your best friend here.

---

## Interview Pro-Tips: Why use interfaces for I/O?
If an interviewer asks why Go's I/O is designed this way:
- **The Answer**: It enables **Composition**. Because everything is a `Reader` or a `Writer`, you can "Chain" them. You can take a File (Reader), wrap it in a Gzip (Reader), and then wrap that in a Decryptor (Reader). Your code just sees a `Reader`, making it incredibly flexible and decoupled from the actual source of data.

---

## Technical Summary
1. `Reader/Writer`: The "Atoms" of Go's I/O system.
2. `bufio`: Reduces system call overhead through memory buffering.
3. `Streaming`: Processing data as it arrives rather than loading it all at once.
