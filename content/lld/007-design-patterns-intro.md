---
title: Introduction to Design Patterns
description: Learn what design patterns actually are, the three GoF families, and how to pick one without over-engineering.
order: 7
---

A design pattern is a **named solution to a recurring design problem**. It is not a library. It is not "advanced OOP." It is a conversation shortcut: "the retry policy should be a Strategy" instead of a 20-minute whiteboard of if-else.

The "Gang of Four" (Gamma, Helm, Johnson, Vlissides) catalogued these in 1994. The problems still exist. The class diagrams in the book are optional; the *intent* is not.

> [!TIP]
> **ELI5: Cooking techniques**
> "Sauté" is a pattern: hot pan, little oil, keep it moving. It is not a recipe for Tuesday. You still choose ingredients. Patterns are techniques. Using every technique in one omelette is how you get a mess.

## Why bother naming them

- **Shared language.** "Observer" is faster than "a list of callbacks we notify when state changes."
- **Known trade-offs.** Singleton is easy *and* hostile to tests. People already wrote that blog post.
- **A menu, not a mandate.** You pick from it when the pain matches.

If you cannot state the **problem** in one sentence, you do not need a pattern yet. You need a function.

## The three families

### Creational — how objects come to exist

The rest of the code should not `new` a concrete class in 40 places if the *kind* of object will change.

| Pattern | Problem |
| :--- | :--- |
| **[Factory](./008-factory-pattern)** | Caller should not know which subclass to construct. |
| **[Singleton](./009-singleton-pattern)** | Exactly one instance (use sparingly; often a mistake). |
| Builder | Many optional construction steps; telescoping constructors hurt. |
| Prototype | Clone a configured object instead of reconstructing it. |

### Structural — how objects are composed

| Pattern | Problem |
| :--- | :--- |
| Adapter | Foreign API does not match the one you designed for. |
| Decorator | Add behavior (logging, retries) without exploding subclasses. |
| Facade | Hide a gnarly subsystem behind one simple type. |
| Proxy | Stand-in for access control, lazy load, or a remote call. |

### Behavioral — how objects divide work and talk

| Pattern | Problem |
| :--- | :--- |
| **[Strategy](./010-strategy-pattern)** | Swap an algorithm (sort, pricing, auth) at runtime. |
| **[Observer](./011-observer-pattern)** | Many listeners should react to one subject's events. |
| Command | Queue/undo an action as an object. |
| State | Behavior changes when an object's state changes (order: draft → paid). |

This track deep-dives the four you will actually be asked and will actually use in web backends: Factory, Singleton, Strategy, Observer.

## A smell, then a pattern

**Before (not a pattern, just pain):**

```typescript
function ship(order: Order, carrier: string) {
  if (carrier === "ups") { /* 40 lines */ }
  else if (carrier === "fedex") { /* 40 lines */ }
  else if (carrier === "dhl") { /* 40 lines */ }
}
```

Every new carrier edits this function (Open/Closed violation). Tests for UPS break when you touch DHL.

**After (Strategy):** each carrier is a `ShippingCarrier` with `quote` / `book`. `ship` takes the interface. Adding "USPS" is a new file, not a new `else if`.

That is the whole game: **spot the variation, give it a type, inject it.**

## Over-engineering (the actual risk)

> [!WARNING]
> Patterns are compression for *experienced* readers. For a junior reading your code, `AbstractFactory` of one implementation is noise. Prefer the simplest thing that keeps tomorrow's change local.

Red flags:

- Pattern name in the class (`UserFactoryFactory`) but no second implementation.
- Introducing Observer for two function calls that will never have a third listener.
- Singleton "because I might need it globally" — that is a hidden global variable.
- Implementing all 23 GoF patterns in a CRUD app.

Green lights:

- You already have two implementations (or a test fake counts).
- A `switch` on type has grown twice.
- You need to say the design out loud in a review and a pattern name is accurate.

Next: Factory, then Singleton (including why *not* to), then Strategy and Observer with code.
