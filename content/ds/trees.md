---
title: Trees
order: 4
---

A tree is a hierarchical data structure consisting of nodes connected by edges, with a single root node and no cycles.

## Binary Trees

Each node has at most two children: left and right.

## Binary Search Trees (BST)

A binary tree where left child < parent < right child. This ordering enables efficient search.

| Operation | Average  | Worst |
| --------- | -------- | ----- |
| Search    | O(log n) | O(n)  |
| Insert    | O(log n) | O(n)  |
| Delete    | O(log n) | O(n)  |

Worst case happens when the tree degenerates into a linked list (all nodes on one side).

## Traversals

- **In-order** (Left, Root, Right) — produces sorted output for BSTs
- **Pre-order** (Root, Left, Right) — useful for copying or serializing
- **Post-order** (Left, Right, Root) — useful for deletion
- **Level-order** (BFS) — visit nodes level by level using a queue

## Balanced Trees

AVL trees and Red-Black trees self-balance to guarantee O(log n) operations.
