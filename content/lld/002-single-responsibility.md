---
title: Single Responsibility Principle (SRP)
description: SRP is about actors, not method counts — how to find the people who force a module to change, split along those lines, and avoid fragmenting code into confetti.
order: 2
---

The most quoted and most misapplied principle in SOLID:

> "A class should have one, and only one, reason to change."

The useful interpretation is not "one method" or "under 100 lines". It is:

> **A module should be responsible to one, and only one, actor.**

An **actor** is a person or group who can request a change: finance, compliance, the mobile team, the on-call engineer. If two different actors can force the same file to change for different reasons, that file has two responsibilities.

## Finding the actors

Take a class that looks reasonable:

```ts
class Employee {
  constructor(
    public readonly id: string,
    public name: string,
    public salaryCents: number,
    public hoursWorked: number,
  ) {}

  calculatePay(): number {
    return this.salaryCents + Math.max(0, this.hoursWorked - 40) * 2_500;
  }

  save(): Promise<void> {
    return db.query("UPDATE employees SET name = $1, salary_cents = $2 WHERE id = $3", [
      this.name, this.salaryCents, this.id,
    ]);
  }

  toCsv(): string {
    return `${this.id},${this.name},${this.salaryCents / 100}`;
  }
}
```

Three changes with three different owners:

| Method | Actor | Change that forces an edit |
|---|---|---|
| `calculatePay` | Finance / payroll | overtime rules, tax treatment, bonuses |
| `save` | Platform / DBA | schema migration, connection handling |
| `toCsv` | Reporting / ops | new export columns, formatting for finance |

The class is small, and still violates SRP. Method count is irrelevant; **the reasons to change** are not.

## Splitting along the actors

```ts
// Domain data — changes when the business definition of an employee changes.
interface Employee {
  readonly id: string;
  readonly name: string;
  readonly salaryCents: number;
  readonly hoursWorked: number;
}

// Payroll policy — changes when finance changes the rules.
interface PayPolicy {
  payFor(employee: Employee): Money;
}

class StandardPayPolicy implements PayPolicy {
  payFor(employee: Employee): Money {
    const overtimeHours = Math.max(0, employee.hoursWorked - 40);
    return Money.cents(employee.salaryCents + overtimeHours * 2_500);
  }
}

// Persistence — changes when the schema or storage engine changes.
interface EmployeeRepository {
  save(employee: Employee): Promise<void>;
}

// Reporting — changes when the export format changes.
interface EmployeeExporter {
  export(employees: Employee[]): string;
}
```

Now a change to overtime touches `StandardPayPolicy` only. A schema migration touches the repository. A CSV column touches the exporter. The domain type stays stable.

> [!NOTE]
> Splitting does not require four files per concept. A single module can hold several small functions if they share one actor. SRP is about **ownership boundaries**, not file count.

## Heuristics that reveal a violation

1. **The commit history test.** `git log --follow` on the file shows changes requested by unrelated teams (finance, infra, marketing).
2. **The "and" test.** The class description needs "and": "validates *and* persists *and* emails invoices."
3. **The constructor test.** Instantiating the object requires a database, an HTTP client, and a config object — it is doing infrastructure work.
4. **The merge-conflict test.** Two feature branches constantly touch the same file for unrelated reasons.
5. **The test setup test.** Testing one rule requires 40 lines of fixtures for unrelated concerns.
6. **The naming test.** `OrderManager`, `UserHelper`, `Utils` — names that describe nothing predict responsibilities that pile up.

## SRP at different scales

| Scale | Example of two actors in one unit |
|---|---|
| Function | `parseAndSaveInvoice()` — parsing (format team) and persistence (platform) |
| Class | the `Employee` example above |
| Module | `billing.ts` contains tax law, Stripe calls, and PDF rendering |
| Service | "checkout" service owns pricing, inventory reservations, and email receipts |
| Deployable | one binary that must be redeployed for a marketing copy change |

At service scale, the "actor" becomes a **team** and the "reason to change" becomes a **release cadence**. That is how SRP shades into service boundaries and team topology.

## The other failure mode: fragmentation

Splitting without a real actor produces confetti:

- `UserValidator`, `UserHasher`, `UserEmailSender`, `UserSaver` — each one line, used once.
- A domain rule spread across six files, where a reader cannot see the invariant in one place.
- "Utils" modules that become a second, unnamed layer.

The rule of thumb:

> Split when the **reason to change** is different. Keep together when the **reason to change is the same**, even if the code is long.

A long function that implements one coherent algorithm is often more maintainable than five tiny units that must be read together.

## Worked refactor

Before:

```ts
class OrderService {
  async placeOrder(cart: Cart, paymentToken: string) {
    validateCart(cart);
    const total = cart.items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);
    const tax = total * TAX_RATE;
    const charge = await stripe.charges.create({
      amount: total + tax,
      currency: "usd",
      source: paymentToken,
    });
    await db.query("INSERT INTO orders ...", [charge.id, total + tax]);
    await sendEmail(cart.email, "Order confirmed");
    return charge.id;
  }
}
```

Three actors again: pricing (finance), payment (payments team), notifications (growth). After:

```ts
interface PriceCalculator {
  totalFor(cart: Cart): Money;
}

interface PaymentGateway {
  charge(amount: Money, token: string): Promise<ChargeId>;
}

interface OrderRepository {
  save(order: Order): Promise<void>;
}

interface OrderNotifier {
  orderPlaced(order: Order): Promise<void>;
}

class PlaceOrder {
  constructor(
    private readonly prices: PriceCalculator,
    private readonly payments: PaymentGateway,
    private readonly orders: OrderRepository,
    private readonly notifier: OrderNotifier,
  ) {}

  async execute(cart: Cart, token: string): Promise<OrderId> {
    validateCart(cart);
    const total = this.prices.totalFor(cart);
    const chargeId = await this.payments.charge(total, token);
    const order = Order.fromCart(cart, chargeId);
    await this.orders.save(order);
    await this.notifier.orderPlaced(order);
    return order.id;
  }
}
```

`PlaceOrder` still orchestrates several concerns — and that is fine. Its **single responsibility is the use case**: the sequence, the failure semantics, the transaction boundary. The actors now change the policy objects, the gateway adapter, or the notifier independently.

If you push SRP all the way down until `PlaceOrder` has no responsibilities left, you get an anemic sequence scattered across event handlers — harder to reason about, not easier.

## Testing SRP

A well-separated design is testable in isolation:

```ts
test("pays overtime at 1.5x", () => {
  const policy = new StandardPayPolicy();
  const employee = { id: "e1", name: "Ada", salaryCents: 100_000, hoursWorked: 45 };
  expect(policy.payFor(employee).cents).toBe(107_500);
});
```

No database, no network, no clock. If testing the rule requires infrastructure, responsibilities are still mixed.

## Exercises

1. Pick a class you own. List every method and write the **actor** next to it. If a method has no actor, it may be dead code.
2. Find a function whose name contains "and". Split it along the change boundary, not by line count.
3. Take a 300-line service and identify the **invariant** it protects. If there are three invariants, there are probably three responsibilities.
4. Refactor one god class, then check the diff: did each new file change for exactly one reason?

## Checklist

- [ ] I can name the actor behind each module.
- [ ] A single requirement change touches one owner, not a chain of files.
- [ ] Domain data is separate from policy, persistence, transport, and formatting.
- [ ] Modules are not split so finely that a rule can no longer be read in one place.
- [ ] Unit tests for a rule run without infrastructure.
- [ ] The class/module name describes a responsibility, not a grab bag.

Next: [Open/Closed](/lld/003-open-closed) — how to add the *second* variant without editing the first.
