import { Server } from "socket.io";
import { GameRoom } from "../game/GameRoom.js";


export function setupSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  const gameRooms = {}; // roomId -> GameRoom

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
      }
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
