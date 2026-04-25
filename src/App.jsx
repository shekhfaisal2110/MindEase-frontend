import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load all pages (except login/register/forgot password – keep them normal for fast auth)
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Affirmations = lazy(() => import('./pages/Affirmations'));
const GratitudeJournal = lazy(() => import('./pages/GratitudeJournal'));
const EmotionalCheckIn = lazy(() => import('./pages/EmotionalCheckIn'));
const TherapyExercises = lazy(() => import('./pages/TherapyExercises'));
const LettersToSelf = lazy(() => import('./pages/LettersToSelf'));
const DailyTracker = lazy(() => import('./pages/DailyTracker'));
const HourlyEmotionTracker = lazy(() => import('./pages/HourlyEmotionTracker'));
const ReactResponse = lazy(() => import('./pages/ReactResponse'));
const Ikigai = lazy(() => import('./pages/Ikigai'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Chat = lazy(() => import('./pages/Chat'));
const AdminChat = lazy(() => import('./pages/AdminChat'));
const TimeDashboard = lazy(() => import('./pages/TimeDashboard'));
const DeviceUsageDashboard = lazy(() => import('./pages/DeviceUsageDashboard'));
const WellbeingDashboard = lazy(() => import('./pages/WellbeingDashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Badges = lazy(() => import('./pages/Badges'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));

function App() {
  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <AuthProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/affirmations" element={<PrivateRoute><Affirmations /></PrivateRoute>} />
            <Route path="/gratitude" element={<PrivateRoute><GratitudeJournal /></PrivateRoute>} />
            <Route path="/emotional" element={<PrivateRoute><EmotionalCheckIn /></PrivateRoute>} />
            <Route path="/therapy" element={<PrivateRoute><TherapyExercises /></PrivateRoute>} />
            <Route path="/letters" element={<PrivateRoute><LettersToSelf /></PrivateRoute>} />
            <Route path="/dailytracker" element={<PrivateRoute><DailyTracker /></PrivateRoute>} />
            <Route path="/hourly-emotion" element={<PrivateRoute><HourlyEmotionTracker /></PrivateRoute>} />
            <Route path="/react-response" element={<PrivateRoute><ReactResponse /></PrivateRoute>} />
            <Route path="/ikigai" element={<PrivateRoute><Ikigai /></PrivateRoute>} />
            <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
            <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
            <Route path="/admin-chat" element={<PrivateRoute><AdminChat /></PrivateRoute>} />
            <Route path="/time-dashboard" element={<PrivateRoute><TimeDashboard /></PrivateRoute>} />
            <Route path="/device-usage" element={<PrivateRoute><DeviceUsageDashboard /></PrivateRoute>} />
            <Route path="/wellbeing" element={<PrivateRoute><WellbeingDashboard /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/badges" element={<PrivateRoute><Badges /></PrivateRoute>} />
            <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
            
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;