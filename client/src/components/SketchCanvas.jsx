import { useRef, useEffect } from 'react';
import {
  preloadFaceMesh,
  setupFaceMesh,
  getFaces,
  getVideo,
  NOSE_KEYPOINT_INDEX,
} from '../input/faceMesh.js';
import { initCalibration, getReferencePoint } from '../input/calibration.js';
import { getGazeVector } from '../input/gazeVector.js';

/**
 * Renders the p5 face-tracking sketch in instance mode, mounted inside the ref container.
 * p5 and ml5 must be loaded globally (e.g. via index.html script tags).
 */
export default function SketchCanvas() {
  const containerRef = useRef(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof window.p5 === 'undefined') return;

    const sketch = (p) => {
      p.preload = function () {
        preloadFaceMesh();
      };

      p.setup = function () {
        p.createCanvas(640, 480);
        setupFaceMesh(p);
        initCalibration(p);
      };

      p.draw = function () {
        const videoEl = getVideo();
        if (videoEl) p.image(videoEl, 0, 0, p.width, p.height);

        const faces = getFaces();
        const referencePoint = getReferencePoint();
        const gazeVector = getGazeVector(faces, referencePoint);

        if (faces.length) {
          const nose = faces[0].keypoints[NOSE_KEYPOINT_INDEX];
          p.fill(255, 0, 0);
          p.noStroke();
          p.circle(nose.x, nose.y, 5);
        }

        if (referencePoint) {
          p.fill(0, 255, 0);
          p.noStroke();
          p.circle(referencePoint.x, referencePoint.y, 10);
          p.stroke(0, 255, 0);
          p.noFill();
          p.circle(referencePoint.x, referencePoint.y, 20);
        }

        if (gazeVector && p.frameCount % 20 === 0) {
          console.log('gazeVector', gazeVector);
        }
      };
    };

    const instance = new window.p5(sketch, node);

    return () => {
      instance.remove();
    };
  }, []);

  return <div ref={containerRef} className="sketch-container" />;
}
