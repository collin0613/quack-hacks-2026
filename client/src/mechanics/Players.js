import { FIELD_W, FIELD_H, PLAYER_R } from '../game/constants.js';

/**
 * Draw all players as circles from socket game state. Call from Sketch draw().
 * @param {import('p5')} p - p5 instance
 * @param {Record<string, { x: number, y: number, side: string }>} players - id -> { x, y, side }
 * @param {string | null} myId - this client's socket id (highlighted)
 */
export function drawPlayers(p, players, myId) {
  const list = Object.entries(players ?? {});
  for (const [id, pl] of list) {
    const x = Number(pl.x) || FIELD_W / 2;
    const y = Number(pl.y) || FIELD_H / 2;
    const isMe = id === myId;
    p.fill(isMe ? 255 : 200);
    p.stroke(isMe ? 255 : 100);
    p.strokeWeight(isMe ? 3 : 1);
    p.circle(x, y, PLAYER_R * 2);
    p.noStroke();
  }
}
