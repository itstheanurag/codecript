---
title: Hierarchical Models: Trees
order: 7
---

# Trees: Non-Linear Hierarchical Structures

A **Tree** is a non-linear data structure used to represent hierarchical relationships. Unlike arrays or linked lists, which are linear sequences, a tree organizes data into **Nodes** connected by **Edges**, starting from a single **Root** node.

---

## 1. Key Terminology

- **Root**: The top-most node (no parent).
- **Edge**: The link between a parent and a child.
- **Leaf**: A node with no children.
- **Depth**: The number of edges from the root to a specific node.
- **Height**: The number of edges from a node to the deepest leaf in its subtree.

---

## 2. Binary Tree and Binary Search Tree (BST)

### I. Binary Tree
A tree where every node has at most **two** children (Left and Right).

### II. Binary Search Tree (BST)
A binary tree with a specific ordering property:
- For every node, all values in its **Left Subtree** are smaller.
- All values in its **Right Subtree** are larger.

**Complexity**: 
- **Average Case**: O(log N) for search, insert, and delete.
- **Worst Case**: O(N) if the tree becomes "Unbalanced" (skewed into a linked list).

---

## 3. Self-Balancing Trees (AVL and Red-Black)

To prevent the O(N) worst-case scenario, we use self-balancing trees. They perform "Rotations" during insertion and deletion to ensure the height remained logarithmic (O(log N)).

- **AVL Trees**: Strict balancing; better for search-intensive applications.
- **Red-Black Trees**: Less strict balancing; faster for insertion and deletion (used in many standard libraries like Java's `TreeMap`).

---

## 4. Tree Traversals

There are three primary ways to visit every node in a binary tree:

1. **In-order (Left, Root, Right)**: Visiting nodes in ascending order (only in a BST).
2. **Pre-order (Root, Left, Right)**: Useful for creating a copy of the tree.
3. **Post-order (Left, Right, Root)**: Useful for deleting the tree or evaluating mathematical expressions.

---

## 5. Breadth-First Search (Level-Order)

Unlike the "Depth-First" traversals above, **Level-Order** traversal visits nodes level by level. As discussed in Module 5, this is implemented using a **Queue**.

---

## Interview Pro-Tips: Binary Search Tree vs. Hash Table
If an interviewer asks when to use a BST over a Hash Table:
- **Hash Table**: Use when you only need O(1) lookups and don't care about the order of data.
- **BST**: Use when you need to keep data in a **Sorted Order** or when you need to perform "Range Queries" (e.g., "Find all users between age 20 and 30").

---

## Technical Summary
1. `Binary`: At most two children.
2. `Logarithmic`: The target height for efficient operations.
3. `Recursion`: Trees are inherently recursive—each child is the root of its own "Sub-tree."
4. `Balance`: The key to maintaining O(log N) performance.
