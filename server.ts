import express from "express";
import { Server } from "socket.io";
import http from "http";
import handleIoConnection from "./socket/index.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://chat-app-next-25.vercel.app/",
      "https://chat-app-next-25-git-master-jaskirat-singhs-projects-69da70b7.vercel.app/"
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

handleIoConnection(io);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
