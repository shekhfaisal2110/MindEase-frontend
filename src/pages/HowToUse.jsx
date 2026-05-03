import React from 'react';
import PageLayout from '../components/PageLayout';
import { Link } from 'react-router-dom';

const HowToUse = () => {
  const features = [
    {
      icon: "🎯",
      title: "Dashboard",
      description: "Your daily command center. Track your mood, view your daily rituals, and manage tasks.",
      tips: ["Rate your mood (1‑10) daily", "Complete self‑care rituals for +3 points each", "Add, complete, and delete tasks"],
      link: "/dashboard",
    },
    {
      icon: "⏰",
      title: "Hourly Emotion Tracker",
      description: "Log your emotions every 2 hours to spot patterns.",
      tips: ["Choose 😊 / 😐 / 😞 for each time block", "Add custom time blocks (e.g., 22:00‑00:00)", "Calendar view shows your daily emotional summary"],
      link: "/hourly-emotion",
    },
    {
      icon: "💭",
      title: "Emotional Check‑In",
      description: "Take a moment to reflect on your feelings.",
      tips: ["Select from quick emotions or type your own", "Rate intensity from 1 to 10", "Optional note about triggers"],
      link: "/emotional",
    },
    {
      icon: "🙏",
      title: "Gratitude Journal",
      description: "Write down what you’re thankful for.",
      tips: ["Write about people, things, and situations", "Add notes for deeper reflection", "Complete the 33‑day challenge for confetti celebration"],
      link: "/gratitude",
    },
    {
      icon: "💬",
      title: "Affirmations",
      description: "Repeat positive statements to reprogram your mind.",
      tips: ["Add your own affirmations", "Set a monthly goal (days)", "Click ‘I repeated this’ to count progress", "Reach your goal → confetti!"],
      link: "/affirmations",
    },
    {
      icon: "🧘",
      title: "Therapy Exercises",
      description: "Practice hot potato, forgiveness, self‑talk, and receiving.",
      tips: ["Add custom exercises", "Click +1 to repeat", "Each completion = +1 point", "Calendar shows your active days"],
      link: "/therapy",
    },
    {
      icon: "✉️",
      title: "Letters to Myself",
      description: "Write letters to your future self.",
      tips: ["Seal & save", "Mark as read when you revisit", "Confetti on every letter"],
      link: "/letters",
    },
    {
      icon: "✅",
      title: "Daily Growth (6 Habits)",
      description: "Track silence, affirmation, happiness, exercise, reading, journaling.",
      tips: ["Check off each habit", "➕3 points per completed habit", "Calendar shows days you did all 6", "Confetti when you complete all six"],
      link: "/dailytracker",
    },
    {
      icon: "⚡",
      title: "React vs Response",
      description: "Log angry moments and choose mindful response.",
      tips: ["Record trigger, outcome", "Earn +5 points per entry", "Calendar shows your progress"],
      link: "/react-response",
    },
    {
      icon: "🎯",
      title: "Ikigai (Purpose)",
      description: "Discover your reason for being.",
      tips: ["Add items in four circles", "See overlap insights (passion, mission, vocation, profession)", "+10 points per item"],
      link: "/ikigai",
    },
    {
      icon: "👨‍👩‍👧",
      title: "Time with Loved Ones",
      description: "Log time spent with family and friends.",
      tips: ["Add people (family/friends)", "Log daily minutes and notes", "Pie & bar charts show usage"],
      link: "/time-dashboard",
    },
    {
      icon: "📱",
      title: "Digital Wellbeing",
      description: "Track screen time and app usage.",
      tips: ["Set total device time", "Add per‑app usage with auto‑suggestions", "Analytics shows top apps"],
      link: "/device-usage",
    },
    {
      icon: "🌿",
      title: "Wellbeing Toolkit",
      description: "Log activities that bring joy or reduce stress.",
      tips: ["Add happiness activities", "For stress relief, set a reduction percentage", "Get the highest‑rated suggestion"],
      link: "/wellbeing",
    },
    {
      icon: "💬",
      title: "Support Chat",
      description: "Message the admin for help.",
      tips: ["Send text or images", "Edit/delete your own messages", "Admin sees unread badges"],
      link: "/chat",
    },
    {
      icon: "📊",
      title: "Analytics",
      description: "See your points and activity breakdown.",
      tips: ["Line, bar, pie, area, radar charts", "Last 30 days + all‑time totals", "Refresh data anytime"],
      link: "/analytics",
    },
    {
      icon: "🏆",
      title: "Badges",
      description: "Earn milestone badges for consistency, points, activities, and more.",
      tips: ["Streak badges every 5 days", "Points every 100", "Activities every 50", "Active days every 10"],
      link: "/badges",
    },
    {
      icon: "👤",
      title: "Profile",
      description: "Manage your account and weekly goal.",
      tips: ["Edit username", "Change password via OTP", "Set weekly points goal", "Print your progress summary"],
      link: "/profile",
    },
  ];

  const quickStart = [
    { step: 1, text: "Create an account and verify with OTP" },
    { step: 2, text: "Log your mood and complete daily rituals" },
    { step: 3, text: "Add tasks and practice affirmations" },
    { step: 4, text: "Explore Ikigai and therapy exercises" },
    { step: 5, text: "Check your analytics and badges" },
  ];

  return (
    <PageLayout title="How to Use MindEase" subtitle="Your complete guide to self‑care with MindEase">
      <div className="max-w-6xl mx-auto">
        {/* Hero / Quick Start */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 mb-12 text-center border border-indigo-100">
          <h2 className="text-2xl font-black text-indigo-800 mb-3">✨ Get Started in 5 Steps</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            {quickStart.map((item) => (
              <div key={item.step} className="flex flex-col items-center bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-sm">
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold mb-2">{item.step}</div>
                <p className="text-sm text-slate-700">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{feature.icon}</span>
                  <h3 className="text-xl font-bold text-slate-800">{feature.title}</h3>
                </div>
                <p className="text-slate-500 text-sm mb-4">{feature.description}</p>
                <div className="space-y-2">
                  {feature.tips.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="text-indigo-500 mt-0.5">•</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
                <Link
                  to={feature.link}
                  className="mt-5 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition"
                >
                  Go to {feature.title} →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Tips */}
        <div className="mt-12 bg-slate-800 rounded-3xl p-8 text-center text-white">
          <h3 className="text-xl font-bold mb-3">🌿 Every small action counts</h3>
          <p className="text-slate-300 max-w-2xl mx-auto">
            MindEase is designed to support your mental wellbeing journey. Use it daily, celebrate your streaks, and remember: progress, not perfection.
          </p>
        </div>
      </div>
    </PageLayout>
  );
};

export default HowToUse;