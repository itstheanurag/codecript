---
title: Prefix Trees: Tries
order: 10
---

# Tries: Efficient String Retrieval

A **Trie** (derived from "Retrieval") is a specialized tree-based data structure used to store and search strings in a space-efficient and time-efficient manner. It is also known as a **Prefix Tree**.

---

## 1. The Structure: Shared Prefixes

In a Trie, individual characters of a word are stored in nodes. Words with the same prefix share the same set of nodes until they diverge.

- **Nodes**: Each node typically contains a hash map or an array of its children (e.g., 26 slots for English letters).
- **`isEndOfWord`**: A boolean flag marking the end of a complete word.

---

## 2. Operations and Complexity

The primary advantage of a Trie is that the time complexity for search and insertion depends on the **Length of the Word ($L$)**, not the total number of words in the structure ($N$).

| Operation | Complexity | Description |
| :--- | :--- | :--- |
| **Insert** | O(L) | Traverse and create nodes for each character. |
| **Search** | O(L) | Traverse nodes matching characters. |
| **Prefix Search** | O(L) | Determine if any word starts with the given prefix. |

---

## 3. Trie vs. Hash Table

If an interviewer asks why you would use a Trie over a Hash Table for string storage:

### Benefits of Trie:
- **Prefix Matching**: Finding all words starting with "app" is O(L) in a Trie. In a Hash Table, it is O(N*L) because you must scan the entire table.
- **Ordered Iteration**: Words in a Trie can be easily output in alphabetical order.
- **Space Efficiency**: Shares common prefixes, which can save memory if many words start with the same characters.

### Drawbacks of Trie:
- **High Memory Overhead**: If words have no common prefixes, the number of nodes (and their empty children arrays) can consume more memory than a compact Hash Table.

---

## 4. Practical Applications

1. **Autofill / Autocomplete**: Providing suggestions as the user types.
2. **Spell Checkers**: Quickly validating if a word exists in a dictionary.
3. **Longest Prefix Match**: Used in IP routing to determine the best match for a packet's destination address.

---

## Interview Pro-Tips: Optimizing Space
A common follow-up question: **"How can you reduce the memory usage of a Trie?"**
- **The Answer**: Use a **Compressed Trie** (or Radix Tree). Instead of every node having only one character, you merge nodes with only one child into a single node with multiple characters (e.g., "p" -> "p" -> "l" -> "e" becomes "apple").

---

## Technical Summary
1. `Prefix`: The defining feature—common start strings are shared.
2. `O(L)`: Performance is determined by the data itself, not the dataset size.
3. `Alphabet Size`: The memory overhead is proportional to the number of characters in the alphabet.
