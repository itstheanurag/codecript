---
title: Arrays
order: 2
---

Arrays are the most fundamental data structure—a contiguous block of memory storing elements of the same type. Because they use a fixed block of memory, they offer incredibly fast access to any element if you know its position (index).

---

## 1. The Intuition: "The Egg Carton"

Imagine an **egg carton**.
1. To get the 3rd egg, you don't need to look at the 1st or 2nd; you know exactly where it is. (**O(1) Access**)
2. But if you want to put a new "mega-egg" in the 1st slot, you have to shift every other egg one spot to the right to make room. (**O(n) Insertion**)
3. If the carton only has 12 slots, and you want a 13th egg, you need to buy a whole new, bigger carton and move all your eggs into it. (**Dynamic Array Resizing**)

---

## 2. Key Operations & Complexity

| Operation     | Time Complexity | Why?                                          |
| :------------ | :-------------- | :-------------------------------------------- |
| **Access**    | O(1)            | Direct memory addressing via index.           |
| **Search**    | O(n)            | In the worst case, you check every element.   |
| **Insertion** | O(n)            | Shifting elements to make room takes time.    |
| **Deletion**  | O(n)            | Filling the gap requires shifting elements.   |

---

## 3. Multi-Language Implementation

```language-code-tabs
[
  {
    "label": "Javascript",
    "language": "javascript",
    "code": "// JS Arrays are dynamic by default\nconst scores = [90, 85, 88, 92, 95];\n\n// Access (O(1))\nconsole.log(scores[0]); \n\n// Add to end (Amortized O(1))\nscores.push(98);\n\n// Insert at index 1 (O(n))\nscores.splice(1, 0, 87);"
  },
  {
    "label": "Python",
    "language": "python",
    "code": "# Python Lists are dynamic arrays\nscores = [90, 85, 88, 92, 95]\n\n# Access\nprint(scores[0])\n\n# Append\nscores.append(98)\n\n# Insert\nscores.insert(1, 87)"
  },
  {
    "label": "Java",
    "language": "java",
    "code": "// Fixed-size Array\nint[] scores = new int[]{90, 85, 88, 92, 95};\n\n// Dynamic Array (ArrayList)\nArrayList<Integer> dynamicScores = new ArrayList<>();\ndynamicScores.add(90); // O(1) amortized"
  },
  {
    "label": "C++",
    "language": "cpp",
    "code": "// Fixed-size\nint arr[5] = {90, 85, 88, 92, 95};\n\n// Dynamic (std::vector)\nstd::vector<int> vec = {90, 85};\nvec.push_back(88);"
  },
  {
    "label": "Go",
    "language": "go",
    "code": "// Array (fixed)\nvar arr [5]int = [5]int{90, 85, 88, 92, 95}\n\n// Slice (dynamic)\nslice := []int{90, 85}\nslice = append(slice, 88)"
  }
]
```

---

## 4. Interview Pro-Tips

### Look for "Direct Access"
If the problem requires frequent random access to elements (e.g., "Get the 500th item"), an Array is your best friend.

### Watch for "Contiguous Memory"
Arrays are stored in one single block. This is why they are **Cache-Friendly**. Iterating through an array is lightning fast because the CPU can predict the next memory address easily.

### The "Dynamic Array" Secret
When a dynamic array (like `ArrayList` or `std::vector`) runs out of space, it usually **doubles** its size. This "doubling" happens rarely, which is why insertion at the end is considered **Amortized O(1)** (O(n) occasionally, but O(1) on average).

### What Interviewers Are Testing
- Do you understand the cost of shifting elements?
- Can you explain why access is O(1)? (Hint: Base Address + Index * Size)
- Do you know the difference between a fixed array and a dynamic one?

---

## Key Takeaway

Arrays are the workhorse of data structures. They are simple, fast for access, and incredibly memory-efficient, but they pay the price when you need to grow or shrink them frequently.
