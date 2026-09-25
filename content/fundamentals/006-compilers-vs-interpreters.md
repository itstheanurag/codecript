---
title: Code Execution Fundamentals
description: Learn how compilers, interpreters, bytecode, and JIT actually turn source into CPU work, and where Python, Go, and JavaScript sit.
order: 6
---

You write Python or TypeScript. The CPU executes machine instructions for *this* chip (x86-64, ARM). Something in the middle translates. That something is a **compiler**, an **interpreter**, or both (bytecode + **JIT**).

The labels on languages are marketing. CPython **compiles** to bytecode then **interprets** it. V8 **JITs**. Go **compiles ahead of time** to a binary. Knowing the pipeline tells you why a program starts fast or runs fast, and why "Python is slow" is incomplete.

> [!TIP]
> **ELI5: Translating a speech**
> **AOT compiler:** translate the whole book, print it, hand the reader a finished English copy. Slow to prepare, fast to read, one edition per language (CPU).
> **Interpreter:** a person at your elbow translating sentence by sentence. Starts immediately, extra work every sentence.
> **JIT:** the interpreter notices "thank you" for the 50th time and writes it on a whiteboard. Hot paths become a compiled book; cold paths stay live-translated.

## 1. Ahead-of-time compilers

**Typical:** C, C++, Rust, Go, Zig.

`go build` / `rustc` produce a native binary. The compiler sees the whole program (or a lot of it), type-checks, optimizes, emits machine code and a calling convention for **one** OS/arch.

- **Run speed:** no translator in the way. Tight loops are C-like (Rust/C) or close (Go).
- **Start speed:** the OS loads a binary and jumps. No VM warmup.
- **Cost:** compile time, less runtime flexibility, **rebuild per platform** (`linux/arm64` ≠ `windows/amd64`) unless you cross-compile.

Go still has a runtime (GC, goroutines). "Compiled" does not mean "no runtime." It means "not interpreting source at run time."

## 2. Interpreters (and the bytecode cheat)

A **pure** interpreter walks the AST and performs operations. Slow.

Most "interpreted" languages **compile to bytecode** first:

```text
source.py  →  .pyc bytecode  →  CPython VM loop
```

The VM is a program in C that switches on opcodes (`LOAD_FAST`, `BINARY_ADD`). Still not native machine code for *your* loop, but cheaper than re-parsing text.

- **Portable:** ship source or bytecode; the VM is per platform.
- **Edit-refresh:** no 5-minute C++ link.
- **Slow hot loops:** every iteration pays the VM. Numeric Python is fast because it spends time in **C extensions**, not in the bytecode loop.

Ruby, PHP, and CPython all live here by default (with optional JITs appearing later).

## 3. Bytecode VMs + JIT

**Typical:** Java (JVM), C# (CLR), JavaScript (V8, JavaScriptCore), sometimes PyPy / LuaJIT.

Pipeline:

1. Source → **bytecode** (`.class`, or V8's internal IR).
2. VM starts by interpreting or quickly compiling.
3. A **profiler** notices hot functions.
4. **JIT** emits optimized machine code (type-specialized, inlined).
5. If assumptions break (the variable was always an int, now it is a string), **deoptimize** back to slow path.

That is why JS is "slow" on first load and "fast" in a long-running server, and why JVM apps have a **warmup** story.

```text
javac App.java   → App.class   →  java App
                     bytecode      interpret + JIT
```

## 4. Where common languages sit

| Language | What actually runs |
| :--- | :--- |
| C / Rust | Native AOT |
| Go | Native AOT + GC runtime |
| Java / Kotlin | Bytecode + JIT (JVM) |
| C# | Bytecode + JIT (or AOT in some modes) |
| JavaScript in Chrome | Parse → bytecode → JIT tiers (V8) |
| CPython | Bytecode + C interpreter (JIT experimental) |
| TypeScript | Erased to JS, then whatever the JS engine does |

**TypeScript does not make JS faster.** It is a compile-time type checker. V8 never sees your types.

## 5. Why this shows up at work

- **Cold start** (Lambda, CLI): AOT binaries and small interpreters win. JVM/JIT want warmup.
- **CPU-bound loops:** move them out of CPython bytecode (numpy, Rust extension) or use a compiled language.
- **"Works on my machine" binaries:** you shipped `darwin/arm64` to `linux/amd64`.
- **Debugging:** a JIT stack trace may not match source lines until you remember source maps / debug symbols.

> [!NOTE]
> "Is Python compiled or interpreted?" The precise answer: **compiled to bytecode, then interpreted (CPython).** Interviewers want that nuance, not a fight.

## What to remember

- CPUs run machine code. Compilers, interpreters, and JITs are different schedules for producing it.
- AOT: fast run, per-platform binary. Interpreter/bytecode: portable, slower hot paths. JIT: slow start, fast hot paths.
- Language marketing ≠ pipeline. Look at what the implementation does.
- TS types and Python types (hints) are not what the CPU sees unless a compiler uses them.
