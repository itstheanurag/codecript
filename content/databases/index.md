---
title: Databases & Storage
description: Learn SQL, NoSQL, caching, and how to choose the right database for scale, consistency, and query patterns.
order: 6
---

Data is the lifeblood of modern applications. A professional engineer must not only know how to write code, but also how to persist, query, and manage state efficiently at scale. Selecting the right database is one of the most critical architectural decisions you will make.

In this section, we cover everything from the internal mechanics of relational systems to advanced SQL query optimization, NoSQL architectures, and specialized data stores.

## The SQL track

SQL is the skill that outlives frameworks. If you want to go from "I can write a `SELECT`" to "I can design a schema, debug a plan, and reason about concurrency", start here:

- **[SQL Fundamentals](./003-sql-fundamentals)**: a compact primer — DML, joins, grouping, CTEs, windows.
- **[SQL Deep Dive](/databases/sql)**: the full curriculum — execution model, every join type, subqueries, aggregation, window functions, CTEs and recursion, DML/DDL, transactions and isolation, indexes and query plans, schema design, and anti-patterns.
  - [How SQL Actually Runs](/databases/sql/001-sql-execution-model)
  - [Joins in Depth](/databases/sql/002-joins-in-depth)
  - [Set Operations & Subqueries](/databases/sql/003-set-operations-and-subqueries)
  - [Aggregation & Grouping](/databases/sql/004-aggregation-and-grouping)
  - [Window Functions](/databases/sql/005-window-functions)
  - [Functions & Expressions](/databases/sql/006-sql-functions-and-expressions)
  - [CTEs & Recursive Queries](/databases/sql/007-ctes-and-recursive-queries)
  - [DML, DDL & Constraints](/databases/sql/008-dml-ddl-and-constraints)
  - [Transactions & Isolation](/databases/sql/009-transactions-and-isolation)
  - [Indexes & Query Plans](/databases/sql/010-indexes-and-query-plans)
  - [Schema Design in Practice](/databases/sql/011-schema-design-and-modeling)
  - [Anti-Patterns & Readiness Checklist](/databases/sql/012-sql-anti-patterns-and-checklist)
- **[SQL Playground](/playground)**: 64 practice exercises on the Northwind dataset, graded row-by-row with instant feedback — all in your browser, no server.

## The storage track

- **[Database Paradigms](./001-database-paradigms)**: OLTP vs. OLAP and the CAP Theorem.
- **[Relational Databases](./002-relational-databases)**: RDBMS architecture, normalization, and ACID guarantees.
- **[SQL Query Optimization](./004-sql-query-optimization)**: EXPLAIN plans, index strategies, and performance pitfalls.
- **[Document & Key-Value Stores](./005-nosql-document-and-key-value)**: Schema flexibility and horizontal scaling.
- **[Wide-Column & Graph Databases](./006-nosql-wide-column-and-graph)**: Massive throughput and complex relationship modeling.
- **[In-Memory & Caching](./007-in-memory-and-caching)**: Ultrafast access and eviction policies.
- **[Search & Time-Series](./008-search-and-time-series)**: Specialized stores for logs, metrics, and text search.
- **[Choosing the Right Database](./009-choosing-the-right-database)**: A pragmatic guide to evaluating trade-offs.

> "Your application code is ephemeral. Your data is forever."
