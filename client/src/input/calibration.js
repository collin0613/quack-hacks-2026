// Reference point calibration: click on the canvas to set a reference point.

let referencePoint = null;

/**
 * Registers a mouse press handler on the given p5 instance to set the reference point.
 * @param {import('p5')} p - p5 instance (use when running in instance mode, e.g. React).
 */
export function initCalibration(p) {
  p.mousePressed = function calibrationMousePressed() {
    if (p.mouseX >= 0 && p.mouseX < p.width && p.mouseY >= 0 && p.mouseY < p.height) {
      referencePoint = { x: p.mouseX, y: p.mouseY };
    }
  };
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
