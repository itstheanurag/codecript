---
title: Database SQL Internals
order: 15
---

# SQL: The database/sql Package

Go’s `database/sql` package provides a generic interface around SQL (or SQL-like) databases. It handles the complexities of connection pooling and thread safety, allowing you to focus on writing queries. To use it, you also need a specific **Driver** for your database (e.g., PostgreSQL, MySQL, SQLite).

---

## 1. Opening a Connection

Opening a connection doesn't actually connect to the database immediately; it just validates the arguments and prepares a pool.

```go
db, err := sql.Open("postgres", dataSourceName)
if err != nil {
    log.Fatal(err)
}
defer db.Close()

// Verifying the connection
err = db.Ping()
```

---

## 2. Executing Queries

- **`Query`**: Used for SELECT statements that return rows.
- **`Exec`**: Used for statements that don't return rows (INSERT, UPDATE, DELETE).
- **`QueryRow`**: Useful when you expect exactly one row.

```go
var name string
err := db.QueryRow("SELECT name FROM users WHERE id = $1", id).Scan(&name)
```

**CRITICAL**: Always use **Parameter Binding** (`$1`, `?`) to prevent SQL Injection attacks. Never concatenate strings into your queries.

---

## 3. Managing Rows and Scans

When you receive multiple rows, you must iterate through them and close the row set to return the connection to the pool.

```go
rows, err := db.Query("SELECT id, name FROM users")
defer rows.Close()

for rows.Next() {
    var id int
    var name string
    rows.Scan(&id, &name)
}
```

---

## 4. Understanding Connection Pooling

The `*sql.DB` object is a **Pool of Connections**, not a single connection. It is safe for concurrent use by multiple goroutines.
- **`SetMaxOpenConns`**: Limits the total number of open connections to the database.
- **`SetMaxIdleConns`**: Controls how many idle connections are kept in the pool for reuse.

---

## 5. Transactions (tx)

For operations that must "Succeed together or fail together," use transactions.

```go
tx, _ := db.Begin()
_, err = tx.Exec("UPDATE accounts SET balance = balance - 100 WHERE id = 1")
// ... second operation ...

if err != nil {
    tx.Rollback()
}
tx.Commit()
```

---

## Interview Pro-Tips: Why QueryRow over Query?
If an interviewer asks about resource safety:
- **The Answer**: `QueryRow` is safer for single results because it automatically handles closing the connection for you. If you use `Query`, you **must** remember to call `rows.Close()`, or you will slowly leak connections until your database pool is exhausted and your app stops responding.

---

## Technical Summary
1. `sql.DB`: A thread-safe connection pool.
2. `Scan`: Moving data from database types into Go variables.
3. `Injecting`: Always use placeholder parameters for security.
 flagship
 flagship
