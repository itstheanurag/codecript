---
title: A Clean Git Workflow for Small Teams
excerpt: Trunk-based development, feature branches, and conventions that keep your git history readable.
date: 2026-02-10
readTime: 5 min read
tags: [DevOps, Git]
---

A messy git history slows everyone down. Here's a workflow that keeps things clean without adding ceremony.

## The Basics

1. **main** is always deployable
2. Feature branches are short-lived (1-3 days max)
3. Every merge goes through a pull request

## Branch Naming

Use a consistent convention:

```
feature/add-user-auth
fix/login-redirect-loop
chore/update-dependencies
```

## Commit Messages

Follow the Conventional Commits spec:

```
feat: add email verification flow
fix: prevent duplicate form submissions
docs: update API endpoint documentation
refactor: extract validation into shared module
```

## The Workflow

1. Pull latest main
2. Create a feature branch
3. Make small, focused commits
4. Open a PR when ready
5. Address review feedback
6. Squash and merge into main

## Squash Merging

Squash merging collapses all your branch commits into a single commit on main. This keeps the main branch history clean and readable while allowing messy work-in-progress commits on branches.

## Avoid These Anti-patterns

- **Long-lived branches** — Merge conflicts grow exponentially with time
- **Committing directly to main** — No review, no safety net
- **Huge PRs** — Keep them under 400 lines of diff when possible
- **Vague commit messages** — "fix stuff" tells nobody anything

A clean git history is a gift to your future self and your teammates.
