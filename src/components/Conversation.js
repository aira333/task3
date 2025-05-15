// src/components/Conversation.js
// Component for displaying the conversation

import React, { useRef, useEffect } from 'react';
import MessageItem from './MessageItem';
import { Loader } from 'lucide-react';

const Conversation = ({ conversation = [], processing, showWelcome, error }) => {
  const messageEndRef = useRef(null);
  
  // Auto-scroll to the bottom when new messages are added
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation, processing]);
  
  return (
    <div className="flex-1 overflow-y-auto p-4">
      {/* Welcome message */}
      {showWelcome && (
        <div className="mb-8 text-center py-16">
          <h2 className="text-2xl font-bold mb-4">Welcome to VoiceVision Tutor</h2>
          <p className="mb-6 text-gray-600 max-w-md mx-auto">
            Ask questions with your voice while sharing images for personalized learning.
            Powered by open source AI technologies.
          </p>
          <div className="flex flex-col gap-4 max-w-sm mx-auto">
            <div className="flex items-center p-3 border border-gray-200 rounded-lg">
              <span className="text-gray-500 mr-3">🎤</span>
              <span>"Solve this equation for me"</span>
            </div>
            <div className="flex items-center p-3 border border-gray-200 rounded-lg">
              <span className="text-gray-500 mr-3">🖼️</span>
              <span>"What does this diagram show?"</span>
            </div>
            <div className="flex items-center p-3 border border-gray-200 rounded-lg">
              <span className="text-gray-500 mr-3">🔊</span>
              <span>"Explain this concept in simple terms"</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Conversation messages */}
      {conversation && conversation.map((message, index) => (
        <MessageItem key={index} message={message} />
      ))}
      
      {/* Processing indicator */}
      {processing && (
        <div className="flex justify-start mb-4">
          <div className="bg-black text-white rounded-lg p-3 flex items-center">
            <Loader className="animate-spin h-4 w-4 mr-2" />
            Processing with AI...
          </div>
        </div>
      )}
      
      {/* Reference for auto-scrolling */}
      <div ref={messageEndRef} />
    </div>
  );
};

export default Conversation;