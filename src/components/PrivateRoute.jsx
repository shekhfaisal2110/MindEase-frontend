import React, { lazy, Suspense } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Lazy load LoadingSpinner to reduce initial bundle size (~10-15KB saved)
const LoadingSpinner = lazy(() => import('./LoadingSpinner'));

// Minimal skeleton that shows instantly (tiny inline spinner)
const SpinnerSkeleton = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
  </div>
);

const PrivateRoute = React.memo(({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Suspense fallback={<SpinnerSkeleton />}>
        <LoadingSpinner />
      </Suspense>
    );
  }

  return user ? (
    children
  ) : (
    <Navigate to="/login" state={{ from: location.pathname }} replace />
  );
});

PrivateRoute.displayName = 'PrivateRoute';

export default PrivateRoute;