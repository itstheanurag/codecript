---
title: Hash Tables
order: 6
---

**Hash Tables** (also known as HashMaps or Dictionaries) are incredibly powerful structures that provide near-constant time lookups. They work by using a **Hash Function** to map keys to specific indices in an array.

![Pencil sketch of a Hash Table](/home/gaurav/.gemini/antigravity/brain/0301a085-3412-430f-ae50-3c32dc593579/hash_table_ds_sketch_1772819691344.png)

## 1. How It Works

1. **Hash Function:** You give the table a key (like a string).
2. **Mapping:** The hash function turns that key into a number (an index).
3. **Collision Resolution:** If two keys map to the same index, we use techniques like **Chaining** (linked list in each bucket) as shown in the sketch.

---

## 2. Complexity Analysis

| Operation     | Average Case | Worst Case |
| :------------ | :----------- | :--------- |
| **Insertion** | O(1)         | O(n)       |
| **Search**    | O(1)         | O(n)       |
| **Deletion**  | O(1)         | O(n)       |

---

## 3. Multi-Language Implementations

```java
import java.util.HashMap;
HashMap<String, Integer> map = new HashMap<>();
map.put("Alice", 25);
int age = map.get("Alice");
```

```cpp
#include <unordered_map>
std::unordered_map<std::string, int> map;
map["Alice"] = 25;
```

```python
# Dicts are hash tables
inventory = {"Apples": 50, "Bananas": 30}
count = inventory["Apples"]
```

```typescript
const map = new Map<string, number>();
map.set("Alice", 25);
```

```go
inventory := make(map[string]int)
inventory["Apples"] = 50
```

---

## 4. Why Use Hash Tables?

- **Speed:** Fastest lookup for key-value pairs.
- **Deduplication:** Effortlessly keeping track of unique items.
- **Frequency Counting:** Counting occurrences of elements in a list.

Next, we'll branch out into hierarchical data structures with **Trees**.
