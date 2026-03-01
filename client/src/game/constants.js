/**
 * Shared game dimensions. Used by Sketch (canvas size) and draw modules (field, players).
 * Canvas is larger than the field so goals extend beyond the end lines to the canvas edge.
 */
export const FIELD_W = 800;
export const FIELD_H = 600;
export const PLAYER_R = 35;
export const BALL_R = 24;

/** Goal opening = middle third of end line (end line length = FIELD_H). */
export const GOAL_WIDTH = FIELD_H / 3;
/** Goal depth = half of goal width; back of net at canvas edge. */
export const GOAL_DEPTH = GOAL_WIDTH / 2;

export const CANVAS_W = FIELD_W + 2 * GOAL_DEPTH;
export const CANVAS_H = FIELD_H;

/** Height of the score band above the field (scoreboard sits here, not on the pitch). */
export const SCOREBOARD_HEIGHT = 48;
export const CANVAS_TOTAL_H = CANVAS_H + SCOREBOARD_HEIGHT;

/** X offset at which the playable field starts (left goal occupies 0..FIELD_OFFSET_X). */
export const FIELD_OFFSET_X = GOAL_DEPTH;

/** Center circle radius (around the center spot). */
export const CENTER_CIRCLE_R = 80;
/** Center spot dot radius. */
export const CENTER_DOT_R = 5;

/** 18-yard / goalie box: depth from goal line into field, width (wider than goal). */
export const GOAL_BOX_DEPTH = Math.round(FIELD_W * 0.16);
export const GOAL_BOX_WIDTH = Math.round(FIELD_H * 0.48);

/** Corner radius for rounded field (must match server FIELD_CORNER_R). */
export const FIELD_CORNER_R = 50;
