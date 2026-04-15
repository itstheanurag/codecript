---
title: Open/Closed Principle
order: 3
---

# Open/Closed Principle (OCP)

> "Software entities (classes, modules, functions, etc.) should be open for extension, but closed for modification."

OCP means you should be able to add new functionality without changing the existing code. This prevents regressions and makes the system more stable.

## The Problem: The "Switch" Nightmare
Usually, OCP violations happen when you use long `if-else` or `switch` statements to handle different types of behavior. When a new type is added, you have to modify the core logic.

###  Before OCP (Violation)

```typescript
class DiscountCalculator {
  calculate(amount: number, type: string): number {
    if (type === "FIXED") {
      return amount - 10;
    } else if (type === "PERCENTAGE") {
      return amount * 0.9;
    }
    // If we want to add 'VIP' discount, we HAVE TO modify this class.
    return amount;
  }
}
```

###  After OCP (Correct)

Instead of modifying the class, we use **Interfaces** or **Abstract Classes** to extend behavior.

```typescript
interface DiscountStrategy {
  apply(amount: number): number;
}

class FixedDiscount implements DiscountStrategy {
  apply(amount: number) {
    return amount - 10;
  }
}

class PercentageDiscount implements DiscountStrategy {
  apply(amount: number) {
    return amount * 0.9;
  }
}

// Extension: We add a new discount without touching existing code.
class VIPDiscount implements DiscountStrategy {
  apply(amount: number) {
    return amount * 0.5;
  }
}

class DiscountCalculator {
  calculate(amount: number, discount: DiscountStrategy): number {
    return discount.apply(amount);
  }
}
```

Now, the `DiscountCalculator` is "Closed for modification" (you never have to touch its logic again) but "Open for extension" (you can add a hundred new discount types by just implementing the interface).

## Why it matters
1. **Stability**: Existing, tested code remains untouched.
2. **Plugins**: This is how plugin architectures work (e.g., VS Code extensions).
3. **Decoupling**: The calculator doesn't need to know about specific discount logic.
