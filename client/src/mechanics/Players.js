import { FIELD_W, FIELD_H, PLAYER_R, FIELD_OFFSET_X } from '../game/constants.js';

const SIDE_COLORS = {
  left: [225, 57, 53],
  right: [30, 136, 229],
};

/**
 * Draw all players as circles from socket game state. Call from Sketch draw().
 * Player 1 (left) = red, Player 2 (right) = blue.
 * @param {import('p5')} p - p5 instance
 * @param {Record<string, { x: number, y: number, side: string }>} players - id -> { x, y, side }
 * @param {string | null} myId - this client's socket id (slightly thicker stroke)
 */
export function drawPlayers(p, players, myId) {
  const list = Object.entries(players ?? {});
  for (const [id, pl] of list) {
    const x = FIELD_OFFSET_X + (Number(pl.x) ?? FIELD_W / 2);
    const y = Number(pl.y) ?? FIELD_H / 2;
    const side = pl.side || "left";
    const [r, g, b] = SIDE_COLORS[side] ?? SIDE_COLORS.left;
    const isMe = id === myId;
    p.fill(r, g, b);
    p.stroke(255);
    p.strokeWeight(isMe ? 3 : 1);
    p.circle(x, y, PLAYER_R * 2);
    p.noStroke();
  }
}
