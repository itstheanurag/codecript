---
title: Open/Closed Principle (OCP)
order: 3
---

The "O" in SOLID. It states: **"Software entities (classes, modules, functions) should be open for extension, but closed for modification."**

This means you should be able to add new functionality to an existing system *without* changing the existing, already-tested code.

> [!TIP]
> **ELI5: The Power Strip**
> Think of a wall outlet. It is **closed for modification**; you don't need to rip open the wall, expose the wires, and solder a new appliance directly to the mains every time you buy a new lamp. 
> 
> However, it is **open for extension**. You can simply plug a power strip into the outlet, and then plug 5 different appliances into the power strip. You extended the system's capabilities without modifying the core wall wiring.

## The Problem (Violating OCP)

Imagine a payment processing system.

```typescript
// BAD: We must MODIFY this class every time we add a new payment method.
class PaymentProcessor {
    processPayment(amount: number, method: string) {
        if (method === "credit_card") {
            console.log(`Processing $${amount} via Credit Card API...`);
        } else if (method === "paypal") {
            console.log(`Processing $${amount} via PayPal API...`);
        }
        // If we want to add Apple Pay, we have to open this file,
        // write another 'else if', and risk breaking existing logic.
    }
}
```

## The Solution (Refactoring to OCP)

We solve this using **Polymorphism** (Interfaces/Abstract Classes). We define a contract, and let specific classes implement that contract.

```typescript
// GOOD: Open for extension, closed for modification.

// 1. The Contract (The Outlet)
interface PaymentMethod {
    pay(amount: number): void;
}

// 2. The Implementations (The Plugs)
class CreditCardPayment implements PaymentMethod {
    pay(amount: number) {
        console.log(`Processing $${amount} via Stripe API...`);
    }
}

class PayPalPayment implements PaymentMethod {
    pay(amount: number) {
        console.log(`Processing $${amount} via PayPal API...`);
    }
}

// 3. New Implementation! (Extending the system without touching old code)
class ApplePayPayment implements PaymentMethod {
    pay(amount: number) {
        console.log(`Processing $${amount} via Apple Pay API...`);
    }
}

// 4. The Processor (Closed for modification)
class PaymentProcessor {
    // It accepts ANY class that implements PaymentMethod
    processPayment(amount: number, method: PaymentMethod) {
        method.pay(amount);
    }
}

// Usage:
const processor = new PaymentProcessor();
processor.processPayment(100, new CreditCardPayment());
processor.processPayment(50, new ApplePayPayment()); // Works seamlessly!
```

## Why does this matter?
If you have a massive `if/else` or `switch` statement that grows every time a new feature is requested, you are violating OCP. By relying on interfaces, you isolate new code in new files, ensuring you never introduce a regression bug into the old, stable code.
