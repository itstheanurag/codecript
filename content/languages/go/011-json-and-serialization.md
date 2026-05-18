---
title: JSON and Serialization
order: 11
---

In modern backend development, communicating with other services usually happens via JSON (JavaScript Object Notation). Go's standard library provides a robust `encoding/json` package that uses reflection to transform Go structs into JSON strings and vice-versa.

---

## 1. Struct Tags: The Mapping Layer

Since Go uses `PascalCase` for exported fields but JSON typically uses `camelCase` or `snake_case`, we use **Struct Tags** to define the mapping between them.

```go
type User struct {
    ID    int    `json:"id"`
    Name  string `json:"full_name"`
    Email string `json:"email,omitempty"` // Hidden if empty
}
```

- **`omitempty`**: This powerful tag tells the encoder to exclude the field from the final JSON if it has its "Zero Value" (e.g., empty string or 0).

---

## 2. Encoding (Marshalling)

Marshalling is the process of converting a Go value into its JSON representation.

```go
u := User{ID: 1, Name: "Alice"}
data, err := json.Marshal(u)
fmt.Println(string(data)) // {"id":1,"full_name":"Alice"}
```

---

## 3. Decoding (Unmarshalling)

Unmarshalling is the process of parsing a JSON string into a Go struct.

```go
var u User
err := json.Unmarshal(data, &u) // Note the pointer
```

- **Pointer Requirement**: You must pass a pointer to the target variable so that the `Unmarshal` function can modify its value.

---

## 4. Custom Marshalling and Unmarshalling

Sometimes you need to transform data during serialization (e.g., formatting a Date or hiding sensitive fields). You can do this by implementing the `Marshaler` or `Unmarshaler` interfaces on your type.

```go
func (n *Name) UnmarshalJSON(data []byte) error {
    // Custom logic here
}
```

---

## 5. Streaming JSON with Decoders

If you are reading from a network connection or a large file, don't use `Unmarshal` (which loads everything into memory). Use `json.Decoder` instead.

```go
decoder := json.NewDecoder(response.Body)
err := decoder.Decode(&user)
```

---

## Interview Pro-Tips: How does json.Marshal work?
If an interviewer asks about performance:
- **The Answer**: `json.Marshal` uses **Reflection** at runtime to inspect the struct and its tags. Because reflection is computationally expensive, serialization can be a bottleneck in high-traffic services. 
- **The Solution**: For performance-critical code, developers sometimes use code-generation tools like `easyjson` or alternate formats like **Protobuf**.

---

## Technical Summary
1. `Struct Tags`: Metadata used to control serialization behavior.
2. `Marshal/Unmarshal`: The core functions for JSON conversion.
3. `Stream`: Use Decoders/Encoders when working with `io.Reader/Writer`.
