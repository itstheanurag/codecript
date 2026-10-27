---
title: Liskov Substitution Principle (LSP)
description: Substitutability is about contracts, not inheritance keywords — preconditions, postconditions, invariants, and the payment/refund examples that break in production.
order: 4
---

> "Objects of a subtype must be usable anywhere an object of the supertype is expected, without breaking correctness."

Barbara Liskov's original formulation is about **behavioural subtyping**: if `S` is a subtype of `T`, then a program written against `T` must still be correct when given an `S`. The compiler checks types; LSP is about the promises the type makes.

## A type is a contract

A well-designed type documents and enforces:

| Part | Meaning | Example |
|---|---|---|
| **Preconditions** | what the caller must guarantee | `withdraw(amount)` requires `amount > 0` |
| **Postconditions** | what the method guarantees | returns a new balance, never negative |
| **Invariants** | what is always true of the object | `balance >= 0`, `id` never changes |
| **Side effects** | what else changes | emits `MoneyWithdrawn`, updates `updatedAt` |
| **Error semantics** | which failures are possible | insufficient funds raises `InsufficientFunds` |

LSP violations are **contract violations**, even when the code compiles.

## The classic: Square and Rectangle

```ts
class Rectangle {
  constructor(protected width: number, protected height: number) {}

  setWidth(width: number): void { this.width = width; }
  setHeight(height: number): void { this.height = height; }
  area(): number { return this.width * this.height; }
}

class Square extends Rectangle {
  setWidth(width: number): void {
    this.width = width;
    this.height = width;
  }
  setHeight(height: number): void {
    this.width = height;
    this.height = height;
  }
}
```

Why it breaks:

```ts
function grow(rect: Rectangle): void {
  rect.setWidth(rect.area() / rect.height());  // keeps height, adjusts width
  assert(rect.area() === rect.width * rect.height); // true for both
  rect.setHeight(10);                           // caller expects width unchanged
}

const square = new Square(5, 5);
grow(square);
// The caller's assumption "setting height does not change width" is false.
```

`Square` is not a behavioural subtype of mutable `Rectangle`: it strengthens the postcondition of `setWidth` (it also changes height). The fix is not a flag or a comment — **the mutable setter model is the problem**:

```ts
interface Shape {
  area(): number;
}

class Rectangle implements Shape {
  constructor(readonly width: number, readonly height: number) {}
  area(): number { return this.width * this.height; }
}

class Square implements Shape {
  constructor(readonly side: number) {}
  area(): number { return this.side * this.side; }
}
```

Immutable values eliminate a whole class of LSP bugs. When state must change, model the change as a new value or a domain operation (`withWidth`), not as a setter with hidden rules.

## Smells that signal a violation

| Smell | What it usually means |
|---|---|
| `instanceof` / type checks after a polymorphic call | the abstraction does not carry the needed behaviour |
| `throw new Error("not implemented")` | the subtype cannot honour the contract |
| Overrides that narrow inputs or reject valid values | stronger preconditions |
| Overrides that return `null`/empty where the parent promised a value | weaker postconditions |
| Overrides that add required side effects | hidden coupling |
| Subclass mutates parent state in surprising ways | broken invariants |
| Tests for the parent cannot be reused for the child | contract mismatch |

A parent's test suite should be runnable against every subtype. If it is not, the hierarchy is lying.

## A production example: payment providers

```ts
interface PaymentProvider {
  /**
   * Charges exactly once per idempotencyKey.
   * Precondition: amount > 0, currency is supported.
   * Postcondition: returns a captured or pending charge with a stable id.
   * Errors: PaymentDeclined, ProviderUnavailable.
   */
  charge(input: {
    idempotencyKey: string;
    amount: Money;
    method: PaymentMethod;
  }): Promise<Charge>;
}
```

A provider that silently retries a declined card, or creates a *new* charge for the same key, is not substitutable — even if it implements the same TypeScript interface. The team's Stripe adapter may be fine; the new provider's "retry on decline" behaviour violates the documented semantics.

Contract tests make this explicit:

```ts
function contract(makeProvider: () => PaymentProvider) {
  test("charges once per idempotency key", async () => {
    const provider = makeProvider();
    const input = { idempotencyKey: "k1", amount: usd(10), method: testCard() };
    const a = await provider.charge(input);
    const b = await provider.charge(input);
    expect(b.id).toBe(a.id);
  });

  test("does not treat a decline as a transient failure", async () => {
    const provider = makeProvider();
    await expect(
      provider.charge({ idempotencyKey: "k2", amount: usd(10), method: declinedCard() }),
    ).rejects.toBeInstanceOf(PaymentDeclined);
  });
}

describe("stripe", () => contract(() => new StripeProvider(testKey())));
describe("fake", () => contract(() => new FakePaymentProvider()));
```

## Covariance and contravariance, without the notation

Method signatures have a substitutability rule:

- **Parameters are contravariant**: a subtype may accept *wider* inputs than the parent (it must handle at least everything the parent handled). Narrowing a parameter breaks callers.
- **Return values are covariant**: a subtype may return a *narrower* type (a `Dog` is an `Animal`). Returning something unrelated breaks callers.
- **Exceptions are covariant**: a subtype must not throw *new* kinds of failures callers cannot handle.

In practice: **never make the contract stricter in a subtype.** Accept at least as much, promise at least as much, fail in the same vocabulary.

## LSP and interfaces vs inheritance

LSP is usually taught with inheritance, but it applies to any substitutable abstraction:

- two implementations of `Clock`
- a fake `OrderRepository` used in tests
- a wrapper/decorator around an HTTP client
- a strategy implementing `PricingPolicy`

The question is always: *can a caller written against the interface work with this implementation without knowing which one it is?*

If the caller needs `if (provider instanceof StripeProvider)`, the abstraction has failed — and the call site is the evidence.

## Fixing violations

1. **Write the contract down.** Document pre/postconditions and error types on the interface; tests are the enforcement.
2. **Prefer composition.** A `Square` is not a `Rectangle`; a `Square` *has* a side length. A `CachedRepository` *wraps* a repository rather than extending it.
3. **Split the interface** when a subtype cannot implement part of it → that is [ISP](/lld/005-interface-segregation).
4. **Make invalid states unrepresentable** with immutable values and validating constructors.
5. **Return result types** instead of throwing for expected failures; keep the error vocabulary consistent across implementations.
6. **Run the contract test suite** against every implementation, including fakes.

> [!WARNING]
> A fake that is more permissive than the real implementation passes tests the production system will fail. Keep fakes *behaviourally* faithful: same error types, same idempotency, same ordering guarantees, same failure timing where it matters.

## Exercises

1. Find a class hierarchy in your codebase where a parent method is overridden with `throw new Error("not supported")`. Split the interface.
2. Write the contract (pre/post/invariants/errors) for `Cache.get`. Implement it with an in-memory map and with Redis; run one test suite against both.
3. Explain why a `ReadOnlyList` that throws on `add()` is not a valid `List` subtype in a language that models `List` with mutation.
4. Add a second `PaymentProvider` to your system. Which tests would prove it is substitutable?

## Checklist

- [ ] The contract (preconditions, postconditions, invariants, errors) is documented and tested.
- [ ] Every implementation runs the same contract test suite.
- [ ] No subtype narrows inputs, weakens guarantees, or adds required side effects.
- [ ] Callers never need `instanceof`/type checks to use an abstraction.
- [ ] Fakes preserve the error and idempotency semantics of the real implementation.
- [ ] Mutable inheritance chains have been replaced by composition or immutable values where possible.

Next: [Interface Segregation](/lld/005-interface-segregation) — depend on the methods you actually call.
