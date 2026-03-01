import { Server } from "socket.io";
import { GameRoom } from "../game/GameRoom.js";
import { TICK_RATE_MS } from "../game/constants.js";

export function setupSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  const gameRooms = {}; // roomId -> GameRoom

  // Game tick: update started rooms and broadcast game_state
  const dtSec = TICK_RATE_MS / 1000;
  setInterval(() => {
    for (const [roomId, room] of Object.entries(gameRooms)) {
      if (room.started && room.ball) {
        room.tick(dtSec);
        io.to(roomId).emit("game_state", room.getGameState());
      }
    }
  }, TICK_RATE_MS);

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join_room", (roomId) => {
      if (!roomId) return;

      if (!gameRooms[roomId]) {
        gameRooms[roomId] = new GameRoom(roomId);
      }

      const gameRoom = gameRooms[roomId];
      const result = gameRoom.addPlayer(socket.id);

      if (!result.ok) {
        socket.emit("join_error", { message: result.error });
        return;
      }

      socket.join(roomId);

      socket.emit("joined_room", { roomId, side: result.side });
      io.to(roomId).emit("room_state", gameRoom.roomState());
    });

    socket.on("player_ready", (roomId) => {
      const gameRoom = gameRooms[roomId];
      if (!gameRoom) return;

      if (!gameRoom.setReady(socket.id)) return;

      io.to(roomId).emit("room_state", gameRoom.roomState());

      if (gameRoom.allReadyForStart()) {
        gameRoom.startGame();
        io.to(roomId).emit("game_start");
        io.to(roomId).emit("game_state", gameRoom.getGameState());
      }
    });

    socket.on("set_display_name", ({ roomId: rid, displayName }) => {
      const room = gameRooms[rid];
      if (room) {
        room.setDisplayName(socket.id, displayName);
        io.to(rid).emit("room_state", room.roomState());
      }
    });

    socket.on("player_input", ({ roomId: rid, vx, vy, kick }) => {
      const room = gameRooms[rid];
      if (room && room.started) room.applyPlayerInput(socket.id, { vx, vy, kick });
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);

      for (const [roomId, gameRoom] of Object.entries(gameRooms)) {
        if (gameRoom.players.has(socket.id)) {
          gameRoom.removePlayer(socket.id);
          io.to(roomId).emit("room_state", gameRoom.roomState());
          if (gameRoom.playerCount() === 0) {
            delete gameRooms[roomId];
          }
          break;
        }
      }
    });
  });

  return io;
}
