---
title: Stacks
order: 4
---

A **Stack** is a linear data structure that follows the **LIFO (Last In, First Out)** principle. It's essentially a list where you can only add or remove items from one end.

---

## 1. The Intuition: "A Stack of Plates"

Imagine a **Stack of Plates** in a cafeteria.
1. When a clean plate is added, it goes on the **very top**. (**Push**)
2. When someone needs a plate, they take the one from the **very top**. (**Pop**)
3. The plate that was washed *last* is the one that gets used *first*. (**LIFO**)
4. You can peek at the top plate to see if it's clean, but you can't see the plates underneath. (**Peek**)

---

## 2. Key Operations & Complexity

| Operation | Time Complexity | Description |
| :--- | :--- | :--- |
| **Push** | O(1) | Add an item to the top. |
| **Pop** | O(1) | Remove the item from the top. |
| **Peek** | O(1) | Look at the top item without removing it. |
| **isEmpty**| O(1) | Check if the stack is empty. |

---

## 3. Multi-Language Implementation

```language-code-tabs
[
  {
    "label": "Javascript",
    "language": "javascript",
    "code": "const stack = [];\nstack.push(1); // Push\nconst top = stack.pop(); // Pop"
  },
  {
    "label": "Python",
    "language": "python",
    "code": "stack = []\nstack.append(1) # Push\ntop = stack.pop() # Pop"
  },
  {
    "label": "Java",
    "language": "java",
    "code": "Stack<Integer> stack = new Stack<>();\nstack.push(1);\nint top = stack.pop();"
  },
  {
    "label": "C++",
    "language": "cpp",
    "code": "#include <stack>\nstd::stack<int> s;\ns.push(1);\ns.pop();"
  }
]
```

---

## 4. Interview Pro-Tips

### Use Stacks for "Undo" or "Backtracking"
If a problem involves going back to a previous state (like the "Undo" button in Word, or the "Back" button in your browser), a Stack is the natural solution.

### Matching Parentheses
This is the #1 Stack interview question. To check if brackets like `{[()]}` are balanced, you push open brackets onto a stack and pop them when you see a closing bracket. If the popped bracket doesn't match, or the stack isn't empty at the end, it's unbalanced.

### Recursive to Iterative
Every recursive function uses the **System Call Stack** under the hood. If an interviewer asks you to convert a recursive solution to an iterative one to avoid "Stack Overflow," you'll almost always use an explicit `Stack` data structure to mimic the recursion.

### What Interviewers Are Testing
- Do you understand the LIFO principle?
- Can you identify problems that require "reversing" or "nested" logic?
- Do you know the difference between the Call Stack and the Stack data structure?

---

## Key Takeaway

Stacks are simple but powerful. They are the backbone of recursion, expression evaluation, and any process that needs to remember "where it just was."
