import React, { useEffect, useState } from 'react';
import { API_BASE_URL, socket } from '../utils/api';

const ConnectionTest = () => {
  const [healthStatus, setHealthStatus] = useState('Testing...');
  const [socketStatus, setSocketStatus] = useState('Disconnected');
  const [debugInfo, setDebugInfo] = useState(null);
  
  useEffect(() => {
    // Test health endpoint
    fetch(`${API_BASE_URL}/api/health`)
      .then(response => response.json())
      .then(data => {
        setHealthStatus(`Connected: ${data.status}`);
      })
      .catch(error => {
        setHealthStatus(`Error: ${error.message}`);
      });
    
    // Test debug endpoint
    fetch(`${API_BASE_URL}/api/debug`)
      .then(response => response.json())
      .then(data => {
        setDebugInfo(data);
      })
      .catch(error => {
        console.error('Debug API error:', error);
      });
    
    // Socket connection status
    socket.on('connect', () => {
      setSocketStatus(`Connected: ${socket.id}`);
    });
    
    socket.on('disconnect', () => {
      setSocketStatus('Disconnected');
    });
    
    socket.on('connect_error', (error) => {
      setSocketStatus(`Error: ${error.message}`);
    });
    
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
    };
  }, []);
  
  return (
    <div className="p-4 border rounded mb-4 bg-gray-50">
      <h2 className="font-bold mb-2">Connection Test</h2>
      <div>API Health: <span className={healthStatus.includes('Error') ? 'text-red-500' : 'text-green-500'}>{healthStatus}</span></div>
      <div>Socket: <span className={socketStatus.includes('Error') ? 'text-red-500' : 'text-green-500'}>{socketStatus}</span></div>
      {debugInfo && (
        <div className="mt-2">
          <div>Server Time: {debugInfo.time}</div>
          <div>Environment: {JSON.stringify(debugInfo.env)}</div>
        </div>
      )}
    </div>
  );
};

export default ConnectionTest; 