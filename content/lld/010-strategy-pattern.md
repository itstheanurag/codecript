---
title: Strategy Pattern
order: 10
---

The Strategy Pattern is a behavioral design pattern that allows you to define a family of algorithms, encapsulate each one as a separate class, and make them interchangeable at runtime.

It heavily leverages the **Open/Closed Principle (OCP)** and **Dependency Inversion Principle (DIP)**.

> [!TIP]
> **ELI5: Maps and Transportation**
> You are building a GPS navigation app. A user needs directions from Point A to Point B.
> 
> *   **Without Strategy:** The app has a massive `calculateRoute()` function with endless `if (mode == 'car') ... else if (mode == 'walking') ... else if (mode == 'bike')` statements.
> *   **With Strategy:** You create a `RouteStrategy` interface. Then you create distinct classes: `CarStrategy`, `WalkStrategy`, `BikeStrategy`. The app simply asks the currently selected strategy to calculate the route. If you want to add a `BusStrategy` later, you just create a new class without touching the core app.

## The Problem (The Massive Switch Statement)

Imagine an e-commerce checkout system applying different discounts.

```typescript
// BAD: Violates OCP. Hard to test. Hard to read.
class Checkout {
    calculateTotal(amount: number, discountType: string) {
        if (discountType === "NONE") {
            return amount;
        } else if (discountType === "BLACK_FRIDAY") {
            return amount * 0.5; // 50% off
        } else if (discountType === "NEW_USER") {
            return amount * 0.9; // 10% off
        } else {
            throw new Error("Unknown discount");
        }
    }
}
```

## The Solution (The Strategy Pattern)

We extract the changing behavior (the algorithms) into their own isolated classes.

```typescript
// 1. The Strategy Interface
interface DiscountStrategy {
    applyDiscount(amount: number): number;
}

// 2. Concrete Strategies (The interchangeable algorithms)
class NoDiscount implements DiscountStrategy {
    applyDiscount(amount: number) { return amount; }
}

class BlackFridayDiscount implements DiscountStrategy {
    applyDiscount(amount: number) { return amount * 0.5; }
}

class NewUserDiscount implements DiscountStrategy {
    applyDiscount(amount: number) { return amount * 0.9; }
}

// 3. The Context (The class that USES the strategy)
class Checkout {
    private strategy: DiscountStrategy;

    // We set a default strategy
    constructor() {
        this.strategy = new NoDiscount();
    }

    // This allows us to swap the algorithm at RUNTIME
    setDiscountStrategy(strategy: DiscountStrategy) {
        this.strategy = strategy;
    }

    calculateTotal(amount: number) {
        // The Context delegates the work to the Strategy object!
        return this.strategy.applyDiscount(amount);
    }
}

// --- USAGE ---
const cart = new Checkout();

console.log(cart.calculateTotal(100)); // Uses NoDiscount: 100

// Oh wait, it's Black Friday! Swap the strategy at runtime.
cart.setDiscountStrategy(new BlackFridayDiscount());
console.log(cart.calculateTotal(100)); // Uses BlackFriday: 50
```

## When to use it?
*   When you have a lot of similar classes that only differ in the way they execute some behavior.
*   To replace massive `switch` or `if/else` statements within a class.
*   When you want to swap out algorithms at runtime based on user input or state.
