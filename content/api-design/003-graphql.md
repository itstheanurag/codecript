---
title: GraphQL
order: 3
---

REST APIs are fantastic, but they suffer from rigidity. Because the server strictly defines what data is returned for a given endpoint, clients (like mobile apps) often suffer from two major problems: Over-fetching and Under-fetching.

Facebook invented **GraphQL** in 2012 to solve this exact problem for their mobile application.

## 1. The Problem with REST

Imagine building a User Profile screen that needs the user's name, their last 3 posts, and their 5 most recent followers.

*   **Under-fetching (The N+1 Request Problem):** You hit `GET /users/123`. It returns the user's name, but not their posts. So you have to make a second network request to `GET /users/123/posts`, and a third to `GET /users/123/followers`. Making 3 round-trip network calls on a slow 3G mobile connection is devastating to performance.
*   **Over-fetching (The Bloat Problem):** To solve the above, the backend team creates a massive `GET /users/123/profile-everything` endpoint. It returns a 2MB JSON payload containing the user's entire life history. But your mobile app only needed the 3 most recent posts. You just wasted massive amounts of bandwidth and battery life parsing useless data.

## 2. The GraphQL Solution

GraphQL flips the paradigm. Instead of having dozens of endpoints (`/users`, `/posts`, `/comments`), a GraphQL API exposes exactly **one** endpoint (`POST /graphql`). 

The client sends a query specifying *exactly* the data it wants, and the server returns exactly that data, nothing more, nothing less.

### The Query (What the frontend sends)
```graphql
query {
  user(id: "123") {
    name
    posts(limit: 3) {
      title
    }
    followers(limit: 5) {
      username
    }
  }
}
```

### The Response
```json
{
  "data": {
    "user": {
      "name": "Alice",
      "posts": [{ "title": "My first post" }, ...],
      "followers": [{ "username": "bob" }, ...]
    }
  }
}
```
*We fetched deeply nested, relational data in a single, highly optimized network request.*

## 3. How it Works (Schemas and Resolvers)

A GraphQL backend requires two things:
1.  **The Schema (TypeDefs):** A strict contract defining all the objects and relationships in your system.
2.  **Resolvers:** Small, isolated functions that know how to fetch the data for a specific field. 

If the client asks for `user.posts`, the GraphQL engine automatically runs the `User` resolver, and then runs the `posts` resolver, stitches the data together, and sends it back.

## 4. The Dark Side: The N+1 Database Problem

GraphQL solves the N+1 *network* problem for the frontend, but it accidentally introduces an N+1 *database* problem for the backend!

If a frontend queries a list of 50 users, and asks for the `avatarUrl` of each user, the GraphQL engine will run the `avatarUrl` resolver 50 separate times. 

```sql
-- What actually happens in the Database:
SELECT * FROM users LIMIT 50;
SELECT * FROM avatars WHERE user_id = 1;
SELECT * FROM avatars WHERE user_id = 2;
-- ... 48 more queries ...
```
This will instantly crash your database under load.

### The Fix: DataLoader
To solve this, GraphQL backends use a utility called **DataLoader**. It waits 10 milliseconds for the GraphQL engine to finish queuing up all 50 `avatarUrl` requests, batches them together, and sends a single, efficient query to the database:
```sql
SELECT * FROM avatars WHERE user_id IN (1, 2, 3... 50);
```
