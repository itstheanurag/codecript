---
title: Trees
order: 7
---

While arrays and linked lists are linear, a **Tree** is a hierarchical data structure. It starts with a single **Root** node, which branches off into **Children** nodes, creating a parent-child relationship.

![Pencil sketch of a Binary Search Tree](/home/gaurav/.gemini/antigravity/brain/0301a085-3412-430f-ae50-3c32dc593579/trees_ds_sketch_v3_retry_1772819729944.png)

## 1. Binary Search Tree (BST)

A common and powerful type of tree is the **Binary Search Tree**. It follows a strict rule:

- The **Left** child's value must be _less_ than the parent's value.
- The **Right** child's value must be _greater_ than the parent's value.

This rule makes searching for an item extremely fast: **O(log n)**.

---

## 2. Multi-Language Implementations (BST Insert)

```java
class Node {
    int val; Node left, right;
    Node(int val) { this.val = val; }
}
public TreeNode insert(TreeNode root, int val) {
    if (root == null) return new TreeNode(val);
    if (val < root.val) root.left = insert(root.left, val);
    else root.right = insert(root.right, val);
    return root;
}
```

```cpp
struct Node {
    int val; Node *left, *right;
    Node(int v) : val(v), left(NULL), right(NULL) {}
};
Node* insert(Node* root, int val) {
    if (!root) return new Node(val);
    if (val < root->val) root->left = insert(root->left, val);
    else root->right = insert(root->right, val);
    return root;
}
```

```python
class Node:
    def __init__(self, val):
        self.val = val
        self.left = self.right = None

def insert(root, val):
    if not root: return Node(val)
    if val < root.val: root.left = insert(root.left, val)
    else: root.right = insert(root.right, val)
    return root
```

```typescript
class TNode {
  val: number;
  left: TNode | null = null;
  right: TNode | null = null;
  constructor(v: number) {
    this.val = v;
  }
}
function insert(root: TNode | null, val: number): TNode {
  if (!root) return new TNode(val);
  if (val < root.val) root.left = insert(root.left, val);
  else root.right = insert(root.right, val);
  return root;
}
```

```go
type Node struct {
    val int
    left, right *Node
}
func insert(root *Node, val int) *Node {
    if root == nil { return &Node{val: val} }
    if val < root.val {
        root.left = insert(root.left, val)
    } else {
        root.right = insert(root.right, val)
    }
    return root
}
```

---

## 3. Tree Traversals

1. **In-Order (Left, Root, Right):** Ascending order for BST.
2. **Pre-Order (Root, Left, Right):** Copying/Serializing.
3. **Post-Order (Left, Right, Root):** Deletion/Expression analysis.

Next, we'll look at a specific type of tree used for priority: **Heaps**.
