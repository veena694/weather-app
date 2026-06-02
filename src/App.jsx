import React from 'react';
import './App.css';
import Weather from './pages/Weather.jsx';

function App() {
  return (
    <div className="App bg-[#06070a] text-slate-100 min-h-screen relative w-full overflow-x-hidden select-none font-body">
      <Weather />
    </div>
  );
}

export default App;
