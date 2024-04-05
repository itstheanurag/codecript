const express = require("express");
const { Worker } = require('worker_threads');
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const app = express()

console.log(process.env.npm_package_version)
const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: process.env.npm_package_name,
        version: process.env.npm_package_version,
        description: process.env.npm_package_description,
      },
      servers: [
        {
          url: "http://localhost:3000",
        },
      ],
    },
    apis: ["./app.js"], // Path to the API file(s)
};
  
const specs = swaggerJsdoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

/**
 * @openapi
 * /fast:
 *   get:
 *     tags:
 *       - Testing
 *     summary: Hits a fast API on the main thread
 *     description: Returns a fast response to test if it's being blocked.
 *     responses:
 *       200:
 *         description: A successful response
 */
app.get('/fast', (request, response) => {
    console.log('this is executing from the main thread')
    response.json({
        status: 200,
        message: 'This is comming from a fast page'
    })
});

/**
 * @openapi
 * /blocking:
 *   get:
 *     tags:
 *       - Blocking
 *     summary: Hits a slow API on the main thread, potentially causing blocking for the first request
 *     description: Returns a slow response, potentially causing blocking for the first request due to execution on the main thread.
 *     responses:
 *       200:
 *         description: A successful response
 */

app.get('/blocking', async (request, response) => {
    const number = 10_000_000_000;
    let res = 0
    for(let i = 0; i < number; i++) {
        res = i;
    }

    response.json({
        status: 200,
        message: `this api hit looped ${number} times on the main thread, blocking other requests`
    })
})

/**
 * @openapi
 * /not/bloacking:
 *   get:
 *     tags:
 *       - Non-Blocking
 *     summary: Hits a slow API on a worker thread so requests won't be blocked
 *     description: Returns a slow response without blocking the main thread
 *     responses:
 *       200:
 *         description: A successful response
 */
app.get('/not/bloacking', async (request, response) => {
    const worker = new Worker('./worker.js', { workerData: { limit: 10_000_000_000} });
    // Listen for messages from the worker thread
    worker.on('message', message => {
        console.log("Received message from worker thread:", message);
        response.json({
            status: 2000,
            message: `this api hit looped ${10_000_000_000} times on a worker thread, without blocking other requests`
        })
    });

    // Listen for errors from the worker thread
    worker.on('error', error => {
        console.error("Error from worker thread:", error);
    });
})

app.listen(3000, () => {
    console.log("server is running on Port:",3000)
})