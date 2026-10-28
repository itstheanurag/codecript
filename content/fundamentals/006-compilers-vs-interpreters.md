---
title: Code Execution Fundamentals
description: How source becomes running code — lexing, parsing, IR, optimisation, interpreters, bytecode VMs, JITs, deoptimisation, and the performance trade-offs of each model.
order: 6
---

Compilers and interpreters are two points on a spectrum of **when** translation happens. Modern runtimes mix both.

## The compilation pipeline

```
source
  -> lexer       tokens
  -> parser      AST
  -> semantic analysis / type checking
  -> IR           (SSA / bytecode / graph)
  -> optimisation
  -> codegen     machine code, bytecode, or another language
```

Key stages:

- **Lexing** turns characters into tokens.
- **Parsing** builds an abstract syntax tree (grammar).
- **Semantic analysis** resolves names, types, scopes; rejects invalid programs.
- **IR** is a representation optimisers can reason about (LLVM IR, JVM bytecode, V8 TurboFan graph).
- **Optimisation** removes work: constant folding, dead-code elimination, inlining, loop-invariant hoisting, escape analysis.
- **Codegen** emits machine code, bytecode, or WASM.

## Interpreters

An interpreter executes the AST or bytecode directly.

- **Pros:** fast startup, simple distribution, dynamic features.
- **Cons:** per-instruction overhead, harder optimisation.

Most "interpreted" languages compile to **bytecode** first (Python `.pyc`, Ruby YARV, JVM, .NET IL). A bytecode VM is still an interpreter, but with a compact, cache-friendly instruction set.

## JIT compilation

A **just-in-time** compiler profiles running code and compiles hot paths to machine code.

```
interpreter -> baseline JIT -> optimising JIT -> deopt on assumption failure
```

Benefits:

- near-native speed for hot loops,
- type feedback enables speculative optimisations (inline caches, shape checks).

Costs:

- **warmup**: cold code is slow; p99 latency can be dominated by compilation,
- memory for code/profiles,
- **deoptimisation** cliffs when assumptions break,
- complexity in debugging.

V8, JVM HotSpot, .NET RyuJIT, and PyPy all follow this shape.

## AOT compilation

Ahead-of-time compilers emit machine code before execution (C, C++, Rust, Go, Swift).

- **Pros:** predictable performance, fast startup, no JIT warmup, smaller runtime.
- **Cons:** platform-specific binaries, longer builds, less runtime adaptivity.

Go compiles quickly and statically; Rust does more optimisation and borrow checking at compile time.

## Comparing models

| Model | Startup | Steady-state | Portability | Example |
|---|---|---|---|---|
| AST interpreter | fast | slow | high | early Ruby, toy languages |
| Bytecode VM | fast | medium | high | Python, JVM (interpreter mode) |
| JIT | medium | fast | high | V8, HotSpot, .NET |
| AOT | very fast | fast/predictable | low (per target) | C/C++/Rust/Go |
| WASM | fast | near-native | high (sandboxed) | browsers, edge |

No model wins everywhere: a CLI wants startup; a long-running server wants steady-state; a browser wants safety and portability.

## Optimisations worth knowing

- **Inlining** removes call overhead and enables further optimisation.
- **Devirtualisation** turns dynamic dispatch into direct calls when the target is known.
- **Escape analysis** moves heap allocations to the stack (or removes them).
- **Loop unrolling / vectorisation** increases instruction-level parallelism.
- **Dead-code elimination** removes unused work.
- **Constant propagation/folding** computes at compile time.

When a runtime cannot prove an assumption, it inserts a guard; if the guard fails at runtime, it **deoptimises** back to the interpreter. That is why polymorphic code can be dramatically slower than monomorphic code.

## Practical implications

- **Warmup-aware benchmarking.** Measure p50/p99 after warmup, and cold-start separately.
- **Avoid megamorphic call sites** in hot paths (many object shapes/types).
- **Serverless**: startup/JIT warmup dominates; prefer smaller bundles and AOT-friendly runtimes.
- **Serialization/parsing** often dominates over raw compute; optimise the pipeline, not the loop.
- **Binary size** affects cold start and deployment time.

## Undefined behaviour and safety

C/C++ undefined behaviour lets the optimiser assume it never happens; the result can be arbitrary. Rust's borrow checker and Go's bounds checks trade some peak performance for safety. WASM enforces sandboxing and memory safety at the cost of some indirection.

## Failure modes

| Symptom | Cause |
|---|---|
| First requests slow, then fast | JIT warmup / cache warmup |
| Occasional huge latency spikes | deopt, GC, compilation |
| Fast locally, slow in prod | different data shapes, missing JIT tier |
| Build times explode | heavy templates/monomorphisation/LTO |
| Crash only with optimisations | undefined behaviour |
| Serverless cold starts | runtime init + JIT |

## Interview prompts

1. "Is Python interpreted?" → bytecode VM, with optional JITs (PyPy); semantics differ from AOT.
2. "Why is the first request slow in Node/Java?" → JIT warmup, lazy module loading, cache warmth.
3. "When would you choose AOT over JIT?" → predictable latency, fast startup, constrained environments.

## Checklist

- [ ] I know whether my runtime is interpreted, JIT, or AOT.
- [ ] Cold start and steady-state performance are measured separately.
- [ ] Hot paths avoid megamorphic dispatch and unnecessary allocation.
- [ ] Benchmarks account for warmup and deopt.
- [ ] I understand the safety/UB model of my language.
- [ ] Binary/bundle size is considered for startup.
