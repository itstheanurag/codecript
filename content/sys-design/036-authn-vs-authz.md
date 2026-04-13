---
title: Authentication vs. Authorization
order: 36
---

In system design security, we deal with two fundamental questions that sound similar but are completely different.

---

## 1. Authentication (AuthN)

**Question**: *Who are you?*

Authentication is the process of verifying the identity of a user or system.

### Common Methods:
-   **Password**: The classic "Secret only you know".
-   **Biometrics**: Fingerprints, FaceID.
-   **SSO (Single Sign-On)**: Logging in via Google or GitHub.
-   **MFA (Multi-Factor Authentication)**: Password + SMS code or Authenticator app.

---

## 2. Authorization (AuthZ)

**Question**: *What are you allowed to do?*

Authorization is the process of verifying what specific files, data, and permissions an authenticated user has.

### Common Models:
-   **RBAC (Role-Based Access Control)**: You are an "Admin", so you can delete users. You are a "Viewer", so you can only read.
-   **ABAC (Attribute-Based Access Control)**: You can access this file only if you are in the "Marketing" department and it is "Monday".
-   **ACL (Access Control Lists)**: User 1 can read File A. User 2 cannot.

---

## Comparison Summary

| Feature | Authentication (AuthN) | Authorization (AuthZ) |
| :------- | :--- | :--- |
| **Pillar** | Identity | Permissions |
| **Order** | Happens first | Happens second |
| **Example** | Entering your ID badge into the office door. | The badge only lets you into the 3rd floor, not the server room. |
| **Transferred via** | ID Tokens | Access Tokens (e.g., Scopes) |

---

## The Workflow in Microservices

1.  **Client** talks to the **Identity Provider (IdP)** to authenticate.
2.  **IdP** returns an **ID Token** (who they are) and an **Access Token** (what they can do).
3.  **Client** sends the **Access Token** to the **API Gateway**.
4.  **API Gateway** (or the individual service) checks the **Access Token** for the required "Scopes" before allowing the action.

---

## Key Takeaways

-   Always separate AuthN from AuthZ.
-   **AuthN** should be centralized (e.g., using an Identity Provider).
-   **AuthZ** can be centralized (in the Gateway) or decentralized (inside each service for fine-grained control).

> Identity is about proof. Permissions are about boundaries.
