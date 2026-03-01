import {
  CANVAS_W,
  FIELD_OFFSET_X,
  FIELD_W,
} from "../game/constants.js";

const SIDE_COLORS = {
  left: [225, 57, 53],
  right: [30, 136, 229],
};

/**
 * Draw the score display. Call from Sketch draw().
 * @param {import('p5')} p - p5 instance
 * @param {{ left: number, right: number }} score - current score
 */
export function drawScoreboard(p, score) {
  const left = score?.left ?? 0;
  const right = score?.right ?? 0;
  p.fill(255);
  p.textSize(28);
  p.textAlign(p.CENTER, p.TOP);
  p.text(`${left} – ${right}`, CANVAS_W / 2, 12);
}

/**
 * Draw each player's display name above their half of the field. Same height as scoreboard.
 * Left = red, right = blue.
 * @param {import('p5')} p - p5 instance
 * @param {Record<string, { side: string, displayName?: string }>} players - id -> { side, displayName }
 */
export function drawPlayerNames(p, players) {
  const list = Object.values(players ?? {});
  const leftPlayer = list.find((pl) => pl.side === "left");
  const rightPlayer = list.find((pl) => pl.side === "right");
  const leftName = leftPlayer?.displayName || "Player 1";
  const rightName = rightPlayer?.displayName || "Player 2";

  p.textSize(18);
  p.textAlign(p.CENTER, p.TOP);

  p.fill(...(SIDE_COLORS.left ?? [225, 57, 53]));
  p.text(leftName, FIELD_OFFSET_X + FIELD_W / 4, 14);

  p.fill(...(SIDE_COLORS.right ?? [30, 136, 229]));
  p.text(rightName, FIELD_OFFSET_X + (3 * FIELD_W) / 4, 14);
}
