---
title: The Testing Pyramid
order: 1
---

# The Testing Pyramid

You cannot and should not test every single aspect of your application with the same type of test. Different tests have different costs regarding execution time, maintenance, and setup complexity.

The **Testing Pyramid** is a framework that dictates the proportion of different tests you should write.

```mermaid
architecture-beta
    group pyramid(cloud)[The Testing Pyramid]
    
    service e2e(server)[E2E Tests (Slow, Expensive, Few)] in pyramid
    service int(database)[Integration Tests (Medium)] in pyramid
    service unit(disk)[Unit Tests (Fast, Cheap, Many)] in pyramid
    
    e2e:B -- T:int
    int:B -- T:unit
```

## 1. Unit Tests (The Base)

Unit tests are the foundation of the pyramid. They should make up the vast majority of your test suite.

*   **Scope:** Tests a single, isolated "unit" of code (usually a single function or class method).
*   **Dependencies:** ZERO external dependencies. No real databases, no network calls, no file system access. Everything external is mocked or stubbed.
*   **Execution Speed:** Lightning fast (milliseconds). A suite of thousands of unit tests should run in seconds.

## 2. Integration Tests (The Middle)

Integration tests verify that different units or modules of your application work correctly *when connected together*.

*   **Scope:** Tests the interaction between two or more components (e.g., a Service interacting with a Database Repository).
*   **Dependencies:** Real databases (often spun up in Docker containers during CI), real caches, but usually still mocking external 3rd-party SaaS APIs.
*   **Execution Speed:** Moderate (seconds).

## 3. End-to-End (E2E) Tests (The Peak)

E2E tests simulate a real user interacting with the fully deployed application.

*   **Scope:** The entire application stack. From clicking a button in the frontend browser, routing through the API gateway, hitting the backend service, reading from the database, and returning the result to the UI.
*   **Dependencies:** The fully deployed, production-like environment.
*   **Execution Speed:** Very slow (minutes to hours).

> [!WARNING]
> **The Ice Cream Cone Anti-Pattern:** A massive suite of slow E2E UI tests, very few integration tests, and almost no unit tests. This leads to multi-hour CI pipelines, exhausted developers, and a culture where people ignore failing tests because "it's probably just a flaky UI test."
