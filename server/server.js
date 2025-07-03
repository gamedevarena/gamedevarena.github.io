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
app.use(express.static(path.join(__dirname, "..")));

// Live reload script injection
app.use((req, res, next) => {
  if (req.url.endsWith(".html")) {
    let filePath = path.join(__dirname, "..", req.url);
    res.sendFile(filePath, {}, (err) => {
      if (!err) {
        // No error, inject script
        // (Handled on client side)
      } else {
        next();
      }
    });
  } else {
    next();
  }
});

// WebSocket for reload
wss.on("connection", (ws) => {
  // ...existing code...
});

// Watch for file changes
chokidar
  .watch(["*.html", "public/**/*", "src/**/*.css", "src/**/*.js"])
  .on("change", () => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send("reload");
      }
    });
  });

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
