---
title: Build a Todo CLI
order: 5
---

A CLI (Command Line Interface) is the perfect way to learn about file I/O, argument parsing, and data persistence without the complexity of a web UI.

---

## 1. The Blueprint (Requirements)

We want to build a tool that lets us:
- `add` a task
- `list` all tasks
- `done` a task (mark as completed)
- `remove` a task

---

## 2. Step-by-Step Implementation

### Step 1: Handling Commands
The program should look at the arguments passed in.

**Conceptual Logic:**
```python
if command == "add":
    add_task(arguments)
elif command == "list":
    show_all_tasks()
```

### Step 2: Persistence
We need a place to store the tasks so they don't disappear when the program closes.
- **Option 1: JSON File**: Simple, readable, and easy to parse.
- **Option 2: SQLite**: Better if you have thousands of tasks and need complex searching.

---

## 3. Implementation Logic

1.  **Read**: Load the existing JSON file into memory.
2.  **Modify**: Add or remove the task from the list.
3.  **Write**: Save the memory list back to the JSON file.

---

## Key Takeaway

Building a CLI teaches you the core "CRUD" (Create, Read, Update, Delete) cycle that powers almost every software system in the world.
