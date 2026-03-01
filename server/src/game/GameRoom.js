// server/src/game/GameRoom.js
import {
  FIELD_W,
  FIELD_H,
  PLAYER_R,
  BALL_R,
  GOAL_WIDTH,
  MAX_PLAYER_SPEED,
  BALL_RESTITUTION,
  BALL_FRICTION,
  BALL_STOP_THRESHOLD,
} from "./constants.js";
import { resolveCircleCircleCollision } from "./CollisionDetection.js";

export class GameRoom {
  constructor(roomId, opts = {}) {
    this.roomId = roomId;
    this.maxPlayers = opts.maxPlayers ?? 2;
    this.players = new Map(); // socketId -> player object
    this.started = false;
    this.ball = null;

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
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      radius: PLAYER_R,
      mass: 1,
      input: { vx: 0, vy: 0, kick: false },
    });

    return { ok: true, side };
  }

  removePlayer(socketId) {
    const existed = this.players.delete(socketId);

    if (existed) {
      this.started = false;
      this.ball = null;
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

    // Ball at center
    this.ball = {
      x: FIELD_W / 2,
      y: FIELD_H / 2,
      vx: 0,
      vy: 0,
      radius: BALL_R,
      mass: 1,
    };

    // Player starting positions by side
    const margin = 100;
    for (const p of this.players.values()) {
      p.x = p.side === "left" ? margin : FIELD_W - margin;
      p.y = FIELD_H / 2;
      p.vx = 0;
      p.vy = 0;
    }
  }

  /**
   * Apply client input for this tick. Call when server receives player_input.
   */
  applyPlayerInput(socketId, { vx = 0, vy = 0, kick = false } = {}) {
    const p = this.players.get(socketId);
    if (!p) return;
    p.input = {
      vx: Math.max(-1, Math.min(1, Number(vx) || 0)),
      vy: Math.max(-1, Math.min(1, Number(vy) || 0)),
      kick: Boolean(kick),
    };
  }

  /**
   * One physics tick. Call at TICK_RATE_MS. Updates positions and collisions in place.
   */
  tick(dt = 1) {
    if (!this.started || !this.ball) return;

    const ball = this.ball;

    // Apply input to player velocities and move players
    const dtSec = typeof dt === "number" && dt > 0 ? dt : 1 / 60;
    for (const p of this.players.values()) {
      p.vx = p.input.vx * MAX_PLAYER_SPEED;
      p.vy = p.input.vy * MAX_PLAYER_SPEED;
      p.x += p.vx * dtSec;
      p.y += p.vy * dtSec;
      // Clamp to field
      p.x = Math.max(p.radius, Math.min(FIELD_W - p.radius, p.x));
      p.y = Math.max(p.radius, Math.min(FIELD_H - p.radius, p.y));
    }

    // Player–player collision (push apart and bounce)
    const playerList = Array.from(this.players.values());
    for (let i = 0; i < playerList.length; i++) {
      for (let j = i + 1; j < playerList.length; j++) {
        resolveCircleCircleCollision(playerList[i], playerList[j], 0.5);
      }
    }

    // Ball friction (velocity damping)
    ball.vx *= BALL_FRICTION;
    ball.vy *= BALL_FRICTION;
    if (Math.abs(ball.vx) < BALL_STOP_THRESHOLD) ball.vx = 0;
    if (Math.abs(ball.vy) < BALL_STOP_THRESHOLD) ball.vy = 0;

    // Move ball
    ball.x += ball.vx * dtSec;
    ball.y += ball.vy * dtSec;

    // Ball vs top/bottom walls (bounce)
    if (ball.y - ball.radius <= 0) {
      ball.y = ball.radius;
      ball.vy = Math.abs(ball.vy) * 0.9;
    }
    if (ball.y + ball.radius >= FIELD_H) {
      ball.y = FIELD_H - ball.radius;
      ball.vy = -Math.abs(ball.vy) * 0.9;
    }

    // End lines: score only when ball has fully crossed the plane inside the goal opening; else bounce
    const goalTop = (FIELD_H - GOAL_WIDTH) / 2;
    const goalBottom = goalTop + GOAL_WIDTH;
    const inGoalOpeningY = (y) => y - ball.radius >= goalTop && y + ball.radius <= goalBottom;

    if (ball.x - ball.radius <= 0) {
      if (ball.x + ball.radius <= 0 && inGoalOpeningY(ball.y)) {
        this.state.score.right += 1;
        this.resetBall();
        return;
      }
      ball.vx = Math.abs(ball.vx) * 0.9;
      ball.x = ball.radius;
    }
    if (ball.x + ball.radius >= FIELD_W) {
      if (ball.x - ball.radius >= FIELD_W && inGoalOpeningY(ball.y)) {
        this.state.score.left += 1;
        this.resetBall();
        return;
      }
      ball.vx = -Math.abs(ball.vx) * 0.9;
      ball.x = FIELD_W - ball.radius;
    }

    // Player–ball collision (order can matter for multiple players; iterate all)
    for (const p of this.players.values()) {
      resolveCircleCircleCollision(p, ball, BALL_RESTITUTION);
    }
  }

  resetBall() {
    this.ball.x = FIELD_W / 2;
    this.ball.y = FIELD_H / 2;
    this.ball.vx = 0;
    this.ball.vy = 0;
  }

  /**
   * Snapshot for client: score, player positions, ball position.
   */
  getGameState() {
    const players = {};
    for (const [id, p] of this.players) {
      players[id] = {
        id: p.id,
        side: p.side,
        ready: p.ready,
        x: p.x,
        y: p.y,
      };
    }
    return {
      roomId: this.roomId,
      started: this.started,
      score: { ...this.state.score },
      players,
      ball: this.ball
        ? { x: this.ball.x, y: this.ball.y }
        : { x: FIELD_W / 2, y: FIELD_H / 2 },
    };
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
