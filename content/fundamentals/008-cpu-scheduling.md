---
title: CPU Scheduling
order: 8
---

At any given moment, a modern computer might have hundreds of processes "running." However, a single CPU core can only execute one instruction at a time. The **CPU Scheduler** is responsible for deciding which process gets to use the CPU next.

## 1. Preemptive vs. Non-Preemptive Scheduling

*   **Non-Preemptive:** Once the CPU has been allocated to a process, the process keeps the CPU until it voluntarily releases it. (Rare in modern OSs, as one infinite loop freezes the machine).
*   **Preemptive:** The OS can forcibly interrupt a running process and assign the CPU to another process.

## 2. Common Scheduling Algorithms

> [!TIP]
> **ELI5: The Grocery Store Checkout Line**
> The CPU is the cashier. The processes are customers with varying cart sizes.
> 
> *   **First-Come, First-Served (FCFS):** You wait in line. If the guy in front of you has 300 items (A massive video rendering process), you wait an hour, even if you just want to buy a pack of gum. (High wait times).
> *   **Shortest Job First (SJF):** The cashier magically scans everyone's carts and brings the person with the gum to the front. Great for the gum-buyer, but the guy with 300 items might wait forever if people keep showing up with gum (**Starvation**).
> *   **Round Robin (RR):** The cashier scans exactly 5 items for a customer (Time Slice / Quantum). Then that customer must go to the back of the line. The cashier moves to the next customer, scans 5 items, etc. Everyone makes steady progress.

### 1. First-Come, First-Served (FCFS)
The simplest algorithm. The process that requests the CPU first gets it first.
*   **Cons:** Suffers from the **Convoy Effect**. Short processes get stuck waiting behind long processes.

### 2. Shortest Job First (SJF)
The scheduler selects the waiting process with the smallest estimated burst time.
*   **Cons:** Impossible to implement perfectly (OS cannot predict exact runtimes). Can lead to Starvation.

### 3. Round Robin (RR)
Every process in the Ready queue gets a small unit of CPU time (a time quantum, typically 10-100 milliseconds).
*   If the process doesn't finish within the quantum, it is preempted and put at the back of the Ready queue.
*   **Cons:** If the time quantum is too small, the system spends all its time performing context switches (overhead).

### 4. Multilevel Feedback Queue (MLFQ)
This is what modern Operating Systems actually use. It combines the best of all algorithms.
*   It maintains multiple Ready queues, each with a different priority level.
*   A new process enters the highest priority queue (with a very short time quantum). If it uses its full quantum, it is demoted to a lower priority queue (with a longer time quantum).
*   **Result:** Interactive tasks (typing on a keyboard) stay in high-priority queues for instant response. Heavy background tasks get demoted to lower queues where they receive longer, uninterrupted chunks of time.
