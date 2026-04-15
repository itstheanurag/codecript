---
title: Host Environment APIs
order: 14
---

# Web APIs: Interacting with the Browser

JavaScript's power in the browser comes from its ability to interact with the **Host Environment**. While the JS engine handles the logic, the browser provides a set of **Web APIs** that allow you to manipulate the page, handle events, and communicate with servers.

---

## 1. The DOM (Document Object Model)

The DOM is the programming interface for HTML and XML documents. It represents the page as a **Tree Structure** (the DOM Tree), where each node is an object representing a part of the document.

- **Querying**: `document.querySelector(".btn")`
- **Manipulation**: `element.innerHTML`, `element.style.color`, `element.classList.add("hidden")`
- **Event Listeners**: `element.addEventListener("click", handler)`

---

## 2. The BOM (Browser Object Model)

The BOM allows JavaScript to "talk" to the browser itself, beyond the contents of the page.
- **`window`**: The global object in the browser.
- **`location`**: Current URL, paths, and navigation methods.
- **`navigator`**: Information about the browser (user agent, geolocation, etc.).
- **`history`**: Control over the browser's back and forward history (key for Single Page Apps).

---

## 3. Storage and State

Browsers provide several ways to store data locally on the user's machine:
- **`localStorage`**: Persistent storage (stays even after the browser is closed).
- **`sessionStorage`**: Temporary storage for the current tab.
- **`IndexedDB`**: A low-level API for client-side storage of significant amounts of structured data (the industry standard for offline-first apps).

---

## 4. Modern Web Capabilities

- **`fetch()`**: The modern, Promise-based API for making network requests.
- **Intersection Observer**: Efficiently detecting when an element enters the viewport (used for lazy-loading images).
- **Web Workers**: Allowing you to run JavaScript in the background on a separate thread (preventing "Blocking the UI").

---

## Interview Pro-Tips: Event Delegation
A common interview question: **What is event delegation?**
- **The Answer**: Instead of attaching an event listener to 100 individual list items, you attach **one** listener to their parent. Because events "Bubble Up" through the DOM tree, the parent can catch them and use `event.target` to figure out which specific item was clicked. This significantly improves performance and memory usage.

---

## Technical Summary
1. `DOM`: The object representation of the page.
2. `BOM`: Interaction with browser features like history and location.
3. `Concurrency`: Web Workers provide a way to achieve multi-threading in the browser.
