import { io } from "socket.io-client";

/**
 * Client-side socket for the 2D soccer game.
 *
 * Server contract (from server/src/network/socket.js + GameRoom):
 *
 * OUTBOUND (client emits):
 *   - join_room(roomId)           → join or create a room
 *   - player_ready(roomId)        → mark self ready in lobby
 *   - player_input({ roomId, vx, vy, kick }) → head movement + blink kick during game
 *
 * INBOUND (client listens):
 *   - joined_room { roomId, side }     → successfully joined; side is "left" | "right"
 *   - join_error { message }           → join failed (e.g. room full)
 *   - room_state { roomId, started, players } → lobby state (id, side, ready per player)
 *   - game_start                      → both players ready, game is starting
 *   - game_state { roomId, started, score, players } → per-tick snapshot (players: id -> { x, y, side, ready })
 */

const DEFAULT_SERVER_URL = "http://localhost:3000";

let socket = null;
const listeners = {
  connect: [],
  disconnect: [],
  joined_room: [],
  join_error: [],
  room_state: [],
  game_start: [],
  game_state: [],
};

function emit(event, ...args) {
  (listeners[event] ?? []).forEach((cb) => {
    try {
      cb(...args);
    } catch (e) {
      console.error(`[socket] listener error for ${event}:`, e);
    }
  });
}

/**
 * Connect to the game server. Safe to call again; reuses existing socket.
 * @param {string} [serverUrl] - Base URL of the server (default http://localhost:3000)
 * @returns {import("socket.io-client").Socket}
 */
export function connect(serverUrl = DEFAULT_SERVER_URL) {
  if (socket?.connected) return socket;

  socket = io(serverUrl, {
    autoConnect: true,
  });

  socket.on("connect", () => emit("connect"));
  socket.on("disconnect", (reason) => emit("disconnect", reason));

  socket.on("joined_room", (payload) => emit("joined_room", payload));
  socket.on("join_error", (payload) => emit("join_error", payload));
  socket.on("room_state", (payload) => emit("room_state", payload));
  socket.on("game_start", () => emit("game_start"));
  socket.on("game_state", (payload) => emit("game_state", payload));

  return socket;
}

/**
 * Join a room by code. Listen for "joined_room" or "join_error" via on().
 * @param {string} roomId - Room code (e.g. user-entered string)
 */
export function joinRoom(roomId) {
  if (!socket) connect();
  socket.emit("join_room", roomId);
}

/**
 * Mark this client as ready in the lobby. Both players must be ready to start.
 * @param {string} roomId - Same roomId used in joinRoom
 */
export function markReady(roomId) {
  if (!socket) return;
  socket.emit("player_ready", roomId);
}

/**
 * Send movement and kick input (e.g. from ML5 head pose + blink). Call every frame or when input changes.
 * @param {string} roomId - Current room
 * @param {{ vx?: number, vy?: number, kick?: boolean }} input - Normalized velocity -1..1, kick = blink
 */
export function sendInput(roomId, input) {
  if (!socket) return;
  socket.emit("player_input", {
    roomId,
    vx: input.vx ?? 0,
    vy: input.vy ?? 0,
    kick: input.kick ?? false,
  });
}

/**
 * Subscribe to server events. Returns an unsubscribe function.
 * @param {keyof typeof listeners} event - Event name
 * @param {(...args: any[]) => void} callback
 * @returns {() => void} - Call to remove this listener
 */
export function on(event, callback) {
  if (!listeners[event]) listeners[event] = [];
  listeners[event].push(callback);
  return () => {
    const i = listeners[event].indexOf(callback);
    if (i !== -1) listeners[event].splice(i, 1);
  };
}

/**
 * Disconnect from the server (e.g. on leave game).
 */
export function disconnect() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function isConnected() {
  return socket?.connected ?? false;
}

export function getSocketId() {
  return socket?.id ?? null;
}
