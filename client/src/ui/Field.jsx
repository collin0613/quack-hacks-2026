import SketchCanvas from '../components/SketchCanvas';

/**
 * Game view: the soccer field and everything shown during a match.
 * Composes the p5 canvas (SketchCanvas) and can add score, overlays, etc.
 */
export default function Field() {
  return (
    <div className="field">
      <SketchCanvas />
      {/* Score, overlays, etc. can go here */}
    </div>
  );
}
