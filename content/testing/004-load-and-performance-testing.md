---
title: Load & Performance Testing
order: 4
---

# Load & Performance Testing

Unit and integration tests prove that your code works for *one* user. Performance testing proves that your code works for *ten thousand* users simultaneously. 

Without performance testing, a minor inefficiency (like an N+1 database query or a slow Regex) might go unnoticed in development but will completely crash the server in production.

## 1. Types of Performance Testing

> [!TIP]
> **ELI5: Testing the New Bridge**
> *   **Load Testing:** You expect 500 cars per hour on a normal day. So, you drive 500 cars across it to make sure traffic flows smoothly without the bridge swaying.
> *   **Stress Testing:** You want to know exactly when the bridge breaks. You drive 1,000 cars, then 5,000 cars, then 10,000 cars onto it until the concrete starts cracking. Now you know its absolute physical limit.
> *   **Spike Testing:** The bridge is empty. Suddenly, a Godzilla attack happens, and 5,000 cars slam onto the bridge in exactly 10 seconds. You test if the bridge can handle extreme, instantaneous shock.

### Load Testing
Validates that the system meets its performance goals under the *expected* peak concurrent load.
*   **Goal:** Ensure latency and error rates remain stable during normal, heavy business hours.

### Stress Testing
Pushes the system far beyond its expected capacity until it breaks.
*   **Goal:** Identify the system's bottleneck (Does the CPU max out? Does the Database run out of connections? Does memory leak?) and see how the system recovers after failing.

### Spike Testing
A specialized form of stress testing that simulates a massive, instantaneous surge in traffic (e.g., tickets going on sale for a Taylor Swift concert, or a viral Black Friday tweet).
*   **Goal:** Ensure auto-scaling triggers fast enough, or that rate-limiting properly rejects excess traffic without bringing down the core service.

## 2. Key Performance Metrics

When running these tests, you don't just look at "Average Response Time". Averages are deceiving.

*   **Throughput (RPS):** Requests Per Second. How much volume the system is successfully handling.
*   **Latency (p95 and p99):** The 99th percentile (p99) latency means "99% of requests finished faster than this time, and the slowest 1% took this long." This is much more accurate than an average, which hides extreme outliers.
*   **Error Rate:** The percentage of requests returning `5xx` (Server Error) or `429` (Too Many Requests).

## 3. Modern Tooling: k6

While older tools like Apache JMeter are powerful, they rely on clunky XML configurations. Modern engineering teams prefer developer-friendly, code-based tools like **k6** (built by Grafana).

With k6, you write your load tests in JavaScript, making it incredibly easy to integrate into CI/CD pipelines.

### Code Example: A k6 Load Test
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

// Define the "Shape" of the load
export const options = {
  stages: [
    { duration: '30s', target: 50 }, // Ramp up to 50 virtual users over 30s
    { duration: '1m', target: 50 },  // Hold at 50 users for 1 minute
    { duration: '10s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    // We fail the test if 99% of requests take longer than 500ms
    http_req_duration: ['p(99)<500'], 
    // We fail if more than 1% of requests error out
    http_req_failed: ['rate<0.01'],   
  },
};

// The actual test logic executed by every virtual user
export default function () {
  const res = http.get('https://api.example.com/checkout');
  
  // Verify the response
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  
  // Wait 1 second before making the next request
  sleep(1); 
}
```
