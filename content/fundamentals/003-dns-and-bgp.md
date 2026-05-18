---
title: Routing (DNS & BGP)
order: 3
---

To connect to a server across the globe, your computer needs two things: 
1. The server's exact GPS coordinates (IP Address).
2. The physical road map to get there.

The internet solves these two problems using **DNS** and **BGP**.

## 1. DNS (Domain Name System)

Computers communicate using IP Addresses (e.g., `142.250.190.46`). Humans communicate using words (e.g., `google.com`). DNS is the phonebook of the internet that translates human-readable domain names into machine-readable IP addresses.

### The DNS Resolution Journey

When you type `codecript.com` into your browser, an incredibly complex lookup happens in milliseconds:

1.  **Browser Cache:** The browser checks if it already knows the IP address. If not, it asks the Operating System.
2.  **OS Cache / ISP Resolver (Recursive Nameserver):** The OS asks your internet service provider's DNS resolver. If the ISP doesn't know, it takes on the burden of finding out.
3.  **The Root Server:** The ISP's resolver asks the global Root Server (there are only 13 logical root servers in the world). The Root Server says, "I don't know the IP, but I know who manages the `.com` domains. Go ask the `.com` TLD server."
4.  **The TLD (Top-Level Domain) Server:** The resolver asks the `.com` TLD server. The TLD server says, "I don't know the exact IP, but I know the company that registered `codecript.com` (like AWS Route53). Go ask them."
5.  **The Authoritative Nameserver:** The resolver asks AWS Route53. AWS says, "I am the authoritative owner of this domain. The IP address is `203.0.113.5`."
6.  **Return & Cache:** The resolver returns the IP to your browser and caches it for a set time (the TTL - Time To Live) so it doesn't have to do this again.

## 2. BGP (Border Gateway Protocol)

Okay, your computer now knows that the server is located at `203.0.113.5`. But how does your packet of data physically get from your laptop in New York to a server in Tokyo?

The internet is not one giant cloud; it is a "network of networks." AT&T owns a network, Verizon owns a network, AWS owns a network. These are called **Autonomous Systems (AS)**.

**BGP is the protocol that allows these massive networks to talk to each other and draw the map of the internet.**

### How BGP Works

*   Every Autonomous System is assigned a unique ASN (Autonomous System Number).
*   Networks use BGP to broadcast to their neighbors: *"Hey, I am AT&T. I know the fastest way to get to IP addresses starting with `203.0.*`. If you have traffic for them, send it to me."*
*   When your packet leaves your home router, it hits your ISP's massive BGP router. 
*   The router looks at its BGP routing table, finds the shortest path to Tokyo, and forwards the packet to the next major Autonomous System along the route.

> [!WARNING]
> **The BGP Hijack**
> BGP was built in the 1980s on "blind trust." If a rogue ISP in another country accidentally broadcasts to the world, *"Hey, I am the fastest route to YouTube,"* global internet traffic will literally re-route to that rogue ISP, taking YouTube offline globally. This has happened multiple times in history (known as a BGP Hijack or Route Leak).
