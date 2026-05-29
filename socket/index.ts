import { Server, Socket } from "socket.io";

const userSocketMap = new Map<string, Set<string>>();

function addUserSocket(userId: string, socketId: string) {
  const sockets = userSocketMap.get(userId) ?? new Set<string>();
  sockets.add(socketId);
  userSocketMap.set(userId, sockets);
}

function removeUserSocket(userId: string, socketId: string) {
  const sockets = userSocketMap.get(userId);
  if (!sockets) return;
  sockets.delete(socketId);
  if (sockets.size === 0) {
    userSocketMap.delete(userId);
  } else {
    userSocketMap.set(userId, sockets);
  }
}

function getOnlineUsers() {
  return Array.from(userSocketMap.keys());
}

export default function handleIoConnection(io: Server) {
  io.on("connection", (socket: Socket) => {
    const userId = socket.handshake.auth?.token;
    console.log("socket connected with", socket.id, "userId", userId);
    if (!userId) {
      socket.disconnect();
      return;
    }

    addUserSocket(userId, socket.id);
    socket.join(String(userId));

    socket.emit("presence-init", getOnlineUsers());
    io.emit("presence-update", getOnlineUsers());

    socket.on("join-conversation", ({ conversationId }) => {
      if (!conversationId) return;
      const roomName = `conversation:${conversationId}`;
      socket.join(roomName);
      socket.emit("joined-conversation", { conversationId });
    });

    socket.on("send-message", ({ message, receiverId }) => {
      if (!receiverId) return;
      io.to(String(receiverId)).emit("receive-message", {
        ...message,
        from: userId,
      });
      socket.emit("message-delivered", {
        messageId: message.id,
        receiverId,
      });
    });

    socket.on("typing", ({ receiverId }) => {
      if (!receiverId) return;
      io.to(String(receiverId)).emit("typing", {
        from: userId,
      });
    });

    socket.on("stop-typing", ({ receiverId }) => {
      if (!receiverId) return;
      io.to(String(receiverId)).emit("stop-typing", {
        from: userId,
      });
    });

    socket.on("message-read", ({ receiverId }) => {
      if (!receiverId) return;
      io.to(String(receiverId)).emit("message-read", {
        from: userId,
      });
    });

    const appBaseUrl = process.env.APP_URL || "http://localhost:3000";
    async function updateLastSeenForUser() {
      if (!userId) return;
      try {
        await fetch(`${appBaseUrl}/api/Users/updateLastSeen`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
      } catch (error) {
        console.error("Failed to update lastSeen on disconnect:", error);
      }
    }

    socket.on("disconnect", () => {
      console.log("socket disconnected with id", socket.id, "userId", userId);
      removeUserSocket(userId, socket.id);
      updateLastSeenForUser();
      io.emit("presence-update", getOnlineUsers());
    });
  });
}
