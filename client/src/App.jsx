import { useState } from 'react';
import './App.css';
import Lobby from './components/Lobby';
import Field from './ui/Field';

export default function App() {
  const [view, setView] = useState('setup'); // 'setup' | 'game'

  return (
    <div className="app">
      {view === 'setup' && (
        <Lobby onGameStart={() => setView('game')} />
      )}
      {view === 'game' && (
        <Field />
      )}
    </div>
  );
}
