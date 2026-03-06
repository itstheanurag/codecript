---
title: Arrays
order: 2
---

Arrays are the most fundamental data structure—a contiguous block of memory storing elements of the same type. Because they use a fixed block of memory, they offer incredibly fast access to any element if you know its position (index).

![Pencil sketch of an Array data structure](/home/gaurav/.gemini/antigravity/brain/0301a085-3412-430f-ae50-3c32dc593579/array_ds_sketch_1772819569025.png)

## 1. Key Operations

| Operation     | Time Complexity | Description                                          |
| :------------ | :-------------- | :--------------------------------------------------- |
| **Access**    | O(1)            | Reading a value at a specific index.                 |
| **Search**    | O(n)            | Finding a value (requires looking at every element). |
| **Insertion** | O(n)            | Requires shifting elements to make room.             |
| **Deletion**  | O(n)            | Requires shifting elements to fill the gap.          |

---

## 2. Multi-Language Implementations

```java
public class ArrayExample {
    public static void main(String[] args) {
        int[] scores = {90, 85, 88, 92, 95};
        System.out.println("First score: " + scores[0]); // Access: O(1)

        // Loop through array
        for (int score : scores) {
            System.out.println(score);
        }
    }
}
```

```cpp
#include <iostream>
#include <vector>

int main() {
    // Fixed size array
    int scores[] = {90, 85, 88, 92, 95};
    std::cout << "First score: " << scores[0] << std::endl;

    // Dynamic array (Vector)
    std::vector<int> dynamicScores = {90, 85};
    dynamicScores.push_back(88); // Amortized O(1)

    return 0;
}
```

```python
# Python lists are dynamic arrays
scores = [90, 85, 88, 92, 95]

# Access
print(f"First score: {scores[0]}")

# Appending
scores.append(97) # O(1)

# Slicing (specific to Python)
print(scores[1:3]) # [85, 88]
```

```typescript
const scores: number[] = [90, 85, 88, 92, 95];

// Access
console.log(`First score: ${scores[0]}`);

// Using modern methods
const doubled = scores.map((s) => s * 2);
```

```go
package main
import "fmt"

func main() {
    // Array (fixed size)
    var scores [5]int = [5]int{90, 85, 88, 92, 95}

    // Slice (dynamic size)
    dynamicScores := []int{90, 85}
    dynamicScores = append(dynamicScores, 88)

    fmt.Println("First score:", scores[0])
}
```

---

## 3. Memory Layout

As seen in the sketch above, arrays are **contiguous**. All elements are stored side-by-side in memory. This makes them highly cache-friendly, as the CPU can pre-fetch the next elements easily during iteration.

## 4. When to Use

- **Fast Random Access:** You have the index and need the value instantly.
- **Fixed Size:** When you know the data size upfront (performance optimization).
- **Simple Sequences:** When you just need a list of items to iterate over multiple times.

> [!TIP]
> While basic arrays have a fixed size, most languages provide **Dynamic Arrays** (like `ArrayList`, `vector`, or `slice`) which handle resizing for you.
