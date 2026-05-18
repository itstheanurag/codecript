---
title: The OSI Model
order: 1
---

When you send a message on WhatsApp or fetch a JSON payload from a server, data must travel from your app, through your device's hardware, across the globe via copper wires and fiber optics, and back up into the recipient's software.

To make sense of this massive complexity, engineers created the **OSI (Open Systems Interconnection) Model**—a conceptual framework that divides network communication into 7 distinct layers.

## The 7 Layers (Top to Bottom)

> [!TIP]
> **ELI5: The International Post Office**
> *   **Layer 7 (Application):** You write a letter to your friend in French.
> *   **Layer 6 (Presentation):** You translate it to English so the global post office can read it.
> *   **Layer 5 (Session):** You open an official correspondence tracking number.
> *   **Layer 4 (Transport):** You decide if you want Registered Mail (guaranteed delivery) or Standard Mail (cheap but might get lost).
> *   **Layer 3 (Network):** You write the exact global GPS coordinates (IP Address) on the envelope.
> *   **Layer 2 (Data Link):** The mailman drives the physical truck from your house to the local post office using local roads (MAC Addresses).
> *   **Layer 1 (Physical):** The truck's engine running on gasoline.

### Layer 7: Application
This is the layer closest to the end-user. It provides network services directly to the software applications.
*   **Protocols:** HTTP, HTTPS, FTP, SMTP, DNS.
*   **What you do here:** Writing REST APIs, GraphQL, sending emails.

### Layer 6: Presentation
Responsible for translating, encrypting, and compressing data. It ensures that the data sent from the application layer of one system is readable by the application layer of another.
*   **Protocols:** TLS/SSL encryption, JPEG, ASCII encoding.

### Layer 5: Session
Manages the setup, coordination, and termination of conversations (sessions) between applications. 
*   *Note: In the modern internet (TCP/IP model), Layers 5, 6, and 7 are often just grouped together as the "Application Layer".*

### Layer 4: Transport
Crucial for backend engineers. This layer decides *how* data is transported. It segments massive data streams into smaller, manageable chunks (segments).
*   **Protocols:** TCP (Transmission Control Protocol) and UDP (User Datagram Protocol).
*   **What you do here:** Deciding between TCP (reliable, slow) or UDP (unreliable, fast). Managing Ports (e.g., Port 80 for HTTP, Port 443 for HTTPS).

### Layer 3: Network
Responsible for routing data packets across the global internet from the source to the destination.
*   **Protocols:** IP (Internet Protocol), ICMP (Ping), IPsec.
*   **What you do here:** Managing IP Addresses, Subnets, and Routers. (An IP Address is like a house address).

### Layer 2: Data Link
Responsible for node-to-node data transfer. While Layer 3 gets data from New York to London, Layer 2 gets data from your Laptop to your Home WiFi Router.
*   **Protocols:** Ethernet, Wi-Fi (802.11), ARP.
*   **What you do here:** Managing MAC Addresses (the permanent physical hardware address of your network card).

### Layer 1: Physical
The actual physical hardware that transmits raw bit streams over a physical medium.
*   **Mediums:** Fiber optic cables, copper Ethernet cables, radio waves (Wi-Fi).
*   **Data Unit:** Bits (`0`s and `1`s).

## Why do Software Engineers care?

For 99% of your career as a Software Engineer, you will only operate at **Layer 7** (Writing APIs) and **Layer 4** (Opening ports, configuring Load Balancers, dealing with TCP/UDP). 

However, if you are designing a high-frequency trading platform, a globally distributed database, or a low-latency video streaming service, you will absolutely need to understand how the lower layers drop packets or route traffic.
