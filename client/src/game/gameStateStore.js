/**
 * Store for server game state and room id. Updated by socket listeners;
 * read by the Sketch (p5 draw loop) for rendering.
 */

let roomId = null;
let state = {
  score: { left: 0, right: 0 },
  players: {},
  ball: { x: 400, y: 300 },
};

export function setRoomId(id) {
  roomId = id;
}

export function getRoomId() {
  return roomId;
}

export function setGameState(snapshot) {
  if (!snapshot) return;
  state = {
    score: snapshot.score ?? { left: 0, right: 0 },
    players: snapshot.players ?? {},
    ball: snapshot.ball ?? { x: 400, y: 300 },
  };
}

export function getGameState() {
  return state;
}
