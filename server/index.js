const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 🔥 Create HTTP server
const server = http.createServer(app);

// 🔥 Attach Socket.IO to HTTP server
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const emailToSocketMapping = new Map();

io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  socket.on("join-room", (data) => {
    const { roomId, emailId } = data;

    console.log("User joined:", emailId,"room -",roomId);

    emailToSocketMapping.set(emailId, socket.id);

    socket.emit("joined-room", { roomId });
    socket.broadcast.to(roomId).emit("User-joined", {
      emailId,
    });
  });
});

// 🔥 Listen using HTTP server (not app.listen + not io.listen)
server.listen(8001, () => {
  console.log("Server + Socket running on 8001");
});
