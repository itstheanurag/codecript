---
title: Introduction to Design Patterns
description: What patterns actually are, how the GoF catalogue is organised, when to introduce one, and how to avoid the pattern-name cargo cult.
order: 7
---

A design pattern is **a named solution to a recurring design problem in a context**, together with its consequences. The name is the least important part — it is a handle for a conversation, not a trophy.

The Gang of Four (GoF) catalogue is organised by purpose:

| Family | Purpose | Examples |
|---|---|---|
| **Creational** | control how objects are created | Factory Method, Abstract Factory, Builder, Singleton, Prototype |
| **Structural** | compose objects into larger structures | Adapter, Decorator, Facade, Proxy, Composite, Bridge |
| **Behavioural** | distribute responsibility and communication | Strategy, Observer, Command, State, Template Method, Iterator |

Modern languages absorb some patterns: first-class functions replace many Strategy classes, modules replace some Singletons, `async` iterators replace some Iterators. The **problem** remains; the implementation changes.

## The anatomy of a pattern

Every pattern has five parts. If you cannot fill them in, do not use it:

1. **Problem** — what goes wrong without it (e.g., callers depend on concrete classes).
2. **Context** — when the problem appears (e.g., multiple providers selected at runtime).
3. **Forces** — competing constraints (extensibility vs simplicity, performance vs clarity).
4. **Solution** — the structure and responsibilities.
5. **Consequences** — what gets easier, what gets harder, what new failure modes appear.

Most pattern descriptions in the wild give only the Solution. That is why they produce code that looks like the diagram and solves nothing.

## Patterns vs principles vs idioms

| Layer | Example | Nature |
|---|---|---|
| Principle | Dependency Inversion | a value/goal, always applicable |
| Pattern | Strategy | a reusable structure for a recurring problem |
| Idiom | injecting a `Clock` instead of calling `Date.now()` | language/team-specific habit |

Principles guide *whether* to abstract. Patterns are *one way* to structure the abstraction. Idioms are how it looks in your language.

## When to introduce a pattern

Patterns are a response to **observed variation or a real external boundary**:

- You have a `switch` that grows with every release → Strategy / polymorphic policy.
- Construction needs configuration, validation, or a lifecycle → Factory / Builder.
- Multiple objects must react to state changes without tight coupling → Observer.
- A third-party API leaks into your domain → Adapter.
- Cross-cutting behaviour (retry, caching, auth) must wrap a call → Decorator.

Signals that the pattern is premature:

- You cannot name the second implementation.
- The abstraction makes the common path harder to read.
- You are writing a factory for a constructor with two arguments.
- The pattern's name appears in class names (`AbstractFactoryImpl`) but the problem does not.

### Refactoring to patterns

The healthy order is:

1. Write the straightforward implementation.
2. Watch for duplication and repeated edits (the rule of three).
3. Extract the variation point.
4. Only then name it with a pattern if the name helps the team.

Starting from the pattern and inventing a problem is how you get `OrderFactoryFactory`.

## Patterns in this section

| Pattern | Problem it solves | Biggest risk |
|---|---|---|
| [Factory](/lld/008-factory-pattern) | construction logic is scattered or type-dependent | hidden control flow, class explosion |
| [Singleton](/lld/009-singleton-pattern) | one shared instance with controlled access | global state, test coupling |
| [Strategy](/lld/010-strategy-pattern) | branching on policy/algorithm | clients must know which strategy to pick |
| [Observer](/lld/011-observer-pattern) | many listeners for one event | leaks, error storms, ordering ambiguity |

Each chapter covers the problem first, then the structure, then **when not to use it**.

## A pattern is a conversation shortcut

Patterns are valuable when a team shares the vocabulary:

> "This is an Observer, so unsubscribing matters."
> "That's a Decorator; retries compose around the client rather than editing it."

Without shared context, the name adds nothing and can hide complexity. "A list of functions called after an order is placed" is often clearer than "an Observer pipeline" to a new teammate.

> [!TIP]
> **ELI5: Patterns are recipes, not ingredients**
> A recipe tells you when to use it, what it needs, and what can go wrong. "Add a Factory" is like adding flour to every dish because a recipe used flour. Start from the dish (the change), then choose the recipe.

## The pattern review test

Before adding a pattern, answer:

1. What specific change becomes cheaper?
2. Which existing files stop changing?
3. What new indirection must a reader now follow?
4. What can go wrong that could not before (ordering, lifecycle, hidden state)?
5. Is there a simpler language feature (function, module, map) that solves it?

If the answers are vague, the pattern is decoration.

## Exercises

1. Find a pattern in your codebase. Write its problem, forces, and consequences in five sentences. If you cannot identify the problem, delete the abstraction.
2. Replace one Strategy class hierarchy with a map of functions. Count the lines and compare readability.
3. List every `switch` on a domain type. Rank them by how often they change; abstract only the top one.
4. Explain to a teammate why a Singleton is a design decision, not a convenience.

## Checklist

- [ ] I can state the problem, forces, and consequences without naming the pattern.
- [ ] There is a real second variant or external boundary.
- [ ] The pattern reduces the blast radius of the next expected change.
- [ ] The common path is still easy to read and debug.
- [ ] A simpler language feature was considered first.
- [ ] The team shares the vocabulary and the trade-off.

Next: [Factory](/lld/008-factory-pattern) — putting construction in one place without hiding it.
