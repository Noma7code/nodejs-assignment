# Webserver

A simple Node.js web server that serves a static HTML profile page.

## Features

- Serves `index.html` at `/index.html`
- Returns a custom 404 page for other routes

## Getting Started

1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the server:
   ```sh
   npm run dev
   ```
3. Visit [http://localhost:3000/index.html](http://localhost:3000/index.html) in your browser.

## Project Structure

- `index.js` — Main server file
- `index.html` — Static HTML page
- `.gitignore` — Node modules ignored

---

# API

A basic RESTful API for managing items, built with Node.js and file-based storage.

## Features

- CRUD operations for items (`GET`, `POST`, `PUT`, `DELETE`)
- Data stored in `db/items.json`

## Endpoints

- `GET /items` — List all items
- `GET /items/:id` — Get item by ID
- `POST /items` — Create a new item
- `PUT /items/:id` — Update an item
- `DELETE /items/:id` — Delete an item

## Getting Started

1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the API server:
   ```sh
   npm run dev
   ```
3. API runs at [http://localhost:8080](http://localhost:8080)

## Project Structure

- `server.js` — Main API server
- `utils.js` — Helper functions for CRUD
- `db/items.json` — Data storage
- `.gitignore` — Node modules ignored
