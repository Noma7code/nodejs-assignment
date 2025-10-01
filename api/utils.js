const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "db", "items.json");

// extract id from url
const getIdFromUrl = (url) => {
  const parts = url.split("/");
  return Number(parts[2]);
};

// safe read
const readItemsFromFile = (cb) => {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      if (err.code === "ENOENT") return cb(null, []);
      return cb(err);
    }
    try {
      const items = JSON.parse(data || "[]");
      cb(null, items);
    } catch (e) {
      cb(e);
    }
  });
};

// safe write
const writeItemsToFile = (items, cb) => {
  fs.writeFile(filePath, JSON.stringify(items, null, 2), cb);
};

// validate item
const validateItem = (item) => {
  if (!item.name || typeof item.name !== "string") return "Name is required";
  if (typeof item.price !== "number") return "Price must be a number";
  if (!["small", "medium", "large"].includes(item.size))
    return "Size must be one of 'small', 'medium', or 'large'";
  return null;
};

// Create an item
const createItem = (req, res) => {
  const chunks = [];
  req.on("data", (chunk) => chunks.push(chunk));
  req.on("end", () => {
    let parsedBody;
    try {
      parsedBody = JSON.parse(Buffer.concat(chunks).toString() || "{}");
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({ success: false, message: "Invalid JSON body" })
      );
    }

    const error = validateItem(parsedBody);
    if (error) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ success: false, message: error }));
    }

    readItemsFromFile((err, items) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ success: false, message: "Could not read items" })
        );
      }

      const newId = items.length ? items[items.length - 1].id + 1 : 1;
      const newItem = { id: newId, ...parsedBody };

      items.push(newItem);

      writeItemsToFile(items, (err) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          return res.end(
            JSON.stringify({ success: false, message: "Could not save item" })
          );
        }

        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, data: newItem }));
      });
    });
  });
};

// Get all items
const getAllItems = (req, res) => {
  readItemsFromFile((err, items) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({ success: false, message: "Could not read items" })
      );
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, data: items }));
  });
};

// Get single item
const getItem = (req, res) => {
  const id = getIdFromUrl(req.url);
  if (!Number.isInteger(id)) {
    res.writeHead(400, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ success: false, message: "Invalid id" }));
  }

  readItemsFromFile((err, items) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({ success: false, message: "Could not read items" })
      );
    }

    const item = items.find((i) => i.id === id);
    if (!item) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({ success: false, message: "Item not found" })
      );
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, data: item }));
  });
};

// Update item
const updateItem = (req, res) => {
  const id = getIdFromUrl(req.url);
  if (!Number.isInteger(id)) {
    res.writeHead(400, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ success: false, message: "Invalid id" }));
  }

  const chunks = [];
  req.on("data", (chunk) => chunks.push(chunk));
  req.on("end", () => {
    let parsedBody;
    try {
      parsedBody = JSON.parse(Buffer.concat(chunks).toString() || "{}");
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({ success: false, message: "Invalid JSON body" })
      );
    }

    const error = validateItem(parsedBody);
    if (error) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ success: false, message: error }));
    }

    readItemsFromFile((err, items) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ success: false, message: "Could not read items" })
        );
      }

      const idx = items.findIndex((i) => i.id === id);
      if (idx === -1) {
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ success: false, message: "Item not found" })
        );
      }

      items[idx] = { id, ...parsedBody };

      writeItemsToFile(items, (err) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          return res.end(
            JSON.stringify({ success: false, message: "Could not update item" })
          );
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, data: items[idx] }));
      });
    });
  });
};

// Delete item
const deleteItem = (req, res) => {
  const id = getIdFromUrl(req.url);
  if (!Number.isInteger(id)) {
    res.writeHead(400, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ success: false, message: "Invalid id" }));
  }

  readItemsFromFile((err, items) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({ success: false, message: "Could not read items" })
      );
    }

    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({ success: false, message: "Item not found" })
      );
    }

    const [deleted] = items.splice(idx, 1);

    writeItemsToFile(items, (err) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ success: false, message: "Could not delete item" })
        );
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, data: deleted }));
    });
  });
};

module.exports = {
  createItem,
  getAllItems,
  getItem,
  updateItem,
  deleteItem,
};
