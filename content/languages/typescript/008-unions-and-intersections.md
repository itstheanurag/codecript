---
title: Unions and Intersections
order: 8
---

In JavaScript, a value can be anything. In TypeScript, we can use **Union** and **Intersection** types to precisely define how multiple types should be combined.

## 1. Union Types (`|`)

A Union type describes a value that can be **one of several types**. Think of it as an "OR" relationship.

```typescript
function printId(id: number | string) {
  console.log(`Your ID is: ${id}`);
}

printId(101); // OK
printId("202"); // OK
printId(true); // ERROR: Argument of type 'boolean' is not assignable...
```

### Narrowing Unions

When working with a union, you often need to "narrow" it down to a specific type before you can use type-specific methods.

```typescript
function getLength(id: string | number) {
  if (typeof id === "string") {
    return id.length; // OK: TypeScript knows id is a string here
  }
  return id.toString().length; // OK: TypeScript knows id is a number here
}
```

---

## 2. Intersection Types (`&`)

An Intersection type combines multiple types into one. The resulting type has **all the properties** of the combined types. Think of it as an "AND" relationship.

```typescript
interface ErrorHandling {
  success: boolean;
  error?: { message: string };
}

interface ArtistsData {
  artists: { name: string }[];
}

// ArtistResponse has EVERY property from both interfaces
type ArtistResponse = ErrorHandling & ArtistsData;

const response: ArtistResponse = {
  success: true,
  artists: [{ name: "The Beatles" }],
};
```

---

## 3. Union vs. Intersection

For a JavaScript developer, these are the mental models:

- **Union (`|`)**: "It's either a `User` or an `Admin`."
- **Intersection (`&`)**: "It's a `User` **who is also** an `Admin`."

## 4. Literal Unions

Unions are extremely common for defining restricted sets of string or number values.

```typescript
type ButtonSize = "small" | "medium" | "large";

function createButton(size: ButtonSize) {
  // ...
}

createButton("large"); // OK
createButton("extra-large"); // ERROR
```

By combining these, you can create highly flexible yet strict type definitions that catch "impossible" states in your code before they ever happen.
