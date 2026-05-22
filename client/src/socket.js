import { io } from "socket.io-client";

// PRODUCTION SAFE (Render + local)
const URL =
  import.meta.env.MODE === "production"
    ? window.location.origin
    : "http://localhost:10000";

export const socket = io(URL);