---
title: Choosing the Right Database
order: 9
---

# Choosing the Right Database

Selecting a database is one of the most critical and permanent decisions in system design. Migrating application logic is hard; migrating petabytes of live, mission-critical data with zero downtime is a monumental engineering effort.

There is no "best" database. There is only the right database for your specific constraints and workload.

## 1. The Default Choice

> [!TIP]
> **Start with a Relational Database (PostgreSQL).**
> Unless you have a specific, undeniable reason to choose NoSQL, an RDBMS should be your default. Modern PostgreSQL can handle JSON (acting like a document store), text search, geospatial data, and can comfortably scale to terrabytes of data and thousands of concurrent connections. It is the safest, most versatile bet.

## 2. The Decision Matrix

When PostgreSQL is no longer sufficient, use the following dimensions to evaluate your options:

### A. Data Structure & Schema
*   **Highly Structured & Relational:** RDBMS (PostgreSQL, MySQL).
*   **Unstructured, Evolving, or Polymorphic:** Document Store (MongoDB).
*   **Highly Interconnected (Relationships > Data):** Graph Database (Neo4j).

### B. Read vs. Write Workload
*   **Read-Heavy (with complex querying):** RDBMS with Read Replicas, or Document Stores.
*   **Massive Write Ingestion (100k+ writes/sec):** Wide-Column Store (Cassandra, ScyllaDB) or Time-Series (InfluxDB).
*   **Extreme Low Latency (Reads/Writes < 1ms):** In-Memory (Redis, Memcached).

### C. Scaling Requirements
*   **Scale Up (Vertical):** RDBMS. Easiest to manage, but has a hard ceiling.
*   **Scale Out (Horizontal - Sharding):** NoSQL (Cassandra, DynamoDB, MongoDB). Built for seamless horizontal distribution, but introduces application complexity and eventual consistency.

### D. Consistency Needs (CAP Theorem)
*   **Strong Consistency (Financial data, Inventory):** RDBMS, or CP NoSQL systems (MongoDB, HBase).
*   **High Availability (Social feeds, Analytics):** AP NoSQL systems (Cassandra, DynamoDB). It's okay if a user sees a stale "like" count for a few seconds.

## 3. The Polyglot Persistence Pattern

In modern enterprise architectures (specifically microservices), you rarely use just one database. **Polyglot Persistence** is the practice of using different database technologies for different services based on their specific needs.

**Example E-Commerce Architecture:**
1.  **Product Catalog:** Stored in a **Document Database** (MongoDB) because different products have wildly different attributes.
2.  **Shopping Cart:** Stored in an **In-Memory Cache** (Redis) for ultra-fast, temporary storage.
3.  **Checkout & Billing:** Stored in an **RDBMS** (PostgreSQL) for strict ACID guarantees and transactional integrity.
4.  **Product Search:** Indexed in a **Search Engine** (Elasticsearch) for fuzzy matching and fast text queries.
5.  **User Recommendations:** Processed using a **Graph Database** (Neo4j) to map complex purchasing relationships.

## 4. Final Checklist

Before adopting a new, shiny NoSQL database, ask yourself:
1.  Do I truly have a scale problem that Postgres cannot handle?
2.  Am I willing to sacrifice ACID guarantees?
3.  Does my team have the operational expertise to manage, back up, and debug this new distributed system?
4.  Can I accept the query limitations (e.g., no joins) imposed by this architecture?

If the answer to any of these is "No," stick with a relational database until you are forced to change.
