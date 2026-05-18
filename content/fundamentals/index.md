---
title: Core CS & Web Fundamentals
order: 4
---

For most high-level backend engineering, the underlying transport layers and operating system mechanics are heavily abstracted. However, when performance degrades, memory leaks occur, or you are designing low-latency distributed systems, understanding how computers actually communicate and manage hardware resources becomes critical.

Top-tier companies frequently test these fundamentals to ensure candidates understand what happens "under the hood."

## Networking & Web

- **[The OSI Model](./001-the-osi-model)**: The 7 layers of network abstraction (from wires to APIs).
- **[TCP vs UDP (Layer 4)](./002-tcp-vs-udp)**: Reliable handshakes vs. reckless speed.
- **[Routing (DNS & BGP)](./003-dns-and-bgp)**: How domains are resolved and packets are routed globally.
- **[HTTP vs HTTPS (TLS)](./004-http-vs-https)**: Deep dive into the TLS handshake and asymmetric encryption.
- **[Web Security (OWASP)](./005-web-security-owasp)**: Mitigating XSS, CSRF, SQLi, and understanding CORS.

## Operating Systems & Code Execution

- **[Code Execution](./006-compilers-vs-interpreters)**: Compilers, Interpreters, and JIT (Just-In-Time) compilation.
- **[Memory Management](./007-memory-management)**: Virtual memory, paging, and preventing thrashing.
- **[CPU Scheduling](./008-cpu-scheduling)**: How the OS decides which process runs next.
- **[File Systems & I/O](./009-file-systems-and-io)**: Inodes, journaling, and disk performance.

> "There is no cloud, it's just someone else's computer. And that computer runs an OS connected to a router."
