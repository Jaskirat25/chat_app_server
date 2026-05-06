import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import handleIoConnection from "./socket/index.js";
const app = express();
const allowedOrigins = [
    "http://localhost:3000",
    "https://chat-app-next-25.vercel.app",
    "https://chat-app-next-25-git-master-jaskirat-singhs-projects-69da70b7.vercel.app",
    "https://chat-app-next-25-ck0buk821-jaskirat-singhs-projects-69da70b7.vercel.app",
];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:3000",
            "https://chat-app-next-25.vercel.app",
            "https://chat-app-next-25-git-master-jaskirat-singhs-projects-69da70b7.vercel.app",
            "https://chat-app-next-25-ck0buk821-jaskirat-singhs-projects-69da70b7.vercel.app",
        ],
        credentials: true,
    },
});
handleIoConnection(io);
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});
