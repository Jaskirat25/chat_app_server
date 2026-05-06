import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://chat-app-next-25.vercel.app"
    ],
    credentials: true,
  })
);

app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://chat-app-next-25.vercel.app"
    ],
    credentials: true,
  },
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});