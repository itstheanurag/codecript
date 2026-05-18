---
title: Document & Key-Value Stores
order: 5
---

# NoSQL: Document and Key-Value Stores

The term "NoSQL" (Not Only SQL) encompasses a wide variety of database architectures designed to address the limitations of relational databases—specifically around flexible schemas and horizontal scalability.

## 1. Key-Value Stores

Key-Value stores are the simplest form of NoSQL databases. They act like a giant, persistent hash map (dictionary). Every data item is stored as an opaque "Value" associated with a unique "Key".

Examples: **Amazon DynamoDB, Redis, Riak, Memcached.**

> [!TIP]
> **ELI5: The Coat Check**
> Think of a Key-Value store like a coat check at a fancy restaurant. 
> *   You hand them your coat (the **Value**, which could be a heavy winter jacket or a light sweater, they don't care).
> *   They hand you a ticket with a unique number (the **Key**).
> *   When you return, you *must* give them the exact ticket number. They look at the ticket and instantly hand back your coat. You cannot ask the coat check attendant, "Can you give me the blue coat?" because they didn't look at what was inside; they only know tickets.

### Architecture & Characteristics
*   **Querying:** You can *only* query by the exact Key. 
*   **Performance:** Ultra-fast (`O(1)` time complexity for single-key lookups).
*   **Scaling:** Exceedingly easy to scale horizontally. Because there are no relationships between keys, data can be perfectly partitioned across hundreds of servers.

## 2. Document Stores

Document stores extend the concept of Key-Value stores. Instead of the value being an opaque blob (the coat), the value is a structured "Document" (typically JSON). The database understands this structure.

Examples: **MongoDB, Couchbase, Amazon DocumentDB.**

### Architecture & Characteristics
*   **Schema Flexibility (Schema-less):** Documents within the same collection do not need to have the exact same fields. 

> [!TIP]
> **ELI5: The Filing Cabinet vs. The Free-Form Folder**
> *   **SQL (Filing Cabinet):** Every file must have the exact same standard form filled out. If a form asks for a fax number, and you don't have one, you leave a blank space (NULL). If you want to add a "Twitter Handle" field, you have to recall every single form in the cabinet and physically print a new box on them (`ALTER TABLE`).
> *   **NoSQL Document (Free-Form Folder):** You just throw papers into a folder. One paper might be a sticky note with a phone number. Another might be a 5-page essay. The database doesn't complain. It allows for rapid iteration.

### The Trade-off: Joins vs. Embedding
Because document databases distribute data across nodes, performing joins between different collections is generally slow and discouraged.

*   **Relational Approach:** Store Users in one table, Addresses in another. Join them.
*   **Document Approach:** Embed the Address JSON directly inside the User JSON document.

*When to embed?* When the nested data is frequently accessed together with the parent data, and the nested data isn't excessively large.

> [!WARNING]
> While "schema-less" sounds liberating, in reality, the schema is simply shifted from the database layer to your application code. Your application must handle documents that might be missing fields or have fields of different types.
