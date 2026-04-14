---
title: Linked Lists
order: 3
---

A **Linked List** is a linear data structure where elements are not stored in contiguous memory locations. Instead, each element (called a **Node**) points to the next one, forming a chain.

---

## 1. The Intuition: "The Treasure Hunt"

Imagine a **Treasure Hunt**.
1. You have a scrap of paper (a **Node**) with a message and the location of the *next* scrap of paper.
2. To find the 5th clue, you **must** start at the 1st, then go to the 2nd, the 3rd, and so on. You can't just jump to clue #5. (**O(n) Access**)
3. If you want to insert a new clue between #2 and #3, you just change the address on clue #2 to point to your new scrap, and make your new scrap point to clue #3. No one else has to move! (**O(1) Insertion**)

---

## 2. Types of Linked Lists

| Type | Description | Pros/Cons |
| :--- | :--- | :--- |
| **Singly** | Each node points to the *next* node only. | Smallest memory footprint. |
| **Doubly** | Each node points to *both* the next and previous nodes. | Easier to traverse backwards, but uses more memory. |
| **Circular**| The last node points back to the first node. | Great for round-robin scheduling (e.g., player turns in a game). |

---

## 3. Key Operations & Complexity

| Operation     | Time Complexity | Note |
| :------------ | :-------------- | :--- |
| **Access**    | O(n)            | Must traverse from the head. |
| **Search**    | O(n)            | Must traverse and check each node. |
| **Insertion** | O(1)            | If you already have a pointer to the location. |
| **Deletion**  | O(1)            | If you already have a pointer to the node. |

---

## 4. Multi-Language Implementation (Singly)

```language-code-tabs
[
  {
    "label": "Javascript",
    "language": "javascript",
    "code": "class Node {\n  constructor(val) {\n    this.val = val;\n    this.next = null;\n  }\n}\n\nconst head = new Node(1);\nhead.next = new Node(2);\nhead.next.next = new Node(3);"
  },
  {
    "label": "Python",
    "language": "python",
    "code": "class Node:\n    def __init__(self, val):\n        self.val = val\n        self.next = None\n\nhead = Node(1)\nhead.next = Node(2)\nhead.next.next = Node(3)"
  },
  {
    "label": "Java",
    "language": "java",
    "code": "class Node {\n    int val;\n    Node next;\n    Node(int x) { val = x; }\n}\n\nNode head = new Node(1);\nhead.next = new Node(2);"
  },
  {
    "label": "C++",
    "language": "cpp",
    "code": "struct Node {\n    int val;\n    Node* next;\n    Node(int x) : val(x), next(nullptr) {}\n};\n\nNode* head = new Node(1);\nhead->next = new Node(2);"
  }
]
```

---

## 5. Interview Pro-Tips

### The "Slow and Fast Pointer" Pattern
This is the most famous Linked List trick. Use two pointers—one moving at half the speed of the other—to find the **middle** of a list or to **detect a cycle** (Floyd’s Cycle-Finding Algorithm).

### Use a "Dummy Head"
When inserting or deleting nodes (especially at the beginning of the list), creating a temporary "Dummy" node that points to the head can simplify your code significantly and handle edge cases automatically.

### Reversing a Linked List
This is a standard "Warm-up" question. You should be able to write the iterative version of `reverseList` in your sleep. It involves tracking three pointers: `prev`, `curr`, and `next`.

### What Interviewers Are Testing
- Do you handle the `null` (end of list) pointer correctly?
- Can you manipulate pointers without losing the rest of the list?
- Do you understand the trade-off: O(n) access vs. O(1) insertion?

---

## Key Takeaway

Linked Lists are all about **flexibility**. They don't need a single big block of memory, and they grow effortlessly. Use them when you don't know your data size or when you need frequent insertions and deletions.
