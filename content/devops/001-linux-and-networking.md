---
title: Linux & Networking Basics
order: 1
---

Before you can orchestrate a cluster of thousands of containers in the cloud, you must understand the operating system that runs 96% of the top 1 million web servers: **Linux**.

DevOps begins with the terminal. If a server goes down, you won't have a GUI to fix it.

## 1. Process Management

Every running program on a Linux machine is a **Process**. Understanding how to monitor and manipulate processes is critical for debugging resource leaks.

*   **`top` & `htop`:** The task managers of Linux. They show you exactly which processes are consuming your CPU and Memory. `htop` provides a much cleaner, color-coded interface.
*   **`ps aux`:** Lists every currently running process on the machine. Commonly piped into grep: `ps aux | grep node` to find the exact Process ID (PID) of your Node.js application.
*   **`kill <PID>`:** Sends a signal to gracefully stop a process.
*   **`kill -9 <PID>`:** The nuclear option. Sends `SIGKILL`, forcing the OS to terminate the process immediately without letting it clean up its resources.

## 2. Users, Groups, and Permissions

Security in Linux is heavily based on file permissions. A massive number of deployment bugs boil down to: "The application doesn't have permission to read that configuration file."

Every file has three sets of permissions: **User (Owner)**, **Group**, and **Others**.
For each set, there are three rights: **Read (r)**, **Write (w)**, and **Execute (x)**.

*   **`chmod` (Change Mode):** Modifies permissions. You will often see numbers like `chmod 755 script.sh`.
    *   `7` (Owner): Read (4) + Write (2) + Execute (1)
    *   `5` (Group): Read (4) + Execute (1)
    *   `5` (Others): Read (4) + Execute (1)
*   **`chown` (Change Owner):** Transfers ownership of a file from one user to another.

> [!WARNING]
> Never run an application server (like a web server or database) as the `root` user. If an attacker exploits a vulnerability in your Node.js app, and it's running as `root`, they instantly gain full control over the entire server.

## 3. Networking & Debugging

When microservices fail to communicate, these are the tools you use to find out why:

*   **`ping <ip>`:** Sends a basic ICMP packet to see if a server is alive. Note: Many production servers block ping requests for security reasons.
*   **`curl -I <url>`:** Fetches the HTTP headers of a website. Crucial for verifying API endpoints without downloading the entire response body.
*   **`netstat -tulpn`:** Shows you exactly which ports are open on your machine and which processes are listening on them. If your app crashes saying "Port 8080 is already in use," this command tells you who is using it.
*   **`iptables` / `ufw`:** The built-in Linux firewalls. You use these to explicitly block all incoming traffic except for specific ports (like 80 for HTTP and 443 for HTTPS).
