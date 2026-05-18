---
title: TCP vs UDP (Layer 4)
order: 2
---

When data leaves your application (Layer 7) and gets ready to travel across the internet, the Transport Layer (Layer 4) has to make a critical decision: **How should we ship this data?**

There are two primary protocols for this: **TCP** (The reliable courier) and **UDP** (The reckless mailman).

## 1. TCP (Transmission Control Protocol)

TCP is connection-oriented, reliable, and strictly ordered. If you download an image, send an email, or load a webpage, you are using TCP.

### The 3-Way Handshake
Before TCP sends a single byte of actual data, it forces the client and server to have a formal introduction to ensure both are ready.
1.  **SYN (Synchronize):** Client says, "Hi, I'd like to open a connection."
2.  **SYN-ACK (Synchronize-Acknowledge):** Server says, "Hi! I received your request, and I am ready."
3.  **ACK (Acknowledge):** Client says, "Great, I received your confirmation. I will start sending data now."

### Core Features of TCP
*   **Guaranteed Delivery:** When TCP sends a packet of data, it waits for an `ACK` from the receiver. If it doesn't get it, it re-transmits the packet. No data is ever lost.
*   **Ordered Packets:** Data is broken into chunks (packets). If Packet 2 arrives before Packet 1 due to weird network routing, TCP holds onto Packet 2, waits for Packet 1, and reassembles them in perfect order before giving them to your application.
*   **Congestion Control:** If the network is busy, TCP automatically slows down to prevent network collapse.

**Pros:** 100% reliable. The application developer doesn't have to worry about missing or out-of-order data.
**Cons:** Slow. The 3-way handshake adds latency, and waiting for dropped packets to be retransmitted causes the whole stream to pause (Head-of-Line Blocking).

## 2. UDP (User Datagram Protocol)

UDP is connectionless and entirely reckless. It just grabs the data and throws it at the destination IP address as fast as humanly possible. 

### Core Features of UDP
*   **No Handshake:** It just starts blasting data immediately.
*   **No Guarantees:** If a packet is dropped by a router in the middle of the ocean, UDP doesn't care. It never re-transmits.
*   **No Ordering:** If Packet 2 arrives before Packet 1, the receiving application gets them in the wrong order.

**Pros:** Blazing fast. Zero latency overhead from handshakes or error checking.
**Cons:** Unreliable. The application developer has to manually write code to handle missing or out-of-order data if they care about it.

## 3. When to use which?

> [!IMPORTANT]
> **The Interview Answer**
> *   **Use TCP** when accuracy is more important than speed. (Web browsing HTTP, Database connections, File Transfers, Emails).
> *   **Use UDP** when speed is more important than perfect accuracy. (Live Video Streaming, VoIP Calls, Fast-paced Multiplayer Gaming).

**The Gaming Analogy (UDP):**
If you are playing *Call of Duty* and your character moves to the right, your console sends a UDP packet with your new location. If that packet is lost in transit, it doesn't matter! A millisecond later, your console will send a *new* UDP packet with your *even newer* location. Waiting 500ms for TCP to retransmit the old, outdated location data would cause the game to lag horribly.

**The Banking Analogy (TCP):**
If you are transferring $1,000 to your friend, dropping the packet that says "$1,000" is catastrophic. You happily pay the latency penalty of TCP to guarantee the bank receives the exact instruction.
