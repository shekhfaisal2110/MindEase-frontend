import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import LoadingSpinner from './components/LoadingSpinner';
import InstallPWA from './components/InstallPWA';
import AuthenticatedLayout from './components/AuthenticatedLayout';

// Lazy load all pages
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
const TimeDashboard = lazy(() => import('./pages/TimeDashboard'));
const DeviceUsageDashboard = lazy(() => import('./pages/DeviceUsageDashboard'));
const WellbeingDashboard = lazy(() => import('./pages/WellbeingDashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Badges = lazy(() => import('./pages/Badges'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const FeedbackForm = lazy(() => import('./components/FeedbackForm'));
const Testimonials = lazy(() => import('./pages/Testimonials'));
const InstallGuide = lazy(() => import('./pages/InstallGuide'));
const HowToUse = lazy(() => import('./pages/HowToUse'));
const Developer = lazy(() => import('./pages/Developer'));
const SleepLog = lazy(() => import('./pages/SleepLog'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ExportReport = lazy(() => import('./pages/ExportReport'));
const ThoughtRecord = lazy(() => import('./pages/ThoughtRecord'));
const MotivationPage = lazy(() => import('./pages/MotivationPage'));
const CopingCards = lazy(() => import('./pages/CopingCards'));
const BehavioralActivation = lazy(() => import('./pages/BehavioralActivation'));

function App() {
  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <AuthProvider>
        <InstallPWA />
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public routes (no layout) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/how-to-use" element={<HowToUse />} />
            <Route path="/developer" element={<Developer />} />

            {/* Protected routes – all share the same AuthenticatedLayout */}
            <Route element={<AuthenticatedLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/affirmations" element={<Affirmations />} />
              <Route path="/gratitude" element={<GratitudeJournal />} />
              <Route path="/emotional" element={<EmotionalCheckIn />} />
              <Route path="/therapy" element={<TherapyExercises />} />
              <Route path="/letters" element={<LettersToSelf />} />
              <Route path="/dailytracker" element={<DailyTracker />} />
              <Route path="/hourly-emotion" element={<HourlyEmotionTracker />} />
              <Route path="/react-response" element={<ReactResponse />} />
              <Route path="/ikigai" element={<Ikigai />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/time-dashboard" element={<TimeDashboard />} />
              <Route path="/device-usage" element={<DeviceUsageDashboard />} />
              <Route path="/wellbeing" element={<WellbeingDashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/badges" element={<Badges />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/feedback-form" element={<FeedbackForm />} />
              <Route path="/testimonials" element={<Testimonials />} />
              <Route path="/install-guide" element={<InstallGuide />} />
              <Route path="/sleep" element={<SleepLog />} />
              <Route path="/export" element={<ExportReport />} />
              <Route path="/cbt" element={<ThoughtRecord />} />
              <Route path="/motivation" element={<MotivationPage />} />
              <Route path="/coping-cards" element={<CopingCards />} />
              <Route path="/tiny-wins" element={<BehavioralActivation />} />
            </Route>

            {/* Redirect root and catch‑all */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;