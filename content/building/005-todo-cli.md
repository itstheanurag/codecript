---
title: Build a Todo CLI
description: A small project done rigorously — command design, storage format, atomic writes, concurrency, exit codes, tests, and packaging.
order: 5
---

A todo CLI is the smallest project where **every production habit still applies**: parsing, persistence, concurrency, errors, tests, and packaging. It is a good calibration exercise.

## Scope

```
todo add "buy milk" --due 2025-01-10 --tag errands
todo list [--all] [--tag errands]
todo done 3
todo rm 3
todo edit 3 --text "buy oat milk"
todo export --format json
```

Out of scope for v1: sync across devices, a server, notifications, recurring tasks.

## Command design

Rules that make CLIs pleasant:

- **Verbs are explicit**; no interactive prompts by default.
- `--help` on every command; examples in help text.
- Machine-readable output (`--json`) separate from human output.
- **Exit codes**: `0` success, `1` generic failure, `2` usage error, `3` not found.
- Errors go to stderr; data goes to stdout.
- Respect `NO_COLOR` and non-TTY output (no spinners in pipes).

```ts
program
  .command("add")
  .argument("<text>")
  .option("--due <date>", "due date (YYYY-MM-DD)")
  .option("--tag <tag>", "tag", collect, [])
  .action(async (text, opts) => {
    const task = await store.add({ text, due: opts.due, tags: opts.tag });
    console.log(`added #${task.id}`);
  });
```

## Storage

For a single-user CLI, a JSON file or SQLite are both fine.

**JSON** (simple, portable):

```json
{
  "version": 1,
  "nextId": 4,
  "tasks": [
    { "id": 1, "text": "buy milk", "done": false, "tags": ["errands"], "createdAt": "2025-01-01T10:00:00Z" }
  ]
}
```

**SQLite** (queries, concurrency, growth):

```sql
CREATE TABLE tasks (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  text       TEXT NOT NULL,
  done       INTEGER NOT NULL DEFAULT 0,
  due        TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE tags (task_id INTEGER, tag TEXT, PRIMARY KEY (task_id, tag));
```

Choose JSON if you want zero dependencies and tiny data; SQLite if you need filtering, transactions, or multiple processes.

## Atomic writes

Never truncate the file and then write — a crash leaves an empty file.

```ts
import { writeFile, rename } from "node:fs/promises";

async function save(path: string, data: unknown) {
  const tmp = `${path}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await rename(tmp, path);         // atomic on the same filesystem
}
```

Also:

- create a backup (`.bak`) before migrations;
- validate the schema on load; fail with a clear message;
- store the data under `$XDG_DATA_HOME`/platform equivalent, not the CWD.

## Concurrency

Two `todo` processes can race:

- **File lock** (`flock`) around read-modify-write for JSON;
- SQLite transactions/`BEGIN IMMEDIATE` for the database;
- **compare-and-swap** on a version field if you want optimistic concurrency.

```ts
const release = await lockfile.lock(dataPath);
try {
  const data = await load(dataPath);
  mutate(data);
  await save(dataPath, data);
} finally {
  await release();
}
```

Without this, `add` + `done` run concurrently can lose one update.

## IDs and ordering

- Monotonic integer ids are friendly for humans (`todo done 3`).
- Do not reuse ids after deletion; keep `nextId`.
- Sort by `createdAt` (or explicit order) and document it.
- For stable list output, add a tiebreaker.

## Testing

- **Unit**: parsing dates, tag validation, filtering.
- **Integration**: run commands against a temp data dir; assert exit codes and stdout/stderr.
- **Concurrency**: two processes adding simultaneously; assert no lost updates.
- **Migration**: old file version → new version, with backup.
- **Golden files**: `--json` output snapshots.

```ts
test("done 3 marks the task", async () => {
  const dir = await tempDir();
  await run(["add", "a"], { dir });
  await run(["add", "b"], { dir });
  const result = await run(["done", "2"], { dir });
  expect(result.code).toBe(0);
  const list = JSON.parse((await run(["list", "--json"], { dir })).stdout);
  expect(list.find((t: Task) => t.id === 2).done).toBe(true);
});
```

## Packaging

- Ship a single binary (Go/Rust/Bun compile) or a package with a `bin` entry.
- Pin the runtime; document installation.
- Version the data format; migrate on upgrade.
- Add shell completions if the CLI is used daily.
- Keep startup under ~100 ms; lazy-load heavy modules.

## Failure modes

| Failure | Result | Fix |
|---|---|---|
| Non-atomic write | corrupted/empty store | temp file + rename |
| Lost updates | tasks disappear | file lock/transaction |
| Unclear errors | user retries blindly | stderr + exit codes |
| Data in CWD | lost on upgrade | platform data dir |
| No migration | crash on old file | version + backup |
| JSON output polluted | scripts break | separate stdout/stderr |

## Extensions

- Recurring tasks (cron-like rules).
- Sync via a server (now you need conflict resolution).
- Natural-language dates (`--due "next friday"`).
- Undo (`todo undo`).

## Checklist

- [ ] Commands are documented with examples and flags.
- [ ] Exit codes and stderr/stdout separation are correct.
- [ ] Writes are atomic and locked against concurrent processes.
- [ ] Data is stored in a platform-appropriate directory.
- [ ] The format is versioned and migrated with a backup.
- [ ] Tests cover parsing, persistence, concurrency, and JSON output.
- [ ] Packaging installs a runnable binary/entry point.
