// server.js - Simple Node.js server with live reload
const express = require("express");
const path = require("path");
const http = require("http");
const WebSocket = require("ws");
const chokidar = require("chokidar");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 6969;

// Serve static files from the parent directory of the server folder
app.use(express.static(path.join(__dirname, ".."), { extensions: ["html"] }));

// WebSocket for reload
wss.on("connection", (ws) => {
  // ...existing code...
});

// Watch for file changes
chokidar
  .watch(["*.html", "public/**/*", "src/**/*.css", "src/**/*.js", "tools/**/*"])
  .on("change", () => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send("reload");
      }
    });
  });

// Localhost only: the dev server serves the whole repo.
server.listen(PORT, "127.0.0.1", () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
