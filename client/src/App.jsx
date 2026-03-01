import { useState } from 'react';
import './App.css';
import Lobby from './Lobby';
import SketchCanvas from './components/SketchCanvas';

export default function App() {
  const [view, setView] = useState('setup'); // 'setup' | 'game'

  return (
    <div className="app">
      {view === 'setup' && (
        <Lobby />

      )}
      {view === 'game' && (
        <SketchCanvas />
      )}
    </div>
  );
}
