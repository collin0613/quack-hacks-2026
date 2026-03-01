import { useState, useEffect } from "react";
import {
  connect,
  joinRoom,
  markReady,
  sendInput,
  on,
  getSocketId,
  isConnected,
} from "./network/socket.js";
import "./App.css";

/**
 * Temporary socket testing page.
 * Use the same room id in two browser tabs (e.g. "test") to verify join, room_state, ready, game_start, and game_state.
 */
function App() {
  const [roomIdInput, setRoomIdInput] = useState("test");
  const [roomId, setRoomId] = useState(null);
  const [mySide, setMySide] = useState(null);
  const [players, setPlayers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const [socketId, setSocketId] = useState(null);

  // Connect on mount and subscribe to socket events
  useEffect(() => {
    connect();
    setConnected(isConnected());
    setSocketId(getSocketId());

    const unConnect = on("connect", () => {
      setConnected(true);
      setSocketId(getSocketId());
    });
    const unDisconnect = on("disconnect", () => setConnected(false));

    const unJoined = on("joined_room", ({ roomId: id, side }) => {
      setRoomId(id);
      setMySide(side);
      setError(null);
    });
    const unJoinError = on("join_error", ({ message }) => {
      setError(message);
    });
    const unRoomState = on("room_state", (state) => {
      setRoomId(state.roomId);
      setPlayers(state.players ?? []);
    });
    const unGameStart = on("game_start", () => setGameStarted(true));
    const unGameState = on("game_state", (snapshot) => setGameState(snapshot));

    return () => {
      unConnect();
      unDisconnect();
      unJoined();
      unJoinError();
      unRoomState();
      unGameStart();
      unGameState();
    };
  }, []);

  const handleJoin = (e) => {
    e.preventDefault();
    const id = roomIdInput.trim();
    if (!id) return;
    setError(null);
    setGameStarted(false);
    setGameState(null);
    joinRoom(id);
  };

  const handleReady = () => {
    if (!roomId) return;
    markReady(roomId);
  };

  const handleSendInput = () => {
    if (!roomId) return;
    sendInput(roomId, { vx: 0.5, vy: 0, kick: false });
  };

  return (
    <div style={{ padding: "1.5rem", maxWidth: 480, margin: "0 auto", fontFamily: "system-ui" }}>
      <h1 style={{ marginTop: 0 }}>Socket test</h1>

      <section style={{ marginBottom: "1.5rem" }}>
        <div style={{ color: connected ? "green" : "red", fontWeight: "bold" }}>
          {connected ? "Connected" : "Disconnected"}
        </div>
        {socketId && (
          <div style={{ fontSize: "0.85rem", color: "#666" }}>Socket ID: {socketId}</div>
        )}
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <form onSubmit={handleJoin} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <label htmlFor="room-id">Room ID</label>
          <input
            id="room-id"
            type="text"
            value={roomIdInput}
            onChange={(e) => setRoomIdInput(e.target.value)}
            placeholder="e.g. test"
            style={{ padding: "0.35rem 0.5rem", flex: 1 }}
          />
          <button type="submit" disabled={!connected}>Join</button>
        </form>
        <p style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem" }}>
          Use the same room ID in both tabs (e.g. &quot;test&quot;) to join the same room.
        </p>
      </section>

      {error && (
        <div style={{ padding: "0.5rem", background: "#fee", color: "#c00", marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      {roomId && (
        <>
          <section style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Room: {roomId}</h2>
            {mySide && <div>Your side: <strong>{mySide}</strong></div>}
            <div style={{ marginTop: "0.5rem" }}>
              <strong>Players ({players.length}/2)</strong>
              <ul style={{ listStyle: "none", paddingLeft: 0, textAlign: "left" }}>
                {players.map((p) => (
                  <li key={p.id} style={{ padding: "0.25rem 0" }}>
                    {p.id === socketId ? "(you) " : ""}
                    {p.side} — {p.ready ? "Ready" : "Not ready"}
                  </li>
                ))}
              </ul>
            </div>
            <button onClick={handleReady} disabled={players.find((p) => p.id === socketId)?.ready}>
              I&apos;m ready
            </button>
          </section>

          {gameStarted && (
            <section style={{ marginBottom: "1.5rem", padding: "0.75rem", background: "#efe", borderRadius: 4 }}>
              <strong>Game started</strong>
              <button onClick={handleSendInput} style={{ marginLeft: "0.5rem" }}>
                Send test input (vx=0.5)
              </button>
            </section>
          )}

          {gameState && (
            <section style={{ fontSize: "0.9rem" }}>
              <h3 style={{ marginBottom: "0.5rem" }}>Last game state</h3>
              <div>Score: left {gameState.score?.left ?? 0} – right {gameState.score?.right ?? 0}</div>
              <div style={{ marginTop: "0.5rem" }}>
                {Object.entries(gameState.players ?? {}).map(([id, p]) => (
                  <div key={id}>
                    {id === socketId ? "(you) " : ""}
                    {p.side}: x={Number(p.x).toFixed(0)}, y={Number(p.y).toFixed(0)}
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default App;
