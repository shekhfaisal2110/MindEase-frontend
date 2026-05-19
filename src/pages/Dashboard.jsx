// src/pages/Dashboard.jsx
import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import PageLayout from '../components/PageLayout';
import { useAuth } from '../context/AuthContext';
import usePWAInstall from '../hooks/usePWAInstall';
import InsightsCard from '../components/InsightsCard';

// Lazy load notification panel for faster initial bundle
const NotificationPanel = lazy(() => import('../components/NotificationPanel'));

// Static icon mapping - defined outside component to prevent recreation
const iconMap = {
  "/hourly-emotion": "⏰",
  "/emotional": "💭",
  "/react-response": "⚡",
  "/affirmations": "💬",
  "/therapy": "🧘",
  "/letters": "✉️",
  "/ikigai": "🎯",
  "/gratitude": "🙏",
  "/dailytracker": "✅",
  "/sleep": "😴",
  "/time-dashboard": "⏱️",
  "/device-usage": "📱",
  "/analytics": "📊",
  "/badges": "🏅",
  "/leaderboard": "🏆",
  "/export": "📄",
  "/cbt": "🧠",
  "/motivation": "💡",
  "/chat": "💬",
  "/testimonials": "⭐",
  "/feedback-form": "📝",
  "/profile": "👤",
  "/coping-cards": "🃏",
  "/tiny-wins": "🌱"
};

// Static feature cards - defined once for performance
const featureCards = [
  { to: "/hourly-emotion", title: "Hourly Emotions", desc: "Track your mood throughout the day" },
  { to: "/emotional", title: "Daily Check‑in", desc: "Log your current emotions" },
  { to: "/react-response", title: "React vs Response", desc: "Practice mindful reactions" },
  { to: "/affirmations", title: "Affirmations", desc: "Positive self-talk" },
  { to: "/therapy", title: "Therapy Exercises", desc: "CBT and healing tools" },
  { to: "/letters", title: "Letters to Self", desc: "Write to your future self" },
  { to: "/ikigai", title: "Ikigai", desc: "Discover your purpose" },
  { to: "/gratitude", title: "Gratitude Journal", desc: "Count your blessings" },
  { to: "/dailytracker", title: "Habit Tracker", desc: "Build daily routines" },
  { to: "/sleep", title: "Sleep Log", desc: "Track your rest" },
  { to: "/time-dashboard", title: "Quality Time", desc: "Time with loved ones" },
  { to: "/device-usage", title: "Digital Wellbeing", desc: "Monitor screen time" },
  { to: "/analytics", title: "Personal Analytics", desc: "Your progress insights" },
  { to: "/badges", title: "Achievement Badges", desc: "Celebrate milestones" },
  { to: "/leaderboard", title: "Leaderboard", desc: "Compare with others (opt‑in)" },
  { to: "/export", title: "Export Report", desc: "Download monthly summary" },
  { to: "/cbt", title: "CBT Thought Record", desc: "Challenge negative thoughts" },
  { to: "/motivation", title: "Inspiring Thoughts", desc: "Read motivational quotes" },
  { to: "/coping-cards", title: "Coping Cards", desc: "Self‑help cards for difficult moments" },
  { to: "/tiny-wins", title: "Tiny Wins", desc: "Plan and complete small daily actions" },
  { to: "/chat", title: "Live Support", desc: "Message admin for help" },
  { to: "/testimonials", title: "Testimonials", desc: "Read community stories" },
  { to: "/feedback-form", title: "Give Feedback", desc: "Help us improve" },
  { to: "/profile", title: "My Profile", desc: "View and edit your account" },
];

// Memoized stat card component
const StatCard = React.memo(({ gradient, label, value, icon, onClick, isClickable }) => {
  const Component = isClickable ? 'button' : 'div';
  return (
    <Component
      onClick={onClick}
      className={`${isClickable ? 'cursor-pointer' : ''} bg-gradient-to-br ${gradient} rounded-xl p-4 md:p-5 text-white shadow-md hover:shadow-xl transition-all hover:scale-105 duration-300 ${isClickable ? 'text-left group' : ''}`}
    >
      <p className="text-xs md:text-sm font-semibold tracking-wide opacity-90">{label}</p>
      <div className="flex items-center justify-between mt-1">
        <p className="text-2xl md:text-3xl font-black">{value}</p>
        {icon && (
          <svg className="w-8 h-8 opacity-80 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        )}
      </div>
    </Component>
  );
});

// Memoized feature card component
const FeatureCard = React.memo(({ card, idx }) => {
  const gradients = [
    "from-indigo-500 to-indigo-700",
    "from-emerald-500 to-teal-700",
    "from-amber-500 to-orange-700",
    "from-blue-500 to-cyan-700",
    "from-rose-500 to-pink-700",
    "from-purple-500 to-indigo-700",
    "from-cyan-500 to-blue-700",
    "from-lime-500 to-green-700",
    "from-fuchsia-500 to-purple-700",
  ];
  const gradient = gradients[idx % gradients.length];
  
  return (
    <Link
      to={card.to}
      className="group flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-gradient-to-br from-slate-50 to-white rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-slate-200 hover:border-indigo-300 active:scale-95"
    >
      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
        <span className="text-lg md:text-xl">{iconMap[card.to] || "✨"}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-slate-800 text-sm md:text-lg group-hover:text-indigo-600 transition truncate">{card.title}</h3>
        <p className="text-xs md:text-sm text-slate-500 mt-0.5 md:mt-1 leading-relaxed line-clamp-2">{card.desc}</p>
      </div>
      <div className="text-slate-300 group-hover:text-indigo-500 transition-transform group-hover:translate-x-1 flex-shrink-0 text-lg md:text-xl">→</div>
    </Link>
  );
});

// Skeleton loader for stats
const StatsSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 md:gap-6 mb-8">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-slate-200 rounded-xl p-4 md:p-5 animate-pulse">
        <div className="h-4 bg-slate-300 rounded w-20 mb-2"></div>
        <div className="h-8 bg-slate-300 rounded w-16"></div>
      </div>
    ))}
  </div>
);

// PWA Install Card Component (only shown when installable and not installed)
const PWAInstallCard = React.memo(() => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const LS_KEY = 'pwaCardDismissed';

  useEffect(() => {
    const dismissedValue = localStorage.getItem(LS_KEY);
    if (dismissedValue === 'true') setDismissed(true);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(LS_KEY, 'true');
  };

  if (!isInstallable || isInstalled || dismissed) return null;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-indigo-100 p-4 md:p-6 mb-8 transition-all hover:shadow-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
            <span className="text-xl">📱</span>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base md:text-lg">Install MindEase App</h3>
            <p className="text-xs text-slate-500">Get a faster, smoother experience with offline support</p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={install}
            className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl transition active:scale-95 text-sm shadow-md"
          >
            Install Now
          </button>
          <button
            onClick={handleDismiss}
            className="flex-1 sm:flex-none bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-xl transition text-sm"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
});

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalPoints: 0, streak: 0, gratitudeCount: 0, unreadCount: 0 });
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [showMonthStartBanner, setShowMonthStartBanner] = useState(false);
  const [previousMonth, setPreviousMonth] = useState('');
  const [showMonthlyReportBanner, setShowMonthlyReportBanner] = useState(false);
  const [currentMonthStr, setCurrentMonthStr] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  // API calls memoized
  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/user/progress');
      setStats(prev => ({
        ...prev,
        totalPoints: res.data.totalPoints || 0,
        streak: res.data.streak || 0,
        gratitudeCount: res.data.metrics?.gratitudeEntries || 0
      }));
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      setStats(prev => ({ ...prev, unreadCount: res.data.count }));
    } catch (err) {
      console.error('Failed to fetch unread count', err);
    }
  }, []);

  const checkMonthStart = useCallback(async () => {
    try {
      const res = await api.get('/user/check-month-start');
      if (res.data.isNewMonth) {
        setPreviousMonth(res.data.currentMonth);
        setShowMonthStartBanner(true);
      }
    } catch (err) { console.error(err); }
  }, []);

  const checkMonthlyReport = useCallback(async () => {
    try {
      const res = await api.get('/user/check-monthly-report');
      // ✅ NEW: Only show the banner if we are in the last 7 days of the month (25th to end)
      const today = new Date();
      const dayOfMonth = today.getDate();
      const isLastWeek = dayOfMonth >= 25;
      if (res.data.shouldShow && isLastWeek) {
        setCurrentMonthStr(res.data.currentMonth);
        setShowMonthlyReportBanner(true);
      } else {
        // No banner (either already seen, or not last week)
        setShowMonthlyReportBanner(false);
      }
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    const recordPageView = async () => {
      try {
        const res = await api.post('/daily-activity/page-view', { pageName: 'dashboard' });
        if (!res.data.alreadyRecorded) {
          await api.post('/activity/add', { actionType: 'pageView', points: 1 });
        }
      } catch (err) { console.error(err); }
    };
    recordPageView();
    
    const loadData = async () => {
      await Promise.allSettled([
        fetchStats(),
        fetchUnreadCount(),
        checkMonthStart(),
        checkMonthlyReport()
      ]);
      setStatsLoaded(true);
    };
    loadData();
  }, [fetchStats, fetchUnreadCount, checkMonthStart, checkMonthlyReport]);

  const handleAcknowledgeMonthStart = useCallback(async () => {
    await api.post('/user/acknowledge-month-start');
    setShowMonthStartBanner(false);
  }, []);

  const downloadPreviousMonthReport = useCallback(async () => {
    const [year, month] = previousMonth.split('-');
    try {
      const response = await api.get(`/export/progress?period=monthly&year=${year}&month=${month}`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `MindEase_Report_${previousMonth}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
      await handleAcknowledgeMonthStart();
    } catch (err) {
      console.error(err);
      alert('Failed to download report');
    }
  }, [previousMonth, handleAcknowledgeMonthStart]);

  const handleDownloadReport = useCallback(async () => {
    try {
      const [year, month] = currentMonthStr.split('-');
      const response = await api.get(`/export/progress?period=monthly&year=${year}&month=${month}`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `MindEase_Report_${currentMonthStr}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
      await api.post('/user/acknowledge-monthly-report');
      setShowMonthlyReportBanner(false);
    } catch (err) {
      console.error(err);
      alert('Failed to download report');
    }
  }, [currentMonthStr]);

  const handleDismissBanner = useCallback(async () => {
    await api.post('/user/acknowledge-monthly-report');
    setShowMonthlyReportBanner(false);
  }, []);

  const getGreeting = useCallback(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const displayName = user?.username || 'User';
  const memoizedFeatureCards = useMemo(() => featureCards, []);

  return (
    <>
      {/* Month start banner (floating, bottom) */}
      {showMonthStartBanner && (
        <div className="fixed bottom-4 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 z-50 w-auto md:w-full md:max-w-md animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-2xl shadow-2xl p-4 md:p-5 border border-white/20">
            <div className="flex items-start gap-3">
              <div className="text-2xl md:text-3xl">🌱</div>
              <div className="flex-1">
                <h4 className="font-bold text-base md:text-lg">A New Month Begins</h4>
                <p className="text-xs md:text-sm text-slate-200 mt-1">Welcome to {previousMonth.replace('-', ' ')}. Every month is a new opportunity to grow.</p>
                <div className="flex gap-2 md:gap-3 mt-3 md:mt-4 flex-wrap">
                  <button onClick={downloadPreviousMonthReport} className="bg-white text-slate-800 font-bold py-2 px-3 md:px-4 rounded-xl text-xs md:text-sm shadow hover:bg-slate-100 transition active:scale-95">📄 Download Last Month's Report</button>
                  <button onClick={handleAcknowledgeMonthStart} className="text-slate-300 hover:text-white text-xs md:text-sm font-medium">Dismiss</button>
                </div>
              </div>
              <button onClick={handleAcknowledgeMonthStart} className="text-slate-400 hover:text-white flex-shrink-0"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
          </div>
        </div>
      )}

      {/* Monthly report banner – only shows in last week of month (25th‑31st) */}
      {showMonthlyReportBanner && (
        <div className="fixed bottom-4 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 z-50 w-auto md:w-full md:max-w-md animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-indigo-600 text-white rounded-2xl shadow-2xl p-4 md:p-5 border border-white/20">
            <div className="flex items-start gap-3">
              <div className="text-2xl md:text-3xl">📊</div>
              <div className="flex-1">
                <h4 className="font-bold text-base md:text-lg">Monthly Report Ready</h4>
                <p className="text-xs md:text-sm text-indigo-100 mt-1">Your progress for {currentMonthStr.replace('-', '‑')} is ready.</p>
                <div className="flex gap-2 md:gap-3 mt-3 md:mt-4">
                  <button onClick={handleDownloadReport} className="bg-white text-indigo-600 font-bold py-2 px-3 md:px-4 rounded-xl text-xs md:text-sm shadow hover:bg-indigo-50 transition active:scale-95">Download Report</button>
                  <button onClick={handleDismissBanner} className="text-indigo-200 hover:text-white text-xs md:text-sm font-medium">Remind me later</button>
                </div>
              </div>
              <button onClick={handleDismissBanner} className="text-indigo-200 hover:text-white flex-shrink-0"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
          </div>
        </div>
      )}

      <PageLayout title={`${getGreeting()}, ${displayName}`} subtitle="Your journey to emotional wellbeing starts here">
        {/* Stats Row with Skeleton Loading */}
        {!statsLoaded ? (
          <StatsSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 md:gap-6 mb-8">
            <StatCard gradient="from-indigo-500 to-indigo-600" label="Total Points" value={stats.totalPoints} />
            <StatCard gradient="from-emerald-500 to-emerald-600" label="Current Streak" value={`${stats.streak} days`} />
            <StatCard gradient="from-amber-500 to-amber-600" label="Gratitude Entries" value={stats.gratitudeCount} />
            <StatCard
              gradient="from-purple-500 to-pink-600"
              label="🔔 Notifications"
              value={stats.unreadCount}
              icon={true}
              isClickable={true}
              onClick={() => setShowNotifications(true)}
            />
          </div>
        )}

        {/* Insights Card */}
        <InsightsCard />

        {/* PWA Install Card */}
        <PWAInstallCard />

        {/* Quick Help Box */}
        <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl p-4 md:p-5 mb-8 border border-indigo-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl md:text-3xl">📘</span>
            <div>
              <h3 className="font-bold text-indigo-800 text-sm md:text-base">New to MindEase?</h3>
              <p className="text-indigo-700 text-xs md:text-sm">Check out the complete guide to understand every feature.</p>
            </div>
          </div>
          <Link
            to="/how-to-use"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 md:px-5 rounded-xl shadow transition active:scale-95 text-sm md:text-base w-full sm:w-auto text-center"
          >
            Go to How‑to‑Use Guide →
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-6">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4 md:mb-6">Explore Tools & Insights</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {memoizedFeatureCards.map((card, idx) => (
              <FeatureCard key={`${card.to}-${idx}`} card={card} idx={idx} />
            ))}
          </div>
        </div>
      </PageLayout>

      {/* Lazy Loaded Notification Panel */}
      {showNotifications && (
        <Suspense fallback={null}>
          <NotificationPanel onClose={() => setShowNotifications(false)} />
        </Suspense>
      )}
    </>
  );
};

export default Dashboard;