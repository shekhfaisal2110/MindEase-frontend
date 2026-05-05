// hooks/useSessionTracking.js
import { useEffect, useRef } from 'react';
import api from '../services/api';

let globalSessionId = null;
let startTime = null;
let intervalId = null;

const useSessionTracking = () => {
  const isAuthenticated = !!localStorage.getItem('token'); // check if user is logged in

  useEffect(() => {
    if (!isAuthenticated) return;

    const startSession = async () => {
      try {
        const res = await api.post('/sessions/start', { deviceType: 'desktop' });
        globalSessionId = res.data.sessionId;
        startTime = Date.now();
      } catch (err) {
        console.error('Failed to start session', err);
      }
    };

    const sendHeartbeat = async () => {
      if (!globalSessionId) return;
      const duration = Math.floor((Date.now() - startTime) / 1000);
      try {
        await api.post('/sessions/heartbeat', { sessionId: globalSessionId, durationSeconds: duration });
      } catch (err) {
        console.error('Heartbeat failed', err);
      }
    };

    const endSession = async () => {
      if (!globalSessionId) return;
      const duration = Math.floor((Date.now() - startTime) / 1000);
      try {
        await api.post('/sessions/end', { sessionId: globalSessionId, finalDuration: duration });
      } catch (err) {
        console.error('End session failed', err);
      }
      globalSessionId = null;
    };

    startSession();
    intervalId = setInterval(sendHeartbeat, 30000);
    window.addEventListener('beforeunload', endSession);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('beforeunload', endSession);
      endSession();
    };
  }, [isAuthenticated]);
};

export default useSessionTracking;