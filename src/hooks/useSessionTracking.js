// src/hooks/useSessionTracking.js
import { useEffect, useRef } from 'react';
import api from '../services/api';

let globalSessionId = null;

const useSessionTracking = () => {
  const intervalRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (!token || !userData._id) return;

    const startSession = async () => {
      try {
        const res = await api.post('/sessions/start', { deviceType: 'desktop' });
        globalSessionId = res.data.sessionId;
        startTimeRef.current = Date.now();
      } catch (err) {
        console.error('Failed to start session', err);
      }
    };

    const sendHeartbeat = async () => {
      if (!globalSessionId) return;
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      try {
        await api.post('/sessions/heartbeat', { sessionId: globalSessionId, durationSeconds: duration });
      } catch (err) {
        console.error('Heartbeat failed', err);
      }
    };

    const endSession = async () => {
      if (!globalSessionId) return;
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      try {
        await api.post('/sessions/end', { sessionId: globalSessionId, finalDuration: duration });
      } catch (err) {
        console.error('End session failed', err);
      }
      globalSessionId = null;
    };

    startSession();
    intervalRef.current = setInterval(sendHeartbeat, 30000); // every 30 seconds

    window.addEventListener('beforeunload', endSession);
    return () => {
      clearInterval(intervalRef.current);
      window.removeEventListener('beforeunload', endSession);
      endSession();
    };
  }, []);
};

export default useSessionTracking;