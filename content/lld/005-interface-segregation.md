---
title: Interface Segregation Principle
order: 5
---

# Interface Segregation Principle (ISP)

> "Clients should not be forced to depend on interfaces that they do not use."

ISP suggests that it's better to have many small, specific interfaces rather than one large, general-purpose interface.

## The Problem: The "Fat" Interface
When you have a large interface, implementing classes are often forced to write "empty" methods or throw errors for functionality they don't actually support.

###  Before ISP (Violation)

```typescript
interface SmartDevice {
  print(): void;
  fax(): void;
  scan(): void;
}

class OldPrinter implements SmartDevice {
  print() {
    console.log("Printing...");
  }

  // Violation: Old printer can't fax or scan!
  fax() {
    throw new Error("Fax not supported");
  }

  scan() {
    throw new Error("Scan not supported");
  }
}
```

###  After ISP (Correct)

Split the interface into smaller, logically grouped pieces.

```typescript
interface Printer {
  print(): void;
}

interface FaxMachine {
  fax(): void;
}

interface Scanner {
  scan(): void;
}

// Now the OldPrinter ONLY depends on what it actually does.
class OldPrinter implements Printer {
  print() {
    console.log("Printing...");
  }
}

// A modern machine can implement multiple interfaces.
class AllInOneMachine implements Printer, FaxMachine, Scanner {
  print() { /* ... */ }
  fax() { /* ... */ }
  scan() { /* ... */ }
}
```

## Why it matters
1. **Decoupling**: Implementations aren't bloated with unused methods.
2. **Maintenance**: Changing the `Scanner` interface won't require you to update or re-test the `OldPrinter` class.
3. **Clarity**: Interfaces clearly define the capabilities of a class.
