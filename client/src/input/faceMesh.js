// Exposes video stream and current face keypoints for use by gaze vector and main.

const NOSE_KEYPOINT_INDEX = 19;
const options = { maxFaces: 1, refineLandmarks: false, flipped: true };

let faceMeshModel = null;
let video = null;
let faces = [];

function gotFaces(results) {
  faces = results;
}

export function preloadFaceMesh() {
  faceMeshModel = ml5.faceMesh(options);
}

/**
 * @param {import('p5')} p - p5 instance (use when running in instance mode, e.g. React).
 */
export function setupFaceMesh(p) {
  video = p.createCapture(p.VIDEO, { flipped: true });
  video.size(p.width, p.height);
  video.hide();
  faceMeshModel.detectStart(video, gotFaces);
}

export function getFaces() {
  return faces;
}

export function getVideo() {
  return video;
}

export { NOSE_KEYPOINT_INDEX };
