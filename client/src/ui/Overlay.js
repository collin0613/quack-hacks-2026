import { FIELD_W, FIELD_H, FIELD_OFFSET_X } from "../game/constants.js";

const CENTER_R = 10;
const NOSE_R = 12;
/** Display-only scale: larger = more separation between center and nose in overlay (does not affect player input) */
const OFFSET_SCALE = 0.8;
const ALPHA = 140;

/**
 * Draw center reference point and nose offset vector at the center of the playable field.
 * Called from Sketch draw() inside the same translate(0, SCOREBOARD_HEIGHT) block as the field.
 * @param {import('p5')} p - p5 instance
 * @param {{ x: number, y: number } | null} gazeVector - offset from reference to nose (from getGazeVector)
 */
export function drawOverlay(p, gazeVector) {
  const cx = FIELD_OFFSET_X + FIELD_W / 2;
  const cy = FIELD_H / 2;

  // Center of screen (reference point) — green, semi-transparent
  p.fill(0, 255, 0, ALPHA);
  p.noStroke();
  p.circle(cx, cy, CENTER_R * 2);

  if (gazeVector) {
    const nx = cx + gazeVector.x * OFFSET_SCALE;
    const ny = cy + gazeVector.y * OFFSET_SCALE;

    // Vector line — yellow, semi-transparent
    p.stroke(255, 220, 0, ALPHA);
    p.strokeWeight(3);
    p.line(cx, cy, nx, ny);
    p.noStroke();

    // Nose point — red, semi-transparent
    p.fill(255, 100, 100, ALPHA);
    p.circle(nx, ny, NOSE_R * 2);
  }
}
