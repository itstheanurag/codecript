---
title: Real-Time APIs (Polling & SSE)
order: 6
---

HTTP was originally designed as a request-response protocol: the client asks for data, the server responds, and the connection closes. 

But what if you are building a live sports ticker, a stock trading dashboard, or a chat application? The server needs a way to push data to the client *when it happens*. 

Here is the evolution of how engineers hacked HTTP to achieve real-time communication.

## 1. Short Polling (The Naive Approach)

The easiest way to get live updates is simply to ask the server over and over again.

> [!TIP]
> **ELI5: Are We There Yet?**
> Imagine driving with a kid in the back seat. 
> *   Kid: "Are we there yet?"
> *   Parent: "No."
> *   (10 seconds later) Kid: "Are we there yet?"
> *   Parent: "No."

The client runs a JavaScript `setInterval` loop, firing a `GET` request every 5 seconds.

*   **Pros:** Incredibly easy to implement. Works on every device and browser.
*   **Cons:** Terrible scalability. If you have 10,000 active users polling every 5 seconds, your server is handling 2,000 requests per second—and 99% of those requests return "No new data," wasting massive amounts of CPU, battery, and bandwidth.

## 2. Long Polling

To fix the wasted requests of Short Polling, engineers invented Long Polling. 

Instead of immediately responding with "No new data," the server intentionally *holds the HTTP connection open* for up to 30 seconds. 

1.  Client requests data.
2.  Server sees there is no data yet. It parks the request and waits.
3.  (15 seconds later) A new message arrives in the database.
4.  The Server immediately responds to the parked request with the message.
5.  The Client receives the message and *immediately opens a new Long Poll connection*.

*   **Pros:** Data is delivered instantly when it arrives. Drastically reduces the number of empty HTTP requests compared to Short Polling.
*   **Cons:** Requires complex server architecture. Your server must be capable of holding tens of thousands of concurrent TCP connections open in memory without crashing (Node.js and Go are great at this; traditional Apache/PHP is terrible at it).

## 3. Server-Sent Events (SSE)

Long polling is still a hack. If you just need the server to push text data to the client, the modern, elegant solution is **Server-Sent Events (SSE)**.

SSE leverages a standard HTTP connection but keeps it open indefinitely. The server streams data down the pipe whenever it wants, utilizing the `text/event-stream` content type.

*   **Unidirectional:** It only flows from Server -> Client. The client cannot send messages back up the SSE connection (they just use standard POST requests for that).

### The Implementation
**Frontend (Native Browser API):**
```javascript
const eventSource = new EventSource('/api/live-scores');

eventSource.onmessage = function(event) {
  const newScore = JSON.parse(event.data);
  console.log("Goal Scored!", newScore);
};
```

**Backend (Node.js):**
```javascript
app.get('/api/live-scores', (req, res) => {
  // Keep the connection alive and set the correct headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  // When a goal happens, write it directly to the stream!
  sportsEngine.on('goal', (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  });
});
```

*   **Pros:** Native browser support (no external libraries needed). Auto-reconnects automatically if the connection drops. Extremely lightweight.
*   **Cons:** Unidirectional only. Limited to 6 concurrent connections per domain in older HTTP/1.1 browsers.
