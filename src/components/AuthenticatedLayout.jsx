// src/components/AuthenticatedLayout.jsx
import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import useSessionTracking from '../hooks/useSessionTracking';

const AuthenticatedLayout = () => {
  // Start session tracking for every authenticated user
  useSessionTracking();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthenticatedLayout;