---
title: Linked Lists
order: 3
---

Unlike arrays, where elements are stored in a single contiguous block, a **Linked List** stores elements in separate containers called **Nodes**. Each node contains the data and a reference (pointer) to the next node in the sequence.

![Pencil sketch of Singly and Doubly Linked Lists](/home/gaurav/.gemini/antigravity/brain/0301a085-3412-430f-ae50-3c32dc593579/linked_list_ds_sketch_1772819602196.png)

## 1. Types of Linked Lists

- **Singly Linked List:** Each node points only to the **next** node.
- **Doubly Linked List:** Each node points to both the **next** and the **previous** node, allowing for two-way traversal.

---

## 2. Multi-Language Implementations (Singly Linked List)

```java
class Node {
    int data;
    Node next;
    Node(int data) { this.data = data; }
}

public class SinglyLinkedList {
    Node head;
    public void add(int data) {
        Node newNode = new Node(data);
        if (head == null) { head = newNode; return; }
        Node current = head;
        while (current.next != null) current = current.next;
        current.next = newNode;
    }
}
```

```cpp
struct Node {
    int data;
    Node* next;
    Node(int val) : data(val), next(nullptr) {}
};

class SinglyLinkedList {
    Node* head = nullptr;
public:
    void add(int data) {
        Node* newNode = new Node(data);
        if (!head) { head = newNode; return; }
        Node* curr = head;
        while (curr->next) curr = curr->next;
        curr->next = newNode;
    }
};
```

```python
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class SinglyLinkedList:
    def __init__(self):
        self.head = None

    def add(self, data):
        new_node = Node(data)
        if not self.head:
            self.head = new_node
            return
        curr = self.head
        while curr.next:
            curr = curr.next
        curr.next = new_node
```

```typescript
class SNode<T> {
  data: T;
  next: SNode<T> | null = null;
  constructor(data: T) {
    this.data = data;
  }
}

class SinglyLinkedList<T> {
  head: SNode<T> | null = null;

  add(data: T): void {
    const newNode = new SNode(data);
    if (!this.head) {
      this.head = newNode;
      return;
    }
    let curr = this.head;
    while (curr.next) curr = curr.next;
    curr.next = newNode;
  }
}
```

```go
type Node struct {
    data int
    next *Node
}

type LinkedList struct {
    head *Node
}

func (ll *LinkedList) Add(data int) {
    newNode := &Node{data: data}
    if ll.head == nil {
        ll.head = newNode
        return
    }
    curr := ll.head
    for curr.next != nil {
        curr = curr.next
    }
    curr.next = newNode
}
```

---

## 3. Complexity Analysis

| Operation               | Singly Linked List | Doubly Linked List |
| :---------------------- | :----------------- | :----------------- |
| **Access (by index)**   | O(n)               | O(n)               |
| **Search**              | O(n)               | O(n)               |
| **Insertion (at head)** | O(1)               | O(1)               |
| **Insertion (at tail)** | O(n)\*             | O(1)\*\*           |

_\*O(n) if you have to traverse to the end, O(1) if you keep a `tail` pointer._  
_\*\*Doubly linked lists almost always keep a `tail` pointer._

---

## 4. Why Use Linked Lists?

- **Dynamic Size:** No need to reallocate the whole list when it grows.
- **Efficient Deletions:** If you have a reference to a node, deleting it is very fast compared to an array.

Next, we'll see how to leverage these nodes to build a **Stack**.
