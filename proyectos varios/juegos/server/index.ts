// server/index.ts
import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { RoomManager } from "./game/RoomManager";

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: "*" },
});

const roomManager = new RoomManager();

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("joinRoom", ({ roomId }) => {
    socket.join(roomId);
    const player = roomManager.addPlayer(roomId, socket.id);
    // send initial state to this client
    socket.emit("stateUpdate", { lives: player.lives, level: player.level });
    // broadcast new player join to others
    socket.to(roomId).emit("playerJoined", { playerId: socket.id });
  });

  socket.on("playerMove", ({ x, y }) => {
    const roomId = roomManager.getRoomIdBySocket(socket.id);
    if (!roomId) return;
    // broadcast position to other players in the room
    socket.to(roomId).emit("playerMoved", { playerId: socket.id, x, y });
  });

  socket.on("levelComplete", ({ lives, level }) => {
    const roomId = roomManager.getRoomIdBySocket(socket.id);
    if (!roomId) return;
    const player = roomManager.updatePlayerState(roomId, socket.id, { lives, level });
    // broadcast updated state
    io.in(roomId).emit("stateUpdate", { playerId: socket.id, lives: player.lives, level: player.level });
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
    const roomId = roomManager.getRoomIdBySocket(socket.id);
    if (roomId) {
      roomManager.removePlayer(roomId, socket.id);
      socket.to(roomId).emit("playerLeft", { playerId: socket.id });
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
