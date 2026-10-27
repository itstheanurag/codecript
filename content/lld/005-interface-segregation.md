---
title: Interface Segregation Principle (ISP)
description: Why callers should depend only on the methods they use — role interfaces, fat-interface smells, TypeScript typing traps, and the cost of splitting too far.
order: 5
---

> "No client should be forced to depend on methods it does not use."

Interfaces exist to describe **what a caller needs**, not everything an implementation can do. When an interface grows into a catalogue of capabilities, every caller is coupled to capabilities it never calls — and every test double must fake them.

## The fat interface

```ts
interface Worker {
  work(): void;
  eat(): void;
  sleep(): void;
  reportHours(): void;
}
```

A `RobotWorker` must implement `eat()` and `sleep()`, usually by throwing or doing nothing:

```ts
class RobotWorker implements Worker {
  work(): void { /* assemble */ }
  eat(): void { throw new Error("robots do not eat"); }
  sleep(): void { throw new Error("robots do not sleep"); }
  reportHours(): void { /* unsupported for robots */ }
}
```

This is two problems at once:

- **ISP**: callers that only need `work()` still depend on four methods.
- **LSP**: `RobotWorker` cannot honour the contract of `Worker`.

The split follows the **roles**, not the nouns:

```ts
interface Workable { work(): void; }
interface Feedable { eat(): void; }
interface Restable { sleep(): void; }
interface TimeTracked { reportHours(): void; }

class HumanWorker implements Workable, Feedable, Restable, TimeTracked {
  work(): void {}
  eat(): void {}
  sleep(): void {}
  reportHours(): void {}
}

class RobotWorker implements Workable {
  work(): void {}
}
```

Now a scheduler that only needs `Workable` accepts both, and nothing is forced to implement phantom behaviour.

## Role interfaces vs header interfaces

| Style | Definition | When it works |
|---|---|---|
| **Header interface** | mirrors the public methods of one class | small, stable types; internal code |
| **Role interface** | describes what a specific client needs | multiple implementations, boundaries, tests |

A role interface is named after the **client's need**:

- `PriceSource` (for the checkout total), not `ProductService`.
- `OrderReader` / `OrderWriter`, not one `OrderRepository` with 30 methods.
- `NotificationSender` (for the notifier), not `NotificationPlatform`.

## A realistic case

```ts
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: T): Promise<void>;
  delete(id: string): Promise<void>;
  transaction<R>(fn: () => Promise<R>): Promise<R>;
  rawQuery(sql: string): Promise<unknown[]>;
  migrate(): Promise<void>;
  healthCheck(): Promise<boolean>;
}
```

The reporting service needs `findAll`; the admin tool needs `save`/`delete`; the health endpoint needs `healthCheck`. Every one of them now mocks eight methods in tests, and a change to `migrate()` recompiles callers that never migrate.

Split by consumer:

```ts
interface OrderReader {
  findById(id: OrderId): Promise<Order | null>;
  findAll(): Promise<Order[]>;
}

interface OrderWriter {
  save(order: Order): Promise<void>;
  delete(id: OrderId): Promise<void>;
}

interface OrderTransaction {
  transaction<R>(fn: () => Promise<R>): Promise<R>;
}

class PostgresOrders implements OrderReader, OrderWriter, OrderTransaction {
  // one implementation, several roles
}
```

The implementation still has all the code. The *callers* only see the role they need.

## ISP and testing

The most concrete benefit is test surface:

```ts
class Checkout {
  constructor(private readonly prices: OrderReader, private readonly payments: PaymentGateway) {}
}
```

To test `Checkout`, fake two methods, not twenty. A fake that implements a fat interface accumulates stubs that drift from production behaviour — the more stubs, the less the test proves.

A useful smell: **a test double with more than ~3 unimplemented methods**. The interface is probably too wide for that client.

## TypeScript specifics

- `implements` requires **all** members of the interface. A client cannot "partially implement" a fat interface — it must stub the rest.
- Structural typing means a class can satisfy an interface implicitly, but a class with extra methods is still assignable. The **dependency** in the constructor is what matters: `constructor(x: Workable)` accepts a `HumanWorker` without exposing `eat()`.
- Prefer `Pick<T, K>` only as a temporary bridge, not as the permanent dependency. `Pick<Repository, "findAll">` still couples the caller to the source interface's evolution.

```ts
// Acceptable for a quick fix, but the name "Repository" leaks into the API.
type ReadOnlyOrders = Pick<OrderRepository, "findById" | "findAll">;
```

## When segregation goes too far

- **One method per interface** produces `IUserFinder`, `IUserSaver`, `IUserHasher`… and a constructor with nine parameters.
- **Interfaces for things used once** add indirection without variation.
- **Duplicated method declarations** across five interfaces drift out of sync.

Balance rule: split when a client or implementation is forced to depend on something it cannot honour. Merge when several interfaces are always implemented and always injected together.

## A refactor in steps

1. **List the clients** of the interface (classes, functions, tests).
2. For each client, note the **methods it actually calls**.
3. Group methods that are always used together → candidate roles.
4. Create role interfaces; make the implementation implement all of them.
5. Narrow constructors and function parameters to the role.
6. Delete methods only if they have no callers (this is also dead-code discovery).

```ts
// Before
class ReportJob {
  constructor(private readonly repo: Repository<Order>) {}
  async run() {
    const orders = await this.repo.findAll();
    // ...
  }
}

// After
class ReportJob {
  constructor(private readonly orders: OrderReader) {}
  async run() {
    const list = await this.orders.findAll();
    // ...
  }
}
```

## Exercises

1. Find an interface with more than 8 methods. List every caller and the methods each uses. Propose 2–3 role interfaces.
2. Refactor a test double that stubs many unused methods into one implementing a narrow role.
3. Take a `Printer` interface with `print`, `scan`, `fax`. Split it, and make a `BasicPrinter` that only prints.
4. Explain why `Pick<Repository, "findAll">` is usually worse than a named `OrderReader` interface.

## Checklist

- [ ] Interfaces are named after the client's role, not the implementation.
- [ ] Every method on an interface is used by at least one caller or contract test.
- [ ] Test doubles implement only the methods the subject calls.
- [ ] Implementations do not contain `throw new Error("not supported")` for interface members.
- [ ] Splitting is driven by a real client or implementation that cannot honour the contract.
- [ ] Interfaces that are always used together are merged, not fragmented.

Next: [Dependency Inversion](/lld/006-dependency-inversion) — point your source code at abstractions your policy owns.
