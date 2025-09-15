const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "db", "items.json");

// helper: extract id from url (returns number or NaN)
const getIdFromUrl = (url) => {
  const parts = url.split("/");
  return Number(parts[2]); // e.g. /items/3 → 3
};

// helper: safe read
const readItemsFromFile = (cb) => {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      // if file doesn't exist, return empty array
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

// Create an item
const createItem = (req, res) => {
  const chunks = [];
  req.on("data", (chunk) => chunks.push(chunk));
  req.on("end", () => {
    let parsedBody;
    try {
      parsedBody = JSON.parse(Buffer.concat(chunks).toString() || "{}");
    } catch (e) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      return res.end("Invalid JSON body");
    }

    readItemsFromFile((err, items) => {
      if (err) {
        console.error(err);
        res.writeHead(500);
        return res.end("Could not read items");
      }

      const newId = items.length ? items[items.length - 1].id + 1 : 1;

      // discard any client-supplied id, put id first, then rest of fields
      const { id: _ignore, ...rest } = parsedBody;
      const newItem = { id: newId, ...rest };

      items.push(newItem);

      fs.writeFile(filePath, JSON.stringify(items, null, 2), (err) => {
        if (err) {
          console.error(err);
          res.writeHead(500);
          return res.end("Could not save item");
        }

        res.writeHead(201, { "Content-Type": "application/json" });
        return res.end(JSON.stringify(newItem));
      });
    });
  });
};

// Get all items
const getAllItems = (req, res) => {
  readItemsFromFile((err, items) => {
    if (err) {
      console.error(err);
      res.writeHead(500);
      return res.end("An internal error occurred");
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(items));
  });
};

// Get single item
const getItem = (req, res) => {
  const id = getIdFromUrl(req.url);
  if (!Number.isInteger(id)) {
    res.writeHead(400);
    return res.end("Invalid id");
  }

  readItemsFromFile((err, items) => {
    if (err) {
      console.error(err);
      res.writeHead(500);
      return res.end("An internal error occurred");
    }

    const item = items.find((i) => i.id === id);
    if (!item) {
      res.writeHead(404);
      return res.end("Item not found");
    }

    // ensure id is first in returned object
    const { id: itemId, ...rest } = item;
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ id: itemId, ...rest }));
  });
};

// Update item
const updateItem = (req, res) => {
  const id = getIdFromUrl(req.url);
  if (!Number.isInteger(id)) {
    res.writeHead(400);
    return res.end("Invalid id");
  }

  const chunks = [];
  req.on("data", (chunk) => chunks.push(chunk));
  req.on("end", () => {
    let parsedBody;
    try {
      parsedBody = JSON.parse(Buffer.concat(chunks).toString() || "{}");
    } catch (e) {
      res.writeHead(400);
      return res.end("Invalid JSON body");
    }

    readItemsFromFile((err, items) => {
      if (err) {
        console.error(err);
        res.writeHead(500);
        return res.end("An internal error occurred");
      }

      const idx = items.findIndex((i) => i.id === id);
      if (idx === -1) {
        res.writeHead(404);
        return res.end("Item not found");
      }

      // do not allow client to change id; merge other fields
      const { id: _ignore, ...restUpdate } = parsedBody;
      items[idx] = { ...items[idx], ...restUpdate };

      fs.writeFile(filePath, JSON.stringify(items, null, 2), (err) => {
        if (err) {
          console.error(err);
          res.writeHead(500);
          return res.end("Could not update item");
        }

        const { id: itemId, ...rest } = items[idx];
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ id: itemId, ...rest }));
      });
    });
  });
};

// Delete item
const deleteItem = (req, res) => {
  const id = getIdFromUrl(req.url);
  if (!Number.isInteger(id)) {
    res.writeHead(400);
    return res.end("Invalid id");
  }

  readItemsFromFile((err, items) => {
    if (err) {
      console.error(err);
      res.writeHead(500);
      return res.end("An internal error occurred");
    }

    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) {
      res.writeHead(404);
      return res.end("Item not found");
    }

    const [deleted] = items.splice(idx, 1);

    fs.writeFile(filePath, JSON.stringify(items, null, 2), (err) => {
      if (err) {
        console.error(err);
        res.writeHead(500);
        return res.end("Could not delete item");
      }

      const { id: itemId, ...rest } = deleted;
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ id: itemId, ...rest }));
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
