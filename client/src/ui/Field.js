import { FIELD_W, FIELD_H } from '../game/constants.js';

/**
 * Draw the playing field (pitch, lines). Call from Sketch draw().
 * @param {import('p5')} p - p5 instance
 */
export function drawField(p) {
  p.background(34, 139, 34);
  p.stroke(255);
  p.strokeWeight(2);
  p.noFill();
  p.rect(0, 0, FIELD_W, FIELD_H);
  p.line(FIELD_W / 2, 0, FIELD_W / 2, FIELD_H);
  p.noStroke();
}
