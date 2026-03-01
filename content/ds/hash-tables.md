---
title: Hash Tables
order: 3
---

Hash tables (hash maps, dictionaries) provide near-constant time lookups by mapping keys to array indices through a hash function.

## How They Work

1. A key is passed through a hash function
2. The hash is mapped to an index in an underlying array
3. The value is stored at that index
4. Collisions are resolved via chaining or open addressing

## Key Operations

| Operation | Average | Worst |
| --------- | ------- | ----- |
| Insert    | O(1)    | O(n)  |
| Lookup    | O(1)    | O(n)  |
| Delete    | O(1)    | O(n)  |

Worst case occurs when all keys hash to the same bucket. Good hash functions and proper load factor management prevent this.

## Common Interview Patterns

- **Frequency counting** — count occurrences of elements
- **Two sum** — find pairs that sum to a target
- **Grouping** — group elements by a shared property
- **Caching** — memoize expensive function calls
