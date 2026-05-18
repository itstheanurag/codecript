---
title: Webhooks & Events
order: 2
---

# Webhooks & Asynchronous Events

REST and GraphQL are synchronous, request-response protocols. The client asks a question, and the server answers. But what happens when the client needs to know when something happens *in the future* (e.g., "Tell me when this Stripe payment succeeds")?

Repeatedly asking the server "Is it done yet?" (Polling) is highly inefficient and strains infrastructure. The solution is push-based asynchronous communication via Webhooks.

## 1. Polling vs. Webhooks

> [!TIP]
> **ELI5: The Road Trip**
> *   **Polling:** The kids in the backseat constantly asking "Are we there yet? Are we there yet? Are we there yet?" every 5 seconds. It's exhausting for the driver (the server).
> *   **Webhooks:** The driver says, "Go to sleep. I will wake you up (send a webhook) the exact moment we arrive."

### Polling
*   Client: `GET /payment/status` -> "Pending"
*   Client waits 5 seconds...
*   Client: `GET /payment/status` -> "Success"
*   *Inefficient, high latency, wastes server resources.*

### Webhooks (Reverse APIs)
*   Client tells the Server: "When the payment status changes, send an HTTP POST request to `https://my-app.com/webhooks/stripe`".
*   Server: Processes the payment asynchronously.
*   Server (hours later): Sends `POST` to the client's URL with the payload `{"status": "Success"}`.

## 2. Designing a Robust Webhook System

### 1. Retries and Exponential Backoff
If the destination URL does not return a `2xx` success code, your system must retry. Retries should use an exponential backoff strategy (wait 1 minute, then 5 minutes, then 1 hour, then 1 day) to avoid overwhelming a struggling receiver. 

### 2. Security and Signatures
Because a webhook receiver is just a public HTTP endpoint, anyone could send a fake request to it (e.g., `{"payment_status": "Success", "amount": 1000000}`).

To prevent this, the sender must digitally sign the payload using HMAC SHA-256.

**Code Example: Verifying a Webhook Signature in Node.js**
```javascript
const crypto = require('crypto');

// The shared secret you got from Stripe/GitHub/etc.
const WEBHOOK_SECRET = 'whsec_my_super_secret_key'; 

function verifyWebhook(req, res) {
    // The signature sent by the provider in the headers
    const signature = req.headers['x-signature']; 
    const payloadString = JSON.stringify(req.body);

    // Recalculate the hash using our secret
    const expectedSignature = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(payloadString)
        .digest('hex');

    // Secure compare prevents timing attacks
    if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        console.log("Webhook is authentic!");
        res.status(200).send("OK");
    } else {
        console.error("Webhook signature mismatch! Intruder alert!");
        res.status(401).send("Unauthorized");
    }
}
```

### 3. Idempotency
Because network failures happen, a webhook might be sent, processed by the receiver, but the acknowledgement (`200 OK`) is lost in transit. The sender will retry, causing the receiver to process the event *twice*.

Webhook receivers must be **idempotent**. They must track the unique Event ID sent in the webhook and ensure that processing the same event multiple times has the same effect as processing it once (e.g., ignoring duplicates).

## 3. Server-Sent Events (SSE) and WebSockets

Webhooks are for server-to-server communication. If you need to push events from a Server directly to a Browser/Mobile Client, you use different protocols.

*   **WebSockets:** Full-duplex, bi-directional communication. Great for chat apps or multiplayer games.
*   **Server-Sent Events (SSE):** A unidirectional protocol where the browser opens a persistent HTTP connection to the server, and the server continuously streams data down. Great for live updating news feeds.
