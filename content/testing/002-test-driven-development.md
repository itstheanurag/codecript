---
title: Test-Driven Development (TDD)
order: 2
---

Test-Driven Development is a software engineering practice where you write the tests *before* you write the actual production code. 

## 1. The Red-Green-Refactor Cycle

TDD follows a strict, repeating three-step cycle:

```mermaid
architecture-beta
    group cycle(cloud)[TDD Cycle]
    service red(server)[1. RED: Write Failing Test] in cycle
    service green(database)[2. GREEN: Make it Pass] in cycle
    service refactor(disk)[3. REFACTOR: Clean it up] in cycle
    
    red:R -- L:green
    green:B -- T:refactor
    refactor:L -- R:red
```

1.  **RED:** Write a test for the next piece of functionality you want to add. Run the test suite. The test *must fail* because the functionality doesn't exist yet. 
2.  **GREEN:** Write the absolute minimum amount of production code required to make the failing test pass. Do not over-engineer; just make it turn "green".
3.  **REFACTOR:** Now that you have a passing test protecting you from regressions, clean up the code. Remove duplication, improve variable names, and optimize the algorithm. 

## 2. Designing for Testability

Code that is written without tests in mind is often "untestable." TDD *forces* you to write modular code using Dependency Injection.

> [!TIP]
> **ELI5: Dependency Injection**
> Imagine you are testing a new remote control. 
> *   **Hardcoded Dependency (Bad):** The remote control has batteries soldered directly into its circuit board. You can't test if the remote works with *different* batteries.
> *   **Dependency Injection (Good):** The remote control has an empty battery slot. You "inject" the batteries. During testing, you can inject a "Fake Battery" (Mock) that always provides exactly 3 volts, ensuring your test is perfectly controlled.

**Testable Code in Go (Dependency Injection):**
```go
package main

import "fmt"

// 1. Define an interface (The empty battery slot)
type PaymentGateway interface {
	Charge(userID int, amount float64) bool
}

// 2. The core logic depends on the interface, NOT a specific implementation
type PaymentProcessor struct {
	gateway PaymentGateway 
}

func (p *PaymentProcessor) ChargeUser(userID int, amount float64) bool {
	return p.gateway.Charge(userID, amount)
}

// --- During Testing ---

// 3. Create a Mock that implements the interface
type MockGateway struct {}
func (m *MockGateway) Charge(userID int, amount float64) bool {
	return true // Always succeeds in our controlled test
}

func main() {
    // We inject the mock!
	processor := PaymentProcessor{gateway: &MockGateway{}}
	success := processor.ChargeUser(1, 99.99)
	fmt.Println("Test passed:", success)
}
```
