---
title: Interface Segregation Principle (ISP)
order: 5
---

The "I" in SOLID. It states: **"No code should be forced to depend on methods it does not use."**

Instead of creating one massive, "fat" interface that tries to cover every possible behavior, you should break it down into smaller, highly specific interfaces.

> [!TIP]
> **ELI5: The Restaurant Menu**
> Imagine going to a restaurant and the waiter hands you a 50-page menu. It contains the Breakfast Menu, the Lunch Menu, the Dinner Menu, the Kids Menu, the Vegan Menu, and the Wine List all bound together. You just want a coffee. It's overwhelming and unnecessary.
> 
> **Interface Segregation** is handing the customer just the Breakfast Menu if it's 9:00 AM. Give the client exactly what they need, and nothing more.

## The Problem (Violating ISP)

Imagine we are building a system for printers.

```typescript
// BAD: A fat interface that forces implementers to write useless code.
interface IMachine {
    print(document: string): void;
    scan(document: string): void;
    fax(document: string): void;
}

// A modern, expensive printer can do everything.
class MultiFunctionPrinter implements IMachine {
    print(doc: string) { console.log(`Printing ${doc}`); }
    scan(doc: string) { console.log(`Scanning ${doc}`); }
    fax(doc: string) { console.log(`Faxing ${doc}`); }
}

// But what about a cheap, old printer?
class OldFashionedPrinter implements IMachine {
    print(doc: string) { console.log(`Printing ${doc}`); }
    
    // We are FORCED to implement these methods because of the interface,
    // even though the machine cannot actually do them.
    scan(doc: string) { throw new Error("I cannot scan!"); }
    fax(doc: string) { throw new Error("I cannot fax!"); }
}
```

## The Solution (Refactoring to ISP)

We break the massive `IMachine` interface into smaller, specialized interfaces.

```typescript
// GOOD: Small, focused interfaces.
interface IPrinter {
    print(document: string): void;
}

interface IScanner {
    scan(document: string): void;
}

interface IFax {
    fax(document: string): void;
}

// The modern printer can simply implement multiple interfaces.
class MultiFunctionPrinter implements IPrinter, IScanner, IFax {
    print(doc: string) { console.log(`Printing ${doc}`); }
    scan(doc: string) { console.log(`Scanning ${doc}`); }
    fax(doc: string) { console.log(`Faxing ${doc}`); }
}

// The old printer now only implements what it actually supports!
class OldFashionedPrinter implements IPrinter {
    print(doc: string) { console.log(`Printing ${doc}`); }
}
```

## Why does this matter?
When you have a massive interface, any change to that interface forces all implementing classes to recompile and potentially update their code, even if they don't care about the method that changed. Segregation minimizes the ripple effect of code changes.
