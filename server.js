const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.get("/", (req, res) => {
  res.send("Mobile Remote Server is running!");
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join-room", (roomCode) => {
    socket.join(roomCode);
    socket.to(roomCode).emit("peer-joined", socket.id);
  });

  socket.on("remote-command", (data) => {
    if (data && data.room) {
      socket.to(data.room).emit("remote-command", data);
    } else {
      socket.broadcast.emit("remote-command", data);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server listening on port", PORT);
});
