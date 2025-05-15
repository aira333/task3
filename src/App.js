// src/App.js
// Root component for the application

import React from 'react';
import VoiceVisionTutor from './components/VoiceVisionTutor';

function App() {
  // In mock mode, skip all server checks
  return (
    <div className="App">
      <VoiceVisionTutor useMockMode={true} />
    </div>
  );
}

export default App;