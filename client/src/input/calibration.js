// Reference point for gaze vector (nose offset). Set to canvas center by initCalibration(p).

let referencePoint = null;

/**
 * Sets the reference point to the center of the given p5 canvas.
 * Call from p5 setup() after createCanvas so width/height are set.
 * @param {import('p5')} p - p5 instance.
 */
export function initCalibration(p) {
  referencePoint = { x: p.width / 2, y: p.height / 2 };
}

/**
 * @returns {{ x: number, y: number } | null} Current reference point, or null if not set.
 */
export function getReferencePoint() {
  return referencePoint;
}

/**
 * Programmatically set or clear the reference point (e.g. for reset).
 * @param {{ x: number, y: number } | null} point
 */
export function setReferencePoint(point) {
  referencePoint = point;
}
