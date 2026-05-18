---
title: Pub/Sub Systems
order: 19
---

# Publish/Subscribe (Pub/Sub) Systems

In a microservice architecture, services need to talk to each other. If the `OrderService` synchronously calls the `EmailService` and the `InventoryService` over HTTP REST every time an order is placed, the system becomes tightly coupled and fragile.

Pub/Sub is an asynchronous messaging pattern that completely decouples the sender (Publisher) from the receivers (Subscribers).

> [!TIP]
> **ELI5: The Radio Broadcasting Tower**
> *   **REST API (A Phone Call):** You dial your friend. They must pick up the phone right now for the communication to work. If they are asleep, the call fails.
> *   **Pub/Sub (The Radio Tower):** A DJ (The Publisher) broadcasts a song on frequency 99.5 FM (The Topic). They have no idea who is listening. Anyone who wants to hear the song simply tunes their radio (The Subscriber) to 99.5 FM. If a listener turns their radio off, the DJ keeps broadcasting perfectly fine.

## 1. How It Works

```mermaid
architecture-beta
    group pubsub(cloud)[Pub/Sub Broker (e.g., Apache Kafka)]
    
    service pub(server)[Publisher (Order Service)]
    service topic(database)[Topic: 'order_created'] in pubsub
    
    service sub1(disk)[Subscriber (Email Service)]
    service sub2(disk)[Subscriber (Inventory Service)]
    
    pub:R -- L:topic
    topic:B -- T:sub1
    topic:R -- L:sub2
```

1.  **Publishers:** Send messages to a central broker, categorized into specific "Topics" (e.g., `user_signed_up`, `payment_processed`).
2.  **The Broker:** The middleware infrastructure (like Apache Kafka, RabbitMQ, or AWS SNS) that receives, stores, and routes the messages.
3.  **Subscribers:** Services that express interest in a specific Topic. When the broker receives a message on that topic, it pushes a copy of the message to all interested subscribers.

## 2. The Benefits of Decoupling

### 1. Asynchronous Processing
When a user uploads a video, the `UploadService` publishes a `video_uploaded` event and immediately returns a "Success" response to the user. In the background, the `EncodingService` receives the event and spends 10 minutes compressing the video without forcing the user to wait.

### 2. Fault Tolerance
If the `EmailService` crashes completely, the `OrderService` doesn't care. It just keeps publishing `order_created` events to the broker. Modern brokers will safely queue those messages on disk. When the `EmailService` boots back up hours later, it reads the backlog from the queue and catches up. Zero data is lost.

### 3. Infinite Scalability
Tomorrow, the Marketing team wants to trigger an analytics script every time an order is placed. You don't have to touch the `OrderService` code at all! You simply spin up a new `AnalyticsService` and subscribe it to the existing `order_created` topic. 

## 3. RabbitMQ vs. Apache Kafka

These are the two dominant open-source message brokers, but they operate very differently.

*   **RabbitMQ (Smart Broker, Dumb Consumers):** It pushes messages directly to consumers and immediately deletes the message from its own memory once the consumer acknowledges receipt. It is optimized for routing complex messages quickly.
*   **Apache Kafka (Dumb Broker, Smart Consumers):** It acts like an append-only distributed log file. It writes messages to disk and keeps them there for days or weeks. Consumers "pull" messages from the log at their own pace. Because messages aren't deleted upon read, multiple different consumers can replay the exact same stream of events from the past. Kafka is built for massive, big-data throughput.
