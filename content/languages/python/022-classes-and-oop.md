---
title: Object-Oriented Programming (OOP)
order: 22
---

Object-Oriented Programming (OOP) is a paradigm that allows us to represent complex entities—like a **Car**, a **User**, or a **Transaction**—by grouping related data (attributes) and behaviors (methods) together.

Instead of managing a scattered collection of variables and functions, OOP provides a structured way to model the "Actors" in your system.

---

## 1. Classes vs. Objects: The Blueprint Analogy

### The Class (Blueprint)
A **Class** is a template or blueprint. It defines the structure and behavior that all objects of that type will follow. It doesn't exist as a physical entity; it is the "plan" for one.
- Defines attributes (e.g., `make`, `model`, `year`).
- Defines methods (e.g., `start_engine()`, `drive()`).

### The Object (Instance)
An **Object** is a specific instance created from that blueprint. In your computer's memory, this is where the actual data lives.
- You can create multiple objects (instances) from the same class.
- Each instance has its own state (e.g., "Silver Tesla" vs. "Blue Ford") but shares the same design.

```python
class Dog:
    def __init__(self, name, breed):
        # State: Attributes stored in the instance
        self.name = name
        self.breed = breed

    def bark(self):
        # Behavior: Actions the object can perform
        print(f"{self.name} says Woof!")

# Instantiation: Creating a 'Dog' object from the 'Dog' class
buddy = Dog("Buddy", "Golden Retriever")
max_dog = Dog("Max", "Poodle")

buddy.bark() # Output: Buddy says Woof!
```

---

## 2. The Four Pillars of OOP

To build production-grade software, you must understand the four fundamental principles of OOP:

### I. Encapsulation (Information Hiding)
Encapsulation is the practice of bundling data and methods into a single unit and restricting access to some of the object's components.
- **Why?** It prevents external code from accidentally corrupting the internal state.
- **Python Convention**: We use a single underscore `_` or double underscore `__` to suggest a variable is "private."

### II. Inheritance (Code Reuse)
Inheritance allows one class (Subclass) to derive characteristics from another class (Superclass).
- **Example**: A `Vehicle` class handles `fuel` and `capacity`, while a `SportsCar` class inherits those and adds `turbo_boost()`.

### III. Polymorphism (Multiple Forms)
Polymorphism allows different classes to share the same method name but implement them differently.
- **Example**: Both `Dog` and `Cat` might have a `make_sound()` method, but one prints "Woof" and the other prints "Meow."

### IV. Abstraction (Complexity Reduction)
Abstraction focuses on hiding the complex internal implementation and showing only the essential features of the object.
- **Example**: When you use a car, you interact with the steering wheel (Interface), not the combustion process (Implementation).

---

## 3. Memory and Performance: References

In Python, when you create an object, you are actually creating a **Reference** to a location in memory. If you assign `dog2 = dog1`, both variables point to the *same* object.

> **Technical Note**: Python's `__init__` method is not actually a "Constructor" but an "Initializer." The object is actually created by `__new__` before `__init__` is called to set the initial values.

---

### Real-World Use Case: Game Development
In a video game, every "NPC" (Non-Player Character) is an **Object** spawned from a base `Character` class. They all inherit the ability to move and take damage, but their specific `health`, `texture`, and `location` are unique to that instance.
