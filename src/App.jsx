// import React, { Suspense, lazy } from 'react';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext';
// import PrivateRoute from './components/PrivateRoute';
// import LoadingSpinner from './components/LoadingSpinner';
// import InstallPWA from './components/InstallPWA';
// import AuthenticatedLayout from './components/AuthenticatedLayout';

// // Lazy load all pages (except login/register/forgot password – keep them normal for fast auth)
// const Login = lazy(() => import('./pages/Login'));
// const Register = lazy(() => import('./pages/Register'));
// const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
// const Dashboard = lazy(() => import('./pages/Dashboard'));
// const Affirmations = lazy(() => import('./pages/Affirmations'));
// const GratitudeJournal = lazy(() => import('./pages/GratitudeJournal'));
// const EmotionalCheckIn = lazy(() => import('./pages/EmotionalCheckIn'));
// const TherapyExercises = lazy(() => import('./pages/TherapyExercises'));
// const LettersToSelf = lazy(() => import('./pages/LettersToSelf'));
// const DailyTracker = lazy(() => import('./pages/DailyTracker'));
// const HourlyEmotionTracker = lazy(() => import('./pages/HourlyEmotionTracker'));
// const ReactResponse = lazy(() => import('./pages/ReactResponse'));
// const Ikigai = lazy(() => import('./pages/Ikigai'));
// const Analytics = lazy(() => import('./pages/Analytics'));
// const Chat = lazy(() => import('./pages/Chat'));
// const TimeDashboard = lazy(() => import('./pages/TimeDashboard'));
// const DeviceUsageDashboard = lazy(() => import('./pages/DeviceUsageDashboard'));
// const WellbeingDashboard = lazy(() => import('./pages/WellbeingDashboard'));
// const Profile = lazy(() => import('./pages/Profile'));
// const Badges = lazy(() => import('./pages/Badges'));
// const Leaderboard = lazy(() => import('./pages/Leaderboard'));
// const FeedbackForm = lazy(() => import('./components/FeedbackForm'));
// const Testimonials = lazy(() => import('./pages/Testimonials'));
// const InstallGuide = lazy(() => import('./pages/InstallGuide'));
// const HowToUse = lazy(() => import('./pages/HowToUse'));
// const Developer = lazy(() => import('./pages/Developer'));
// const SleepLog = lazy(() => import('./pages/SleepLog'));
// const NotFound = lazy(() => import('./pages/NotFound'));

// function App() {
//   return (
//     <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
//       <AuthProvider>
//         <InstallPWA />
//         <Suspense fallback={<LoadingSpinner />}>
//           <Routes>
//             <Route path="/login" element={<Login />} />
//             <Route path="/register" element={<Register />} />
//             <Route path="/forgot-password" element={<ForgotPassword />} />
            
//             {/* Protected Routes */}
//             <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
//             <Route path="/affirmations" element={<PrivateRoute><Affirmations /></PrivateRoute>} />
//             <Route path="/gratitude" element={<PrivateRoute><GratitudeJournal /></PrivateRoute>} />
//             <Route path="/emotional" element={<PrivateRoute><EmotionalCheckIn /></PrivateRoute>} />
//             <Route path="/therapy" element={<PrivateRoute><TherapyExercises /></PrivateRoute>} />
//             <Route path="/letters" element={<PrivateRoute><LettersToSelf /></PrivateRoute>} />
//             <Route path="/dailytracker" element={<PrivateRoute><DailyTracker /></PrivateRoute>} />
//             <Route path="/hourly-emotion" element={<PrivateRoute><HourlyEmotionTracker /></PrivateRoute>} />
//             <Route path="/react-response" element={<PrivateRoute><ReactResponse /></PrivateRoute>} />
//             <Route path="/ikigai" element={<PrivateRoute><Ikigai /></PrivateRoute>} />
//             <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
//             <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
//             <Route path="/time-dashboard" element={<PrivateRoute><TimeDashboard /></PrivateRoute>} />
//             <Route path="/device-usage" element={<PrivateRoute><DeviceUsageDashboard /></PrivateRoute>} />
//             <Route path="/wellbeing" element={<PrivateRoute><WellbeingDashboard /></PrivateRoute>} />
//             <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
//             <Route path="/badges" element={<PrivateRoute><Badges /></PrivateRoute>} />
//             <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
//             <Route path="/feedback-form" element={<PrivateRoute><FeedbackForm /></PrivateRoute>} />
//             <Route path="/testimonials" element={<PrivateRoute><Testimonials /></PrivateRoute>} />
//             <Route path="/install-guide" element={<PrivateRoute><InstallGuide /></PrivateRoute>} />
//             <Route path="/how-to-use" element={<HowToUse />} />
//             <Route path="/developer" element={<Developer />} />
//             <Route path="/sleep" element={<PrivateRoute><SleepLog /></PrivateRoute>} />

//             <Route path="/" element={<Navigate to="/dashboard" />} />
//             <Route path="*" element={<NotFound />} />
//           </Routes>
//         </Suspense>
//       </AuthProvider>
//     </BrowserRouter>
//   );
// }

// export default App;














import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import LoadingSpinner from './components/LoadingSpinner';
import InstallPWA from './components/InstallPWA';
import AuthenticatedLayout from './components/AuthenticatedLayout';  // ✅ import layout

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
const ExportReport = lazy(()=> import('./pages/ExportReport'))
const ThoughtRecord = lazy(()=>import('./pages/ThoughtRecord'))
const MotivationPage = lazy(()=>import('./pages/MotivationPage'))

function App() {
  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <AuthProvider>
        <InstallPWA />
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/how-to-use" element={<HowToUse />} />
            <Route path="/developer" element={<Developer />} />

            {/* Protected routes – wrapped in AuthenticatedLayout */}
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
              <Route path="/cbt" element={<PrivateRoute><ThoughtRecord /></PrivateRoute>} />
              <Route path="/motivation" element={<PrivateRoute><MotivationPage /></PrivateRoute>} />

            </Route>

            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;