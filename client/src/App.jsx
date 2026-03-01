import { useState } from 'react';
import './App.css';
import Lobby from './components/Lobby';
import Sketch from './components/Sketch';

export default function App() {
  const [view, setView] = useState('setup'); // 'setup' | 'game'

  return (
    <div className="app">
      {view === 'setup' && (
        <div className="setup">
          <Lobby onGameStart={() => setView('game')} />
        </div>
      )}
      {view === 'game' && (
        <div className="game">
          <Sketch />
        </div>
      )}
    </div>
  );
}
