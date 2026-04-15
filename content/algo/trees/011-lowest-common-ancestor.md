---
title: Lowest Common Ancestor (LCA)
order: 11
---

# Tree Connectivity: Lowest Common Ancestor

The **Lowest Common Ancestor (LCA)** of two nodes $P$ and $Q$ in a tree is defined as the deepest node $A$ that has both $P$ and $Q$ as descendants (where we allow a node to be a descendant of itself). Finding the LCA is a fundamental operation in genealogical modeling, version control systems, and inheritance hierarchies.

---

## 1. Recursive Strategy (General Binary Tree)

For a general binary tree where nodes do not have `parent` pointers, we use a post-order traversal to "Search and Report" upwards.

### The Algorithm:
1. **Base Case**: If the current node is `null`, or if it matches $P$ or $Q$, return the current node.
2. **Recursive Step**: Recursively search for $P$ and $Q$ in the left and right subtrees.
3. **Logic**:
   - If both the left and right searches return a non-null result, the current node is the lowest point where $P$ and $Q$ converge. **Return the current node.**
   - If only one subtree returns a non-null result, it means both nodes are located in that subtree. Bubbling up the result from that side.

---

## 2. Optimized Strategy (Binary Search Tree)

If the tree is a **BST**, we can leverage the ordering property to find the LCA in O(log N) average time without looking at most of the nodes.

- **If $P$ and $Q$ are both smaller than the current node**: The LCA must be in the left subtree.
- **If both are larger**: The LCA must be in the right subtree.
- **If one is smaller and one is larger**: The current node is the split point and therefore the LCA.

---

## 3. Complexity Analysis

| Scenario | Time Complexity | Space Complexity |
| :--- | :--- | :--- |
| **Binary Tree** | O(N) | O(H) |
| **Balanced BST** | O(log N) | O(H) |

- **Time**: In a general tree, we may need to visit all $N$ nodes. In a BST, we only visit nodes along a single path of length $H$.
- **Space**: The depth of the recursion stack is proportional to the height of the tree ($H$).

---

## 4. Implementation (Recursive)

```javascript
function lowestCommonAncestor(root, p, q) {
  // Base Case
  if (!root || root === p || root === q) return root;

  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);

  // If p and q found in different subtrees, root is LCA
  if (left && right) return root;

  // Otherwise return the found node from whichever side it came
  return left || right;
}
```

---

## 5. Interview Pro-Tips: Parent Pointers
If the interviewer mentions that nodes have a **`parent` pointer**:
- **The Answer**: Don't use recursion. This problem becomes similar to finding the intersection point of two linked lists. 
- **The Strategy**: Push all ancestors of node $P$ into a **Hash Set**. Then, traverse up from node $Q$, checking each ancestor against the set. The first match you find is the LCA.

---

## Technical Summary
1. `Deepest Node`: The definition of the "Lowest" ancestor.
2. `Post-order`: The traversal logic used to bubble up findings.
3. `Split Point`: The BST-specific logic for finding convergence.
4. `Ancestor Set`: The optimal O(1) space alternative if parent pointers exist and both are at the same depth.
