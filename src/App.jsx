import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Affirmations from './pages/Affirmations';
import GratitudeJournal from './pages/GratitudeJournal';
import EmotionalCheckIn from './pages/EmotionalCheckIn';
import TherapyExercises from './pages/TherapyExercises';
import LettersToSelf from './pages/LettersToSelf';
import DailyTracker from './pages/DailyTracker';
import HourlyEmotionTracker from './pages/HourlyEmotionTracker';
import ReactResponse from './pages/ReactResponse';
import Ikigai from './pages/Ikigai';
import Analytics from './pages/Analytics';
import Chat from './pages/Chat';
import AdminChat from './pages/AdminChat';

function App() {
  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <AuthProvider>
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
          
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;