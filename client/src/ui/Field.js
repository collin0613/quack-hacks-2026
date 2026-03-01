import {
  FIELD_W,
  FIELD_H,
  GOAL_WIDTH,
  GOAL_DEPTH,
  FIELD_OFFSET_X,
  FIELD_CORNER_R,
  CENTER_CIRCLE_R,
  CENTER_DOT_R,
  GOAL_BOX_DEPTH,
  GOAL_BOX_WIDTH,
} from "../game/constants.js";

/** Out-of-bounds color: matches page background (see index.css --canvas-out-of-bounds). */
function getOutOfBoundsColor() {
  if (typeof document === "undefined" || !document.documentElement)
    return "#242424";
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue("--canvas-out-of-bounds")
    .trim();
  return v || "#242424";
}

/** Goal net line color (see index.css --goal-net-color). */
function getGoalNetColor() {
  if (typeof document === "undefined" || !document.documentElement)
    return "rgba(180, 180, 185, 0.85)";
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue("--goal-net-color")
    .trim();
  return v || "rgba(180, 180, 185, 0.85)";
}

/**
 * Clip a line (point + direction) to a rectangle; returns [t0, t1] for segment inside rect, or null.
 * Line: (x, y) = (ox, oy) + t * (dx, dy).
 */
function clipLineToRect(ox, oy, dx, dy, rx, ry, rw, rh) {
  const ts = [];
  if (Math.abs(dx) > 1e-6) {
    let t = (rx - ox) / dx;
    let y = oy + t * dy;
    if (y >= ry && y <= ry + rh) ts.push(t);
    t = (rx + rw - ox) / dx;
    y = oy + t * dy;
    if (y >= ry && y <= ry + rh) ts.push(t);
  }
  if (Math.abs(dy) > 1e-6) {
    let t = (ry - oy) / dy;
    let x = ox + t * dx;
    if (x >= rx && x <= rx + rw) ts.push(t);
    t = (ry + rh - oy) / dy;
    x = ox + t * dx;
    if (x >= rx && x <= rx + rw) ts.push(t);
  }
  if (ts.length < 2) return null;
  const tMin = Math.min(...ts);
  const tMax = Math.max(...ts);
  return [tMin, tMax];
}

/**
 * Draw netting inside a goal rectangle: two families of diagonal lines so that at each
 * intersection the top/bottom angles are acute and the left/right angles are obtuse.
 * Uses --goal-net-color from CSS.
 */
function drawGoalNetting(p, x, y, w, h) {
  const netColor = getGoalNetColor();
  p.stroke(netColor);
  p.strokeWeight(0.8);
  p.noFill();

  const spacing = 6;
  const deg1 = 25;
  const deg2 = 155;
  const rad1 = (deg1 * Math.PI) / 180;
  const rad2 = (deg2 * Math.PI) / 180;

  for (const [angleRad, perpRad] of [
    [rad1, rad1 + Math.PI / 2],
    [rad2, rad2 + Math.PI / 2],
  ]) {
    const dx = Math.cos(angleRad);
    const dy = Math.sin(angleRad);
    const px = Math.cos(perpRad);
    const py = Math.sin(perpRad);
    const steps = Math.ceil((w + h) / spacing) + 2;
    const startX = x + w / 2 - (steps / 2) * spacing * px;
    const startY = y + h / 2 - (steps / 2) * spacing * py;
    for (let i = -steps; i <= steps; i++) {
      const ox = startX + i * spacing * px;
      const oy = startY + i * spacing * py;
      const seg = clipLineToRect(ox, oy, dx, dy, x, y, w, h);
      if (seg) {
        const [t0, t1] = seg;
        p.line(ox + t0 * dx, oy + t0 * dy, ox + t1 * dx, oy + t1 * dy);
      }
    }
  }
  p.noStroke();
}

/**
 * Draw the playing field (pitch, lines) and both goals. Call from Sketch draw().
 * Canvas is CANVAS_W x CANVAS_H; out-of-bounds areas use the page background color.
 * @param {import('p5')} p - p5 instance
 */
export function drawField(p) {
  const pageBg = getOutOfBoundsColor();
  p.background(pageBg);

  const goalTop = (FIELD_H - GOAL_WIDTH) / 2;

  // Playable field rectangle only (green) — rounded corners
  p.noStroke();
  p.fill(34, 139, 34);
  p.rect(FIELD_OFFSET_X, 0, FIELD_W, FIELD_H, FIELD_CORNER_R);

  // Left goal (extends from x=0 to end line at FIELD_OFFSET_X)
  p.fill(240, 240, 245);
  p.stroke(255);
  p.strokeWeight(2);
  p.rect(0, goalTop, FIELD_OFFSET_X, GOAL_WIDTH);
  p.noFill();
  p.rect(0, goalTop, FIELD_OFFSET_X, GOAL_WIDTH);
  drawGoalNetting(p, 0, goalTop, FIELD_OFFSET_X, GOAL_WIDTH);

  // Right goal (extends from end line at FIELD_OFFSET_X + FIELD_W to canvas edge)
  p.fill(240, 240, 245);
  p.stroke(255);
  p.strokeWeight(2);
  p.rect(FIELD_OFFSET_X + FIELD_W, goalTop, GOAL_DEPTH, GOAL_WIDTH);
  p.noFill();
  p.rect(FIELD_OFFSET_X + FIELD_W, goalTop, GOAL_DEPTH, GOAL_WIDTH);
  drawGoalNetting(p, FIELD_OFFSET_X + FIELD_W, goalTop, GOAL_DEPTH, GOAL_WIDTH);

  // Field outline and center line
  p.noFill();
  p.stroke(255);
  p.strokeWeight(2);
  p.rect(FIELD_OFFSET_X, 0, FIELD_W, FIELD_H, FIELD_CORNER_R);
  p.line(
    FIELD_OFFSET_X + FIELD_W / 2,
    0,
    FIELD_OFFSET_X + FIELD_W / 2,
    FIELD_H,
  );

  // 18-yard / goalie boxes (rectangular border around each goal)
  const leftBoxX = FIELD_OFFSET_X;
  const rightBoxX = FIELD_OFFSET_X + FIELD_W - GOAL_BOX_DEPTH;
  const boxTop = (FIELD_H - GOAL_BOX_WIDTH) / 2;
  p.rect(leftBoxX, boxTop, GOAL_BOX_DEPTH, GOAL_BOX_WIDTH);
  p.rect(rightBoxX, boxTop, GOAL_BOX_DEPTH, GOAL_BOX_WIDTH);

  // Center circle and center spot
  const centerX = FIELD_OFFSET_X + FIELD_W / 2;
  const centerY = FIELD_H / 2;
  p.noFill();
  p.circle(centerX, centerY, CENTER_CIRCLE_R * 2);
  p.fill(255);
  p.noStroke();
  p.circle(centerX, centerY, CENTER_DOT_R * 2);
  p.noStroke();
}

/** Goal opening Y bounds (field coords). Matches server logic for bounce vs goal. */
export function getGoalOpeningBounds() {
  const yMin = (FIELD_H - GOAL_WIDTH) / 2;
  const yMax = yMin + GOAL_WIDTH;
  return { yMin, yMax };
}

/**
 * True only when the ball has fully crossed the end-line plane within the goal opening.
 * Ball must be entirely past the line and entirely within the goal’s vertical opening.
 * Used for consistent client-side checks; server is authoritative.
 * @param {number} ballX - ball center x (field coords)
 * @param {number} ballY - ball center y (field coords)
 * @param {number} ballR - ball radius
 * @param {'left' | 'right'} side - which goal
 * @returns {boolean}
 */
export function isBallInGoal(ballX, ballY, ballR, side) {
  const { yMin, yMax } = getGoalOpeningBounds();
  const inVerticalBounds = ballY - ballR >= yMin && ballY + ballR <= yMax;

  if (side === "left") {
    return ballX + ballR <= 0 && inVerticalBounds;
  }
  if (side === "right") {
    return ballX - ballR >= FIELD_W && inVerticalBounds;
  }
  return false;
}
