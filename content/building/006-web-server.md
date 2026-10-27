---
title: Web Server from Scratch
description: Build an HTTP/1.1 server — sockets, parsing, keep-alive, concurrency models, limits, path safety, TLS, and how to benchmark it honestly.
order: 6
---

Writing a small HTTP server is the fastest way to understand the failures you normally only see in incident reports: slowloris, header bombs, request smuggling, connection exhaustion, and broken keep-alive.

## Scope

v1:

- TCP listener, HTTP/1.1 request parsing.
- `GET`/`HEAD` static files, `POST` echo.
- Keep-alive, timeouts, size limits.
- One process, many connections (event loop or thread pool).

Out of scope: HTTP/2, TLS termination (use a proxy), compression, ranges.

## Accept loop

```ts
const server = net.createServer({ pauseOnConnect: true }, (socket) => {
  handleConnection(socket);
});

server.listen(8080, "127.0.0.1");
```

Every accepted socket needs:

- **idle timeout** (close slow clients),
- **header/body size limits**,
- **a maximum number of concurrent connections** (backpressure),
- error handling for resets.

## Parsing HTTP/1.1

Request line:

```
GET /path?q=1 HTTP/1.1\r\n
Host: example.com\r\n
Content-Length: 5\r\n
\r\n
hello
```

Rules:

- read until `\r\n\r\n` with a hard cap (e.g., 16 KB) — otherwise a header bomb consumes memory;
- validate the method token and version;
- require `Host` in HTTP/1.1;
- parse `Content-Length`; if `Transfer-Encoding: chunked`, handle chunks and **reject requests with both** (request smuggling risk);
- cap body size (and stream large uploads to disk);
- reject control characters in the path/headers.

```ts
function parseRequest(buf: Buffer): Request | null {
  const end = buf.indexOf("\r\n\r\n");
  if (end === -1) return null;               // need more data
  if (end > MAX_HEADERS) throw new HttpError(431);

  const [requestLine, ...headerLines] = buf.subarray(0, end).toString("latin1").split("\r\n");
  const [method, target, version] = requestLine.split(" ");
  if (!method || !target || version !== "HTTP/1.1") throw new HttpError(400);

  const headers = new Map<string, string>();
  for (const line of headerLines) {
    const idx = line.indexOf(":");
    if (idx <= 0) throw new HttpError(400);
    headers.set(line.slice(0, idx).toLowerCase(), line.slice(idx + 1).trim());
  }
  return { method, target, headers };
}
```

## Responses and keep-alive

```http
HTTP/1.1 200 OK
Content-Type: text/plain; charset=utf-8
Content-Length: 5
Connection: keep-alive

hello
```

- Always send `Content-Length` or `Transfer-Encoding`, not both.
- For `HEAD`, send headers but no body.
- Keep-alive requires exact body framing; a wrong length desynchronises the connection.
- Support `Connection: close` and close after the response.
- Idle keep-alive timeout should be below the proxy/LB timeout.

## Concurrency models

| Model | How | Trade-off |
|---|---|---|
| Thread per connection | blocking reads/writes | simple; expensive at 10k+ connections |
| Event loop + non-blocking | state machine per socket | efficient; complex parsing |
| Goroutines/virtual threads | blocking style, runtime multiplexing | simpler code; runtime overhead |
| Process per core + SO_REUSEPORT | kernel distributes accepts | isolation; coordination |

For a learning build, start with **one thread/task per connection** and limits. Then measure; move to an event loop only if you need the concurrency.

## Routing and static files

- Normalise the path before lookup.
- **Reject `..` traversal** after URL-decoding (and again after resolving).
- Serve only from a configured root; use `realpath` and verify containment.
- Set `Content-Type` from a small allowlist; default to `application/octet-stream`.
- Support conditional requests (`ETag`/`If-None-Match`) and `Cache-Control`.
- Never list directories by default.

```ts
const root = realpathSync("./public");
const resolved = realpathSync(join(root, decodeURIComponent(pathname)));
if (!resolved.startsWith(root + sep)) return send(403);
```

## Security and robustness

| Threat | Defence |
|---|---|
| Slowloris | read timeouts, header size caps |
| Header bomb | max header bytes/count |
| Request smuggling | reject `Content-Length` + `Transfer-Encoding`, normalise |
| Path traversal | decode, resolve, containment check |
| Memory exhaustion | body limits, streaming, backpressure |
| Connection exhaustion | `server.maxConnections`, accept backpressure |
| Log injection | escape control chars before logging |
| TLS issues | terminate at a proxy (nginx/Envoy) for v1 |

Add a request id and structured access logs: method, path, status, bytes, duration, remote addr.

## TLS

Do not hand-roll TLS for production. Put the server behind a reverse proxy that terminates TLS, or use the runtime's TLS support with sane ciphers and certificate rotation. For learning, understand the handshake; for shipping, use the platform.

## Benchmarking honestly

- Use `wrk`/`hey`/`oha` with keep-alive and realistic payloads.
- Measure p50/p95/p99, not just RPS.
- Run against a release build, with the same CPU count.
- Watch for **coordinated omission** (closed-loop generators hide queueing).
- Compare concurrency levels (1, 10, 100, 1,000 connections).
- Measure the cost of TLS/proxy separately.

```
wrk -t4 -c200 -d30s --latency http://127.0.0.1:8080/hello
```

## Tests

- Parser unit tests: valid/invalid request lines, duplicate headers, chunked bodies, oversized headers.
- Fuzz the parser (truncated input, control characters).
- Integration: raw socket tests for keep-alive, pipelining, `HEAD`, `Connection: close`.
- Security: traversal, smuggling, slow client timeout.
- Load test with assertions on error rate and p99.

## Failure modes

| Failure | Symptom | Fix |
|---|---|---|
| No header cap | memory blowup | max header bytes |
| Wrong framing | hung/desynced connections | exact `Content-Length` |
| No idle timeout | FD exhaustion | timeouts + max connections |
| Blocking handler | stalled event loop | offload work |
| Path traversal | data leak | decode + containment |
| Unbounded body | OOM | streaming + size limit |

## Checklist

- [ ] Header/body limits and timeouts are enforced.
- [ ] Framing (`Content-Length`/chunked) is strict.
- [ ] Keep-alive and `Connection: close` work.
- [ ] Path traversal and header injection are blocked.
- [ ] Concurrency is bounded; backpressure exists.
- [ ] Access logs include request id, status, latency.
- [ ] Benchmarks report percentiles with realistic concurrency.
- [ ] TLS is delegated to a proxy or a maintained library.
