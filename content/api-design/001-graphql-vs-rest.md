---
title: GraphQL vs. REST
order: 1
---

# GraphQL vs. REST

While REST has been the dominant architectural style for APIs for over a decade, GraphQL has emerged as a powerful alternative, specifically designed to solve the inefficiencies of REST in modern, complex web and mobile applications.

## 1. The REST Approach

REST (Representational State Transfer) is resource-centric. You interact with distinct resources via predictable URLs using standard HTTP verbs (GET, POST, PUT, DELETE).

*Example:* `GET /users/123/posts`

### The Problems with REST

> [!TIP]
> **ELI5: The Grocery Store vs. The Personal Shopper**
> *   **REST (The Grocery Store):** You want to make a sandwich. You have to walk to the Bread aisle (Endpoint A), grab the whole loaf (Over-fetching). Then walk to the Deli counter (Endpoint B), wait in line, and get the meat. Then walk to the Produce aisle (Endpoint C) for lettuce. You make multiple trips and get more food than you actually need.
> *   **GraphQL (The Personal Shopper):** You hand a list to a shopper: "I want exactly 2 slices of bread, 3 slices of turkey, and 1 leaf of lettuce." The shopper runs around the store, gets *exactly* what you asked for, and hands it to you in one neat package.

1.  **Over-fetching:** The server dictates exactly what data is returned. If an endpoint returns 50 fields for a user profile, but your mobile app only needs the `name` and `avatar_url`, you are wasting bandwidth downloading the other 48 fields.
2.  **Under-fetching (The N+1 Problem in APIs):** If you need a user's profile, their last 5 posts, and the authors of the comments on those posts, a pure REST architecture might require you to make an initial request for the user, then subsequent requests for the posts, and even more requests for the comments. This results in slow, waterfall network requests.

## 2. The GraphQL Approach

GraphQL is query-centric. Instead of multiple endpoints returning fixed data structures, GraphQL exposes a *single* endpoint (`POST /graphql`). The client sends a query specifying exactly what data it needs, and the server returns exactly that data—nothing more, nothing less.

### Solving Over/Under-fetching

With GraphQL, the complex scenario described above can be fulfilled in a single network request:

```graphql
# The Client Query
query {
  user(id: "123") {
    name
    avatar_url
    posts(limit: 5) {
      title
      comments {
        author {
          name
        }
      }
    }
  }
}
```

### The GraphQL Schema

The power of GraphQL comes from its strongly typed Schema. The server defines a schema of Types and their relationships. The client can use introspection to query the schema itself, enabling incredible developer tooling (like automatic code generation and self-documenting APIs).

## 3. The Trade-offs (Why REST isn't dead)

If GraphQL solves these problems, why doesn't everyone use it?

1.  **Complexity on the Server:** Resolving nested GraphQL queries efficiently is hard. If a client queries `Users -> Posts -> Comments -> Authors`, the server can easily fall into a massive N+1 database querying problem if not carefully managed (usually solved using a tool called `DataLoader` to batch and cache queries).
2.  **Caching:** REST utilizes the built-in caching mechanisms of the web (HTTP GET caching, CDNs) effortlessly. Because GraphQL uses a single `POST` endpoint with varying bodies, network-level caching is extremely difficult. Caching must be handled at the application level.
3.  **Security:** Because clients dictate the query, a malicious client could send a deeply nested, infinitely recursive query (`User -> Friends -> Friends -> Friends...`) to crash the server. You must implement query complexity analysis and depth limiting.
