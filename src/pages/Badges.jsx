import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PageLayout from '../components/PageLayout';
import LoadingSpinner from '../components/LoadingSpinner';

const Badges = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [badgeValues, setBadgeValues] = useState({
    streak: 0,
    totalPoints: 0,
    totalActivities: 0,
    activeDays: 0,
    gratitude: 0,
    affirmations: 0,
    therapy: 0,
    letters: 0,
    emotionalCheckIns: 0,
    hourlyEmotions: 0,
    dailyTaskCompletions: 0,
    reactResponseEntries: 0,
    ikigaiItems: 0,
  });

  const badgeCategories = [
    { id: 'streak', title: 'Streak Badges', icon: '🔥', color: 'orange', base: 5, inc: 5, key: 'streak' },
    { id: 'points', title: 'Points Badges', icon: '🏆', color: 'indigo', base: 100, inc: 100, key: 'totalPoints' },
    { id: 'totalActivities', title: 'Activities Badges', icon: '📝', color: 'emerald', base: 50, inc: 50, key: 'totalActivities' },
    { id: 'activeDays', title: 'Active Days Badges', icon: '📅', color: 'purple', base: 10, inc: 10, key: 'activeDays' },
    { id: 'gratitude', title: 'Gratitude Badges', icon: '🙏', color: 'amber', base: 10, inc: 10, key: 'gratitude' },
    { id: 'affirmations', title: 'Affirmation Badges', icon: '💬', color: 'blue', base: 10, inc: 10, key: 'affirmations' },
    { id: 'therapy', title: 'Growth & Healing Badges', icon: '🧘', color: 'teal', base: 10, inc: 10, key: 'therapy' },
    { id: 'letters', title: 'Letters to Self Badges', icon: '✉️', color: 'rose', base: 5, inc: 5, key: 'letters' },
    { id: 'emotionalCheckIns', title: 'Check‑In Badges', icon: '💭', color: 'cyan', base: 10, inc: 10, key: 'emotionalCheckIns' },
    { id: 'hourlyEmotions', title: 'Hourly Emotion Badges', icon: '⏰', color: 'lime', base: 20, inc: 20, key: 'hourlyEmotions' },
    { id: 'dailyTaskCompletions', title: 'Daily Tasks Badges', icon: '✅', color: 'green', base: 10, inc: 10, key: 'dailyTaskCompletions' },
    { id: 'ikigaiItems', title: 'Ikigai Items Badges', icon: '🎯', color: 'pink', base: 5, inc: 5, key: 'ikigaiItems' },
    { id: 'reactResponseEntries', title: 'React vs Response Badges', icon: '⚡', color: 'yellow', base: 10, inc: 10, key: 'reactResponseEntries' },
  ];

  const getGradientColor = (color) => {
    const colors = {
      orange: '#f97316', indigo: '#6366f1', emerald: '#10b981', purple: '#8b5cf6',
      amber: '#f59e0b', blue: '#3b82f6', teal: '#14b8a6', rose: '#f43f5e',
      cyan: '#06b6d4', lime: '#84cc16', green: '#22c55e', pink: '#ec4899', yellow: '#eab308',
    };
    const mainColor = colors[color] || '#6366f1';
    return `linear-gradient(90deg, ${mainColor}, ${mainColor}cc)`;
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [progressRes, activeDaysRes, breakdownRes] = await Promise.all([
        api.get('/user/progress'),
        api.get('/user/active-days'),
        api.get('/user/activity-breakdown').catch(() => ({ data: {} })),
      ]);

      const streak = progressRes.data.streak;
      const totalPoints = progressRes.data.totalPoints;
      const totalActivities = progressRes.data.metrics.gratitudeEntries +
        progressRes.data.metrics.affirmations +
        progressRes.data.metrics.therapyExercises +
        progressRes.data.metrics.lettersToSelf;
      const activeDays = activeDaysRes.data.activeDays;

      // Individual module counts
      const [gratitudeRes, affirmationsRes, therapyRes, lettersRes, emotionalRes, hourlyRes, reactRes, ikigaiRes] = await Promise.all([
        api.get('/gratitude').catch(() => ({ data: [] })),
        api.get('/affirmations').catch(() => ({ data: [] })),
        api.get('/therapy').catch(() => ({ data: [] })),
        api.get('/letters').catch(() => ({ data: [] })),
        api.get('/emotional').catch(() => ({ data: [] })),
        api.get('/emotion-hourly').catch(() => ({ data: [] })),
        api.get('/react-response').catch(() => ({ data: [] })),
        api.get('/ikigai').catch(() => ({ data: { love: [], skill: [], worldNeed: [], earn: [] } })),
      ]);

      // ✅ Daily tasks: each completion adds 3 points to breakdown.dailyTask, so divide by 3
      const dailyTaskCompletions = Math.floor((breakdownRes.data?.dailyTask || 0) / 3);
      console.log('✅ Daily tasks completions (from activity points):', dailyTaskCompletions);

      const reactResponseEntries = reactRes.data.length;
      const ikigaiData = ikigaiRes.data;
      const ikigaiItems = (ikigaiData.love?.length || 0) +
        (ikigaiData.skill?.length || 0) +
        (ikigaiData.worldNeed?.length || 0) +
        (ikigaiData.earn?.length || 0);

      setBadgeValues({
        streak,
        totalPoints,
        totalActivities,
        activeDays,
        gratitude: gratitudeRes.data.length,
        affirmations: affirmationsRes.data.length,
        therapy: therapyRes.data.length,
        letters: lettersRes.data.length,
        emotionalCheckIns: emotionalRes.data.length,
        hourlyEmotions: hourlyRes.data.length,
        dailyTaskCompletions,
        reactResponseEntries,
        ikigaiItems,
      });
    } catch (err) {
      console.error('Error fetching badge data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeThresholds = (base, inc, current) => {
    const thresholds = [];
    let next = base;
    let upcomingCount = 0;
    const maxUpcoming = 3;
    while (thresholds.length < 30) {
      thresholds.push(next);
      if (next > current) {
        upcomingCount++;
        if (upcomingCount > maxUpcoming) break;
      }
      next += inc;
    }
    return thresholds;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <PageLayout title="Achievement Badges" subtitle="Every milestone celebrates your progress.">
      <div className="max-w-7xl mx-auto space-y-12">
        {badgeCategories.map((category) => {
          const currentValue = badgeValues[category.key];
          const thresholds = getBadgeThresholds(category.base, category.inc, currentValue);
          const earnedCount = thresholds.filter(t => currentValue >= t).length;
          const totalCount = thresholds.length;
          const nextThreshold = thresholds.find(t => t > currentValue);
          const progress = nextThreshold ? (currentValue / nextThreshold) * 100 : 100;

          return (
            <div key={category.id} className="bg-white rounded-3xl shadow-md border border-slate-100 p-6">
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <span className="text-3xl">{category.icon}</span>
                <h2 className="text-2xl font-bold text-slate-800">{category.title}</h2>
                <span className="text-sm bg-slate-100 px-3 py-1 rounded-full ml-auto">
                  {earnedCount} / {totalCount}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {thresholds.map((threshold, idx) => {
                  const isEarned = currentValue >= threshold;
                  return (
                    <div
                      key={idx}
                      className={`relative p-4 rounded-2xl text-center transition-all duration-200 ${
                        isEarned
                          ? `bg-${category.color}-100 text-${category.color}-800 border-2 border-${category.color}-300 shadow-md`
                          : 'bg-gray-100 text-gray-400 border border-gray-200 opacity-70'
                      }`}
                    >
                      <div className="text-4xl mb-2">{category.icon}</div>
                      <div className="text-lg font-bold">{threshold}</div>
                      <div className="text-xs mt-1">milestone</div>
                      {isEarned && (
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm shadow">
                          ✓
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {nextThreshold && (
                <div className="mt-6">
                  <div className="flex justify-between text-sm text-slate-600 mb-1">
                    <span>Next: {nextThreshold}</span>
                    <span>{currentValue} / {nextThreshold}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, progress)}%`,
                        background: getGradientColor(category.color),
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </PageLayout>
  );
};

export default Badges;