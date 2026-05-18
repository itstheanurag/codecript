---
title: Liskov Substitution Principle (LSP)
order: 4
---

# Liskov Substitution Principle (LSP)

The "L" in SOLID. Coined by Barbara Liskov. It states: **"Objects in a program should be replaceable with instances of their subtypes without altering the correctness of that program."**

In simpler terms: A subclass must strictly honor the contract established by its parent class. If you override a method, you cannot change its fundamental behavior or throw unexpected errors.

> [!TIP]
> **ELI5: The Coffee Maker**
> Imagine you buy a standard `CoffeeMaker`. It has a button `brew()`. When you press it, hot coffee comes out.
> 
> You later upgrade to an `EspressoMachine` (a child class of `CoffeeMaker`). It also has a `brew()` button. If you press it and it dispenses hot espresso, LSP is maintained. But if you press `brew()` and the machine explodes, or it requires you to manually grind beans *before* pressing the button (changing the rules), LSP is violated. You cannot substitute the old machine for the new one seamlessly.

## The Problem (Violating LSP)

The classic "Square-Rectangle" problem.

```typescript
// BAD: A Square is mathematically a Rectangle, but behaviorally it is not!

class Rectangle {
    protected width: number = 0;
    protected height: number = 0;

    setWidth(w: number) { this.width = w; }
    setHeight(h: number) { this.height = h; }
    getArea() { return this.width * this.height; }
}

class Square extends Rectangle {
    // Overriding behavior to enforce Square rules
    setWidth(w: number) {
        this.width = w;
        this.height = w; // Changing height implicitly!
    }

    setHeight(h: number) {
        this.width = h; // Changing width implicitly!
        this.height = h;
    }
}

// THE CATASTROPHE:
function printArea(rect: Rectangle) {
    rect.setWidth(4);
    rect.setHeight(5);
    // If it's a true rectangle, area should be 20.
    console.log(`Area is: ${rect.getArea()}`); 
}

const myRect = new Rectangle();
printArea(myRect); // Prints 20 (Correct)

const mySquare = new Square();
// The function expects a Rectangle, so we pass a Square (Subtype).
printArea(mySquare); // Prints 25! LSP is violated. The program behavior broke.
```

## The Solution (Refactoring to LSP)

If a subtype changes the underlying expectations of the parent, it shouldn't be a subtype. We break the inheritance and use a more generic interface.

```typescript
// GOOD: Use a common interface that doesn't dictate specific mutable behavior.

interface Shape {
    getArea(): number;
}

class Rectangle implements Shape {
    constructor(private width: number, private height: number) {}
    getArea() { return this.width * this.height; }
}

class Square implements Shape {
    constructor(private sideLength: number) {}
    getArea() { return this.sideLength * this.sideLength; }
}

function printArea(shape: Shape) {
    console.log(`Area is: ${shape.getArea()}`);
}

printArea(new Rectangle(4, 5)); // 20
printArea(new Square(5));       // 25
```

## Why does this matter?
Violating LSP leads to code littered with `if (obj instanceof Square)` checks to handle exceptions, entirely defeating the purpose of polymorphism and clean inheritance.
