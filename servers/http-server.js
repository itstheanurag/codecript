const http = require("http");

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hello World!");
  }

  if (req.method === "POST" && req.url === "/user") {
    let body = "";
    req.on("data", (chunck) => {
      console.log(chunck);
      body += chunck;
    });

    req.on("end", () => {
      console.log(body);
      res.end("user saved");
    });
  }
});

server.listen(3000, () => {
  console.log("Server started on port 3000");
});
