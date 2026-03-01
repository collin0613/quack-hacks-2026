import { useState, useEffect, useRef } from "react";
import {
  connect,
  joinRoom,
  markReady,
  on,
  getSocketId,
  isConnected,
} from "../network/socket.js";
import { setRoomId as setGameStoreRoomId } from "../game/gameStateStore.js";
import "../App.css";

/**
 * Intro screen: room ID, join, connection status. After join, shows room and ready flow.
 * @param {{ onGameStart?: () => void }} props - onGameStart called when server emits game_start (both players ready).
 */
function Lobby({ onGameStart }) {
  const [roomIdInput, setRoomIdInput] = useState("");
  const [roomId, setRoomId] = useState(null);
  const [mySide, setMySide] = useState(null);
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const onGameStartRef = useRef(onGameStart);

  useEffect(() => {
    onGameStartRef.current = onGameStart;
  }, [onGameStart]);

  useEffect(() => {
    connect();
    queueMicrotask(() => {
      setConnected(isConnected());
    });

    const unConnect = on("connect", () => setConnected(true));
    const unDisconnect = on("disconnect", () => setConnected(false));

    const unJoined = on("joined_room", ({ roomId: id, side }) => {
      setRoomId(id);
      setMySide(side);
      setError(null);
      setGameStoreRoomId(id);
    });
    const unJoinError = on("join_error", ({ message }) => setError(message));
    const unRoomState = on("room_state", (state) => {
      setRoomId(state.roomId);
      setPlayers(state.players ?? []);
      if (state.roomId) setGameStoreRoomId(state.roomId);
    });
    const unGameStart = on("game_start", () => {
      onGameStartRef.current?.();
    });

    return () => {
      unConnect();
      unDisconnect();
      unJoined();
      unJoinError();
      unRoomState();
      unGameStart();
    };
  }, []);

  const handleJoin = (e) => {
    e.preventDefault();
    const id = roomIdInput.trim();
    if (!id) return;
    setError(null);
    joinRoom(id);
  };

  const handleReady = () => {
    if (!roomId) return;
    markReady(roomId);
  };

  const socketId = getSocketId();
  const imReady = players.find((p) => p.id === socketId)?.ready ?? false;

  return (
    <div className="lobby intro-screen">
      <h1 className="lobby-title">'Head' Soccer</h1>

      <div className="lobby-status" aria-live="polite">
        <span className={`lobby-status-dot ${connected ? "connected" : "disconnected"}`} />
        {connected ? "Connected" : "Disconnected"}
      </div>

      <form onSubmit={handleJoin} className="lobby-join">
        <label htmlFor="room-id" className="lobby-label">Room code</label>
        <div className="lobby-join-row">
          <input
            id="room-id"
            type="text"
            value={roomIdInput}
            onChange={(e) => setRoomIdInput(e.target.value)}
            placeholder="Enter room code"
            className="lobby-input"
            autoComplete="off"
          />
          <button type="submit" className="lobby-btn" disabled={!connected}>
            Join
          </button>
        </div>
      </form>

      {error && (
        <div className="lobby-error" role="alert">
          {error}
        </div>
      )}

      {roomId && (
        <section className="lobby-room">
          <p className="lobby-room-name">Room: <strong>{roomId}</strong></p>
          {mySide && (
            <p className="lobby-side">You’re on <strong>{mySide}</strong></p>
          )}
          <p className="lobby-players">Players: {players.length}/2</p>
          <ul className="lobby-player-list">
            {players.map((p) => (
              <li key={p.id}>
                {p.id === socketId ? "You" : p.side} — {p.ready ? "Ready" : "Waiting"}
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="lobby-btn lobby-btn-ready"
            onClick={handleReady}
            disabled={imReady}
          >
            {imReady ? "Ready" : "I’m ready"}
          </button>
        </section>
      )}
    </div>
  );
}

export default Lobby;
