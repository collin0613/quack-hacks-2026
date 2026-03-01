import { CANVAS_W } from '../game/constants.js';

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
