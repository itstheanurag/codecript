---
title: Activity Selection
order: 21
---

**Activity Selection** is a foundational greedy problem. Given a set of activities, each with a start and finish time, the objective is to find the maximum number of non-overlapping activities that can be performed by a single resource (e.g., one person or one machine).

---

## 1. The Greedy Choice Property: Sorting by Finish Time

The defining characteristic of Activity Selection is that a locally optimal choice leads to a globally optimal solution. 

**The Strategy**: Always select the activity that finishes **earliest**.
1. By picking the activity with the earliest finish time, you maximize the remaining time available for subsequent activities.
2. Any other strategy (like picking the shortest duration or the earliest start time) could inadvertently block multiple future activities that might have otherwise been compatible.

---

## 2. Requirement: Optimal Substructure

For a greedy algorithm to be correct, the problem must exhibit **Optimal Substructure**. This means that once a greedy choice is made (selecting the first finishing activity), the remaining problem is simply to solve the same problem for the activities that start after the selected activity finishes.

---

## 3. Complexity Analysis

| Scenario | Time Complexity | Space Complexity |
| :--- | :--- | :--- |
| **Total Process** | O(N log N) | O(1) or O(N) |

- **O(N log N)**: Required to sort the activities by their finish times.
- **O(N)**: Required for a single linear pass to select compatible activities.
- **Space**: O(1) if sorting is done in-place; O(N) if a new list is created.

---

## 4. Implementation

```javascript
function selectActivities(activities) {
  // 1. Sort activities by their finish times
  activities.sort((a, b) => a.finish - b.finish);

  const selected = [];
  let lastFinishTime = -1;

  for (const activity of activities) {
    // 2. Greedy Choice: Pick if the activity starts after the last one finished
    if (activity.start >= lastFinishTime) {
      selected.push(activity);
      lastFinishTime = activity.finish;
    }
  }

  return selected;
}
```

---

## 5. Interview Pro-Tips: Why Greedy Fails
- **Weighted Activity Selection**: If every activity has a "Profit" or "Value" and you want to maximize the **Total Profit** (rather than just the count), the greedy approach fails. You must use **Dynamic Programming** combined with Binary Search to find the optimal set.
- **Interval Partitioning**: If the question asks for the **Minimum number of resources** (e.g., meeting rooms) to host all activities, this is a different problem requiring a Min-Heap to track earliest available times.

---

## Technical Summary
1. `Finish Time`: The variable that must be sorted to ensure optimality.
2. `O(N log N)`: The bottleneck is the sorting phase.
3. `Local Optimum`: Selecting the first finishing activity is the best local move.
4. `Global Optimum`: The series of local best moves results in the maximum count.
