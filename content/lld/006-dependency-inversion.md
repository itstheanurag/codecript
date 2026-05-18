---
title: Dependency Inversion Principle (DIP)
order: 6
---

The "D" in SOLID. It states:
1. **High-level modules should not depend on low-level modules. Both should depend on abstractions.**
2. **Abstractions should not depend on details. Details should depend on abstractions.**

This is the principle that enables decoupled architectures and makes unit testing possible.

> [!TIP]
> **ELI5: The Lamp and the Wall Socket**
> Imagine you buy a lamp. 
> *   **Violating DIP (Hardwired):** The lamp's power cord is soldered directly into the electrical wiring inside the wall (The high-level lamp depends on the low-level house wiring). If you want to move the lamp to another room, you have to tear down the wall.
> *   **Following DIP (The Socket):** The wall has a standard 3-prong socket (The Abstraction/Interface). The lamp has a standard 3-prong plug. The lamp doesn't care if the house is powered by a coal plant, solar panels, or a generator. It just expects electricity from the socket. You can unplug the lamp and move it anywhere instantly.

## The Problem (Violating DIP)

Imagine a high-level `OrderService` that saves orders to a MySQL database.

```typescript
// LOW-LEVEL MODULE (The concrete detail)
class MySQLDatabase {
    insert(data: string) {
        console.log(`Saving ${data} to MySQL Database...`);
    }
}

// HIGH-LEVEL MODULE (The core business logic)
class OrderService {
    private db: MySQLDatabase;

    constructor() {
        // BAD: The high-level module is creating and hard-depending on the low-level detail.
        this.db = new MySQLDatabase(); 
    }

    createOrder(item: string) {
        this.db.insert(`Order for ${item}`);
    }
}
```

If we want to switch from MySQL to MongoDB, we have to rewrite the `OrderService`. Furthermore, we cannot easily mock the database to write a Unit Test for the `OrderService`.

## The Solution (Dependency Injection)

We introduce an Interface (The Socket) that both the high-level and low-level modules adhere to. Then, we "inject" the dependency.

```typescript
// 1. THE ABSTRACTION (The Interface / The Socket)
interface IDatabase {
    save(data: string): void;
}

// 2. LOW-LEVEL MODULES (Implementing the abstraction)
class MySQLDatabase implements IDatabase {
    save(data: string) {
        console.log(`Saving ${data} to MySQL Database...`);
    }
}

class MongoDatabase implements IDatabase {
    save(data: string) {
        console.log(`Saving ${data} to MongoDB Database...`);
    }
}

// 3. HIGH-LEVEL MODULE (Depends ONLY on the abstraction)
class OrderService {
    private db: IDatabase;

    // GOOD: We inject the dependency via the constructor. 
    // The OrderService has no idea what specific database it's using!
    constructor(database: IDatabase) {
        this.db = database;
    }

    createOrder(item: string) {
        this.db.save(`Order for ${item}`);
    }
}

// --- USAGE ---
const sqlService = new OrderService(new MySQLDatabase());
sqlService.createOrder("Laptop");

// Instantly swap to Mongo without changing the OrderService!
const mongoService = new OrderService(new MongoDatabase());
mongoService.createOrder("Phone");
```

## Why does this matter?
DIP is the foundation of Clean Architecture. It isolates your core business logic from frameworks, databases, and external APIs. If an external service shuts down or you want to migrate databases, you only have to write a new low-level implementation class; your core application logic remains completely untouched.
