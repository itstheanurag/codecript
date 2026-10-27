---
title: Singleton Pattern
description: What a singleton really buys you, why global state breaks tests, legitimate uses like config and pools, and the dependency-injection alternative.
order: 9
---

Singleton promises two things:

1. exactly one instance of a type exists in a process;
2. it is reachable through a global access point.

The first is sometimes a real constraint. The second is where most of the trouble starts.

## The classic implementation

```ts
class AppConfig {
  private static instance: AppConfig | null = null;

  private constructor(readonly databaseUrl: string, readonly stripeKey: string) {}

  static getInstance(): AppConfig {
    if (!this.instance) {
      this.instance = new AppConfig(
        requireEnv("DATABASE_URL"),
        requireEnv("STRIPE_KEY"),
      );
    }
    return this.instance;
  }
}
```

In JavaScript/TypeScript the **module system already gives you a singleton**:

```ts
// config.ts
export const config = {
  databaseUrl: requireEnv("DATABASE_URL"),
  stripeKey: requireEnv("STRIPE_KEY"),
} as const;
```

Every import returns the same object, there is no lazy-init race in a single-threaded runtime, and it is easy to read. If the value must be initialized asynchronously, export a promise or an explicit `init()` at the composition root.

## Why global access is the problem

The global access point is the actual design decision:

```ts
function chargeCustomer(customerId: string, amount: Money): Promise<void> {
  const stripe = new Stripe(AppConfig.getInstance().stripeKey);
  // ...
}
```

Consequences:

- **Hidden dependencies.** The function signature says nothing about needing config, a network client, or credentials.
- **Test coupling.** Tests must set environment variables or reset the singleton between cases; parallel tests interfere.
- **Lifecycle surprises.** The instance caches values from startup; a rotated secret or changed tenant is ignored.
- **Concurrency/lifecycle at boundaries.** In serverless or multi-tenant processes, "one per process" may be the wrong scope entirely.
- **Ordering.** `getInstance()` can throw deep inside a request if the environment is missing, instead of failing at boot.

A function that calls `getInstance()` is impossible to unit test without global setup. That is the price.

## Legitimate uses

A process-wide singleton is reasonable when **one per process is a physical or economic fact**, not a convenience:

| Use | Why one instance | Safer shape |
|---|---|---|
| Configuration | env is read once at boot | exported constant / validated config object |
| Logger | one sink/pipeline per process | inject `Logger` into components |
| Connection pool | pools are expensive and bounded | create at composition root, pass the pool |
| Feature-flag client | one cache/listener per process | inject a narrow `Flags` interface |
| Metrics registry | one registry per process | module export or injected registry |

Even in those cases, prefer **one construction + explicit injection** over a global lookup:

```ts
// composition.ts
const pool = new Pool({ connectionString: config.databaseUrl });
const orders = new PostgresOrderStore(pool);
const service = new OrderService(orders, logger, flags);
```

The instance count is still one. The dependency is visible in constructors, and tests can pass a fake.

## Scoping

Ask "one per what?":

- one per **process** (pool, logger)
- one per **request** (unit of work, transaction, tenant context)
- one per **tenant** (config, feature flags)
- one per **test** (fresh fake)

A common bug is using a process-wide singleton for request-scoped data (current user, tenant, correlation id). Under concurrency, requests overwrite each other. Use request context (AsyncLocalStorage in Node) or pass the context explicitly.

## Testing

Avoid calling `getInstance()` in tests. If you inherit code that does:

```ts
beforeEach(() => {
  AppConfig.resetForTests();   // explicit, named for tests
  process.env.DATABASE_URL = "postgres://test";
});
```

Better: refactor the consumer to take `AppConfig` as a constructor/function parameter. The test then constructs a config literal with no globals.

> [!WARNING]
> A `reset()` method that exists only for tests is a strong signal the singleton should be an injected dependency.

## Module-cache pitfalls

- In dev with hot reload, modules can be re-evaluated, creating a second "singleton" (two WebSocket servers, two listeners).
- In bundlers, the same module can be duplicated across chunks (dual-package hazard), producing two instances.
- Worker threads and clustered processes each get their own copy — which may be correct, but must be intentional.
- Tests that import the module once share mutable state across test files.

## When a singleton is the right answer

Use it only when **all** of these hold:

1. The resource is genuinely one per process.
2. It must be initialized after environment/config is known.
3. Passing it explicitly would add noise to every call site (it truly is ambient).
4. You can still test the policy by substituting an interface at the boundary.

Otherwise, construct once and inject. The object count is the same; the coupling is not.

## Exercises

1. Find a `getInstance()` call. Replace it with constructor injection and run the tests.
2. Identify one process-wide resource in your service and decide its correct scope (process/request/tenant).
3. Convert a lazy singleton config into a validated, exported config object initialized at boot.
4. Write a test that fails because a previous test mutated the singleton. Fix it without `reset()`.

## Checklist

- [ ] "One instance" is a real constraint, not convenience.
- [ ] The scope is explicit: process, request, tenant, or test.
- [ ] Consumers receive the instance via injection, not a global lookup.
- [ ] Initialization fails at boot, not mid-request.
- [ ] Tests never depend on mutation order or global reset.
- [ ] Request-scoped data is not stored in a process-wide singleton.

Next: [Strategy](/lld/010-strategy-pattern) — replace growing conditionals with named policies.
