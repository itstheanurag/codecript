---
title: Memory Management
order: 7
---

Memory (RAM) is a finite and critical resource. If processes had to manage physical RAM addresses directly, modern multitasking would be impossible (and highly insecure).

## 1. Virtual Memory

Virtual Memory is the most important concept in OS memory management. It provides an abstraction layer between the application and the physical RAM.

> [!TIP]
> **ELI5: The Valet Parking Lot**
> Imagine RAM is a parking lot. 
> *   **Without Virtual Memory:** The driver (Application) parks their own car. They have to remember they parked in Spot 42. If another driver accidentally parks in Spot 42, they crash (Data Corruption/Security Breach).
> *   **With Virtual Memory:** The driver hands their keys to the Valet (The OS) and receives a generic ticket number (Virtual Address). The driver has no idea where the car is physically parked. The Valet keeps a master ledger (Page Table) mapping Ticket # -> Parking Spot. If the driver wants their car, they ask the Valet.

## 2. Paging and Page Tables

How does the OS map a virtual address to a physical address? Using Paging.

1.  **Pages:** The OS divides the virtual memory of a process into fixed-size blocks called Pages.
2.  **Frames:** The physical RAM is divided into blocks of the exact same size, called Frames.
3.  **The Page Table:** The OS maintains a data structure called the Page Table for *each process*. It acts as a lookup dictionary, mapping a virtual Page to a physical Frame in RAM.

## 3. Page Faults and Swapping

What happens if a process tries to access a virtual page that is not currently loaded into physical RAM?

1.  A **Page Fault** occurs. This is a hardware interrupt that tells the OS to intervene.
2.  The OS pauses the process.
3.  The OS locates the required data on the hard drive (in the swap space).
4.  The OS loads that data into a free Frame in physical RAM.
5.  The OS updates the Page Table and resumes the process.

### Thrashing
If a system is severely low on physical RAM, it will spend all its time swapping pages in and out of the hard drive, and no time actually executing code. This state of constant paging is called **Thrashing**.

## 4. The Heap vs. The Stack

Within a process's virtual memory space, data is organized into segments. 

### The Stack
*   Used for static memory allocation (local variables, function calls).
*   Operates strictly Last-In, First-Out (LIFO).
*   Extremely fast allocation and deallocation.
*   Variables are automatically destroyed when the function exits.

### The Heap
*   Used for dynamic memory allocation (e.g., creating objects, expanding arrays).
*   Data persists until it is manually freed or collected by a Garbage Collector.
*   Prone to **Memory Leaks** if references are held indefinitely.
