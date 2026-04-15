---
title: Liskov Substitution Principle
order: 4
---

# Liskov Substitution Principle (LSP)

> "Objects in a program should be replaceable with instances of their subtypes without altering the correctness of that program."

In simpler terms: A child class should be able to do everything the parent class can do, without breaking the application logic or throwing unexpected exceptions.

## The Problem: Breaking the Contract
LSP is often violated when a subclass throws an "Not Implemented" exception or changes the behavior of a method in a way that the caller doesn't expect.

###  Before LSP (Violation)

The classic "Square vs Rectangle" problem.

```typescript
class Rectangle {
  constructor(protected width: number, protected height: number) {}

  setWidth(w: number) { this.width = w; }
  setHeight(h: number) { this.height = h; }
  getArea() { return this.width * this.height; }
}

class Square extends Rectangle {
  // Violation: To keep it a square, we force both dimensions same.
  setWidth(w: number) {
    this.width = w;
    this.height = w;
  }
  setHeight(h: number) {
    this.width = h;
    this.height = h;
  }
}

function processRectangle(rect: Rectangle) {
  rect.setWidth(10);
  rect.setHeight(5);
  // Expectation: 10 * 5 = 50
  // Reality for Square: 5 * 5 = 25
  console.log(rect.getArea()); 
}
```

In this case, `Square` is not a proper substitution for `Rectangle` because it breaks the fundamental assumption that setting width doesn't affect height.

###  After LSP (Correct)

Instead of using inheritance where it doesn't fit, use a more general abstraction.

```typescript
interface Shape {
  getArea(): number;
}

class Rectangle implements Shape {
  constructor(private width: number, private height: number) {}
  getArea() { return this.width * this.height; }
}

class Square implements Shape {
  constructor(private side: number) {}
  getArea() { return this.side * this.side; }
}

function printArea(shape: Shape) {
  console.log(shape.getArea()); // Works correctly for both!
}
```

## Why it matters
1. **Predictability**: You can use a subclass without knowing its exact implementation.
2. **Robustness**: Prevents subtle bugs that occur when polymorphic behavior unexpectedely changes logic.
3. **Hierarchy Integrity**: Forces you to think if "Inheritance" is really the right choice (Is-A relationship).
 flagship
 flagship
