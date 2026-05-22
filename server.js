const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// ------------------ GAME DATA ------------------

const lobbies = {};

const wordPairs = [
  ["chat", "chien"],
  ["pizza", "burger"],
  ["voiture", "moto"],
  ["soleil", "lune"],
  ["paris", "londres"],
  ["football", "basket"],
  ["eau", "feu"],
  ["pain", "croissant"],
  ["avion", "bateau"],
  ["ninja", "samurai"],
];

// ------------------ HELPERS ------------------

function generateCode() {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

function getWords() {
  return wordPairs[Math.floor(Math.random() * wordPairs.length)];
}

// ------------------ SOCKET ------------------

io.on("connection", (socket) => {
  console.log("user:", socket.id);

  // CREATE LOBBY
  socket.on("lobby:create", (name, cb) => {
    const code = generateCode();

    lobbies[code] = {
      host: socket.id,
      players: [{ id: socket.id, name }],
      started: false,
    };

    socket.join(code);

    cb({ code });
    io.to(code).emit("lobby:update", lobbies[code].players);
  });

  // JOIN LOBBY
  socket.on("lobby:join", ({ code, name }, cb) => {
    const lobby = lobbies[code];
    if (!lobby) return;

    lobby.players.push({ id: socket.id, name });
    socket.join(code);

    cb?.({ ok: true });

    io.to(code).emit("lobby:update", lobby.players);
  });

  // START GAME
  socket.on("game:start", (code) => {
    const lobby = lobbies[code];
    if (!lobby) return;

    const [normal, undercover] = getWords();

    const undercoverIndex = Math.floor(Math.random() * lobby.players.length);

    lobby.players.forEach((p, i) => {
      const word = i === undercoverIndex ? undercover : normal;
      io.to(p.id).emit("game:start", { word });
    });

    lobby.started = true;
  });

  // VOTE
  socket.on("game:vote", ({ lobbyId, targetId }) => {
    const lobby = lobbies[lobbyId];
    if (!lobby) return;

    lobby.votes = lobby.votes || {};
    lobby.votes[targetId] = (lobby.votes[targetId] || 0) + 1;

    const totalVotes = Object.values(lobby.votes).reduce((a, b) => a + b, 0);

    if (totalVotes === lobby.players.length) {
      const eliminated = Object.entries(lobby.votes).sort(
        (a, b) => b[1] - a[1]
      )[0][0];

      io.to(lobbyId).emit("game:result", {
        eliminated,
        votes: lobby.votes,
      });
    }
  });
});

// ------------------ SERVER ------------------

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});