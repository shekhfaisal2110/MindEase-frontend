// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../context/AuthContext';
// import api from '../services/api';
// import PageLayout from '../components/PageLayout';
// import LoadingSpinner from '../components/LoadingSpinner';
// import { Link } from 'react-router-dom';

// const Badges = () => {
//   const { user } = useAuth();
//   const [loading, setLoading] = useState(true);
//   const [badgeValues, setBadgeValues] = useState({
//     streak: 0,
//     totalPoints: 0,
//     totalActivities: 0,
//     activeDays: 0,
//     gratitude: 0,
//     affirmations: 0,
//     therapy: 0,
//     letters: 0,
//     emotionalCheckIns: 0,
//     hourlyEmotions: 0,
//     dailyTaskCompletions: 0,
//     reactResponseEntries: 0,
//     ikigaiItems: 0,
//   });

//   const badgeCategories = [
//     { id: 'points', title: 'Points Badges', icon: '🏆', color: 'indigo', base: 100, inc: 100, key: 'totalPoints' },
//     { id: 'streak', title: 'Streak Badges', icon: '🔥', color: 'orange', base: 5, inc: 5, key: 'streak' },
//     { id: 'totalActivities', title: 'Activities Badges', icon: '📝', color: 'emerald', base: 50, inc: 50, key: 'totalActivities' },
//     { id: 'activeDays', title: 'Active Days Badges', icon: '📅', color: 'purple', base: 10, inc: 10, key: 'activeDays' },
//     { id: 'dailyTaskCompletions', title: 'Daily Tasks Badges', icon: '✅', color: 'green', base: 10, inc: 10, key: 'dailyTaskCompletions' },
//   ];

//   const getGradientColor = (color) => {
//     const colors = {
//       orange: '#f97316', indigo: '#6366f1', emerald: '#10b981', purple: '#8b5cf6',
//       amber: '#f59e0b', blue: '#3b82f6', teal: '#14b8a6', rose: '#f43f5e',
//       cyan: '#06b6d4', lime: '#84cc16', green: '#22c55e', pink: '#ec4899', yellow: '#eab308',
//     };
//     const mainColor = colors[color] || '#6366f1';
//     return `linear-gradient(90deg, ${mainColor}, ${mainColor}cc)`;
//   };

//   useEffect(() => {
//     fetchAllData();
//   }, []);

//   const fetchAllData = async () => {
//     setLoading(true);
//     try {
//       const [progressRes, activeDaysRes, breakdownRes] = await Promise.all([
//         api.get('/user/progress'),
//         api.get('/user/active-days'),
//         api.get('/user/activity-breakdown').catch(() => ({ data: {} })),
//       ]);

//       const streak = progressRes.data.streak;
//       const totalPoints = progressRes.data.totalPoints;
//       const totalActivities = progressRes.data.metrics.gratitudeEntries +
//         progressRes.data.metrics.affirmations +
//         progressRes.data.metrics.therapyExercises +
//         progressRes.data.metrics.lettersToSelf;
//       const activeDays = activeDaysRes.data.activeDays;

//       const [gratitudeRes, affirmationsRes, therapyRes, lettersRes, emotionalRes, hourlyRes, reactRes, ikigaiRes] = await Promise.all([
//         api.get('/gratitude').catch(() => ({ data: [] })),
//         api.get('/affirmations').catch(() => ({ data: [] })),
//         api.get('/therapy').catch(() => ({ data: [] })),
//         api.get('/letters').catch(() => ({ data: [] })),
//         api.get('/emotional').catch(() => ({ data: [] })),
//         api.get('/emotion-hourly').catch(() => ({ data: [] })),
//         api.get('/react-response').catch(() => ({ data: [] })),
//         api.get('/ikigai').catch(() => ({ data: { love: [], skill: [], worldNeed: [], earn: [] } })),
//       ]);

//       const dailyTaskCompletions = Math.floor((breakdownRes.data?.dailyTask || 0) / 3);
//       const reactResponseEntries = reactRes.data.length;
//       const ikigaiData = ikigaiRes.data;
//       const ikigaiItems = (ikigaiData.love?.length || 0) +
//         (ikigaiData.skill?.length || 0) +
//         (ikigaiData.worldNeed?.length || 0) +
//         (ikigaiData.earn?.length || 0);

//       setBadgeValues({
//         streak,
//         totalPoints,
//         totalActivities,
//         activeDays,
//         gratitude: gratitudeRes.data.length,
//         affirmations: affirmationsRes.data.length,
//         therapy: therapyRes.data.length,
//         letters: lettersRes.data.length,
//         emotionalCheckIns: emotionalRes.data.length,
//         hourlyEmotions: hourlyRes.data.length,
//         dailyTaskCompletions,
//         reactResponseEntries,
//         ikigaiItems,
//       });
//     } catch (err) {
//       console.error('Error fetching badge data:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getBadgeThresholds = (base, inc, current) => {
//     const thresholds = [];
//     let next = base;
//     let upcomingCount = 0;
//     const maxUpcoming = 3;
//     while (thresholds.length < 30) {
//       thresholds.push(next);
//       if (next > current) {
//         upcomingCount++;
//         if (upcomingCount > maxUpcoming) break;
//       }
//       next += inc;
//     }
//     return thresholds;
//   };

//   if (loading) return <LoadingSpinner />;

//   return (
//     <PageLayout title="Achievement Badges" subtitle="Every milestone celebrates your progress.">
//       {/* Monthly Reset Note */}
//       <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100 shadow-sm">
//   <div className="flex items-start gap-3">
//     <div className="text-2xl">📅</div>
//     <div>
//       <h3 className="font-bold text-slate-800">Monthly Badge Reset</h3>
//       <p className="text-sm text-slate-600 mt-1">
//         <strong>All badges reset at the beginning of each month.</strong> Your progress starts fresh every month, 
//         giving you a new opportunity to challenge yourself and earn achievements again.
//       </p>
//       <p className="text-xs text-slate-500 mt-2">
//         ⚡ Tip: Use the{' '}
//         <Link to="/export" className="text-indigo-600 font-bold underline hover:text-indigo-800">
//           Export Report
//         </Link>{' '}
//         page to download a PDF/CSV of your current month's performance before it resets!
//       </p>
//     </div>
//   </div>
// </div>

//       <div className="max-w-7xl mx-auto space-y-12">
//         {badgeCategories.map((category) => {
//           const currentValue = badgeValues[category.key];
//           const thresholds = getBadgeThresholds(category.base, category.inc, currentValue);
//           const earnedCount = thresholds.filter(t => currentValue >= t).length;
//           const totalCount = thresholds.length;
//           const nextThreshold = thresholds.find(t => t > currentValue);
//           const progress = nextThreshold ? (currentValue / nextThreshold) * 100 : 100;

//           return (
//             <div key={category.id} className="bg-white rounded-3xl shadow-md border border-slate-100 p-6">
//               <div className="flex items-center gap-3 mb-6 flex-wrap">
//                 <span className="text-3xl">{category.icon}</span>
//                 <h2 className="text-2xl font-bold text-slate-800">{category.title}</h2>
//                 <span className="text-sm bg-slate-100 px-3 py-1 rounded-full ml-auto">
//                   {earnedCount} / {totalCount}
//                 </span>
//               </div>

//               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
//                 {thresholds.map((threshold, idx) => {
//                   const isEarned = currentValue >= threshold;
//                   return (
//                     <div
//                       key={idx}
//                       className={`relative p-4 rounded-2xl text-center transition-all duration-200 ${
//                         isEarned
//                           ? `bg-${category.color}-100 text-${category.color}-800 border-2 border-${category.color}-300 shadow-md`
//                           : 'bg-gray-100 text-gray-400 border border-gray-200 opacity-70'
//                       }`}
//                     >
//                       <div className="text-4xl mb-2">{category.icon}</div>
//                       <div className="text-lg font-bold">{threshold}</div>
//                       <div className="text-xs mt-1">milestone</div>
//                       {isEarned && (
//                         <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm shadow">
//                           ✓
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>

//               {nextThreshold && (
//                 <div className="mt-6">
//                   <div className="flex justify-between text-sm text-slate-600 mb-1">
//                     <span>Next: {nextThreshold}</span>
//                     <span>{currentValue} / {nextThreshold}</span>
//                   </div>
//                   <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
//                     <div
//                       className="h-full transition-all duration-500"
//                       style={{
//                         width: `${Math.min(100, progress)}%`,
//                         background: getGradientColor(category.color),
//                       }}
//                     />
//                   </div>
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>
//     </PageLayout>
//   );
// };

// export default Badges;







import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PageLayout from '../components/PageLayout';
import LoadingSpinner from '../components/LoadingSpinner';

// Memoized badge card component to prevent unnecessary re‑renders
const BadgeCard = React.memo(({ icon, title, earnedCount, totalCount, thresholds, currentValue, color, getGradientColor }) => {
  const nextThreshold = thresholds.find(t => t > currentValue);
  const progress = nextThreshold ? (currentValue / nextThreshold) * 100 : 100;

  return (
    <div className="bg-white rounded-3xl shadow-md border border-slate-100 p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-5 sm:mb-6 flex-wrap">
        <span className="text-3xl">{icon}</span>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">{title}</h2>
        <span className="text-xs sm:text-sm bg-slate-100 px-3 py-1 rounded-full ml-auto">
          {earnedCount} / {totalCount}
        </span>
      </div>

      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
        {thresholds.map((threshold, idx) => {
          const isEarned = currentValue >= threshold;
          return (
            <div
              key={idx}
              className={`relative p-3 sm:p-4 rounded-2xl text-center transition-all duration-200 ${
                isEarned
                  ? `bg-${color}-100 text-${color}-800 border-2 border-${color}-300 shadow-md`
                  : 'bg-gray-100 text-gray-400 border border-gray-200 opacity-70'
              }`}
            >
              <div className="text-3xl sm:text-4xl mb-2">{icon}</div>
              <div className="text-base sm:text-lg font-bold">{threshold}</div>
              <div className="text-[10px] sm:text-xs mt-1">milestone</div>
              {isEarned && (
                <div className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs shadow">
                  ✓
                </div>
              )}
            </div>
          );
        })}
      </div>

      {nextThreshold && (
        <div className="mt-5 sm:mt-6">
          <div className="flex justify-between text-xs sm:text-sm text-slate-600 mb-1">
            <span>Next: {nextThreshold}</span>
            <span>{currentValue} / {nextThreshold}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${Math.min(100, progress)}%`,
                background: getGradientColor(color),
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
});

// Skeleton loader for badges – shows instantly
const BadgeSkeleton = () => (
  <div className="bg-white rounded-3xl shadow-md border border-slate-100 p-5 sm:p-6 animate-pulse">
    <div className="flex items-center gap-3 mb-5 sm:mb-6">
      <div className="w-10 h-10 bg-slate-200 rounded-full" />
      <div className="h-6 bg-slate-200 rounded w-32" />
      <div className="h-6 bg-slate-200 rounded w-16 ml-auto" />
    </div>
    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="p-3 sm:p-4 rounded-2xl bg-slate-100 h-24" />
      ))}
    </div>
  </div>
);

// Static badge categories – defined once outside component
const BADGE_CATEGORIES = [
  { id: 'points', title: 'Points Badges', icon: '🏆', color: 'indigo', base: 100, inc: 100, key: 'totalPoints' },
  { id: 'streak', title: 'Streak Badges', icon: '🔥', color: 'orange', base: 5, inc: 5, key: 'streak' },
  { id: 'totalActivities', title: 'Activities Badges', icon: '📝', color: 'emerald', base: 50, inc: 50, key: 'totalActivities' },
  { id: 'activeDays', title: 'Active Days Badges', icon: '📅', color: 'purple', base: 10, inc: 10, key: 'activeDays' },
  { id: 'dailyTaskCompletions', title: 'Daily Tasks Badges', icon: '✅', color: 'green', base: 10, inc: 10, key: 'dailyTaskCompletions' },
];

const colorMap = {
  orange: '#f97316', indigo: '#6366f1', emerald: '#10b981', purple: '#8b5cf6',
  amber: '#f59e0b', blue: '#3b82f6', teal: '#14b8a6', rose: '#f43f5e',
  cyan: '#06b6d4', lime: '#84cc16', green: '#22c55e', pink: '#ec4899', yellow: '#eab308',
};

const getGradientColor = (color) => {
  const mainColor = colorMap[color] || '#6366f1';
  return `linear-gradient(90deg, ${mainColor}, ${mainColor}cc)`;
};

const Badges = React.memo(() => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [badgeValues, setBadgeValues] = useState({
    streak: 0,
    totalPoints: 0,
    totalActivities: 0,
    activeDays: 0,
    dailyTaskCompletions: 0,
  });

  // Memoized helper: get badge thresholds (cached per category)
  const getBadgeThresholds = useCallback((base, inc, current) => {
    const thresholds = [];
    let next = base;
    let upcomingCount = 0;
    const maxUpcoming = 6; // show up to 6 upcoming badges
    while (thresholds.length < 30) {
      thresholds.push(next);
      if (next > current) {
        upcomingCount++;
        if (upcomingCount > maxUpcoming) break;
      }
      next += inc;
    }
    return thresholds;
  }, []);

  // Memoized category data to avoid recomputation
  const categoriesWithData = useMemo(() => {
    return BADGE_CATEGORIES.map(category => {
      const currentValue = badgeValues[category.key];
      const thresholds = getBadgeThresholds(category.base, category.inc, currentValue);
      const earnedCount = thresholds.filter(t => currentValue >= t).length;
      return {
        ...category,
        currentValue,
        thresholds,
        earnedCount,
        totalCount: thresholds.length,
      };
    });
  }, [badgeValues, getBadgeThresholds]);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [progressRes, activeDaysRes, breakdownRes] = await Promise.all([
          api.get('/user/progress'),
          api.get('/user/active-days'),
          api.get('/user/activity-breakdown').catch(() => ({ data: {} })),
        ]);

        const streak = progressRes.data.streak || 0;
        const totalPoints = progressRes.data.totalPoints || 0;
        const totalActivities =
          (progressRes.data.metrics?.gratitudeEntries || 0) +
          (progressRes.data.metrics?.affirmations || 0) +
          (progressRes.data.metrics?.therapyExercises || 0) +
          (progressRes.data.metrics?.lettersToSelf || 0);
        const activeDays = activeDaysRes.data.activeDays || 0;
        const dailyTaskCompletions = Math.floor((breakdownRes.data?.dailyTask || 0) / 3);

        setBadgeValues({
          streak,
          totalPoints,
          totalActivities,
          activeDays,
          dailyTaskCompletions,
        });
      } catch (err) {
        console.error('Error fetching badge data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  if (loading) {
    return (
      <PageLayout title="Achievement Badges" subtitle="Every milestone celebrates your progress.">
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100 animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-48 mb-2" />
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-3 bg-slate-200 rounded w-64 mt-2" />
        </div>
        <div className="max-w-7xl mx-auto space-y-8">
          {[...Array(5)].map((_, i) => <BadgeSkeleton key={i} />)}
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Achievement Badges" subtitle="Every milestone celebrates your progress.">
      {/* Monthly Reset Note */}
      <div className="mb-6 sm:mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-5 border border-blue-100 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="text-2xl">📅</div>
          <div>
            <h3 className="font-bold text-slate-800 text-base sm:text-lg">Monthly Badge Reset</h3>
            <p className="text-sm text-slate-600 mt-1">
              <strong>All badges reset at the beginning of each month.</strong> Your progress starts fresh every month,
              giving you a new opportunity to challenge yourself and earn achievements again.
            </p>
            <p className="text-xs text-slate-500 mt-2">
              ⚡ Tip: Use the{' '}
              <Link to="/export" className="text-indigo-600 font-bold underline hover:text-indigo-800">
                Export Report
              </Link>{' '}
              page to download a PDF/CSV of your current month's performance before it resets!
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
        {categoriesWithData.map((category) => (
          <BadgeCard
            key={category.id}
            icon={category.icon}
            title={category.title}
            earnedCount={category.earnedCount}
            totalCount={category.totalCount}
            thresholds={category.thresholds}
            currentValue={category.currentValue}
            color={category.color}
            getGradientColor={getGradientColor}
          />
        ))}
      </div>
    </PageLayout>
  );
});

Badges.displayName = 'Badges';
export default Badges;