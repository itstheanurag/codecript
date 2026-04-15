---
title: Single Responsibility Principle
order: 2
---

# Single Responsibility Principle (SRP)

> "A class should have one, and only one, reason to change."

SRP means that a class should be responsible for only one part of the functionality provided by the software, and that responsibility should be entirely encapsulated by the class.

## The Problem: "The God Object"
When a class does too many things (logging, database access, business logic, email notifications), it becomes fragile. A change to the logging logic might break the business logic.

###  Before SRP (Violation)

```typescript
class User {
  constructor(public name: string, public email: string) {}

  // Business Logic
  saveToDatabase() {
    console.log(`Saving user ${this.name} to DB...`);
  }

  // Communication Logic (Violation)
  sendWelcomeEmail() {
    console.log(`Sending email to ${this.email}...`);
  }

  // Formatting Logic (Violation)
  formatNameForReport() {
    return this.name.toUpperCase();
  }
}
```

In the example above, if the email service provider changes or the database schema changes, the `User` class must be modified. It has too many reasons to change.

###  After SRP (Correct)

```typescript
class User {
  constructor(public name: string, public email: string) {}
}

class UserRepository {
  save(user: User) {
    console.log(`Saving ${user.name} to database...`);
  }
}

class EmailService {
  sendWelcome(user: User) {
    console.log(`Sending welcome email to ${user.email}...`);
  }
}

class UserReportFormatter {
  static format(user: User) {
    return user.name.toUpperCase();
  }
}
```

Now, each class has a clear, single responsibility. You can change how emails are sent without touching the `User` domain model or the `UserRepository`.

## Why it matters
1. **Testing**: Smaller classes are easier to unit test.
2. **Coupling**: Reduces the risk that a change in one area breaks unrelated features.
3. **Collaboration**: Different developers can work on `EmailService` and `UserRepository` simultaneously without merge conflicts in a single "God file."
