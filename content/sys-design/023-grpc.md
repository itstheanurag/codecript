---
title: gRPC (Google Remote Procedure Call)
order: 23
---

gRPC is a high-performance, open-source universal RPC framework developed by Google. It is built on top of **HTTP/2** and uses **Protocol Buffers (Protobuf)** as its interface definition language.

---

## Core Technologies

### 1. HTTP/2 (The Transport)
Unlike REST (usually HTTP/1.1), gRPC uses HTTP/2 which provides:
- **Binary Framing**: More efficient to parse than text.
- **Multiplexing**: Send multiple requests over a single TCP connection.
- **Header Compression**: Reduces overhead.
- **Server Push**: Server can push data to client without a request.

### 2. Protocol Buffers (The IDL)
Protobuf is a binary serialization format. You define your data structure in a `.proto` file, and gRPC generates code in your language of choice.

```protobuf
// Example .proto
message UserRequest {
  string user_id = 1;
}

message UserResponse {
  string name = 1;
  int32 age = 2;
}

service UserService {
  rpc GetUser(UserRequest) returns (UserResponse);
}
```

---

## gRPC Communication Patterns

1.  **Unary**: Simple Request-Response (like REST).
2.  **Server Streaming**: Client sends one request, server sends many responses (e.g., a live feed).
3.  **Client Streaming**: Client sends many requests, server sends one response (e.g., uploading a file in chunks).
4.  **Bidirectional Streaming**: Both sides send a stream of messages simultaneously (e.g., a real-time chat).

---

## gRPC vs. REST

| Feature | gRPC | REST |
| :------- | :--- | :--- |
| **Protocol** | HTTP/2 | HTTP/1.1 (usually) |
| **Payload** | Binary (Protobuf) | Text (JSON/XML) |
| **API Style** | Action-based (RPC) | Resource-based |
| **Streaming** | Native support | Very limited |
| **Browser** | Limited (needs gRPC-web) | Full support |

---

## Pros and Cons

### Pros
-   **Performance**: Much faster and smaller payloads than REST.
-   **Type Safety**: Proto files act as a strict contract between services.
-   **Streaming**: Native support for complex streaming scenarios.
-   **Polyglot**: Code generation for almost all major languages.

### Cons
-   **Limited Browser Support**: Direct browser calls are difficult.
-   **Complexity**: Requires learning Protobuf and managing `.proto` files.
-   **Implicit**: Harder to debug with standard tools (like `curl`) as data is binary.

---

## Key Takeaway

gRPC is the gold standard for **Internal Microservice Communication**. Its speed and strict type-safety make it ideal for back-end interactions, while REST remains the king of public-facing APIs and browser-to-server communication.
