---
title: Open/Closed Principle (OCP)
description: How to add behaviour without editing stable code — polymorphism, strategies, and registries — plus the cost of closing the wrong axis and building extension points nobody needs.
order: 3
---

> "Software entities should be open for extension, but closed for modification."

Read literally, this is impossible: every new feature changes *something*. The useful meaning is narrower:

> **For one identified axis of variation, adding a variant should mean adding code, not editing existing branches.**

That phrase — *one identified axis* — is the whole principle. A design can be open to new payment providers and closed to everything else; trying to be open to all change produces abstraction soup.

## What "closed" protects

The value of OCP is **not** that edits are forbidden. It is that:

- stable, tested code is not reopened for every new case;
- adding a variant cannot break existing variants;
- the set of behaviours is visible in one place (a registry, a module list);
- the compiler/tests can catch an incomplete implementation.

OCP is therefore a **risk-management** principle: keep the blast radius of a new variant to one new file.

## The mechanism is replaceable behaviour

Any of these can serve as the extension point:

| Mechanism | Example | Cost |
|---|---|---|
| Polymorphism / interfaces | `PaymentProvider` with `StripeProvider`, `AdyenProvider` | one type + implementations |
| Strategy object | `PricingPolicy` selected at runtime | indirection at the call site |
| Registry / plugin map | `Map<string, NotificationChannel>` | bootstrap code, duplicate keys |
| Composition of functions | `discounts: Array<(cart) => Money>` | ordering rules, debugging |
| Events / pipeline | subscribers react to `OrderPlaced` | async semantics, ordering, failure handling |
| Declarative config | rules loaded from a table or file | runtime validation, weaker typing |

The right question is not "which pattern?" but **"what varies independently, and how often?"**

## Worked example: pricing

The classic violation:

```ts
function priceFor(cart: Cart, plan: string): Money {
  switch (plan) {
    case "regular":
      return sum(cart.items);
    case "pro":
      return sum(cart.items).times(0.9);
    case "black-friday":
      return sum(cart.items).times(0.7).plus(shipping(cart));
    default:
      throw new Error(`unknown plan: ${plan}`);
  }
}
```

Every new plan edits this function. It also mixes three concerns: discount, shipping, and plan selection. Add a coupon, a country-specific tax rule, and a partner discount, and the switch becomes unreadable.

A first refactor:

```ts
interface PricingPlan {
  price(cart: Cart): Money;
}

class RegularPlan implements PricingPlan {
  price(cart: Cart): Money {
    return sum(cart.items);
  }
}

class ProPlan implements PricingPlan {
  price(cart: Cart): Money {
    return sum(cart.items).times(0.9);
  }
}

const PLANS: Record<string, PricingPlan> = {
  regular: new RegularPlan(),
  pro: new ProPlan(),
  "black-friday": new BlackFridayPlan(),
};

function priceFor(cart: Cart, plan: string): Money {
  const pricing = PLANS[plan];
  if (!pricing) throw new UnknownPlanError(plan);
  return pricing.price(cart);
}
```

Now adding `student` means adding one class and one map entry. Existing plans are untouched.

But notice what did **not** change: the switch still exists in the map. OCP does not eliminate dispatch; it moves dispatch to a **single, explicit registry** so the business logic lives in isolated units.

### The second axis: discounts vs plans

If plans and discounts vary independently, do not multiply classes (`ProWithBlackFridayPlan`). Compose:

```ts
interface Discount {
  apply(amount: Money, cart: Cart): Money;
}

class PercentageDiscount implements Discount {
  constructor(private readonly rate: number) {}
  apply(amount: Money): Money {
    return amount.times(1 - this.rate);
  }
}

class PricingPlan {
  constructor(
    private readonly base: Money,
    private readonly discounts: Discount[],
  ) {}

  price(cart: Cart): Money {
    return this.discounts.reduce(
      (amount, discount) => discount.apply(amount, cart),
      this.base,
    );
  }
}
```

This is composition instead of an inheritance lattice. It is also easier to test: each discount is a pure function of amount and cart.

## Registries: extension without editing dispatch

For notification channels:

```ts
interface NotificationChannel {
  readonly key: string;
  send(to: Recipient, message: Message): Promise<void>;
}

const channels = new Map<string, NotificationChannel>();

export function registerChannel(channel: NotificationChannel): void {
  if (channels.has(channel.key)) {
    throw new Error(`duplicate notification channel: ${channel.key}`);
  }
  channels.set(channel.key, channel);
}

export class Notifier {
  async send(channelKey: string, to: Recipient, message: Message): Promise<void> {
    const channel = channels.get(channelKey);
    if (!channel) throw new UnknownChannelError(channelKey);
    await channel.send(to, message);
  }
}

// bootstrap.ts
registerChannel(new EmailChannel(emailClient));
registerChannel(new SmsChannel(smsClient));
```

A new channel is a new file plus one bootstrap line. The `Notifier` is closed. The cost is explicit: registration is global state, duplicate keys must be handled, and tests must reset the registry (or inject it instead — see [Dependency Inversion](/lld/006-dependency-inversion)).

> [!NOTE]
> Prefer injecting the registry (`Map` passed to the constructor) over a module-level singleton. It keeps tests isolated and makes the available channels visible at the composition root.

## When OCP makes things worse

- **Speculative variants.** "We might support crypto one day" is not a reason to build a provider abstraction today.
- **One implementation, one interface.** If there is genuinely no second case and no test double, the extra type buys nothing.
- **Closing the wrong axis.** Making `PricingPlan` extensible while tax rules are hard-coded means the next tax change still reopens stable code.
- **Config-driven behaviour without types.** A registry loaded from JSON turns compile-time errors into runtime 500s.
- **Explosion of tiny classes.** One class per combination of flags is a sign you needed composition, not more subclasses.

### The rule of three

Wait for the **third** concrete variant, or for a stable interface forced by an external boundary, before abstracting. Two cases often look like a pattern but are actually one rule with a parameter.

## A useful review question

For every abstraction, ask:

> "If I add the next variant, which files change?"

- One new file and one registration → OCP is working.
- Ten files, or a chain of `instanceof` checks → the abstraction is in the wrong place.
- Zero existing files but the new file must copy 80% of an existing one → the axis is wrong; extract the shared policy instead.

## Testing OCP designs

- Each variant has its own focused unit test (no conditional test setup).
- The dispatcher has one test for unknown keys and one for routing.
- A contract test suite runs against every implementation of an interface:

```ts
function assertPaymentProviderContract(makeProvider: () => PaymentProvider) {
  test("is idempotent for the same key", async () => {
    const provider = makeProvider();
    const first = await provider.charge({ key: "p1", amount: usd(10) });
    const second = await provider.charge({ key: "p1", amount: usd(10) });
    expect(second.id).toBe(first.id);
  });
}
```

Run it for Stripe, for the fake, and for the next provider. The contract, not the class, is what is closed.

## Exercises

1. Find a `switch` on a domain type. List the actors who add cases. Refactor one axis into a registry and measure the diff for a new case.
2. Design a discount engine where percentage, fixed-amount, and buy-one-get-one discounts compose without subclasses per combination.
3. Identify an abstraction in your codebase with exactly one implementation. Decide: keep it (external boundary/test seam) or delete it.
4. Add a `student` pricing plan in a codebase that uses OCP. Count the files touched; if it is more than two, explain why.

## Checklist

- [ ] I can name the axis of variation this abstraction protects.
- [ ] Adding the next variant touches one new file plus one registration.
- [ ] Dispatch is explicit and central, not scattered `instanceof` checks.
- [ ] Variants are independently testable.
- [ ] The abstraction exists because of real variants or an external boundary, not speculation.
- [ ] I have not closed an axis that is actually stable — and left volatile rules hard-coded.

Next: [Liskov Substitution](/lld/004-liskov-substitution) — an abstraction is only useful if every implementation keeps its promises.
