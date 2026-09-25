---
title: Web Server from Scratch
order: 6
---

To truly master backend engineering, you must understand the abstractions you use every day. In Go, the `net/http` package is incredibly powerful, but to appreciate *why*, we are going to build a web server without it. 

We will start with raw TCP sockets, parse HTTP text manually, and eventually see how the standard library saves us from boilerplate.

---

## 1. The Core Mental Model

You can think of a backend web server as a continuous pipeline that does exactly four things:
1. **Receive/Collect**: It accepts an incoming stream of raw bytes over a TCP socket.
2. **Read/Parse**: It interprets those bytes according to a protocol (like HTTP) to figure out what the client wants.
3. **Transform**: It executes your business logic (routing, fetching data) to generate a result.
4. **Write**: It formats that result back into a raw byte stream and sends it back.

Without Go's `net/http` package, we must use the `net` package to open a raw socket and handle this entire pipeline manually.

```go
package main

import (
	"fmt"
	"net"
	"os"
)

func main() {
	// 1. Listen on a TCP port
	listener, err := net.Listen("tcp", ":8080")
	if err != nil {
		fmt.Println("Error listening:", err.Error())
		os.Exit(1)
	}
	defer listener.Close()
	fmt.Println("Listening on localhost:8080")

	// 2. Accept incoming connections in an infinite loop
	for {
		conn, err := listener.Accept()
		if err != nil {
			fmt.Println("Error accepting connection:", err.Error())
			continue
		}

		// 3. Handle each connection in a new goroutine
		go handleConnection(conn)
	}
}
```

---

## 2. Manual HTTP Parsing

HTTP is a text-based protocol. When your browser requests a page, it sends a block of text that looks like this:

```http
GET /hello HTTP/1.1
Host: localhost:8080
User-Agent: curl/7.81.0
Accept: */*
```

To understand this request, we have to read the bytes from the TCP connection and manually parse the text. Let's implement `handleConnection`.

```go
import (
	"bufio"
	"strconv"
	"strings"
)

// A custom struct to hold our parsed request
type Request struct {
	Method  string
	Path    string
	Headers map[string]string
	Body    string
}

func handleConnection(conn net.Conn) {
	defer conn.Close()
	reader := bufio.NewReader(conn)

	// 1. Read the Request Line (e.g., "GET /hello HTTP/1.1")
	requestLine, err := reader.ReadString('\n')
	if err != nil {
		return
	}

	parts := strings.Split(strings.TrimSpace(requestLine), " ")
	if len(parts) < 3 {
		return
	}

	req := Request{
		Method:  parts[0],
		Path:    parts[1],
		Headers: make(map[string]string),
	}

	// 2. Read the Headers
	for {
		line, err := reader.ReadString('\n')
		if err != nil || line == "\r\n" {
			break // Empty line means end of headers
		}
		
		headerParts := strings.SplitN(line, ":", 2)
		if len(headerParts) == 2 {
			key := strings.TrimSpace(headerParts[0])
			val := strings.TrimSpace(headerParts[1])
			req.Headers[key] = val
		}
	}

	// 3. Parse the Request Body
	if contentLengthStr, ok := req.Headers["Content-Length"]; ok {
		contentLength, _ := strconv.Atoi(contentLengthStr)
		if contentLength > 0 {
			bodyBuf := make([]byte, contentLength)
			// Read exactly 'contentLength' bytes
			reader.Read(bodyBuf)
			req.Body = string(bodyBuf)
		}
	}

	// At this point, `req` contains our completely parsed HTTP request!
	routeRequest(conn, req)
}
```

*(Note: We successfully parsed the body by reading bytes up to the `Content-Length` header! We are still ignoring edge cases like chunked encoding for simplicity).*

---

## 3. The Custom Router

Now that we have parsed the request text into a `Request` struct, we need to route it. A router is simply a mechanism that matches a URL path to a specific function.

Let's build a basic router using a Go map.

```go
// Our custom Handler function signature
type HandlerFunc func(conn net.Conn, req Request)

var router = map[string]HandlerFunc{
	"/ping":  handlePing,
	"/hello": handleHello,
}

func routeRequest(conn net.Conn, req Request) {
	handler, exists := router[req.Path]
	if exists {
		handler(conn, req)
	} else {
		handleNotFound(conn, req)
	}
}
```

---

## 4. The Manual Response

To send a response back to the client, we can't just send "Hello World". We must format our response exactly according to the HTTP protocol spec: Status Line, Headers, a blank line, and then the Body.

```go
func handlePing(conn net.Conn, req Request) {
	// A classic ping-pong route
	response := "HTTP/1.1 200 OK\r\n" +
		"Content-Type: text/plain\r\n" +
		"Content-Length: 4\r\n" +
		"\r\n" +
		"pong"
	
	conn.Write([]byte(response))
}

func handleHello(conn net.Conn, req Request) {
	body := `{"message": "Hello from raw TCP!"}`

	// Manually construct the exact HTTP string
	response := "HTTP/1.1 200 OK\r\n" +
		"Content-Type: application/json\r\n" +
		fmt.Sprintf("Content-Length: %d\r\n", len(body)) +
		"Connection: close\r\n" +
		"\r\n" + // The blank line separating headers from body
		body

	// Write the raw bytes back to the socket
	conn.Write([]byte(response))
}

func handleNotFound(conn net.Conn, req Request) {
	response := "HTTP/1.1 404 Not Found\r\n\r\n404 - Page Not Found"
	conn.Write([]byte(response))
}
```

### Reviewing our work
If you run this code and navigate to `http://localhost:8080/hello`, you will see your JSON response! You've just built a web server from absolute scratch. You handled the socket, parsed the strings, routed the traffic, and formatted the HTTP protocol output.

---

## 5. The Standard Library Refactor

Parsing text strings manually is dangerous. What if the client sends a malicious header? What if the connection drops halfway through? Handling every edge case of HTTP/1.1 (and HTTP/2) is extremely complex.

This is exactly what Go's `net/http` package solves. It handles the TCP sockets, parses the text safely, manages connection pools, and exposes a clean interface.

Let's rewrite our entire custom server using `net/http`.

```go
package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

func main() {
	// The http.ServeMux replaces our custom map[string]HandlerFunc
	mux := http.NewServeMux()

	mux.HandleFunc("/hello", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK) // Automatically writes the HTTP/1.1 200 OK
		
		// The ResponseWriter handles writing the bytes to the socket
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Hello from net/http!",
		})
	})

	fmt.Println("Listening on localhost:8080")
	// ListenAndServe abstracts away net.Listen and the accept loop
	http.ListenAndServe(":8080", mux)
}
```

### Conclusion

By building the server over raw TCP first, the magic of `net/http` disappears. 
- `http.ListenAndServe` is just a wrapper around `net.Listen` and an infinite `Accept()` loop.
- `*http.Request` is just a struct populated by a robust version of our `bufio.ReadString` text parser.
- `http.ResponseWriter` is just a safe wrapper around `conn.Write()`, ensuring headers are formatted correctly before the body is sent.

You now understand the actual mechanics of web servers beneath the framework layer.

---

## 6. Middlewares (The Onion Model)

Now that we are using `net/http`, how do we handle things like logging or authentication for *every* route? We use Middleware.

A middleware is simply a function that takes an `http.Handler` and returns a new `http.Handler`. It intercepts the request before passing it to the next layer (like layers of an onion).

```go
func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Do something BEFORE the main handler runs
		fmt.Printf("Received %s request for %s\n", r.Method, r.URL.Path)
		
		// Pass control to the next handler
		next.ServeHTTP(w, r)
		
		// Do something AFTER the main handler runs
		fmt.Println("Finished processing request")
	})
}
```

To use it, you just wrap your multiplexer before starting the server:
```go
	// Wrap the mux with our logging middleware
	loggedMux := loggingMiddleware(mux)
	
	http.ListenAndServe(":8080", loggedMux)
```

With this pattern, you can build modular, reusable authentication, logging, and panic-recovery layers without modifying your core business logic!
