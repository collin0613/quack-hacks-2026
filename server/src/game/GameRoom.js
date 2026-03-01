// server/src/game/GameRoom.js
export class GameRoom {
  constructor(roomId, opts = {}) {
    this.roomId = roomId;

    this.maxPlayers = opts.maxPlayers ?? 2;

    this.players = new Map(); // socketId -> player object
    this.started = false;


    this.state = {
      score: { left: 0, right: 0 },
    };
  }

  playerCount() {
    return this.players.size;
  }

  isFull() {
    return this.playerCount() >= this.maxPlayers;
  }

  addPlayer(socketId) {
    if (this.isFull()) return { ok: false, error: "Room full." };

    const side = this.playerCount() === 0 ? "left" : "right";

    this.players.set(socketId, {
      id: socketId,
      side,
      ready: false,
    });

    return { ok: true, side };
  }

  removePlayer(socketId) {
    const existed = this.players.delete(socketId);

    if (existed) {
      this.started = false;
      for (const p of this.players.values()) p.ready = false;
    }

    return existed;
  }

  setReady(socketId, ready = true) {
    const p = this.players.get(socketId);
    if (!p) return false;
    p.ready = ready;
    return true;
  }

  allReadyForStart() {
    if (this.players.size !== this.maxPlayers) return false;
    for (const p of this.players.values()) {
      if (!p.ready) return false;
    }
    return true;
  }

  startGame() {
    this.started = true;
  }

  roomState() {
    return {
      roomId: this.roomId,
      started: this.started,
      players: Array.from(this.players.values()).map((p) => ({
        id: p.id,
        side: p.side,
        ready: p.ready,
      })),
    };
  }

}

