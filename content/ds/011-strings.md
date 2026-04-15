---
title: String Manipulation Internals
order: 11
---

# Strings: The Sequence of Characters

In most modern programming languages, a **String** is more than just an array of characters. It is an abstract data structure with specific memory and performance properties. Understanding these internals—especially **Immutability** and **Allocation**—is key to writing performant code for text processing.

---

## 1. Immutability and Memory

In languages like **Java**, **Python**, and **JavaScript**, strings are **Immutable**. This means once a string is created, its content cannot be changed.

### Why Immutability?
- **Security**: Strings are used for passwords, URLs, and file paths. If they were mutable, a malicious process could change them after they were validated.
- **Caching (String Pooling)**: If two variables contain the same string `"Hello"`, they can both point to the same memory address in a "String Pool," saving RAM.
- **Thread Safety**: Immutable objects are inherently thread-safe.

### The Cost
Every time you "Modify" a string (e.g., `s += "!"`), you are technically creating a **Brand New String** and copying the entire old string into it. In a loop, this leads to **O(N²)** performance.

**The Solution**: Use a specialized mutable buffer, like `StringBuilder` (Java/C#) or a `[]byte` slice (Go).

---

## 2. Encoding: ASCII vs. UTF-8

- **ASCII**: Uses 7 bits to represent 128 characters. Only supports English and basic symbols.
- **Unicode (UTF-8)**: A variable-width encoding that can represent characters from almost every language. A single "Character" (Grapheme) can be between 1 and 4 bytes long.

**Interviewer Pro-Tip**: In Go or Rust, indices refer to **Bytes**, not characters. `s[0]` might only give you the first bit of a multi-byte emoji character.

---

## 3. String Matching Algorithms

Finding a "Pattern" (P) inside a "Text" (T) is a classic problem.

1. **Naive Approach (O(N*M))**: Slide the pattern across the text and check characters one-by-one.
2. **KMP (Knuth-Morris-Pratt)**: Pre-processes the pattern to determine how much to "skip" when a mismatch occurs.
    - **Complexity**: O(N + M)
3. **Rabin-Karb**: Uses **Rolling Hashes** to compare segments of the text with the pattern hash.

---

## 4. Complexity of Operations

| Operation | Complexity | Description |
| :--- | :--- | :--- |
| **Random Access** | O(1) | Assuming fixed-width encoding (e.g. ASCII). |
| **Concatenation** | O(N+M) | Requires creating a new string and copying both. |
| **Sub-string** | O(K) | Depends on implementation (some copy, some share memory). |

---

## Interview Pro-Tips: Palindromes and Anagrams
- **Anagrams**: Two strings are anagrams if they contain the same characters. To check this: Sort both (O(N log N)) or use a Frequency Map (O(N) time, O(1) space since there are only 256 ASCII chars).
- **Palindromes**: Use **Two Pointers** (start and end) moving towards the middle.

---

## Technical Summary
1. `Immutability`: The reason string concatenation in a loop is a performance "Antipattern."
2. `Memory Pools`: Optimizing RAM usage by sharing identical string references.
3. `Encodings`: The difference between a byte, a character, and a rune.
