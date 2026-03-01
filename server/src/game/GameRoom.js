// server/src/game/GameRoom.js
export class GameRoom {
  constructor(roomId, opts = {}) {
    this.roomId = roomId;

    this.maxPlayers = opts.maxPlayers ?? 2;

    this.players = new Map(); // socketId -> player object
    this.started = false;

    this.fieldWidth = opts.fieldWidth ?? 800;
    this.fieldHeight = opts.fieldHeight ?? 600;
    this.playerSpeed = opts.playerSpeed ?? 0.35;

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
    const x = side === "left" ? 120 : this.fieldWidth - 120;
    const y = this.fieldHeight / 2;

    this.players.set(socketId, {
      id: socketId,
      side,
      ready: false,
      x,
      y,
      input: { vx: 0, vy: 0, kick: false },
      lastKickAt: 0,
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

  setInput(socketId, input) {
    const p = this.players.get(socketId);
    if (!p) return false;

    const vx = clamp(Number(input?.vx ?? 0), -1, 1);
    const vy = clamp(Number(input?.vy ?? 0), -1, 1);
    const kick = Boolean(input?.kick);

    p.input = { vx, vy, kick };
    return true;
  }

  tick(dtMs) {
    if (!this.started) return;

    const margin = 20;
    const minX = margin;
    const maxX = this.fieldWidth - margin;
    const minY = margin;
    const maxY = this.fieldHeight - margin;

    for (const p of this.players.values()) {
      const dx = p.input.vx * this.playerSpeed * dtMs;
      const dy = p.input.vy * this.playerSpeed * dtMs;
      p.x = clamp(p.x + dx, minX, maxX);
      p.y = clamp(p.y + dy, minY, maxY);
    }
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

  snapshot() {
    return {
      roomId: this.roomId,
      started: this.started,
      ...this.state,
      players: Object.fromEntries(
        Array.from(this.players.entries()).map(([id, p]) => [
          id,
          { x: p.x, y: p.y, side: p.side, ready: p.ready },
        ])
      ),
    };
  }
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}
