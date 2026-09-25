---
title: Introduction to SOLID
description: Learn why SOLID exists, the five principles as a map, and when applying them makes code worse instead of better.
order: 1
---

SOLID is five rules for object-oriented design from Robert C. Martin. They are not a religion and they are not a checklist you spray onto every file. They are a vocabulary for *why* a change felt expensive.

If changing a tax rule also breaks PDF export, email, and the admin UI, the design is **fragile**. If you cannot reuse the pricing module without dragging in the HTTP server, it is **rigid**. SOLID is how teams talk about those failures before they become a rewrite.

> [!TIP]
> **ELI5: Kitchen stations**
> A good kitchen splits work: one person sauces, one person grills, one person plates. If the grill cook also does taxes and answers the phone, one busy night wrecks dinner. SOLID is "each station has one job, you can swap the grill without rebuilding the dining room, and nobody depends on a specific brand of pan — they depend on 'a hot surface.'"

## The pain SOLID is answering

Uncle Bob described four design smells. You will feel them in code review before you remember the acronym.

| Smell | What it feels like |
| :--- | :--- |
| **Rigidity** | A small product change requires edits in 12 files. |
| **Fragility** | You fix login, checkout breaks. Unrelated tests fail. |
| **Immobility** | You want this parser in another service; it is welded to Rails. |
| **Viscosity** | The "right" change is hard, so people hack around it. |

Low **coupling** (few dependencies between modules) and high **cohesion** (things in a module belong together) are the underlying physics. SOLID is five concrete tactics for those two.

## The five principles (the map)

Read them as questions you ask a class, not as laws of nature.

1. **[S — Single Responsibility](./002-single-responsibility)**  
   Does this type have *one* reason to change? `User` should not also send email and write SQL.

2. **[O — Open/Closed](./003-open-closed)**  
   Can I add a payment method without editing a 400-line `if/else` of existing methods?

3. **[L — Liskov Substitution](./004-liskov-substitution)**  
   Can I pass a `Square` where a `Rectangle` is expected without lying about behavior?

4. **[I — Interface Segregation](./005-interface-segregation)**  
   Do callers depend on a fat interface they only 10% use? Split it.

5. **[D — Dependency Inversion](./006-dependency-inversion)**  
   Does the domain import Postgres, or does it depend on a `UserStore` port that Postgres implements?

The later pages use TypeScript before/after examples. The point of *this* page is to know which principle you are reaching for.

```text
Need a new variant without touching old code?     → OCP, often Strategy/Factory
Tests cannot construct the class?                 → DIP (inject the dependency)
Subclass throws "not supported"?                  → LSP violation
Interface with 12 methods, callers use 2?         → ISP
Class named Manager/Helper/Util doing everything? → SRP
```

## How they work together

A typical backend use-case:

- The checkout **use case** depends on `Payments` and `Inventory` **interfaces** (DIP + ISP).
- Stripe and a fake in-memory gateway both implement `Payments` (OCP + LSP).
- The HTTP handler does not contain pricing rules (SRP).

That is SOLID as a *system*, not five stickers on five classes.

## When SOLID makes things worse

> [!WARNING]
> A 40-line script with one `Calculator` class does not need five interfaces and a factory. Premature SOLID is how you get `IAbstractUserFactoryBean` for a weekend project.

Apply the principles when:

- You have *more than one* implementation (test fake + real, or Stripe + Adyen).
- Two teams / two reasons to change keep colliding in one file.
- You are about to copy-paste a `switch` for the third time.

Do not apply them when:

- There is one implementation and no test that needs a fake yet.
- The "abstraction" just forwards to the only concrete class.
- You cannot name the interface after a **capability** (`Clock`, `Mailer`) and instead name it after the class (`IUserServiceImpl`).

The next five lessons show each principle with a broken example and a fixed one. If you only remember one sentence: **depend on small, stable contracts, and keep each module's reasons to change to one.**
