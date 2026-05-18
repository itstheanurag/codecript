---
title: File Systems & I/O
order: 3
---

The hard drive is just a massive array of physical blocks holding 1s and 0s. The File System is the OS abstraction that organizes these blocks into the recognizable structure of files and directories.

## 1. Inodes (Index Nodes)

In Unix-like systems (Linux, macOS), a file is not just its data. It is composed of two parts: the data blocks, and the metadata.

The metadata is stored in an **Inode**.

An Inode contains:
*   File type (regular file, directory, symlink).
*   Permissions (read, write, execute for user, group, others).
*   Owner (UID, GID).
*   File size.
*   Timestamps (creation, modification, access).
*   **Pointers to the physical data blocks on the disk.**

> [!NOTE]
> An Inode does **not** contain the filename. A directory is essentially just a special file that contains a mapping of human-readable filenames to Inode numbers. This is why you can have multiple "Hard Links" (different filenames) pointing to the exact same Inode and data.

## 2. Journaling File Systems

Imagine the OS is in the middle of writing a large file, updating several data blocks and the Inode, and suddenly the power goes out. The file system is now in an inconsistent state, potentially leading to catastrophic data corruption.

Modern file systems (like ext4, NTFS, APFS) use **Journaling** to prevent this.

1.  Before making any actual changes to the main file system structures, the OS writes a "log" or "journal" of the intended changes to a dedicated area on the disk.
2.  Once the journal entry is safely on disk, the OS executes the actual changes.
3.  If power is lost during the actual update, the OS simply reads the journal upon reboot and either replays the completed transaction or rolls back the incomplete one, guaranteeing consistency.

## 3. I/O Performance & Bottlenecks

Disk I/O is often the slowest part of a computer system. 

### Sequential vs. Random Access
*   **Sequential I/O:** Reading or writing contiguous blocks of data (e.g., streaming a video, or appending to a log file). Very fast, especially on traditional HDDs where the physical read head doesn't have to move.
*   **Random I/O:** Reading or writing small chunks of data scattered across the disk (e.g., a heavily fragmented database lookup). Much slower. NVMe SSDs have drastically reduced the penalty for Random I/O, but it remains a critical metric.

### Page Cache (Buffer Cache)
Because disks are slow, the OS aggressively caches disk reads and writes in unused physical RAM.
*   When you read a file, the OS loads it into the Page Cache. A subsequent read of the same file will be served directly from RAM (lightning fast).
*   When you write a file, the OS writes it to the Page Cache first and marks the page as "dirty". It then asynchronously flushes these dirty pages to the physical disk in the background.

> [!WARNING]
> Because writes are buffered in RAM, a sudden power loss means recent writes can be lost. Databases must explicitly tell the OS to bypass the cache and force an immediate sync to the physical disk (using `fsync()`) to guarantee ACID Durability. This is why database writes are significantly slower than normal file writes.
