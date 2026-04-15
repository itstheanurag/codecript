---
title: Introduction to SOLID
order: 1
---

# Introduction to SOLID Principles

The SOLID principles are a collection of five design principles intended to make software designs more understandable, flexible, and maintainable. They were introduced by Robert C. Martin (Uncle Bob) in 2000.

## Why SOLID?

Imagine a codebase where changing one small feature causes regressions in five unrelated modules. This is high **Fragility**. Or a codebase where modules are so intertwined that you can't reuse one without dragging in ten others. This is high **Rigidity**.

SOLID principles minimize these issues by encouraging:
1. **Low Coupling**: Modules should have minimal dependencies on each other.
2. **High Cohesion**: Elements within a module should be strictly related to its purpose.

## The Five Principles

1. **S**: [Single Responsibility Principle (SRP)](./002-single-responsibility)
2. **O**: [Open/Closed Principle (OCP)](./003-open-closed)
3. **L**: [Liskov Substitution Principle (LSP)](./004-liskov-substitution)
4. **I**: [Interface Segregation Principle (ISP)](./005-interface-segregation)
5. **D**: [Dependency Inversion Principle (DIP)](./006-dependency-inversion)

In the following sections, we will explore each principle with **Before** and **After** code examples in TypeScript.
