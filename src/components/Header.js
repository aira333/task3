// src/components/Header.js
// Header component for the application

import React from 'react';

const Header = () => {
  return (
    <header className="border-b border-gray-200 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight">VoiceVision Tutor</h1>
          <p className="text-xs text-gray-500">Speak, show, and learn with AI</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            Open Source
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;