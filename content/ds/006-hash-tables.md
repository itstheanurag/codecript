---
title: Hash Tables
order: 6
---

A **Hash Table** (or Hash Map) is a data structure that stores data in **key-value pairs**. It uses a special function (the **Hash Function**) to map a key to a specific location in an array, allowing for incredibly fast data retrieval.

---

## 1. The Intuition: "The Post Office"

Imagine a **Post Office** with 1,000 locked P.O. boxes.
1. When you want to store a package, you give the clerk your **Key** (e.g., your name).
2. The clerk runs your name through a formula (the **Hash Function**) that spits out a number, like `412`.
3. Your package goes directly into **Box #412**.
4. To get it back, you just give your name, the clerk calculates `412` again, and goes straight to that box. You don't have to check Box #1, #2, #3... (**O(1) Average Access**)

```mermaid
graph LR
    Key[Key: "Antigravity"] --> HashFunc[Hash Function]
    HashFunc --> Index[Index: 412]
    Index --> Bucket[Bucket 412: "Value"]
    
    subgraph HashArray ["Hash Table Array"]
    B1[...] --- B412[Bucket 412] --- B999[...]
    end
    style HashArray fill:#1a1a1a,stroke:#333
```

---

## 2. Key Operations & Complexity

| Operation | Average | Worst Case | Note |
| :--- | :--- | :--- | :--- |
| **Search** | O(1) | O(n) | Constant time on average. |
| **Insert** | O(1) | O(n) | Instant unless a collision occurs. |
| **Delete** | O(1) | O(n) | Instant search + deletion. |

> [!WARNING]
> The **Worst Case O(n)** happens when every single key hashes to the same box (a **Collision**). Modern hash functions are designed to make this extremely rare.

---

## 3. Multi-Language Implementation

```language-code-tabs
[
  {
    "label": "Javascript",
    "language": "javascript",
    "code": "const map = new Map();\nmap.set(\"name\", \"Antigravity\"); // Insert\nconst val = map.get(\"name\"); // Search"
  },
  {
    "label": "Python",
    "language": "python",
    "code": "my_dict = {}\nmy_dict[\"name\"] = \"Antigravity\" # Insert\nval = my_dict.get(\"name\") # Search"
  },
  {
    "label": "Java",
    "language": "java",
    "code": "HashMap<String, String> map = new HashMap<>();\nmap.put(\"name\", \"Antigravity\");\nString val = map.get(\"name\");"
  },
  {
    "label": "C++",
    "language": "cpp",
    "code": "#include <unordered_map>\nstd::unordered_map<string, string> map;\nmap[\"name\"] = \"Antigravity\";\nstring val = map[\"name\"];"
  }
]
```

---

## 4. Interview Pro-Tips

### The "O(1) Solver"
If you find yourself using a loop inside a loop to search for something (O(n²)), ask yourself: "Can I use a Hash Map to store this data and find it in O(1) instead?" This is the single most common way to optimize an algorithm during an interview.

### Collisions: How to Handle Them
Interviewers love to ask: "What happens if two different keys hash to the same index?"
- **Chaining**: Every box in the array is actually a **Linked List**. Multiple items just hang off the same box.
- **Open Addressing**: If Box #412 is full, look for the next empty box (#413, #414...).

### The "Load Factor"
Hash Tables need extra "breathing room" to stay fast. Most implementations will automatically resize (double in size) when they get about **70-75% full** (the "Load Factor").

### What Interviewers Are Testing
- Do you understand that O(1) is an **average**, not a guarantee?
- Can you explain how a hash function works at a high level?
- Do you know how to handle collisions?

---

## Key Takeaway

Hash Tables are the **superpower** of data structures. They offer near-instant access to data, making them the first tool you should reach for when you need to optimize search-heavy code.
