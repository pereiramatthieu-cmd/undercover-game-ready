const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// ===== SOCKET =====
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ===== CLIENT BUILD (PROD) =====
const clientPath = path.join(__dirname, "client", "dist");
app.use(express.static(clientPath));

// IMPORTANT : FIX ERREUR path-to-regexp
// NE PAS utiliser "*"
app.get("/*", (req, res) => {
  res.sendFile(path.join(clientPath, "index.html"));
});

// ===== START =====
const PORT = process.env.PORT || 10000;

server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});