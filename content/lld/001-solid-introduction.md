---
title: Introduction to SOLID
description: Why SOLID exists, what each principle protects against, how coupling and cohesion explain it, and when applying the principles makes code worse.
order: 1
---

SOLID is a set of five heuristics for arranging code so that **change stays local**. It was popularised by Robert C. Martin in the 2000s, building on earlier work on modularity and dependency management.

They are not laws, and they are not a checklist for code review. Each principle is a **warning sign with a suggested treatment**. Applied without a concrete change in mind, they produce indirection, ceremony, and the exact fragility they were meant to prevent.

## The real goal: cost of change

Every codebase changes. The design question is not "how do I make this perfect?" but:

- When a requirement changes, **how many files do I touch?**
- When I touch them, **what can I accidentally break?**
- Can I **verify** the change without running the whole system?

Two classic terms describe this:

| Term | Meaning | Too little | Too much |
|---|---|---|---|
| **Cohesion** | How strongly the parts of a module belong together | a god class doing everything | 30 one-line classes no one can follow |
| **Coupling** | How much a module must know about another | duplicated rules, inconsistent behaviour | one change ripples through ten modules |

SOLID is mostly about **reducing the wrong kind of coupling** while keeping cohesion high.

## The five principles as a map

| Principle | Protects against | The question to ask | Typical smell |
|---|---|---|---|
| **S**ingle Responsibility | a module with several reasons to change | "Which actor asks for this change?" | `UserManager` that validates, hashes, emails, and writes SQL |
| **O**pen/Closed | editing stable code for every new variant | "Can I add this without touching working code?" | `switch (type)` in the pricing engine, edited for every plan |
| **L**iskov Substitution | subtypes that break their parent's contract | "Can this be used everywhere the parent can?" | `Square extends Rectangle`; `NotImplemented` overrides |
| **I**nterface Segregation | callers forced to depend on unused methods | "What does this caller actually need?" | one `Repository` interface with 40 methods |
| **D**ependency Inversion | business rules depending on frameworks | "Which way does the source dependency point?" | service imports `pg`, `express`, and `stripe` directly |

## A concrete before/after

A small example shows what "managed change" means. This reports revenue and emails a summary:

```ts
class RevenueReport {
  async send(): Promise<void> {
    const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    const { rows } = await client.query("SELECT total_cents FROM orders WHERE paid_at >= $1", [startOfMonth()]);
    const total = rows.reduce((sum, row) => sum + row.total_cents, 0);

    const response = await fetch("https://api.emailprovider.com/send", {
      method: "POST",
      body: JSON.stringify({ to: "finance@example.com", subject: "Revenue", text: `$${total / 100}` }),
    });
    if (!response.ok) throw new Error("email failed");
    await client.end();
  }
}
```

Problems, mapped to the principles:

- It owns **querying, business arithmetic, formatting, transport, and credentials** → SRP.
- Adding a Slack report means editing this class → OCP.
- It cannot be tested without a database and a network → DIP/ISP.
- The "total" rule is hidden inside transport code → cohesion.

After:

```ts
interface OrderReader {
  paidTotalCentsSince(instant: Date): Promise<number>;
}

interface Notifier {
  notify(channel: string, message: string): Promise<void>;
}

class RevenueReport {
  constructor(
    private readonly orders: OrderReader,
    private readonly notifier: Notifier,
    private readonly clock: Clock,
  ) {}

  async send(): Promise<void> {
    const totalCents = await this.orders.paidTotalCentsSince(this.clock.startOfMonth());
    await this.notifier.notify("finance", formatMoney(totalCents));
  }
}
```

The business rule is now one line, testable with a fake reader and notifier. Nothing here says "use a factory" or "create five interfaces". The seams exist because changes and tests demanded them.

## Coupling and cohesion at every scale

SOLID is usually taught with classes, but the same forces appear at other boundaries:

| Scale | Example of bad coupling |
|---|---|
| Function | a helper reads global config directly |
| Module | `pricing.ts` imports the HTTP framework |
| Service | checkout calls the inventory database directly instead of its API |
| Team | every change requires sign-off from three teams |

The principles are heuristics for the **dependency graph**, not just for object-oriented code. Functional code can violate SRP (a 400-line reducer doing validation, persistence, and analytics) just as easily.

## When SOLID makes code worse

Every abstraction has a cost. The failure mode of over-application has a name in review: **cargo cult design**.

- **One interface per class.** If there is exactly one implementation and no test double or variation, the interface adds a hop with no benefit.
- **Abstraction before the second use.** You cannot know what varies until you have two real variants (or a clear external dependency to isolate).
- **Splitting by method count.** SRP is about *reasons to change*, not lines of code. A 20-line method that owns one rule is fine.
- **Pattern-first design.** "Where does the Factory go?" is the wrong opening question. "What change am I preparing for?" is the right one.
- **Hidden control flow.** Dependency injection containers, event buses, and layers of indirection make a simple request hard to trace. Indirection must buy testability, replaceability, or independent deployment.

> [!WARNING]
> The most dangerous misuse of SOLID is **speculative generality**: building extension points for variants that never arrive. The code becomes harder to read today to support a tomorrow that may not happen.

## How to apply it without religion

1. **Start from a real change.** "We need a second payment provider" justifies DIP. "We might need one someday" does not.
2. **Write the test first.** If the design makes the test require a database, container, or sleep, the seam is wrong.
3. **Prefer the smallest seam.** A function parameter beats an interface; an interface beats a class hierarchy; a hierarchy beats a framework.
4. **Use the rule of three.** Duplicate twice, abstract on the third concrete case — or when an external boundary (network, clock, filesystem) forces isolation.
5. **Measure the blast radius.** After a refactor, a new variant should touch one new file and zero existing branches. If it touches ten files, the abstraction is in the wrong place.

> [!TIP]
> **ELI5: SOLID is a fire code, not interior design**
> Fire codes tell you where exits must be. They do not tell you what colour to paint the walls. Use SOLID to make change and failure survivable; use taste, naming, and tests for everything else.

## What each principle does *not* mean

| It does not mean | It means |
|---|---|
| SRP: one method per class | one reason to change, one owner of the rule |
| OCP: never edit a file | protect stable code; edit when the abstraction is wrong |
| LSP: inheritance everywhere | substitutability of *contracts*, however implemented |
| ISP: tiny interfaces everywhere | callers depend only on what they use |
| DIP: a DI container | policy owns the abstraction; details implement it |

## Checklist

- [ ] I can name the actor(s) who force each module to change.
- [ ] Business rules do not import framework, ORM, or transport code.
- [ ] Every external effect (time, randomness, network, storage) is behind a seam I can fake.
- [ ] Abstractions exist because of a real second case or an external boundary.
- [ ] Adding a new variant touches one new file, not a chain of conditionals.
- [ ] I can explain what each abstraction costs (indirection, files, cognitive load).

Continue with [Single Responsibility](/lld/002-single-responsibility) — the principle that decides where everything else lives.
