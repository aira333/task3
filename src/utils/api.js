// src/utils/api.js
// API utilities and configuration

import io from 'socket.io-client';
import { mockSocket } from '../services/mockServices';

// API base URL
export const API_BASE_URL = 'http://localhost:3001';

// Initialize Socket.IO
const useMockMode = true; // Set this to true to use mocks
export const socket = useMockMode ? mockSocket : io('http://localhost:3001', {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ['polling', 'websocket'],
  upgrade: true,
  forceNew: true,
  timeout: 10000
});

// API endpoints
export const API_ENDPOINTS = {
  AUDIO_PROCESS: '/api/audio/process',
  IMAGE_PROCESS: '/api/image/process',
  LLM_GENERATE: '/api/llm/generate',
  LLM_HEALTH: '/api/llm/health',
  HEALTH: '/api/health',
};

// Socket event types
export const SOCKET_EVENTS = {
  PROCESSING_UPDATE: 'processing-update',
  ERROR: 'error',
};

// Only set up socket listeners if not in mock mode
if (!useMockMode) {
  socket.on('connect', () => {
    console.log('Socket connected with ID:', socket.id);
  });
  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });
  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });
}