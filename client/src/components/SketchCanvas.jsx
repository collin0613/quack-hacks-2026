import { useRef, useEffect } from 'react';
import { preloadFaceMesh, setupFaceMesh } from '../input/faceMesh.js';
import { initCalibration } from '../input/calibration.js';

// getGazeVector(getFaces(), getReferencePoint()), getReferencePoint() remain available
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
        p.createCanvas(1100, 700);
        setupFaceMesh(p);
        initCalibration(p);
      };

      p.draw = function () {
        p.background(240);
      };
    };

    const instance = new window.p5(sketch, node);

    return () => {
      instance.remove();
    };
  }, []);

  return <div ref={containerRef} className="sketch-container" />;
}
