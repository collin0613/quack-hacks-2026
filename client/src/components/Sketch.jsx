import { useRef, useEffect } from 'react';
import { connect, on, getSocketId, sendInput } from '../network/socket.js';
import { setGameState, getGameState, getRoomId } from '../game/gameStateStore.js';
import { CANVAS_W, CANVAS_H, SCOREBOARD_HEIGHT } from '../game/constants.js';
import { drawField } from '../ui/Field.js';
import { drawScoreboard, drawPlayerNames } from '../ui/Scoreboard.js';
import { drawOverlay } from '../ui/overlay.js';
import { drawPlayers } from '../mechanics/Players.js';
import { drawBall } from '../mechanics/Ball.js';
import soccerBallSrc from '../photos/soccer_ball.png';
import { preloadFaceMesh, setupFaceMesh, getFaces } from '../input/faceMesh.js';
import { initCalibration, getReferencePoint } from '../input/calibration.js';
import { getGazeVector } from '../input/gazeVector.js';

/**
 * p5 hub: runs the game loop and calls field, scoreboard, and players draw modules.
 * Subscribes to game_state; draw() delegates to ui/field, ui/scoreboard, mechanics/players.
 */
export default function Sketch() {
  const containerRef = useRef(null);

  // Player communication
  useEffect(() => {
    connect();
    const unGameState = on('game_state', (snapshot) => setGameState(snapshot));
    return () => unGameState();
  }, []);

  // p5 sketch
  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof window.p5 === 'undefined') return;

    let ballImage = null;
    const sketch = (p) => {
      p.preload = function () {
        preloadFaceMesh();
        ballImage = p.loadImage(soccerBallSrc);
      };

      // p5 setup
      p.setup = function () {
        p.createCanvas(CANVAS_W, CANVAS_H + SCOREBOARD_HEIGHT);
        setupFaceMesh(p);
        initCalibration(p);
      };

      // p5 draw
      p.draw = function () {
        const { score, players, ball } = getGameState();
        const myId = getSocketId();
        const gaze = getGazeVector(getFaces(), getReferencePoint());

        // Field and players (translated down so score band stays clear)
        p.push();
        p.translate(0, SCOREBOARD_HEIGHT);
        drawField(p);
        drawPlayers(p, players, myId);
        drawBall(p, ball, ballImage);
        drawOverlay(p, gaze);
        p.pop();
        // Scoreboard in top band (drawn last so it isn’t cleared by field background)
        drawScoreboard(p, score);
        drawPlayerNames(p, players);

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
