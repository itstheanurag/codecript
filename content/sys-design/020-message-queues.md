---
title: Message Queues
order: 20
---

A Message Queue (MQ) is a form of asynchronous service-to-service communication. Messages are stored on the queue until they are processed and deleted by a single consumer.

## How it Works

1. **Producer**: Adds a message to the end of the queue.
2. **Queue**: Stores the message safely (usually on disk).
3. **Consumer**: Pulls the message from the queue, processes it, and sends an **Acknowledgement (ACK)**.

```mermaid
graph LR
    Producer[Producer] --> Queue[Message Queue]
    Queue --> Consumer[Consumer/Worker]
    Consumer -- ACK --> Queue
```

## Key Benefits

- **Buffering / Load Leveling**: If the producer sends 1000 requests per second but the consumer can only handle 100, the queue stores the excess until the consumer catches up.
- **Persistence**: Messages are not lost if the consumer is offline.
- **Guarantee of Delivery**: Using ACKs ensures that if a consumer crashes while processing, the message is returned to the queue for another worker.

## Comparison: RabbitMQ vs. Kafka

| Feature | RabbitMQ | Apache Kafka |
| :--- | :--- | :--- |
| **Model** | Traditional Message Queue | Distributed Commit Log |
| **Philosophy** | Smart Broker, Dumb Consumer | Dumb Broker, Smart Consumer |
| **Persistence** | Deleted after consumption | Retained for a set time (Log) |
| **Use Case** | Task distribution, complex routing | Stream processing, high-volume event logs |

## Common Use Cases

1. **Async Email/SMS**: Don't make the user wait for the email to be sent. Put it in a queue.
2. **Image Processing**: Resize an uploaded image in a background worker.
3. **Order Processing**: Send order details to shipping and billing services.
4. **Data Analytics**: Collect millions of logs for later analysis.

## Dead Letter Queues (DLQ)
If a message fails to process multiple times (e.g., due to bad data), it is moved to a special **Dead Letter Queue**. This prevents "poison pills" from blocking the entire system and allows developers to inspect failed items.

## Key Takeaway
Message Queues are the best way to handle **heavy lifting** and **unreliable systems**. They provide a buffer that prevents temporary spikes or failures from crashing your entire application.
