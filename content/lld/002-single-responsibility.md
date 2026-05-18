---
title: Single Responsibility Principle (SRP)
order: 2
---

The first letter in SOLID. It states: **"A class should have one, and only one, reason to change."**

In simpler terms, every module or class should have responsibility over a single part of the functionality provided by the software, and that responsibility should be entirely encapsulated by the class.

> [!TIP]
> **ELI5: The Swiss Army Knife vs. The Chef's Knife**
> *   **Violating SRP (The Swiss Army Knife):** It has a blade, a corkscrew, scissors, and a screwdriver. It tries to do everything. If the scissors break, you have to send the entire tool to the shop, meaning you also lose your blade and screwdriver while it's being fixed.
> *   **Following SRP (The Chef's Knife):** It does exactly one thing: cut food perfectly. If it gets dull, you sharpen the knife. Your corkscrew is a completely separate tool in the drawer.

## The Problem (Violating SRP)

Imagine a `User` class in a backend application.

```typescript
// BAD: This class does way too much.
class User {
    constructor(private name: string, private email: string) {}

    // Responsibility 1: Data Management
    getUserData() {
        return { name: this.name, email: this.email };
    }

    // Responsibility 2: Database Operations
    saveToDatabase() {
        const db = new DatabaseConnection();
        db.query(`INSERT INTO users (name, email) VALUES ('${this.name}', '${this.email}')`);
    }

    // Responsibility 3: Formatting/Presentation
    generateReport() {
        return `<html><body><h1>User: ${this.name}</h1></body></html>`;
    }
}
```

If the database schema changes, you have to modify the `User` class. If the marketing team wants the report to be PDF instead of HTML, you have to modify the `User` class. This violates SRP because the class has *multiple reasons to change*.

## The Solution (Refactoring to SRP)

We split these distinct responsibilities into their own dedicated classes.

```typescript
// GOOD: Each class does exactly one thing.

// Responsibility 1: Core Domain Entity (Just holds data)
class User {
    constructor(public name: string, public email: string) {}
}

// Responsibility 2: Persistence (Database)
class UserRepository {
    save(user: User) {
        const db = new DatabaseConnection();
        // Uses an ORM or safe query builder
        db.save('users', user); 
    }
}

// Responsibility 3: Presentation/Reporting
class UserReportGenerator {
    generateHtml(user: User) {
        return `<html><body><h1>User: ${user.name}</h1></body></html>`;
    }
}
```

## Why does this matter?
*   **Testing:** It's incredibly easy to write a unit test for `UserReportGenerator` without needing to mock a database connection.
*   **Merge Conflicts:** If Alice is updating the database schema and Bob is updating the HTML report, they are working in two entirely different files, avoiding Git merge conflicts.
