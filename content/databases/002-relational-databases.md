---
title: Relational Databases
order: 2
---

# Relational Databases (RDBMS)

Relational Database Management Systems (RDBMS) have been the industry standard for decades. They store data in highly structured tables comprised of rows and columns, with strict relationships defined between these tables.

Examples: **PostgreSQL, MySQL, Oracle, SQL Server.**

## 1. Core Concepts

### Tables, Rows, and Columns
*   **Table:** A collection of related data entries (e.g., `Users`).
*   **Column:** A specific data point within a table, enforcing a strict data type (e.g., `email VARCHAR(255)`).
*   **Row:** A single, distinct record in the table.

### Keys
*   **Primary Key (PK):** A column that uniquely identifies each row in a table (e.g., `user_id`).
*   **Foreign Key (FK):** A column in one table that references the Primary Key of another table, establishing a relationship.

## 2. Normalization

Normalization is the process of structuring a database to reduce data redundancy and improve data integrity. 

> [!TIP]
> **ELI5: Normalization (The Address Book)**
> Imagine you have a giant spreadsheet of `Customers` and their `Orders`. Every single row contains the customer's full address. If "John Doe" places 50 orders, his address is written 50 times (Redundancy). If John moves, you have to find and update all 50 rows, or risk sending his new order to the old address (Anomaly).
> 
> **Normalization** says: Break it up! Create a `Customers` table (where John's address lives exactly once), and an `Orders` table that just points to John's ID (Foreign Key). If John moves, you update one row in one table.

## 3. ACID Properties

RDBMS are renowned for their strict adherence to ACID properties, which guarantee that database transactions are processed reliably, even during crashes.

> [!TIP]
> **ELI5: The ACID Test for Bank Transfers**
> You want to transfer $100 from Checking to Savings.
> 1.  **Atomicity ("All or Nothing"):** Either the $100 is deducted *and* added, or neither happens. It cannot crash halfway and delete your $100.
> 2.  **Consistency ("Follow the Rules"):** If your bank rule says "No negative balances," the database will block the transfer if Checking only has $50.
> 3.  **Isolation ("Wait Your Turn"):** If your wife also tries to withdraw $100 from Checking at the exact same millisecond, the database processes one transaction fully before the other, preventing a double-spend race condition.
> 4.  **Durability ("Written in Stone"):** Once the ATM says "Transfer Complete," that data is permanently saved to the hard drive. Even if the bank's power goes out a second later, the money is safe.

## 4. Scaling Relational Databases

Relational databases are notoriously difficult to scale horizontally (adding more machines) because maintaining ACID compliance across multiple nodes is incredibly complex.

### Vertical Scaling (Scaling Up)
The most straightforward approach: buy a bigger server with more RAM and faster SSDs.
*   **Pros:** Requires no application changes; maintains strict ACID guarantees.
*   **Cons:** Has a hard physical limit; becomes prohibitively expensive.

### Read Replicas (Scaling Reads)
For read-heavy workloads, set up a Master-Slave architecture.
*   **Master Node:** Handles all write operations.
*   **Slave Node(s):** Replicate data from the Master and handle read queries.

### Sharding (Scaling Writes Horizontally)
Sharding involves partitioning the database horizontally across multiple separate database servers based on a Key (e.g., users A-M on Server 1, N-Z on Server 2).
*   **Cons:** Extremely complex application logic. Joins across shards are nearly impossible.
