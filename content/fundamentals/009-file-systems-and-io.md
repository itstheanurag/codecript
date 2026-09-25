---
title: File Systems & I/O
description: Learn inodes, directories, journaling, page cache, fsync, and why disk I/O is the bottleneck databases work around.
order: 9
---

A disk is blocks of bits. A **file system** is the scheme that turns those blocks into files, directories, permissions, and names. Most production bugs at this layer are not "ext4 vs XFS." They are **full disks**, **forgotten `fsync`**, and **random I/O** on a spinning rust mental model that still applies to tail latency.

> [!TIP]
> **ELI5: Library catalog**
> The book (data blocks) lives on shelves. The **inode** is the catalog card: size, owner, where the shelves are. The **filename** is not on the card — it lives in a folder listing (a directory is a file that maps names → inode numbers). Two names can point at one card (**hard link**). A **symlink** is a card that just says "see that other name."

## 1. Inodes, names, and links

On Unix, a file is an **inode** + data blocks.

The inode stores type, mode (`rwx`), owner, size, timestamps, and **pointers to data blocks** (and indirect pointers for large files). It does **not** store the name.

A **directory** is a list of `(name, inode number)`. That is why `mv` inside a filesystem is cheap: you rewrite directory entries, not the file bytes.

```bash
ls -li file.txt          # left column is inode
stat file.txt
df -i                    # inode exhaustion: lots of tiny files can fill inodes first
```

**Hard link:** second name, same inode, same data. Data lives until the last link (and last open fd) is gone.

**Symlink:** a small file holding a path. Breaks if you move the target.

**"No space left on device"** can mean data blocks **or** inodes. `df -h` vs `df -i`.

## 2. Journaling (why the disk is not soup after a crash)

A write is several steps: update data, update inode, update directory. Power loss in the middle = torn metadata.

**Journaling** file systems (ext4, NTFS, APFS) write an **intent log** first, then the real structures. On mount after a crash, the journal is replayed or rolled back. You get a **consistent tree**, not necessarily every byte of file contents (depends on journal mode: metadata-only vs data=journal).

This is consistency of the *file system*, not of your *database*. Postgres still has its own WAL.

## 3. Sequential vs random, HDD vs SSD

**Sequential:** read the next block, then the next. HDD heads barely move; NVMe is still happiest here (large reads). Logs, scans, video.

**Random:** tiny reads scattered. HDD dies (milliseconds per seek). NVMe is orders of magnitude better but still not RAM; p99 spikes if the queue depth explodes.

Databases and KV stores are designed around this (LSM vs B-tree, compaction, write amplification). Your API that `read()`s a 10-byte file per request on a network filesystem will feel it.

## 4. Page cache and `fsync`

Linux uses spare RAM as **page cache**. Reads of hot files never hit disk. Writes often go to cache (**dirty pages**) and flush later.

```text
write()  →  page cache (fast)  →  later  →  disk
fsync()  →  "I mean it: durable now"
```

That is why `write()` returning does **not** mean the file survived a crash. Databases call `fsync` (or `fdatasync`) on WAL files. That is also why "sync every write" tanks throughput.

> [!WARNING]
> Docker and VMs lie if the hypervisor caches too. A test that `write()`s a file then "pulls the plug" in a VM may still see data that would have died on real power loss. Durability tests need `fsync` and a clear storage path.

`O_DIRECT` bypasses the cache when you want to manage buffers yourself (some DBs). Most app code should not.

## 5. What you debug on a box

```bash
df -h && df -i
iostat -xz 1              # await, %util
dmesg | grep -i error     # dying disk
lsof | grep deleted       # process holds a deleted file; space not freed until exit
```

A classic outage: log file deleted but the process still has it open — `df` stays at 100% until restart.

## What to remember

- Names live in directories; identity and blocks live in inodes. Links are extra names.
- Journaling protects file-system metadata across crashes; it is not your app's durability story.
- `write` is to cache; `fsync` is to media. Databases pay for `fsync` on purpose.
- Full inodes, held-deleted files, and random I/O are the boring causes of "the disk is broken."
