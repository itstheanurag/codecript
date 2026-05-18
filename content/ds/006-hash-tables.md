---
title: Associative Arrays: Hash Tables
order: 6
---

A **Hash Table** (or Hash Map) is a data structure that implements an associative array—a structure that maps individual **Keys** to **Values**. It is the most powerful tool in a developer's kit for achieving **O(1) Average Time** for search, insertion, and deletion.

---

## 1. The Hashing Mechanism

The core of a hash table is the **Hash Function**.
1. It takes a key of any size (like a string "Alice").
2. It outputs a fixed-size integer (the "Hash").
3. This integer is used as an index in an underlying array (the "Bucket").

**A Perfect Hash Function** would map every unique key to a unique index. In reality, multiple keys often map to the same index, causing a **Collision**.

---

## 2. Collision Resolution Strategies

### I. Separate Chaining
Each bucket in the underlying array is actually the head of a **Linked List**. If two keys collide, they are both stored in that list.
- **Pros**: Simple to implement; table never "fills up."
- **Cons**: Performance degrades to O(N) if many keys cluster in one bucket.

### II. Open Addressing (Probing)
If a collision occurs, the engine looks for the **Next Available** empty slot in the array.
- **Linear Probing**: Checks index+1, index+2, etc.
- **Quadratic Probing**: Checks index+1², index+2², etc.
- **Double Hashing**: Uses a second hash function to determine the step size.

---

## 3. The Load Factor and Resizing

The **Load Factor (α)** is the ratio of stored items to the total number of buckets.
`α = n / k` (where n = items, k = buckets).

- **Performance**: As α increases, collisions become more frequent.
- **Threshold**: Most professional implementations (like Java's HashMap or Python's Dict) trigger a **Resizing** operation when α reaches **0.75**. The table size is doubled, and every key is "Re-hashed" into its new position.

---

## 4. Complexity Analysis

| Operation | Average Case | Worst Case |
| :--- | :--- | :--- |
| **Search** | O(1) | O(N) |
| **Insertion** | O(1)* | O(N) |
| **Deletion** | O(1) | O(N) |

*Worst case occurs when all keys collide into a single bucket or during a resize.*

---

## Interview Pro-Tips: Why use a prime number for table size?
If an interviewer asks why hash tables often have a prime number of buckets:
- **The Answer**: Using a prime number helps distribute keys more evenly, especially if the hash function is not perfect. It minimizes the risk of patterns in the data (like every key being an even number) resulting in all keys mapping to the same set of buckets.

---

## Technical Summary
1. `O(1)`: The performance target for lookups.
2. `Collision`: The inevitable phenomenon where keys overlap.
3. `Hash Function`: Must be deterministic, fast, and uniform.
4. `Memory`: Tradeoff—Hash tables use more memory than arrays to maintain a low Load Factor.
