// src/pages/Dashboard.jsx (User Dashboard – admin‑style)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import PageLayout from '../components/PageLayout';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import InsightsCard from '../components/InsightsCard';

// Icon mapping for cards (optional, but use emojis for simplicity)
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
  "/profile": "👤"
};

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalPoints: 0, streak: 0, gratitudeCount: 0 });
  const [showMonthStartBanner, setShowMonthStartBanner] = useState(false);
  const [previousMonth, setPreviousMonth] = useState('');
  const [showMonthlyReportBanner, setShowMonthlyReportBanner] = useState(false);
  const [currentMonthStr, setCurrentMonthStr] = useState('');

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
    Promise.all([
      fetchStats(),
      checkMonthStart(),
      checkMonthlyReport()
    ]).finally(() => setLoading(false));
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/user/progress');
      setStats({
        totalPoints: res.data.totalPoints || 0,
        streak: res.data.streak || 0,
        gratitudeCount: res.data.metrics?.gratitudeEntries || 0
      });
    } catch (err) {
      console.error(err);
    }
  };

  const checkMonthStart = async () => {
    try {
      const res = await api.get('/user/check-month-start');
      if (res.data.isNewMonth) {
        setPreviousMonth(res.data.currentMonth);
        setShowMonthStartBanner(true);
      }
    } catch (err) { console.error(err); }
  };

  const handleAcknowledgeMonthStart = async () => {
    await api.post('/user/acknowledge-month-start');
    setShowMonthStartBanner(false);
  };

  const downloadPreviousMonthReport = async () => {
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
  };

  const checkMonthlyReport = async () => {
    try {
      const res = await api.get('/user/check-monthly-report');
      if (res.data.shouldShow) {
        setCurrentMonthStr(res.data.currentMonth);
        setShowMonthlyReportBanner(true);
      }
    } catch (err) { console.error(err); }
  };

  const handleDownloadReport = async () => {
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
  };

  const handleDismissBanner = async () => {
    await api.post('/user/acknowledge-monthly-report');
    setShowMonthlyReportBanner(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };
  const displayName = user?.username || 'User';

  // Feature cards (paths and labels)
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
    { to: "/chat", title: "Live Support", desc: "Message admin for help" },
    { to: "/testimonials", title: "Testimonials", desc: "Read community stories" },
    { to: "/feedback-form", title: "Give Feedback", desc: "Help us improve" },
    { to: "/profile", title: "My Profile", desc: "View and edit your account" },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <>
      {/* Banners (unchanged) */}
      {showMonthStartBanner && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-2xl shadow-2xl p-5 border border-white/20">
            <div className="flex items-start gap-3">
              <div className="text-3xl">🌱</div>
              <div className="flex-1">
                <h4 className="font-bold text-lg">A New Month Begins</h4>
                <p className="text-sm text-slate-200 mt-1">Welcome to {previousMonth.replace('-', ' ')}. Every month is a new opportunity to grow. Reflect on the past month and set fresh intentions for the weeks ahead.</p>
                <div className="flex gap-3 mt-4 flex-wrap">
                  <button onClick={downloadPreviousMonthReport} className="bg-white text-slate-800 font-bold py-2 px-4 rounded-xl text-sm shadow hover:bg-slate-100 transition">📄 Download Last Month's Report</button>
                  <button onClick={handleAcknowledgeMonthStart} className="text-slate-300 hover:text-white text-sm font-medium">Dismiss</button>
                </div>
              </div>
              <button onClick={handleAcknowledgeMonthStart} className="text-slate-400 hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
          </div>
        </div>
      )}

      {showMonthlyReportBanner && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-indigo-600 text-white rounded-2xl shadow-2xl p-5 border border-white/20">
            <div className="flex items-start gap-3">
              <div className="text-3xl">📊</div>
              <div className="flex-1">
                <h4 className="font-bold">Monthly Report Ready</h4>
                <p className="text-sm text-indigo-100 mt-1">Your progress for {currentMonthStr.replace('-', '‑')} is ready. Download your report to keep track.</p>
                <div className="flex gap-3 mt-4">
                  <button onClick={handleDownloadReport} className="bg-white text-indigo-600 font-bold py-2 px-4 rounded-xl text-sm shadow hover:bg-indigo-50 transition">Download Report</button>
                  <button onClick={handleDismissBanner} className="text-indigo-200 hover:text-white text-sm font-medium">Remind me later</button>
                </div>
              </div>
              <button onClick={handleDismissBanner} className="text-indigo-200 hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
          </div>
        </div>
      )}

      <PageLayout title={`${getGreeting()}, ${displayName}`} subtitle="Your journey to emotional wellbeing starts here">
        {/* Stats Row – same as admin dashboard style */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 md:p-5 text-white shadow-md hover:shadow-xl transition-all hover:scale-105 duration-300">
            <p className="text-xs md:text-sm font-semibold tracking-wide opacity-90">Total Points</p>
            <p className="text-2xl md:text-3xl font-black mt-1">{stats.totalPoints}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 md:p-5 text-white shadow-md hover:shadow-xl transition-all hover:scale-105 duration-300">
            <p className="text-xs md:text-sm font-semibold tracking-wide opacity-90">Current Streak</p>
            <p className="text-2xl md:text-3xl font-black mt-1">{stats.streak} days</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 md:p-5 text-white shadow-md hover:shadow-xl transition-all hover:scale-105 duration-300">
            <p className="text-xs md:text-sm font-semibold tracking-wide opacity-90">Gratitude Entries</p>
            <p className="text-2xl md:text-3xl font-black mt-1">{stats.gratitudeCount}</p>
          </div>
        </div>

        <InsightsCard />

        {/* Feature Cards Grid – exactly like admin dashboard action cards */}
        <div className="mt-10">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-6">Explore Tools & Insights</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {featureCards.map((card, idx) => {
              // Determine gradient colors based on index or card title
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
                  key={idx}
                  to={card.to}
                  className="group flex items-start gap-4 p-4 md:p-5 bg-gradient-to-br from-slate-50 to-white rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-slate-200 hover:border-indigo-300 active:scale-95"
                >
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-lg md:text-xl">{iconMap[card.to] || "✨"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-base md:text-lg group-hover:text-indigo-600 transition truncate">{card.title}</h3>
                    <p className="text-xs md:text-sm text-slate-500 mt-1 leading-relaxed">{card.desc}</p>
                  </div>
                  <div className="text-slate-300 group-hover:text-indigo-500 transition-transform group-hover:translate-x-1 flex-shrink-0">→</div>
                </Link>
              );
            })}
          </div>
        </div>
      </PageLayout>
    </>
  );
};

export default Dashboard;