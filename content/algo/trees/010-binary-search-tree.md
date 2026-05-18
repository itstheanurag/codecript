---
title: Binary Search Tree (BST)
order: 10
---

A **Binary Search Tree (BST)** is a node-based binary tree data structure which has the following properties:
- The **Left Subtree** of a node contains only nodes with keys lesser than the node’s key.
- The **Right Subtree** of a node contains only nodes with keys greater than the node’s key.
- The left and right subtree each must also be a binary search tree.

---

## 1. Core Operations

### I. Search and Insert
Both operations use the BST property to eliminate half of the tree at each step. 
- **Search**: Start at the root and move left if target < current, or right if target > current.
- **Insert**: Search for the target value; when you reach a `null` child that satisfies the ordering, attach the new node there.

### II. Deletion
Deletion is the most complex operation in a BST and involves three scenarios:
1. **Node is a Leaf**: Simply remove the node.
2. **Node has One Child**: Copy the child to the node and delete the child.
3. **Node has Two Children**: Find the **In-order Successor** (the smallest node in the right subtree), copy its value to the current node, and delete the successor.

---

## 2. Complexity Analysis

| Operation | Average Case | Worst Case (Skewed) |
| :--- | :--- | :--- |
| **Search** | O(log N) | O(N) |
| **Insert** | O(log N) | O(N) |
| **Delete** | O(log N) | O(N) |

**The Skewed Case**: If items are inserted in sorted order (e.g., 1, 2, 3, 4, 5), the BST becomes a single line, essentially a Linked List. This is why **Self-Balancing Trees** (like AVL or Red-Black) are used in production.

---

## 3. Implementation (Recursive)

```javascript
class Node {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}

function insert(root, val) {
  if (!root) return new Node(val);
  
  if (val < root.val) {
    root.left = insert(root.left, val);
  } else {
    root.right = insert(root.right, val);
  }
  return root;
}
```

---

## 4. Key Properties to Remember

- **In-order Traversal**: Performing an in-order traversal (Left → Root → Right) on a BST always returns the elements in **Sorted Order**.
- **Successor/Predecessor**: The in-order successor of a node is the node with the smallest key greater than the current node's key.

---

## Interview Pro-Tips: Why use a BST?
If an interviewer asks why we use BSTs instead of just sorting an array:
- **Dynamic Data**: Unlike a sorted array, which requires O(N) time for every insertion (to shift elements), a balanced BST allows for O(log N) insertions. This makes BSTs superior for datasets that are frequently changing while needing to remain searchable.
- **Complexity Progression**: Always start by mentioning the O(log N) average, but proactively mention the O(N) worst case and the solution (Self-Balancing Trees) to show seniority.

---

## Technical Summary
1. `Binary Search Property`: The fundamental rule for navigation.
2. `Logarithmic`: The target efficiency for a balanced tree.
3. `In-order`: The mechanism for retrieving data in sorted order.
4. `Balancing`: Necessary to prevent performance degradation in production.
