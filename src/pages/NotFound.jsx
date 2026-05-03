import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-6">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl shadow-indigo-100 p-8 sm:p-12 max-w-lg w-full text-center border border-white">
        {/* Animated illustration */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center animate-ping">
              <div className="w-24 h-24 rounded-full bg-indigo-200 opacity-50" />
            </div>
            <div className="relative bg-white rounded-full p-6 shadow-xl">
              <span className="text-6xl">🌿</span>
            </div>
          </div>
        </div>

        <h1 className="text-5xl font-black text-slate-800 mb-2">404</h1>
        <h2 className="text-2xl font-bold text-slate-700 mb-4">Page Not Found</h2>
        <p className="text-slate-500 mb-6">
          Oops! The page you are looking for seems to have wandered off.
          <br />
          Don't worry, we'll guide you back to a calm place.
        </p>

        {/* Countdown progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-1000"
            style={{ width: `${(countdown / 5) * 100}%` }}
          />
        </div>
        <p className="text-sm text-slate-400">
          Redirecting to dashboard in <span className="font-bold text-indigo-600">{countdown}</span> second{countdown !== 1 && 's'}...
        </p>

        <button
          onClick={() => navigate('/dashboard')}
          className="mt-6 inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Go back now
        </button>
      </div>
    </div>
  );
};

export default NotFound;