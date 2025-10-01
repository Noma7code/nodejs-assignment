const http = require("http");
const fs = require("fs");
const path = require("path");

const port = 3000;

const requestHandler = (req, res) => {
  const filepath = path.join(__dirname, "index.html");

  if (req.url === "/") {
    res.setHeader("content-Type", "text/html");
    res.statusCode = 200;
    res.end("<h1>Welcome</h1>");
  } else if (req.url === "/index.html") {
    const file = fs.readFile(filepath, "utf8", (err, data) => {
      if (err) {
        res.setHeader("content-Type", "text/plain");
        res.statusCode = 500;
        res.end("Server error");
      } else {
        res.setHeader("content-Type", "text/html");
        res.statusCode = 200;
        res.end(data);
      }
    });
  } else {
    res.setHeader("content-Type", "text/html");
    res.statusCode = 404;
    res.end("<h1>404-Page not found</h1>");
  }
};

const server = http.createServer(requestHandler);

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
