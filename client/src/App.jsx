import { useEffect, useState } from "react";
import { socket } from "./socket";

export default function App() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [players, setPlayers] = useState([]);
  const [gameCode, setGameCode] = useState("");
  const [word, setWord] = useState("");

  useEffect(() => {
    socket.on("lobby:update", setPlayers);

    socket.on("game:start", ({ word }) => {
      setWord(word);
    });
  }, []);

  const create = () => {
    socket.emit("lobby:create", name, ({ code }) => {
      setGameCode(code);
    });
  };

  const join = () => {
    socket.emit("lobby:join", { code, name }, () => {
      setGameCode(code);
    });
  };

  const start = () => {
    socket.emit("game:start", gameCode);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Undercover</h1>

      <input placeholder="name" onChange={(e) => setName(e.target.value)} />
      <button onClick={create}>Create</button>

      <br />

      <input placeholder="code" onChange={(e) => setCode(e.target.value)} />
      <button onClick={join}>Join</button>

      <hr />

      <h3>Lobby: {gameCode}</h3>

      {players.map((p) => (
        <div key={p.id}>{p.name}</div>
      ))}

      <button onClick={start}>Start</button>

      <h2>Ton mot : {word}</h2>
    </div>
  );
}