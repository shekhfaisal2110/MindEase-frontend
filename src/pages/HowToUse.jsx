import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../components/PageLayout';

// Static data – defined outside to avoid recreation on each render
const quickStartSteps = [
  { step: 1, text: "Create an account and verify with OTP" },
  { step: 2, text: "Log your mood and complete daily rituals" },
  { step: 3, text: "Add tasks and practice affirmations" },
  { step: 4, text: "Explore CBT, coping cards, and tiny wins" },
  { step: 5, text: "Check your analytics, badges, and export reports" },
];

const featuresData = [
  {
    icon: "⏰",
    title: "Hourly Emotion Tracker",
    description: "Log your emotions every 2 hours to spot patterns.",
    tips: ["Choose 😊 / 😐 / 😞 for each time block", "Add custom time blocks (e.g., 22:00‑00:00)", "Calendar view shows daily emotional summary"],
    points: ["Each emotion block: +5"],
    link: "/hourly-emotion",
  },
  {
    icon: "💭",
    title: "Emotional Check‑In",
    description: "Take a moment to reflect on your feelings.",
    tips: ["Select from quick emotions or type your own", "Rate intensity from 1 to 10", "Optional note about triggers"],
    points: ["Each check‑in: +1"],
    link: "/emotional",
  },
  {
    icon: "🙏",
    title: "Gratitude Journal",
    description: "Write down what you’re thankful for.",
    tips: ["Write about people, things, and situations", "Add notes for deeper reflection", "Complete the 33‑day challenge for confetti celebration"],
    points: ["Each entry: +2"],
    link: "/gratitude",
  },
  {
    icon: "💬",
    title: "Affirmations",
    description: "Repeat positive statements to reprogram your mind.",
    tips: ["Add your own affirmations", "Set a monthly goal (days)", "Click ‘I repeated this’ to count progress", "Reach your goal → confetti!"],
    points: ["Each repetition: +1 (points increase with repetitions)"],
    link: "/affirmations",
  },
  {
    icon: "🧘",
    title: "Therapy Exercises",
    description: "Practice hot potato, forgiveness, self‑talk, and receiving.",
    tips: ["Add custom exercises", "Click +1 to repeat", "Calendar shows your active days"],
    points: ["Each repetition: +1"],
    link: "/therapy",
  },
  {
    icon: "✉️",
    title: "Letters to Myself",
    description: "Write letters to your future self.",
    tips: ["Seal & save", "Mark as read when you revisit", "Confetti on every letter"],
    points: ["Each letter: +20"],
    link: "/letters",
  },
  {
    icon: "✅",
    title: "Daily Growth (6 Habits)",
    description: "Track silence, affirmation, happiness, exercise, reading, journaling.",
    tips: ["Check off each habit", "➕3 points per completed habit", "Calendar shows days you did all 6", "Confetti when you complete all six"],
    points: ["Each completed habit: +3 (max 18/day)"],
    link: "/dailytracker",
  },
  {
    icon: "⚡",
    title: "React vs Response",
    description: "Log angry moments and choose mindful response.",
    tips: ["Record trigger, outcome", "Calendar shows your progress"],
    points: ["Each entry: +5"],
    link: "/react-response",
  },
  {
    icon: "🎯",
    title: "Ikigai (Purpose)",
    description: "Discover your reason for being.",
    tips: ["Add items in four circles", "See overlap insights (passion, mission, vocation, profession)"],
    points: ["Each Ikigai item: +10"],
    link: "/ikigai",
  },
  {
    icon: "🧠",
    title: "CBT Thought Record",
    description: "Challenge negative thoughts using Cognitive Behavioural Therapy.",
    tips: ["Write situation, automatic thoughts, feelings", "Identify cognitive distortions", "Create balanced response", "Track before/after intensity"],
    points: ["Each record: +10"],
    link: "/cbt",
  },
  {
    icon: "💡",
    title: "Motivation Corner",
    description: "Read and share inspiring thoughts.",
    tips: ["Browse community-approved quotes", "Submit your own motivational thought", "Admin approves before public display"],
    points: ["Submitting a thought: +5 (if approved)"],
    link: "/motivation",
  },
  {
    icon: "🃏",
    title: "Coping Cards",
    description: "Ready‑to‑use self‑help cards for difficult moments.",
    tips: ["Search by category", "Create your own custom cards", "Submit for public sharing (admin approval)", "Bookmark favourites"],
    points: ["Using a card: +2", "Creating a card: +5"],
    link: "/coping-cards",
  },
  {
    icon: "🌱",
    title: "Tiny Wins (Behavioral Activation)",
    description: "Plan and complete very small daily tasks to reduce overwhelm.",
    tips: ["Add your own tasks (e.g., ‘Drink water’)", "Complete tasks and log mood before/after", "Get personalised suggestions", "See weekly insights"],
    points: ["Each completed task: +3"],
    link: "/tiny-wins",
  },
  {
    icon: "👨‍👩‍👧",
    title: "Time with Loved Ones",
    description: "Log time spent with family and friends.",
    tips: ["Add people (family/friends)", "Log daily minutes and notes", "Pie & bar charts show usage"],
    points: ["Each time entry: +20"],
    link: "/time-dashboard",
  },
  {
    icon: "📱",
    title: "Digital Wellbeing",
    description: "Track screen time and app usage.",
    tips: ["Set total device time", "Add per‑app usage with auto‑suggestions", "Analytics shows top apps"],
    points: ["Each app usage log: +5"],
    link: "/device-usage",
  },
  {
    icon: "🌿",
    title: "Wellbeing Toolkit",
    description: "Log activities that bring joy or reduce stress.",
    tips: ["Add happiness activities", "For stress relief, set a reduction percentage", "Get the highest‑rated suggestion"],
    points: ["Each activity log: +5"],
    link: "/wellbeing",
  },
  {
    icon: "💬",
    title: "Support Chat",
    description: "Message the admin for help.",
    tips: ["Send text or images", "Edit/delete your own messages", "Admin sees unread badges"],
    points: ["No points (support only)"],
    link: "/chat",
  },
  {
    icon: "📊",
    title: "Analytics",
    description: "See your points and activity breakdown.",
    tips: ["Line, bar, pie, area, radar charts", "Last 30 days + all‑time totals", "Refresh data anytime"],
    points: ["No points (view only)"],
    link: "/analytics",
  },
  {
    icon: "🏆",
    title: "Badges",
    description: "Earn milestone badges for consistency, points, activities, and more.",
    tips: ["Streak badges every 5 days", "Points every 100", "Activities every 50", "Active days every 10"],
    points: ["Each badge earned: +20"],
    link: "/badges",
  },
  {
    icon: "🏅",
    title: "Leaderboard",
    description: "Compare your total points with other users (opt‑in).",
    tips: ["You can hide from leaderboard in Profile", "Rank based on lifetime points"],
    points: ["No points (ranking only)"],
    link: "/leaderboard",
  },
  {
    icon: "📄",
    title: "Export Report",
    description: "Download your monthly or yearly progress as a PDF.",
    tips: ["Choose month/year", "Includes points, activities, sleep, emotions, device usage", "Professional chart layout"],
    points: ["No points (export only)"],
    link: "/export",
  },
  {
    icon: "📬",
    title: "Notifications",
    description: "Receive announcements, admin messages, and system alerts.",
    tips: ["Bell icon in navbar shows unread count", "Mark as read", "Delete old notifications"],
    points: ["No points (system messages)"],
    link: "/notifications",
  },
  {
    icon: "😴",
    title: "Sleep Log",
    description: "Log bedtime, wake time, quality, and notes.",
    tips: ["Automatic duration calculation", "Sleep vs next‑day mood chart", "Track over time"],
    points: ["Each log: +2"],
    link: "/sleep",
  },
  {
    icon: "👤",
    title: "Profile",
    description: "Manage your account and view progress overview.",
    tips: ["Edit username", "Change password via OTP", "Set weekly goal", "View your total points, streak, and activity breakdown"],
    points: ["No points (account management)"],
    link: "/profile",
  },
];

const pointsBreakdown = [
  "📄 Page View: +1", "⏰ Hourly Emotion: +5", "💭 Check‑In: +1", "🙏 Gratitude: +2",
  "💬 Affirmation: +1", "🧘 Therapy: +1", "✉️ Letter: +20", "✅ Daily Habit: +3",
  "⚡ React/Response: +5", "🎯 Ikigai Item: +10", "🧠 CBT Record: +10", "💡 Motivation: +5 (if approved)",
  "🃏 Coping Card: +2 (use) / +5 (create)", "🌱 Tiny Win: +3", "👨‍👩‍👧 Time with Loved Ones: +20",
  "📱 Digital Wellbeing: +5", "🌿 Wellbeing Toolkit: +5", "🏆 Badges: +20 each", "😴 Sleep Log: +2",
];

// Memoized feature card component
const FeatureCard = React.memo(({ feature }) => (
  <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 group h-full flex flex-col">
    <div className="p-5 sm:p-6 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-4xl">{feature.icon}</span>
        <h3 className="text-lg sm:text-xl font-bold text-slate-800">{feature.title}</h3>
      </div>
      <p className="text-slate-500 text-sm mb-4 flex-1">{feature.description}</p>
      <div className="space-y-2">
        {feature.tips && feature.tips.map((tip, idx) => (
          <div key={idx} className="flex items-start gap-2 text-sm text-slate-600">
            <span className="text-indigo-500 mt-0.5">•</span>
            <span className="break-words">{tip}</span>
          </div>
        ))}
      </div>
      {feature.points && (
        <div className="mt-3 pt-2 border-t border-slate-100">
          <p className="text-xs font-bold text-emerald-600 flex flex-wrap gap-x-3 gap-y-1">
            {feature.points.map((p, i) => <span key={i}>🎁 {p}</span>)}
          </p>
        </div>
      )}
      <Link
        to={feature.link}
        className="mt-5 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition touch-manipulation"
      >
        Go to {feature.title} →
      </Link>
    </div>
  </div>
));

const HowToUse = React.memo(() => {
  // Static arrays – no need for useMemo, but using it to be explicit
  const quickStart = useMemo(() => quickStartSteps, []);
  const features = useMemo(() => featuresData, []);
  const points = useMemo(() => pointsBreakdown, []);

  return (
    <PageLayout title="How to Use MindEase" subtitle="Your complete guide to self‑care with MindEase">
      <div className="max-w-6xl mx-auto px-4 sm:px-0">
        {/* Quick Start / Hero – responsive */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl sm:rounded-3xl p-5 sm:p-8 mb-8 sm:mb-12 text-center border border-indigo-100">
          <h2 className="text-xl sm:text-2xl font-black text-indigo-800 mb-3">✨ Get Started in 5 Steps</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 mt-5 sm:mt-6">
            {quickStart.map((item) => (
              <div key={item.step} className="flex flex-col items-center bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base mb-2">{item.step}</div>
                <p className="text-xs sm:text-sm text-slate-700 text-center">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Points Summary Card – grid adjusts for mobile */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl sm:rounded-3xl p-5 sm:p-6 mb-8 sm:mb-12 border border-emerald-100">
          <h3 className="text-base sm:text-xl font-bold text-emerald-800 mb-3 flex items-center gap-2">⭐ How to earn points</h3>
          <p className="text-emerald-700 mb-4 text-sm sm:text-base">Every positive action in MindEase earns you points. Here's the breakdown:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 text-xs sm:text-sm">
            {points.map((point, idx) => (
              <div key={idx} className="bg-white rounded-lg sm:rounded-xl p-2 text-center truncate">{point}</div>
            ))}
          </div>
        </div>

        {/* Features Grid – responsive columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>

        {/* Footer – mobile padding */}
        <div className="mt-8 sm:mt-12 bg-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center text-white">
          <h3 className="text-lg sm:text-xl font-bold mb-3">🌿 Every small action counts</h3>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            MindEase is designed to support your mental wellbeing journey. Use it daily, celebrate your streaks, and remember: progress, not perfection.
          </p>
        </div>
      </div>
    </PageLayout>
  );
});

HowToUse.displayName = 'HowToUse';
export default HowToUse;