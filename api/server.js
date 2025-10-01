const http = require("http");
const {
  createItem,
  getItem,
  getAllItems,
  updateItem,
  deleteItem,
} = require("./utils");

const port = 8080;

const handleRequest = (req, res) => {
  const urlParts = req.url.split("/"); // "/items/3" -> ["", "items", "3"]
  const basePath = `/${urlParts[1]}`; // "/items"
  const hasId = urlParts[2] !== undefined;

  if (req.method === "POST" && req.url === "/items") {
    createItem(req, res);
  } else if (req.method === "GET" && req.url === "/items") {
    getAllItems(req, res);
  } else if (req.method === "GET" && basePath === "/items" && hasId) {
    getItem(req, res);
  } else if (req.method === "PUT" && basePath === "/items" && hasId) {
    updateItem(req, res);
  } else if (req.method === "DELETE" && basePath === "/items" && hasId) {
    deleteItem(req, res);
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, message: "Route not found" }));
  }
};

const server = http.createServer(handleRequest);

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
