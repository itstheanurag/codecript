---
title: File Systems & I/O
description: How writes actually reach disk — the page cache, fsync and atomic rename, journaling vs COW, IOPS vs throughput, direct/async I/O, and the durability bugs that lose data.
order: 9
---

"The write succeeded" is not the same as "the data is on disk". File systems, page caches, and device caches sit between your `write()` and durable storage.

## The layers

```
application
  read()/write()/mmap()/fsync()
    -> VFS (common interface)
      -> file system (ext4, xfs, btrfs, zfs, overlayfs)
        -> block layer (I/O scheduler)
          -> device (SSD/HDD/network volume)
```

- **VFS** abstracts different file systems behind one API.
- **Inode** stores metadata (permissions, size, block pointers); the **dentry** caches path→inode.
- **File descriptor** is a process-local handle; leaking them is a common outage.

## The page cache

Reads/writes go through the kernel page cache by default:

- `write()` copies into cache and returns.
- Dirty pages are flushed asynchronously by **writeback**.
- A crash before flush loses the data (unless the FS journals it, which is not the same as application durability).

`fsync(fd)` flushes data + metadata for that file. `fdatasync` skips non-essential metadata. `sync()` flushes everything (slow).

**Durability rule**: to guarantee a file's contents survive a power loss, `fsync` the file **and** the directory entry if you created/renamed it.

## Atomic writes

A common pattern:

```ts
await writeFile(`${path}.tmp`, data);
await fsync(tmpFd);              // data durable
await rename(tmp, path);         // atomic within a filesystem
await fsync(dirFd);              // directory entry durable
```

Without the directory fsync, the rename may be lost after a crash even though the file data is on disk. Rename is atomic only on the same filesystem.

## Journaling vs copy-on-write

| Type | Examples | How it protects |
|---|---|---|
| Journaling | ext4, xfs | logs metadata (and optionally data) before committing |
| Copy-on-write | btrfs, zfs | writes new blocks, then switches pointers |
| Log-structured | f2fs, some flash FS | append-only log, GC |

Journaling modes in ext4:

- `data=ordered` (default): data before metadata commit;
- `data=journal`: full data journaling (slow);
- `data=writeback`: metadata only (risk after crash).

COW gives snapshots/checksums but can fragment and needs free space.

## Performance: IOPS vs throughput vs latency

| Workload | Dominated by |
|---|---|
| Many small random reads | IOPS + latency |
| Large sequential reads | throughput |
| Small synchronous writes | fsync latency |
| Log append | write throughput + fsync |

SSDs have high IOPS but limited write endurance; HDDs have high throughput but terrible random IOPS. Cloud volumes add network latency and burst credits.

Queue depth: more in-flight I/O can increase throughput until latency explodes. Measure both.

## I/O modes

| Mode | Behaviour | Use |
|---|---|---|
| Buffered | page cache, write-back | default; best for most apps |
| `O_DIRECT` | bypass cache, aligned | databases; avoids double caching |
| `mmap` | map file into memory | random reads; page-fault driven |
| `fsync` | durability barrier | transactions/commits |
| async (`io_uring`, AIO) | submit many I/Os | high-throughput servers |
| `sendfile`/`splice` | zero-copy file→socket | static file serving |

## Object storage

S3-style stores are not file systems:

- eventual listing, strong read-after-write in modern S3;
- no partial-file updates; replace whole objects;
- latency per request is higher; parallelise;
- durability is provider-managed;
- use pre-signed URLs for direct client upload/download.

## Failure modes

| Failure | Symptom | Cause |
|---|---|---|
| Data loss after crash | empty/truncated file | no fsync / writeback |
| Lost rename | file missing after power loss | missing directory fsync |
| `ENOSPC` | writes fail | disk full, reserved blocks |
| Inode exhaustion | cannot create files | too many small files |
| Slow fsync | commit latency spikes | device cache/queue saturation |
| Page cache pressure | RSS/dirty pages high | large writes, no throttling |
| FD leak | `EMFILE` | unclosed files/sockets |
| Disk saturation | high `iowait`, PSI full | random I/O storm, noisy neighbour |
| Network volume stall | multi-second latency | cloud volume throttling |

## Measuring

```bash
df -h; df -i              # space and inodes
iostat -xz 1              # per-device util, await, queue
cat /proc/pressure/io     # PSI stall time
pidstat -d 1              # per-process I/O
lsof -p <pid> | wc -l     # fd count
```

- `await` = average latency per I/O.
- `%util` near 100% means saturation (for HDDs; SSDs can be misleading).
- PSI `full` is a better signal of real stalls.

## Practical guidance

- Batch small writes; use append-only logs.
- Avoid fsync per row; group commits (databases do this).
- Stream large files; do not buffer them in memory.
- Use atomic rename for config/state files.
- Monitor inode usage, not just bytes.
- Keep free space headroom (snapshots, COW, compaction).
- Separate write-heavy workloads from latency-sensitive ones.
- Back up; test restores.

## Interview prompts

1. "A database commit takes 20 ms. Why?" → fsync latency, device queue, cloud volume, group commit.
2. "We write a file and rename it, but after a crash it is missing. Why?" → directory fsync missing.
3. "Random reads are slow but sequential is fine. What is the bottleneck?" → IOPS/latency, not bandwidth.

## Checklist

- [ ] Durability requirements are explicit (fsync file + dir).
- [ ] Atomic rename is used for state files.
- [ ] Write amplification and batch sizes are understood.
- [ ] Inode and disk space are monitored.
- [ ] I/O latency (not just throughput) is measured.
- [ ] File descriptors are bounded and closed.
- [ ] Large files are streamed, not buffered.
- [ ] Backups are restored in drills.
