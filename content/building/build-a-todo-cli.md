---
title: Build a CLI Todo App
order: 3
---

A command-line todo application is a great beginner project that teaches file I/O, argument parsing, and data serialization.

## Features

- Add a task
- List all tasks
- Mark a task as complete
- Delete a task
- Persist tasks to a JSON file

## Implementation Plan

### 1. Parse Arguments

```bash
todo add "Buy groceries"
todo list
todo done 3
todo delete 3
```

### 2. Data Model

```json
[
  { "id": 1, "text": "Buy groceries", "done": false },
  { "id": 2, "text": "Write blog post", "done": true }
]
```

### 3. File Storage

Read from and write to a `todos.json` file in the user's home directory.

### 4. Display

Format output in a clean table:

```
 #  Status  Task
 1  [ ]     Buy groceries
 2  [x]     Write blog post
```

## Extensions

- Add due dates and priority levels
- Color-code output (overdue in red, done in green)
- Add search and filter commands
- Sync to a remote API
