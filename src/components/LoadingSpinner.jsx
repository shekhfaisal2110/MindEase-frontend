import React, { useState, useEffect } from 'react';

const motivationalQuotes = [
  "✨ Small steps every day lead to big changes.",
  "🌱 You are stronger than you think.",
  "💪 Every day is a new beginning.",
  "🧘 Breathe. You've got this.",
  "🌟 Your only limit is your mind.",
  "🌸 Progress, not perfection.",
  "💖 You deserve peace and happiness.",
  "🌿 Take a deep breath. You are enough.",
  "🔥 Keep going. You're making progress.",
  "🌈 This too shall pass. Brighter days ahead.",
  "💫 Believe in yourself. You can do this.",
  "🍃 Let go of what you can't control.",
  "⭐ You are not alone. We're here for you.",
  "🎯 One task at a time. You'll get there.",
  "💭 Your feelings are valid. Take a moment.",
];

const LoadingSpinner = () => {
  // Random initial quote
  const [quote, setQuote] = useState(() => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    return motivationalQuotes[randomIndex];
  });

  useEffect(() => {
    const interval = setInterval(() => {
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * motivationalQuotes.length);
      } while (motivationalQuotes[newIndex] === quote);
      setQuote(motivationalQuotes[newIndex]);
    }, 3000); // 3 seconds

    return () => clearInterval(interval);
  }, [quote]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 max-w-md w-full text-center shadow-xl">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">🌿</span>
            </div>
          </div>
        </div>
        <p className="text-slate-600 text-lg font-medium italic transition-all duration-500">
          "{quote}"
        </p>
        <p className="text-slate-400 text-sm mt-4">Loading MindEase...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;