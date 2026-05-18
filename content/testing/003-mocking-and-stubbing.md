---
title: Mocking & Stubbing
order: 3
---

# Mocking and Stubbing

When writing Unit Tests, the code under test must be completely isolated from external dependencies (databases, APIs, time, random number generators). To achieve this isolation, we use "Test Doubles"—objects that look and behave like their production counterparts but are strictly controlled by the test.

## 1. Stubs

A Stub is the simplest form of a test double. It simply provides canned answers to calls made during the test. It does not record how it was called; it just returns pre-programmed data.

*   **Use Case:** When your function needs to query a database to get a user, you pass in a Stub Repository that always returns a fake User object, so you can test the rest of the logic without a real DB.

```javascript
// Stub Example
const stubbedUserRepository = {
    getUserById: (id) => {
        // Always returns this static data, regardless of input
        return { id: 1, name: "Alice", active: true };
    }
};

const userService = new UserService(stubbedUserRepository);
const user = userService.getActiveUser(1);
expect(user.name).toBe("Alice");
```

## 2. Mocks

Mocks are more complex. They are pre-programmed with expectations which form a specification of the calls they are expected to receive. They can verify *how* they were used.

*   **Use Case:** When your function's entire purpose is to trigger a side effect (e.g., sending an email). You use a Mock to verify that the `sendEmail` function was called exactly once, with the correct email address and subject.

```javascript
// Mock Example (using Jest syntax)
const mockEmailService = {
    send: jest.fn() // Creates a mock function that tracks calls
};

const authService = new AuthService(mockEmailService);
authService.registerUser("bob@example.com", "password");

// We assert on the BEHAVIOR of the code, not just the state
expect(mockEmailService.send).toHaveBeenCalledTimes(1);
expect(mockEmailService.send).toHaveBeenCalledWith("bob@example.com", "Welcome!");
```

## 3. Spies

A Spy is a wrapper around an *actual* function or object. It allows the real function to execute normally, but it secretly records arguments, return values, and call counts so you can assert on them later.

*   **Use Case:** When you want to execute real integration logic, but still want to verify that a specific underlying method was triggered during the process.

## 4. The Danger of Over-Mocking

While mocks are essential for unit testing, abusing them leads to fragile tests.

*   **Mocking Implementation Details:** If you mock internal private methods, your tests will break every time you refactor the code, even if the public output remains correct.
*   **Mocking What You Don't Own:** Mocking 3rd-party libraries (like the AWS SDK or an ORM) is dangerous because your mock might behave differently than the real library. Instead, wrap the 3rd-party library in your own abstraction (an Interface/Adapter), and mock your abstraction.

> [!IMPORTANT]
> **Rule of Thumb:** Use Stubs to control the *inputs* to your system under test. Use Mocks to verify the *outputs/side-effects* of your system under test.
