import { useRef, useEffect } from 'react';
import { connect, on, getSocketId, sendInput } from '../network/socket.js';
import { setGameState, getGameState, getRoomId } from '../game/gameStateStore.js';
import { FIELD_W, FIELD_H } from '../game/constants.js';
import { drawField } from '../ui/Field.js';
import { drawScoreboard } from '../ui/Scoreboard.js';
import { drawPlayers } from '../mechanics/Players.js';
import { preloadFaceMesh, setupFaceMesh, getFaces } from '../input/faceMesh.js';
import { initCalibration, getReferencePoint } from '../input/calibration.js';
import { getGazeVector } from '../input/gazeVector.js';

/**
 * p5 hub: runs the game loop and calls field, scoreboard, and players draw modules.
 * Subscribes to game_state; draw() delegates to ui/field, ui/scoreboard, mechanics/players.
 */
export default function Sketch() {
  const containerRef = useRef(null);

  useEffect(() => {
    connect();
    const unGameState = on('game_state', (snapshot) => setGameState(snapshot));
    return () => unGameState();
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof window.p5 === 'undefined') return;

    const sketch = (p) => {
      p.preload = function () {
        preloadFaceMesh();
      };

      p.setup = function () {
        p.createCanvas(FIELD_W, FIELD_H);
        setupFaceMesh(p);
        initCalibration(p);
      };

      p.draw = function () {
        const { score, players } = getGameState();
        const myId = getSocketId();

        drawField(p);
        drawScoreboard(p, score);
        drawPlayers(p, players, myId);

        // Send head-based input
        const roomId = getRoomId();
        if (roomId) {
          const gaze = getGazeVector(getFaces(), getReferencePoint());
          const scale = 0.015;
          const vx = gaze ? Math.max(-1, Math.min(1, gaze.x * scale)) : 0;
          const vy = gaze ? Math.max(-1, Math.min(1, gaze.y * scale)) : 0;
          sendInput(roomId, { vx, vy, kick: false });
        }
      };
    };

    const instance = new window.p5(sketch, node);
    return () => instance.remove();
  }, []);

  return <div ref={containerRef} className="sketch-container" />;
}
