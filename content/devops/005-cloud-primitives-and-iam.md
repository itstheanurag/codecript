---
title: Cloud Primitives & IAM
order: 5
---

Whether you are using AWS, Google Cloud (GCP), or Microsoft Azure, every public cloud provider offers the same foundational primitives. A senior engineer must understand how to piece these building blocks together to form secure, scalable architectures.

## 1. Compute & Storage Primitives

### Virtual Machines (EC2 / Compute Engine)
The fundamental unit of cloud computing. You rent a slice of a physical server in a data center. You manage the Operating System, install the dependencies, and run your code. It provides maximum control, but maximum maintenance overhead.

### Object Storage (S3 / Cloud Storage)
Unlike file systems on a hard drive, Object Storage treats data as discrete objects stored in a flat hierarchy (Buckets). You cannot modify a single byte of a file in S3; you must overwrite the entire object.
*   **Use Cases:** Storing user uploads (images, videos), storing database backups, serving static frontend assets (HTML/CSS/JS) directly to a CDN.

## 2. Virtual Private Clouds (VPC)

A VPC is your own logically isolated section of the AWS Cloud. It allows you to define a virtual network topology that closely resembles a traditional on-premises data center.

### Public vs Private Subnets
A subnet is a range of IP addresses in your VPC.
*   **Public Subnet:** Resources deployed here are given Public IP addresses and can be accessed directly from the open internet via an Internet Gateway. (e.g., Load Balancers, API Gateways).
*   **Private Subnet:** Resources deployed here have no route to the internet. They can only be accessed by other resources *inside* the VPC. (e.g., Application Servers, Databases).

> [!WARNING]
> Never put your Database in a Public Subnet. Your database should live in a Private Subnet, only accepting connections from your Application Servers.

## 3. Identity and Access Management (IAM)

IAM is arguably the most critical and complex service in any cloud provider. It answers the question: **"Who can do what to which resource?"**

Cloud security breaches rarely happen because a hacker broke AWS's encryption. They happen because an engineer accidentally gave a public web server permission to read an entire S3 bucket of sensitive data.

### The Principle of Least Privilege
You must grant users and applications the absolute minimum permissions required to perform their job, and nothing more.

*   **Users:** Human beings (e.g., "Alice the Developer").
*   **Roles:** A hat that an application or user can put on temporarily. Instead of hardcoding API keys into your application code to talk to a database, you assign an IAM Role to your EC2 instance. The cloud provider automatically injects temporary, rotating credentials into the instance.
*   **Policies:** JSON documents attached to Users or Roles that explicitly define permissions. 

**Example Policy:**
```json
{
  "Effect": "Allow",
  "Action": [
    "s3:GetObject",
    "s3:PutObject"
  ],
  "Resource": "arn:aws:s3:::my-company-assets/*"
}
```
This policy allows the entity to Read (`GetObject`) and Write (`PutObject`) files, but *only* inside the `my-company-assets` bucket. It explicitly denies deleting files (`DeleteObject`).
