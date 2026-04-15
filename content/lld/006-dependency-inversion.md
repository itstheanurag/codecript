---
title: Dependency Inversion Principle
order: 6
---

# Dependency Inversion Principle (DIP)

> "1. High-level modules should not depend on low-level modules. Both should depend on abstractions."
> "2. Abstractions should not depend on details. Details should depend on abstractions."

DIP is about decoupling. It ensures that the core business logic (high-level) doesn't break when a detail (low-level), like a specific database or API, changes.

## The Problem: Hardcoded Dependencies
When a high-level class creates its own low-level dependencies (e.g., using `new Database()`), you cannot easily swap the database or mock it for testing.

###  Before DIP (Violation)

```typescript
class SentryLogger {
  log(message: string) {
    console.log(`Sending to Sentry: ${message}`);
  }
}

class App {
  private logger: SentryLogger;

  constructor() {
    // Violation: App is tightly coupled to SentryLogger.
    this.logger = new SentryLogger();
  }

  run() {
    this.logger.log("Application started");
  }
}
```

If you want to switch to `WinstonLogger` or `ConsoleLogger`, you have to modify the `App` class.

###  After DIP (Correct)

Both modules depend on an abstraction (Interface).

```typescript
interface Logger {
  log(message: string): void;
}

class SentryLogger implements Logger {
  log(message: string) { /* ... */ }
}

class ConsoleLogger implements Logger {
  log(message: string) { /* ... */ }
}

class App {
  // App depends on the Logger interface, not a concrete class.
  constructor(private logger: Logger) {}

  run() {
    this.logger.log("Application started");
  }
}

// Dependency Injection
const app = new App(new ConsoleLogger());
app.run();
```

Now, the `App` class is completely oblivious to the specific logging implementation. You can inject any logger that implements the interface.

## Why it matters
1. **Unit Testing**: You can easily inject "Mock" or "Stub" objects for testing.
2. **Flexibility**: You can swap out database engines, email providers, or third-party APIs without changing business logic.
3. **Pluggable Architecture**: High-level modules remain untouched when low-level details evolve.
