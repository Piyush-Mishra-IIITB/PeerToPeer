const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

const emailToSocketMap = new Map();
const socketToEmailMap = new Map();

io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  socket.on("join-room", ({ roomId, emailId }) => {
    emailToSocketMap.set(emailId, socket.id);
    socketToEmailMap.set(socket.id, emailId);

    socket.join(roomId);

    socket.emit("joined-room", { roomId });

    socket.broadcast.to(roomId).emit("User-joined", {
      emailId,
    });
  });

  socket.on("call-user", ({ emailId, offer }) => {
    const targetSocketId = emailToSocketMap.get(emailId);

    io.to(targetSocketId).emit("incoming-call", {
      from: socketToEmailMap.get(socket.id),
      offer,
    });
  });

  socket.on("call-accepted", ({ emailId, ans }) => {
    const targetSocketId = emailToSocketMap.get(emailId);

    io.to(targetSocketId).emit("call-accepted", { ans });
  });

  // 🔥 ICE relay
  socket.on("ice-candidate", ({ emailId, candidate }) => {
    const targetSocketId = emailToSocketMap.get(emailId);

    io.to(targetSocketId).emit("ice-candidate", {
      candidate,
    });
  });
});

server.listen(8001, () => {
  console.log("Server running on 8001");
});
