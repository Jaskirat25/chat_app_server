export function handleSocketEvents(io, socket) {
    socket.on("send-message", ({ message, receiverId }) => {
        io.to(receiverId).emit("receive-message", { from: socket.id, message });
    });
}
