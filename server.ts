import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import handleIoConnection from "./socket/index.js";

const app = express();

const allowedOrigins = new Set([
  "http://localhost:3000",
  "http://localhost:3001",
  "https://chat-app-next-25.vercel.app",
  "https://chat-app-next-25-git-master-jaskirat-singhs-projects-69da70b7.vercel.app",
  "https://chat-app-next-25-ck0buk821-jaskirat-singhs-projects-69da70b7.vercel.app",
  "https://chat-app-server-ah27.onrender.com",
]);

const allowedOriginChecker = (origin: string | undefined) => {
  if (!origin) return true;
  if (allowedOrigins.has(origin)) return true;
  if (origin.includes("localhost")) return true;
  if (origin.includes("vercel.app")) return true;
  if (origin.includes("render.com")) return true;
  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOriginChecker(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (allowedOriginChecker(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  },
});

handleIoConnection(io);

// Internal endpoint called by the Next.js addFriend API route after DB writes succeed.
// Emits a `friend-added` socket event to both participants so their clients update in real time.
app.post("/internal/friend-added", (req, res) => {
  const { initiatorId, recipientId, conversationId, initiatorUser, recipientUser } = req.body;

  // Emit to initiator's room: their new friend is the recipient
  io.to(String(initiatorId)).emit("friend-added", {
    newFriend: recipientUser,
    conversationId,
    forUserId: initiatorId,
  });

  // Emit to recipient's room: their new friend is the initiator
  io.to(String(recipientId)).emit("friend-added", {
    newFriend: initiatorUser,
    conversationId,
    forUserId: recipientId,
  });

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
