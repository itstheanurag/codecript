---
title: Combinatorial Search: Backtracking
order: 8
---

**Backtracking** is a general algorithmic technique for finding solutions to problems by exploring all possible candidates incrementally. It builds a **State Space Tree** and uses depth-first search (DFS) to traverse it. If a partial candidate is determined to be invalid (it cannot possibly lead to a valid solution), the algorithm "Backtracks" by undoing its last move and trying a different branch.

---

## 1. The Core Pattern: Choose, Explore, Un-choose

Every backtracking algorithm follows a strict three-step loop within its recursive function:

1. **Choose**: Select a potential candidate for the next part of the solution.
2. **Explore**: Move forward and recursively attempt to complete the remaining solution.
3. **Un-choose (Backtrack)**: If the exploration did not result in a valid solution, undo the selection. This resets the state so the next iteration can start with a fresh slate.

---

## 2. Pruning: The Efficiency Engine

The primary difference between standard Brute Force and Backtracking is **Pruning**. 
Pruning is the process of eliminating entire branches of the state space tree the moment they are found to violate the problem's constraints. 

- **Example**: In a Sudoku solver, if you place a `5` in a row that already contains a `5`, you immediately stop and backtrack. You don't wait to fill the rest of the board.

---

## 3. Complexity Analysis

Backtracking problems typically have high theoretical complexity because they explore exponential or factorial state spaces.

| Problem Type | Time Complexity | Space Complexity |
| :--- | :--- | :--- |
| **Permutations** | O(N!) | O(N) |
| **Subsets** | O(2^N) | O(N) |
| **N-Queens** | O(N!) | O(N) |

- **Space**: The depth of the recursion stack is usually O(N), representing the depth of the state space tree.

---

## 4. Implementation Template (Pseudo-Code)

```javascript
function backtrack(state, options) {
    if (isSolution(state)) {
        processResult(state);
        return;
    }

    for (let option of options) {
        if (isValid(option, state)) {
            makeMove(option, state);     // CHOOSE
            backtrack(state, options);   // EXPLORE
            undoMove(option, state);     // UN-CHOOSE
        }
    }
}
```

---

## 5. Interview Pro-Tips: Constraint Satisfaction
- **The "State" is everything**: In an interview, clearly define what your "State" represents (e.g., "The current row being filled" or "The subset being built").
- **Pruning is Mandatory**: A backtracking solution without an explicit `if (isValid)` check is technically just brute force. Always look for ways to "Prune" the search space early.
- **Classic Variants**:
    - **Backtracking on Graphs**: Finding paths or Hamiltonian cycles.
    - **Constraint Satisfaction**: Sudoku, Crossword puzzles, and Map coloring.
    - **Optimization**: Finding the best solution among all valid solutions (Branch and Bound).

---

## Technical Summary
1. `State Space Tree`: The mental model of all possible choices.
2. `DFS`: The traversal method used to explore clones of the state.
3. `Template`: Choose → Explore → Un-choose is the gold standard for implementation.
4. `Pruning`: The critical optimization that makes exponential problems solvable in practice.
