import { BALL_R, FIELD_OFFSET_X } from '../game/constants.js';

/**
 * Draw the ball from game state. Call from Sketch draw().
 * Uses same field offset as players so ball aligns with collision (field coords).
 * @param {import('p5')} p - p5 instance
 * @param {{ x: number, y: number }} ball - ball position from game state (field coords)
 * @param {import('p5').Image | null} [ballImage] - optional image (e.g. soccer_ball.png) to render
 */
export function drawBall(p, ball, ballImage) {
  if (!ball) return;
  const x = FIELD_OFFSET_X + (ball.x != null ? Number(ball.x) : 400);
  const y = ball.y != null ? Number(ball.y) : 300;
  const d = BALL_R * 2;

  if (ballImage && ballImage.width) {
    p.imageMode(p.CENTER);
    p.image(ballImage, x, y, d, d);
  } else {
    p.fill(255, 255, 0);
    p.stroke(200, 200, 0);
    p.strokeWeight(1);
    p.circle(x, y, d);
    p.noStroke();
  }
}
