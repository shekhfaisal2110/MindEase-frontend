import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f8fafc]">
        {/* Animated Branded Loader */}
        <div className="relative flex items-center justify-center">
          {/* Outer Pulsing Ring */}
          <div className="absolute animate-ping h-20 w-20 rounded-full bg-indigo-400 opacity-20"></div>
          
          {/* Inner Glowing Orb */}
          <div className="relative bg-white p-4 rounded-2xl shadow-xl shadow-indigo-100 border border-indigo-50">
            <span className="text-4xl animate-bounce inline-block">🌿</span>
          </div>
        </div>

        {/* Loading Text */}
        <div className="mt-8 text-center px-6">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">
            Preparing your space...
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Just a moment while we secure your data.
          </p>
        </div>

        {/* Minimal Progress Bar (Optional Visual) */}
        <div className="mt-6 w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-600 animate-progress-loading rounded-full" />
        </div>
      </div>
    );
  }

  return user ? (
    children
  ) : (
    <Navigate to="/login" state={{ from: location.pathname }} replace />
  );
};

export default PrivateRoute;