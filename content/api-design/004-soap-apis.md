---
title: SOAP APIs
order: 4
---

Before REST and JSON took over the world, enterprise communication was dominated by **SOAP (Simple Object Access Protocol)**. While rarely chosen for new greenfield projects today, you will inevitably encounter SOAP if you work in finance, healthcare, or with legacy enterprise systems.

## 1. What is SOAP?

SOAP is a highly structured, strict messaging protocol that exclusively uses XML for its payload. Unlike REST, which is a loose architectural style, SOAP is a rigid standard maintained by the W3C.

It was designed to be platform and language independent. A Java server could communicate perfectly with a C# client because both adhered to the strict XML contract.

## 2. The Anatomy of a SOAP Message

Every SOAP message is an XML document containing specific elements:
1.  **The Envelope:** The root element that identifies the XML document as a SOAP message.
2.  **The Header (Optional):** Contains metadata, routing information, or security tokens (like WS-Security signatures).
3.  **The Body:** Contains the actual payload (the method call or the response data).
4.  **The Fault (Optional):** An error block providing status and error information if something went wrong.

```xml
<?xml version="1.0"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:m="http://www.example.org/stock">
  <soap:Header>
    <!-- Security tokens go here -->
  </soap:Header>
  <soap:Body>
    <m:GetStockPrice>
      <m:StockName>AAPL</m:StockName>
    </m:GetStockPrice>
  </soap:Body>
</soap:Envelope>
```

## 3. The Contract: WSDL

The defining feature of SOAP is the **WSDL (Web Services Description Language)**. 

A WSDL is a massive XML file hosted by the server that acts as a strict, machine-readable contract. It defines exactly what methods are available, what arguments they take, and what data types they return.

*   **Pros of WSDL:** Because it is machine-readable, you can point a code generator (like Java's `wsimport`) at a WSDL URL, and it will instantly generate fully typed client code for you. No guessing required.
*   **Cons of WSDL:** It is incredibly verbose and painful for a human developer to read or write by hand.

## 4. Why did REST win?

If SOAP provided automatic code generation and strict contracts, why did the industry abandon it for REST?

1.  **JSON vs XML:** XML is heavy, verbose, and difficult to parse in a web browser. JSON maps natively to JavaScript objects, making it the perfect fit for the explosion of Web 2.0 and Single Page Applications (SPAs).
2.  **Complexity:** SOAP requires specialized libraries just to construct a basic request. You can't easily test a SOAP endpoint using a standard web browser or `cURL` without writing a lot of XML boilerplate.
3.  **Performance:** Parsing massive XML envelopes is CPU and memory intensive compared to lightweight JSON.

## 5. When is SOAP still used?

SOAP has built-in, standardized extensions that REST lacks:
*   **WS-Security:** Enterprise-grade security handling message integrity, confidentiality, and authentication directly in the XML envelope.
*   **WS-AtomicTransaction:** Standardized handling for distributed ACID transactions across multiple services.

If you are building an API that transfers millions of dollars between international banks, the rigid safety of SOAP and WS-Security is often preferred over the flexibility of REST.
