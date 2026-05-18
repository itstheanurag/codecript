---
title: Search & Time-Series
order: 8
---

# Specialized Stores: Search and Time-Series

While relational and general-purpose NoSQL databases are versatile, certain workloads—specifically full-text search and metric ingestion—require highly specialized database architectures.

## 1. Search Engines

Traditional databases can perform string matching using `LIKE '%term%'`, but they are not built to handle complex linguistic analysis, fuzzy matching (typos), or relevance scoring across millions of large documents.

Examples: **Elasticsearch, Apache Solr, Meilisearch.**

### The Inverted Index

> [!TIP]
> **ELI5: The Inverted Index vs. The Table of Contents**
> *   **Traditional DB (Table of Contents):** Chapter 1 is about Dogs. Chapter 2 is about Cats. If you want to find every mention of the word "Bark", you have to read every single chapter start to finish.
> *   **Search Engine (The Glossary Index at the back of the book):** It has a list of words alphabetically. You look up "Bark" and it says: `Found on pages 14, 22, and 89`. You jump straight to the answer. This is an **Inverted Index**.

Instead of mapping a document ID to its content, an inverted index maps individual words (terms) back to the document IDs that contain them.

*Example:*
Document 1: "The quick brown fox"
Document 2: "The fast brown dog"

*Inverted Index:*
*   `quick` -> [Doc 1]
*   `brown` -> [Doc 1, Doc 2]
*   `fox` -> [Doc 1]
*   `dog` -> [Doc 2]

When a user searches for "brown dog", the engine instantly looks up the terms, finds the intersection of document IDs, and returns the result in milliseconds.

## 2. Time-Series Databases (TSDB)

Time-series data is a sequence of data points indexed in time order. Think of server metrics (CPU usage every second), financial market ticks, or IoT sensor readings.

Examples: **InfluxDB, Prometheus, TimescaleDB.**

### Why not use an RDBMS?
If you insert 10,000 metrics per second into a PostgreSQL table, the B-Tree index will quickly become a massive bottleneck due to continuous rebalancing. 

### Architecture & Characteristics
*   **Append-Only Workloads:** TSDBs are heavily optimized for continuous, massive write ingestion. Updates and deletes are extremely rare or unsupported.
*   **Time-Centric Indexing:** Data is physically partitioned and indexed on disk based on time intervals (e.g., a file for every hour). Queries filtering by a specific time range can instantly skip irrelevant files.
*   **Downsampling:** TSDBs automatically handle data lifecycle. They can retain granular data (every second) for 7 days, then automatically downsample it to 1-minute averages for 30 days to save space.

### Common Use Cases
*   **DevOps Monitoring:** Ingesting metrics from servers for observability dashboards (e.g., Grafana).
*   **Financial Trading Systems:** Storing historical stock prices and tick data.
*   **Internet of Things (IoT):** Handling massive data streams from distributed sensors.
