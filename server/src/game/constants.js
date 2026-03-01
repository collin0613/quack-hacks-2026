/**
 * Server-side game constants. Match client field dimensions for physics.
 */
export const FIELD_W = 800;
export const FIELD_H = 600;
/** Must match client PLAYER_R so collision shape matches drawn circle. */
export const PLAYER_R = 35;
/** Must match client BALL_R so collision shape matches drawn circle. */
export const BALL_R = 24;

/** Goal opening = middle third of end line (match client). */
export const GOAL_WIDTH = FIELD_H / 3;
/** Goal depth (match client); used for “fully in goal” check. */
export const GOAL_DEPTH = GOAL_WIDTH / 2;

/** Tick rate in ms (e.g. 60 fps) */
export const TICK_RATE_MS = 1000 / 60;

/** Max player speed in pixels per second (input -1..1 scaled) */
export const MAX_PLAYER_SPEED = 200;

/** Ball restitution (bounciness) vs players */
export const BALL_RESTITUTION = 0.8;

/** Ball friction per tick (velocity multiplier, < 1). Ball comes to rest over a few seconds. */
export const BALL_FRICTION = 0.985;

/** Speed below this is zeroed (stops tiny drift). */
export const BALL_STOP_THRESHOLD = 2;

/** Corner radius for rounded field (ball bounces off arc instead of sharp corner). */
export const FIELD_CORNER_R = 50;
