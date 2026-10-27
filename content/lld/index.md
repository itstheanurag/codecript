---
title: Low-Level Design (LLD)
description: Learn low-level design properly — responsibilities, contracts, dependency direction, and the design patterns that solve real change instead of decorating code.
order: 0
---

High-level design asks *what components exist and how they talk*. **Low-level design asks how the code inside a component is organised so it survives change.**

That is a different skill from naming patterns. An LLD review does not start with "use a factory"; it starts with:

- Who owns this rule?
- What is allowed to depend on what?
- Which decisions must be replaceable, and which are stable?
- What happens when a dependency fails?
- How will this be tested without a database, network, or clock?

This section teaches principles and patterns as **answers to those questions**, not as vocabulary to sprinkle into interviews.

## What "in-depth" means here

Every chapter in this section covers:

| Layer | What you should be able to do afterwards |
|---|---|
| **Mental model** | Explain the problem the principle/pattern solves, and the forces pulling against it |
| **Mechanics** | Show the structure in code (TypeScript), including the boring parts |
| **Trade-offs** | Say when it makes the design *worse* and what it costs |
| **Failure modes** | Recognise the smells in review: hidden coupling, leaky contracts, god objects, over-abstraction |
| **Testing** | Prove the design works without mocking the universe |
| **Practice** | Apply it to a concrete scenario and defend the decision |

## The reading order

| # | Chapter | The question it answers |
|---|---|---|
| 1 | [Introduction to SOLID](/lld/001-solid-introduction) | What are these principles actually for? |
| 2 | [Single Responsibility](/lld/002-single-responsibility) | Who owns this code, and who can force it to change? |
| 3 | [Open/Closed](/lld/003-open-closed) | How do I add behaviour without editing stable code? |
| 4 | [Liskov Substitution](/lld/004-liskov-substitution) | When is a subtype *really* a subtype? |
| 5 | [Interface Segregation](/lld/005-interface-segregation) | Why do callers depend on methods they never use? |
| 6 | [Dependency Inversion](/lld/006-dependency-inversion) | Which direction should source dependencies point? |
| 7 | [Introduction to Patterns](/lld/007-design-patterns-intro) | How do patterns differ from principles, and when do they hurt? |
| 8 | [Factory](/lld/008-factory-pattern) | Where should construction logic live? |
| 9 | [Singleton](/lld/009-singleton-pattern) | When is global state acceptable, and when is it a bug factory? |
| 10 | [Strategy](/lld/010-strategy-pattern) | How do I replace conditional explosions with named policies? |
| 11 | [Observer](/lld/011-observer-pattern) | How do components notify each other without knowing each other? |

Read 1–6 before 7–11. The patterns are consequences of the principles; learning them first produces pattern-shaped code without the judgement to keep it small.

## The method: from requirements to code

Use the same five steps for any LLD exercise, interview, or real feature:

### 1. Clarify the behaviour, not the classes

Write 5–10 concrete scenarios. "A user can cancel an order before it ships; after shipping, cancellation becomes a return." Scenarios expose rules that class diagrams hide.

### 2. Identify entities and their invariants

For each entity, write the rule that must always hold:

- `Order.total = sum(line items)` — never negative.
- `Booking` cannot overlap another booking for the same room.
- `Payment` can be captured at most once.

Invariants become constructors, validation, and constraints — not comments.

### 3. Assign responsibilities (SRP)

For every behaviour, ask: *which actor would request a change to this?* If two different teams would change the same class for different reasons, it has two responsibilities.

### 4. Draw the dependency graph

Arrows point from the thing that changes more often to the thing that changes less often. Business rules should not point at frameworks, ORMs, or HTTP clients.

### 5. Design the seams

The seams are where you will test and where you expect variation:

- time → inject a clock
- randomness/IDs → inject a generator
- network/database → inject a port (interface)
- policy variants → strategy

If a seam is not testable without a container, the design is not finished.

## Worked example: "design a parking lot"

Most candidates jump to `ParkingLot`, `Floor`, `Spot`, `Vehicle`. That is the *noun* view. The depth comes from the rules:

1. A spot can hold one vehicle at a time.
2. A vehicle can occupy at most one spot.
3. Pricing depends on vehicle type and duration.
4. Payment must be idempotent.
5. Entry/exit devices may be offline; the system must not lose money.

Now the design has teeth:

```ts
interface SpotAllocator {
  allocate(vehicle: Vehicle): Spot | null;
  release(spot: Spot): void;
}

interface PricingPolicy {
  priceFor(ticket: Ticket, exitAt: Date): Money;
}

interface PaymentGateway {
  charge(paymentId: string, amount: Money): Promise<PaymentResult>;
}
```

`ParkingService` orchestrates those three ports. It does not know whether spots live in memory or Postgres, whether pricing is hourly or flat, or whether Stripe or a fake gateway is used.

That is the level this section targets: **rules as contracts, variation as seams, dependencies pointing inward.**

## What reviewers actually look for

- **Names describe domain rules**, not patterns (`BookingPolicy`, not `StrategyImpl`).
- **Constructors cannot build invalid objects.**
- **No business rule depends on a framework type.**
- **Every external effect is behind a port.**
- **Conditionals on "type" are either exhaustive and local, or replaced by polymorphic policy.**
- **The design can be tested with in-memory fakes, not mocks of everything.**
- **Patterns are justified by a change that is actually expected.**

> [!TIP]
> **ELI5: LLD is plumbing, not decoration**
> HLD decides where the bathroom goes. LLD decides pipe diameter, joints, and shut-off valves. Pattern names are brand labels on fittings — useful when the fitting is right, useless (and expensive) when it is not.

## How to practise

1. Take a feature you built recently and list its invariants and external effects.
2. Redraw the dependency graph. Mark every arrow that points at a framework.
3. Pick one smell from this section and refactor it with tests.
4. Explain the trade-off out loud: what did the refactor make easier, and what did it make harder?

> "Good low-level design is not code that shows off patterns. It is code where the next change has an obvious place to go."
