---
title: Dependency Management
order: 24
---

# Virtual Environments: Isolating Dependencies

One of the challenges of Python development is managing "Dependency Conflicts." If Project A requires `Requests v2.0` and Project B requires `Requests v1.0`, installing them into your global Python system will break one of the projects.

**Virtual Environments** solve this by creating isolated, standalone directory trees that contain a specific Python installation and a distinct set of libraries.

---

## 1. Why Isolation is Mandatory

Without isolation, you risk:
1. **System Instability**: Overwriting critical libraries used by your Operating System's Python (on Mac/Linux).
2. **"It Works on My Machine"**: Difficulty in sharing code since your global environment is unique.
3. **Circular Dependencies**: Trying to satisfy two conflicting requirements at once.

---

## 2. Using `venv` (The Built-in Standard)

As of Python 3.3, isolation is a built-in feature via the `venv` module.

```bash
# 1. Create the environment
python3 -m venv .venv

# 2. Activate it (Platform specific)
source .venv/bin/activate  # Mac/Linux
.venv\Scripts\activate     # Windows

# 3. Install dependencies
pip install requests
```

Once activated, your `$PATH` is modified so that the `python` and `pip` commands point to the bin/scripts folder inside the `.venv` directory.

---

## 3. The Dependency Manifest: `requirements.txt`

To ensure your project is reproducible, you should always track your dependencies.

```bash
# Save current environment state
pip freeze > requirements.txt

# Reconstruct environment on a new machine
pip install -r requirements.txt
```

---

## 4. Modern Tools: Poetry and Conda

While `venv` is the base, the industry often uses more advanced tools:

- **Poetry**: Handles dependency resolution, lockfiles (`poetry.lock`), and packaging in a single tool. It is the modern standard for new Python projects.
- **Conda**: A manager that handles not just Python, but also C-libraries and non-Python dependencies. It is essential for Data Science and Machine Learning.

---

## Interview Pro-Tips: How does `pip` work?
If asked about dependency resolution: 
- `pip` uses a backtracking resolver to find a set of package versions that satisfy all constraints.
- In professional CI/CD pipelines, always use **Lockfiles** (created by Poetry or `pip-compile`) to ensure you are installing the exact same bytes in production as you did in development.

---

## Technical Summary
1. `DotVenv`: A common practice is to name your environment `.venv` and add it to your `.gitignore`.
2. `Activation`: Only a temporary terminal state; does not modify the filesystem outside the virtual environment folder.
3. `Reproducibility`: The goal is to make your environment disposable and reconstructible from a single command.
