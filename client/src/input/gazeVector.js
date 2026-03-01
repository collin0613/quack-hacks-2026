//Gaze vector: offset from the calibration reference point to the nose (keypoint 19).

const NOSE_KEYPOINT_INDEX = 19;

/**
 * Computes the vector from the reference point to the nose (keypoint 19).
 * @param {Array} faces - Face detection results from faceMesh (getFaces()).
 * @param {{ x: number, y: number } | null} referencePoint - From calibration (getReferencePoint()).
 * @returns {{ x: number, y: number } | null} Offset from ref to nose, or null if missing data.
 */
export function getGazeVector(faces, referencePoint) {
  if (!faces?.length || !referencePoint) return null;

  const face = faces[0];
  const keypoints = face.keypoints;
  if (!keypoints || keypoints.length <= NOSE_KEYPOINT_INDEX) return null;

  const nose = keypoints[NOSE_KEYPOINT_INDEX];
  return {
    x: nose.x - referencePoint.x,
    y: nose.y - referencePoint.y,
  };
}
