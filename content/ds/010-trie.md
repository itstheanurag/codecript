---
title: Tries (Prefix Trees)
order: 10
---

A **Trie** (pronounced "try") is a specialized tree data structure used to store a set of strings. It is optimized for **prefix searching**.

![Pencil sketch of a Trie data structure](/home/gaurav/.gemini/antigravity/brain/0301a085-3412-430f-ae50-3c32dc593579/trie_ds_sketch_1772819830103.png)

## 1. Multi-Language Implementations (Insert Word)

```java
class Node { Map<Character, Node> children = new HashMap<>(); boolean isEnd; }
public void insert(String word) {
    Node curr = root;
    for (char c : word.toCharArray()) {
        curr.children.putIfAbsent(c, new Node());
        curr = curr.children.get(c);
    }
    curr.isEnd = true;
}
```

```cpp
struct Node { std::unordered_map<char, Node*> children; bool isEnd = false; };
void insert(string word) {
    Node* curr = root;
    for (char c : word) {
        if (!curr->children.count(c)) curr->children[c] = new Node();
        curr = curr->children[c];
    }
    curr->isEnd = true;
}
```

```python
class Node:
    def __init__(self): self.children = {}; self.is_end = False
def insert(word):
    curr = root
    for char in word:
        if char not in curr.children: curr.children[char] = Node()
        curr = curr.children[char]
    curr.is_end = True
```

```typescript
class TNode { children = new Map<string, TNode>(); isEnd = false; }
insert(word: string): void {
    let curr = this.root;
    for (const char of word) {
        if (!curr.children.has(char)) curr.children.set(char, new TNode());
        curr = curr.children.get(char)!;
    }
    curr.isEnd = true;
}
```

```go
type Node struct { children map[rune]*Node; isEnd bool }
func (t *Trie) Insert(word string) {
    curr := t.root
    for _, r := range word {
        if _, ok := curr.children[r]; !ok { curr.children[r] = &Node{children: make(map[rune]*Node)} }
        curr = curr.children[r]
    }
    curr.isEnd = true
}
```

---

Congratulations! You have completed the foundation of Data Structures. Mastering these concepts is the key to writing professional, efficient, and scalable software.
