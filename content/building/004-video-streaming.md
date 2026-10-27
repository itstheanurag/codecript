---
title: Video Streaming (YouTube/Netflix)
description: The full video pipeline — resumable upload, transcoding ladders, HLS/DASH packaging, CDN delivery, DRM, storage lifecycle, and the cost model that decides the design.
order: 4
---

Video is bandwidth- and CPU-dominated. The architecture is an **ingestion pipeline** feeding a **CDN**, with the database only storing metadata.

## Scope

In scope:

- Upload (large files, resumable).
- Transcode to multiple resolutions/bitrates.
- Adaptive playback (HLS/DASH).
- Public/private videos with signed access.
- Thumbnails, captions (optional).
- View analytics (aggregate).

Out of scope v1:

- Live streaming (different pipeline).
- Recommendations.
- Collaborative editing.
- Full DRM (plan for it if licensing requires).

## Estimates

```
1M uploads/day × 500 MB average = 500 TB/day ingested
transcode: 1 hour of video → ~1–2 hours CPU across ladder (varies wildly)
playback: 10M concurrent viewers × 5 Mbps = 50 Tbps at the edge
metadata: 1M rows/day, tiny compared to media
```

Storage and egress dominate cost. The CDN is not optional; origin egress at this scale is prohibitive.

## Upload

Do **not** proxy large files through your API servers.

1. Client requests an upload session: `POST /videos` → `{videoId, uploadUrls}`.
2. API returns pre-signed multipart URLs to object storage.
3. Client uploads parts directly, resumable (retry per part).
4. Client completes: `POST /videos/{id}/complete` with ETags/parts.
5. Server verifies the object (size, checksum, container), enqueues processing.

```http
POST /videos
{"title":"...","sizeBytes":524288000,"contentType":"video/mp4"}
→ 201 {"videoId":"v_1","uploadId":"...","partUrls":[...]}
```

Validation:

- content type by sniffing, not the header alone;
- max size/duration per plan;
- malware scan (async) before publishing;
- quota per account.

## Transcoding pipeline

```
upload → validate → probe (ffprobe) → transcode ladder → package → publish
                              └→ thumbnails, captions, loudness
```

A ladder might be:

| Rendition | Resolution | Bitrate |
|---|---|---|
| 240p | 426×240 | 300 kbps |
| 480p | 854×480 | 800 kbps |
| 720p | 1280×720 | 2.5 Mbps |
| 1080p | 1920×1080 | 5 Mbps |
| 4K | 3840×2160 | 15–25 Mbps |

Decisions:

- **Codec**: H.264 for compatibility, HEVC/AV1 for bandwidth savings (decode support varies).
- **Per-title encoding**: analyze complexity and choose bitrates; big savings at scale.
- **Chunked work**: split the video into segments and transcode in parallel; merge after.
- **Idempotency**: jobs keyed by `(videoId, rendition, attempt)`; retries must not duplicate outputs.
- **Priority queues**: small/paid uploads first; fairness across tenants.

Store renditions as immutable objects; publishing is a metadata flip.

## Packaging: HLS/DASH

Segments + manifests:

```
master.m3u8
  720p/index.m3u8   → segment_00001.ts, segment_00002.ts, ...
  1080p/index.m3u8  → ...
```

- **HLS** (Apple) and **DASH** (MPEG) are the standards; most players support both.
- Segments are 2–6 s; shorter = lower latency, more requests.
- Manifests and segments are just HTTP objects → CDN-cacheable.
- **Signed URLs/cookies** for private content; short TTLs.
- **DRM** (Widevine/FairPlay/PlayReady) if licensing requires; adds key management and player complexity.

## Delivery

- Serve manifests/segments from the CDN, not the origin.
- Cache segments aggressively (immutable names), manifests briefly.
- **Adaptive bitrate (ABR)**: the player switches renditions based on throughput/buffer.
- **Origin shield** to protect the origin from cache misses.
- **Geo-routing** to the nearest edge.
- **Egress cost**: negotiate CDN commit pricing; consider multi-CDN for leverage/redundancy.
- **Start-up latency**: preload the first segments; keep the manifest small.

## Storage lifecycle

- Raw uploads: temporary bucket, delete after processing (or retain per policy).
- Renditions: hot tier for popular, infrequent-access tier for long tail.
- Lifecycle rules: transition/expire by age and popularity.
- Deletion must remove segments/manifests and invalidate CDN caches.

## Playback analytics

Players emit events (start, buffer, bitrate switch, error, completion) via a beacon endpoint. Aggregate, don't store per-event forever:

- QoE metrics: startup time, rebuffer ratio, error rate by region/ISP/device.
- Use for ABR tuning and CDN selection.
- Sample if volume is huge; preserve error events fully.

## Failure modes

| Failure | Impact | Mitigation |
|---|---|---|
| Transcode backlog | uploads stuck "processing" | autoscaled workers, priority queues, ETA |
| Poison input | worker crash loop | validation, quarantine, DLQ |
| CDN miss storm | origin overload | origin shield, request collapsing |
| Manifest cached too long | stale renditions | short TTL, versioned manifests |
| Signed URL leak | unauthorized access | short expiry, per-session tokens |
| Storage cost creep | margin collapse | lifecycle tiers, delete raw, per-title encoding |
| Encoding bug | bad playback | canary renditions, QoE monitoring |

## Build order

1. Pre-signed upload + metadata + validation.
2. Single-rendition transcode + object storage.
3. HLS packaging + CDN playback.
4. Ladder + ABR.
5. Thumbnails/captions.
6. Signed access + private videos.
7. Lifecycle/cost optimisation.
8. QoE analytics + alerts.

## Review questions

- Why not upload through the API servers?
- How do you make transcoding idempotent and resumable?
- What is the cache TTL for manifests vs segments?
- How do private videos work end to end?
- What is the egress cost at 10M concurrent viewers?
- What happens when a transcode worker dies mid-job?

## Checklist

- [ ] Uploads go directly to object storage with resumable parts.
- [ ] Input is validated and scanned before publishing.
- [ ] Transcode jobs are idempotent with retries and a DLQ.
- [ ] Renditions are immutable; publishing flips metadata.
- [ ] Manifests/segments are CDN-cached with correct TTLs.
- [ ] Private content uses short-lived signed access.
- [ ] Storage lifecycle and egress costs are modelled.
- [ ] QoE metrics and playback error alerts exist.
