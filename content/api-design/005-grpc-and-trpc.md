---
title: Modern RPC (gRPC & tRPC)
order: 5
---

**RPC (Remote Procedure Call)** is a design paradigm where a client executes a function on a remote server as if it were a local function call in the client's own codebase.

While REST forces you to think about *Resources* (Nouns), RPC allows you to think purely in *Actions* (Verbs).

## 1. gRPC (Google RPC)

Created by Google, gRPC is the undisputed king of backend-to-backend microservice communication. It is designed for raw performance and strict contracts.

### The Protobuf Contract
Unlike REST which relies on loose JSON and OpenAPI specs, gRPC relies on **Protocol Buffers (Protobuf)**. You define your API contract in a `.proto` file.

```protobuf
syntax = "proto3";

service PaymentService {
  rpc ProcessPayment (PaymentRequest) returns (PaymentResponse) {}
}

message PaymentRequest {
  string credit_card = 1;
  int32 amount_cents = 2;
}

message PaymentResponse {
  bool success = 1;
}
```

### Why gRPC is incredibly fast
1.  **Binary Payload:** Protobuf compiles down to a dense binary format. It is significantly smaller and much faster to serialize/deserialize than plain-text JSON.
2.  **HTTP/2:** gRPC mandates HTTP/2 under the hood. This allows for multiplexing (sending multiple requests over a single TCP connection simultaneously) and native bi-directional streaming.

### Code Generation
Just like SOAP, you run a compiler (`protoc`) against your `.proto` file, and it automatically generates the client and server stubs in Go, Python, Java, or Node.js. 

*   **The Catch:** gRPC is fantastic for microservices, but terrible for web browsers. Browsers cannot natively speak HTTP/2 framing required for gRPC, forcing you to use clunky proxies (like `gRPC-Web`) if you want your React app to talk directly to a gRPC server.

## 2. tRPC (TypeScript RPC)

While gRPC solves backend communication, **tRPC** was created to solve Full-Stack web communication. 

If you are building a modern web application where both your backend (Node.js) and frontend (React) are written in TypeScript, and they live in the same Git Monorepo, tRPC is a game-changer.

### End-to-End Type Safety (Without Code Gen)
With REST or gRPC, you have to run a compiler or a Swagger generator to share types between backend and frontend.

With tRPC, you simply define your router on the backend using TypeScript and Zod (for validation). Because it's a monorepo, your React frontend simply *imports the type definition* directly from the backend folder.

**Backend (Node):**
```typescript
export const appRouter = router({
  getUser: publicProcedure
    .input(z.string())
    .query(async (opts) => {
      return await db.user.findById(opts.input);
    }),
});
// Export ONLY the type, not the actual backend code!
export type AppRouter = typeof appRouter;
```

**Frontend (React):**
```tsx
// This hook is instantly fully typed, with autocomplete for 'getUser'!
const userQuery = trpc.getUser.useQuery("123");

if (userQuery.data) {
  console.log(userQuery.data.name); // 100% type safe
}
```

If a backend engineer renames `name` to `firstName` in the database, the frontend React code will instantly show a red squiggly error in the IDE before you even run the code. No building, no code generation, just pure TypeScript inference.
