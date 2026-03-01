---
title: Linked Lists
order: 2
---

A linked list stores elements in nodes, each pointing to the next. Unlike arrays, elements aren't stored contiguously in memory.

## Types

- **Singly Linked** — each node points to the next
- **Doubly Linked** — each node points to both next and previous
- **Circular** — the last node points back to the first

## Key Operations

| Operation       | Time   |
| --------------- | ------ |
| Access by index | O(n)   |
| Insert at head  | O(1)   |
| Insert at tail  | O(1)\* |
| Delete by node  | O(1)   |
| Search          | O(n)   |

\*O(1) if you maintain a tail pointer.

## When to Use Linked Lists

- Frequent insertions and deletions at arbitrary positions
- You don't need random access
- Implementing stacks, queues, or LRU caches

## The Runner Technique

Use two pointers moving at different speeds to detect cycles, find midpoints, or identify the kth-to-last element.
