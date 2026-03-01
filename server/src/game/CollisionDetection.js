/**
 * Circle–circle collision detection and resolution for player (circle) vs ball (circle).
 * Use these helpers in GameRoom or elsewhere to test player/ball interactions and forces.
 *
 * Expected shape:
 *   { x, y, radius, vx?, vy?, mass? }
 * vx, vy = velocity; mass optional (defaults to 1 for impulse resolution).
 */

/**
 * Check if two circles overlap (colliding).
 * @param {{ x: number, y: number, radius: number }} a
 * @param {{ x: number, y: number, radius: number }} b
 * @returns {boolean}
 */
export function circlesOverlap(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const distSq = dx * dx + dy * dy;
  const minDist = a.radius + b.radius;
  return distSq <= minDist * minDist;
}

/**
 * Get overlap depth (positive when overlapping). Useful for resolution.
 * @param {{ x: number, y: number, radius: number }} a
 * @param {{ x: number, y: number, radius: number }} b
 * @returns {{ overlap: number, nx: number, ny: number } | null} Normal points from a toward b; null if not overlapping.
 */
export function getCircleOverlap(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const distSq = dx * dx + dy * dy;
  const minDist = a.radius + b.radius;
  if (distSq >= minDist * minDist) return null;
  const dist = Math.sqrt(distSq) || 1;
  const nx = dx / dist;
  const ny = dy / dist;
  const overlap = minDist - dist;
  return { overlap, nx, ny };
}

/**
 * Resolve overlap by pushing circles apart along the collision normal (position correction).
 * Modifies a and b in place.
 * @param {{ x: number, y: number, radius: number }} a
 * @param {{ x: number, y: number, radius: number }} b
 * @param {{ overlap: number, nx: number, ny: number }} info from getCircleOverlap
 * @param {number} [ratio=0.5] How much of the correction to apply to a (1 = all to a, 0 = all to b).
 */
export function resolveOverlap(a, b, info, ratio = 0.5) {
  const { overlap, nx, ny } = info;
  const moveA = ratio * overlap;
  const moveB = (1 - ratio) * overlap;
  a.x -= nx * moveA;
  a.y -= ny * moveA;
  b.x += nx * moveB;
  b.y += ny * moveB;
}

/**
 * Apply elastic impulse so circles bounce (exchange momentum along normal).
 * Assumes objects have vx, vy and optional mass (default 1).
 * Modifies a and b velocities in place.
 * @param {{ x: number, y: number, radius: number, vx?: number, vy?: number, mass?: number }} a
 * @param {{ x: number, y: number, radius: number, vx?: number, vy?: number, mass?: number }} b
 * @param {{ nx: number, ny: number }} normal from a toward b (e.g. from getCircleOverlap)
 * @param {number} [restitution=0.8] Bounciness (0 = no bounce, 1 = full bounce).
 */
export function applyCircleBounce(a, b, normal, restitution = 0.8) {
  const { nx, ny } = normal;
  const vax = a.vx ?? 0;
  const vay = a.vy ?? 0;
  const vbx = b.vx ?? 0;
  const vby = b.vy ?? 0;
  const ma = a.mass ?? 1;
  const mb = b.mass ?? 1;

  const relVx = vax - vbx;
  const relVy = vay - vby;
  const relNorm = relVx * nx + relVy * ny;
  if (relNorm <= 0) return; // separating already (relative motion away from each other)

  const j = -(1 + restitution) * relNorm / (1 / ma + 1 / mb);
  const jx = j * nx;
  const jy = j * ny;

  a.vx = vax + jx / ma;
  a.vy = vay + jy / ma;
  b.vx = vbx - jx / mb;
  b.vy = vby - jy / mb;
}

/**
 * One-step: detect collision, resolve overlap, then apply bounce.
 * Use this to test player–ball interactions. Modifies player and ball in place.
 * @param {object} player Circle with x, y, radius, vx?, vy?, mass?
 * @param {object} ball Circle with x, y, radius, vx?, vy?, mass?
 * @param {number} [restitution=0.8]
 */
export function resolveCircleCircleCollision(player, ball, restitution = 0.8) {
  const info = getCircleOverlap(player, ball);
  if (!info) return false;
  resolveOverlap(player, ball, info, 0.5); 
  applyCircleBounce(player, ball, info, restitution);
  return true;
}

/**
 * Apply a temporary force (impulse) to a circle. Updates vx, vy.
 * @param {{ vx?: number, vy?: number, mass?: number }} circle
 * @param {number} fx Force x
 * @param {number} fy Force y
 * @param {number} [dt=1] Time step (use 1 for impulse-style “kick”).
 */
export function applyForce(circle, fx, fy, dt = 1) {
  const mass = circle.mass ?? 1;
  circle.vx = (circle.vx ?? 0) + (fx / mass) * dt;
  circle.vy = (circle.vy ?? 0) + (fy / mass) * dt;
}
