const express = require("express");
const http = require("http");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 10000;

app.use(express.json());

// API test
app.get("/api", (req, res) => {
  res.json({ message: "API OK" });
});

// 👇 IMPORTANT : fallback propre (REMPLACE le '*')
app.use((req, res) => {
  res.send("Server running");
});

server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});