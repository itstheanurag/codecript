---
title: TypeScript Generics Without the Headache
excerpt: Generics don't have to be scary. A step-by-step guide with real-world examples.
date: 2026-02-05
readTime: 7 min read
tags: [TypeScript, Frontend]
---

Generics are one of the most powerful features in TypeScript, and they don't have to be intimidating. Think of them as function parameters, but for types.

## The Problem

Without generics, you'd write separate functions for each type:

```typescript
function getFirstString(arr: string[]): string {
  return arr[0];
}

function getFirstNumber(arr: number[]): number {
  return arr[0];
}
```

That's a lot of duplication.

## The Generic Solution

```typescript
function getFirst<T>(arr: T[]): T {
  return arr[0];
}

const name = getFirst(["Alice", "Bob"]); // string
const age = getFirst([25, 30]); // number
```

`T` is a placeholder. TypeScript infers it from usage.

## Constraining Generics

Sometimes you need to restrict what `T` can be:

```typescript
function getLength<T extends { length: number }>(item: T): number {
  return item.length;
}

getLength("hello"); // ✅ string has length
getLength([1, 2, 3]); // ✅ array has length
getLength(42); // ❌ number has no length
```

## Generic Interfaces

```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

type UserResponse = ApiResponse<{ name: string; email: string }>;
type PostResponse = ApiResponse<{ title: string; body: string }>;
```

## Real-World: Generic React Hook

```typescript
function useFetch<T>(url: string): { data: T | null; loading: boolean } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(url)
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading };
}

// Usage
const { data: users } = useFetch<User[]>("/api/users");
```

## Key Insight

Generics make your code reusable without sacrificing type safety. Start with simple cases and gradually add constraints as your confidence grows.
