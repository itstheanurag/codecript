---
title: SQL vs NoSQL
order: 11
---

Choosing the right database is one of the most critical decisions in system design. Databases are generally divided into two categories: **Relational (SQL)** and **Non-Relational (NoSQL)**.

## SQL (Relational Databases)

SQL databases store data in tables with a fixed schema. They use Structured Query Language for defining and manipulating data.

- **Storage**: Structured tables with rows and columns.
- **Schema**: Rigid/Fixed. Changes require migrations.
- **Scaling**: Typically Vertical (Scale Up). Horizontal scaling is possible but complex (Replication/Sharding).
- **ACID Compliance**: High. Guarantees Atomicity, Consistency, Isolation, and Durability.
- **Examples**: MySQL, PostgreSQL, Oracle, SQL Server.

### Best For:
- Complex queries and joins.
- Applications requiring strict data integrity (Financial systems).
- Structured data with clear relationships.

## NoSQL (Non-Relational Databases)

NoSQL databases store data in various formats (document, key-value, graph, column) and have a dynamic schema.

- **Storage**: Flexible formats (JSON-like documents, key-value pairs).
- **Schema**: Dynamic/Flexible. No predefined schema required.
- **Scaling**: Typically Horizontal (Scale Out). Designed for distributed clusters.
- **Consistency**: Often Base (Basically Available, Soft state, Eventual consistency).
- **Examples**: MongoDB, Redis, Cassandra, Neo4j.

### Types of NoSQL

| Type | Example | Best For |
| :--- | :--- | :--- |
| **Key-Value** | Redis, DynamoDB | Caching, session management, real-time data. |
| **Document** | MongoDB, CouchDB | Content management, catalogs, user profiles. |
| **Column** | Cassandra, HBase | Large datasets, high write throughput, analytics. |
| **Graph** | Neo4j, ArangoDB | Social networks, recommendation engines. |

## Comparison Diagram

```mermaid
graph LR
    subgraph "SQL (Relational)"
        T1[Table 1] -- Join --> T2[Table 2]
    end

    subgraph "NoSQL (Document)"
        D1[Document 1: {id, name, ...}]
        D2[Document 2: {id, name, ...}]
    end
```

## Key Differences

| Feature | SQL | NoSQL |
| :--- | :--- | :--- |
| **Data Model** | Relational (Tables) | Non-relational (Doc, Key, Graph) |
| **Schema** | Fixed | Dynamic |
| **Scaling** | Vertical | Horizontal |
| **Joins** | Yes (Efficient) | No (Usually denormalized) |
| **Transaction** | ACID | BASE (usually) |

## The CAP Theorem Alignment
- **SQL** databases are often **CP** or **CA** (depending on replication).
- **NoSQL** databases are often designed to be **AP** to handle massive scale.

## Key Takeaway
Don't pick a database based on hype. Start with SQL (PostgreSQL is usually a great default). Only move to NoSQL if you have massive scale requirements, very high write throughput, or unstructured data that makes SQL schemas painful.
