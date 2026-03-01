---
title: Interfaces and Types
order: 2
---

Interfaces and Type Aliases are the two main ways to define the "shape" of data in TypeScript.

## Interfaces

Used strictly for describing objects.

```typescript
interface User {
  id: string;
  username: string;
  email: string;
  isActive: boolean;
  avatarUrl?: string; // Optional property
}

const user: User = {
  id: "1",
  username: "gaurav",
  email: "gaurav@example.com",
  isActive: true,
};
```

## Type Aliases

More flexible — can represent primitives, unions, tuples, and intersections as well as objects.

```typescript
type ID = string | number;
type Status = "pending" | "approved" | "rejected";

type Response = {
  data: any;
  status: number;
};

const myId: ID = 123;
```

## Which should I use?

- Use **interfaces** when you want to use declaration merging (adding new fields to an existing interface).
- Use **types** for unions, tuples, and simple aliases.
- In most modern apps, you can use either consistently, but interfaces are generally preferred for public API definitions.
