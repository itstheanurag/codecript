---
title: Retrieval: Tries
order: 19
---

# Prefix Trees: Tries

A **Trie** (derived from "Retrieval") is a specialized tree-based data structure used to store and search strings in a space-efficient and time-efficient manner. It is also known as a **Prefix Tree** because every node represents a common prefix of the strings stored within it.

---

## 1. The Structure: Shared Nodes

In a Trie, individual characters of a word are stored in nodes. Words that share a common prefix share the same set of nodes until they diverge.

- **Node Structure**: Each node contains a collection of pointers to its children (representing the alphabet) and a boolean flag `isEndOfWord`.
- **Paths**: To find a word, you follow the path of character nodes starting from the Root.

---

## 2. Operations and Complexity

The primary advantage of a Trie is that performance is determined by the **Length of the Word ($L$)**, not the total number of words ($N$) in the dataset.

| Operation | Time Complexity | Space Complexity |
| :--- | :--- | :--- |
| **Insert** | O(L) | O(L * Average Alphabet Size) |
| **Search** | O(L) | O(1) |
| **Prefix Search** | O(L) | O(1) |

---

## 3. Trie vs. Hash Table

If an interviewer asks for a comparison:

### Trie Advantages:
- **Prefix Matching**: Finding all words starting with "app" is $O(L)$ in a Trie. In a Hash Table, it would require a full scan ($O(N \cdot L)$).
- **Ordered Data**: A DFS traversal of a Trie returns words in alphabetical order.
- **Deduplication**: Automatically handles unique strings and shared prefixes.

### Hash Table Advantages:
- **Absolute Lookup**: A Hash Table can determine if an *entire* word exists in $O(1)$ average time, which is usually faster than $O(L)$ for long strings.
- **Memory**: Tries have high memory overhead due to the large number of child pointers per node.

---

## 4. Implementation (Array-based)

```javascript
class TrieNode {
  constructor() {
    // Array for 26 lowercase English letters
    this.children = new Array(26).fill(null);
    this.isEndOfWord = false;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word) {
    let node = this.root;
    for (const char of word) {
      const idx = char.charCodeAt(0) - 'a'.charCodeAt(0);
      if (!node.children[idx]) {
        node.children[idx] = new TrieNode();
      }
      node = node.children[idx];
    }
    node.isEndOfWord = true;
  }
}
```

---

## 5. Interview Pro-Tips: Space Optimization
- **Sparse Alphabet**: If your alphabet is large (e.g., Unicode), use a **Hash Map** (`Map<char, TrieNode>`) for children instead of a fixed-size array to save space.
- **Compressed Trie (Radix Tree)**: If a node has only one child, you can merge them into a single node with multiple characters (e.g., "p" → "l" → "e" becomes "ple"). This is used in high-performance networking routing tables.

---

## Technical Summary
1. `L`: The length of the string, which governs all performance.
2. `Prefix`: The key to efficient autocomplete and group-based string queries.
3. `isEndOfWord`: The marker that distinguishes a prefix from a complete word.
4. `Alphabet Size`: The primary driver of memory consumption.
