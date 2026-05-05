// import React, { useState, useEffect, useCallback } from 'react';
// import { useAuth } from '../context/AuthContext';
// import api from '../services/api';
// import PageLayout from '../components/PageLayout';
// import LoadingSpinner from '../components/LoadingSpinner';

// const Leaderboard = () => {
//   const { user } = useAuth();
//   const [leaderboard, setLeaderboard] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [showRank, setShowRank] = useState(false);

//   const fetchLeaderboard = useCallback(async () => {
//     try {
//       const res = await api.get('/user/leaderboard');
//       setLeaderboard(res.data);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchLeaderboard();
//     // Auto-refresh every 30 seconds
//     const interval = setInterval(fetchLeaderboard, 30000);
//     return () => clearInterval(interval);
//   }, [fetchLeaderboard]);

//   const handleRefresh = () => {
//     setRefreshing(true);
//     fetchLeaderboard();
//   };

//   const toggleShowRank = () => setShowRank(prev => !prev);

//   const currentUserRank = leaderboard.find(entry => entry.userId === user?.id)?.rank || null;

//   const getRankEmoji = (rank) => {
//     if (rank === 1) return '🥇';
//     if (rank === 2) return '🥈';
//     if (rank === 3) return '🥉';
//     return null;
//   };

//   if (loading) return <LoadingSpinner />;

//   return (
//     <PageLayout title="Leaderboard" subtitle="See how you rank among MindEase users.">
//       <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        
//         {/* Stats Summary Card with Refresh */}
//         <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-xl p-6 text-white">
//           <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
//             <div className="text-center sm:text-left">
//               <p className="text-indigo-100 text-sm uppercase tracking-wide">Your Global Rank</p>
//               {showRank ? (
//                 <p className="text-4xl sm:text-5xl font-black">
//                   #{currentUserRank || '?'}
//                 </p>
//               ) : (
//                 <p className="text-2xl sm:text-3xl font-semibold opacity-80">––––</p>
//               )}
//               <p className="text-indigo-100 text-sm mt-1">
//                 {!showRank && "Click 'Show My Rank' to reveal"}
//               </p>
//             </div>
//             <div className="flex gap-3">
//               <button
//                 onClick={handleRefresh}
//                 disabled={refreshing}
//                 className="px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-bold rounded-xl transition-all"
//               >
//                 {refreshing ? '⟳ ...' : '⟳ Refresh'}
//               </button>
//               <button
//                 onClick={toggleShowRank}
//                 className="px-6 py-2.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-bold rounded-xl transition-all"
//               >
//                 {showRank ? '🔒 Hide My Rank' : '👁️ Show My Rank'}
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Leaderboard Table (unchanged) */}
//         <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
//           <div className="px-6 py-5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
//             <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
//               <span className="text-2xl">🏆</span> 
//               Global Rankings
//               <span className="ml-2 text-sm font-normal text-slate-500">
//                 ({leaderboard.length} participants)
//               </span>
//             </h2>
//           </div>
          
//           <div className="overflow-x-auto">
//             <table className="w-full min-w-[500px]">
//               <thead className="bg-slate-50 border-b-2 border-slate-200">
//                 <tr>
//                   <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Rank</th>
//                   <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
//                   <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Total Points</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-100">
//                 {leaderboard.map((entry) => {
//                   const isCurrentUser = entry.userId === user?.id;
//                   const rankEmoji = getRankEmoji(entry.rank);
//                   return (
//                     <tr key={entry.userId} className={isCurrentUser ? 'bg-indigo-50/50 hover:bg-indigo-100/50' : 'hover:bg-slate-50'}>
//                       <td className="px-6 py-4">
//                         <div className="flex items-center gap-2">
//                           {rankEmoji && <span className="text-xl">{rankEmoji}</span>}
//                           <span className={`font-bold ${entry.rank <= 3 ? 'text-indigo-600' : 'text-slate-700'}`}>#{entry.rank}</span>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="flex items-center gap-2 flex-wrap">
//                           <span className="font-semibold text-slate-800">{entry.username}</span>
//                           {isCurrentUser && <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">You</span>}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 text-right">
//                         <span className="text-lg font-bold text-indigo-600">{entry.totalPoints.toLocaleString()}</span>
//                         <span className="text-xs text-slate-400 ml-1">pts</span>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>

//           {leaderboard.length === 0 && (
//             <div className="text-center py-16 px-4">
//               <div className="text-6xl mb-4">🏆</div>
//               <h3 className="text-xl font-semibold text-slate-700 mb-2">No visible participants yet</h3>
//               <p className="text-slate-500 max-w-md mx-auto">
//                 Start using MindEase to earn points, then go to your Profile and set 
//                 <span className="font-medium text-indigo-600"> "Visible on leaderboard"</span> 
//                 to appear here.
//               </p>
//             </div>
//           )}
//         </div>

//         {/* Info Card */}
//         <div className="bg-slate-50 rounded-2xl p-5 text-center">
//           <p className="text-slate-600 text-sm">
//             💡 Only users who choose to be visible appear on the leaderboard. 
//             You can change this anytime in your profile settings.
//           </p>
//         </div>
//       </div>
//     </PageLayout>
//   );
// };

// export default Leaderboard;





// src/pages/Leaderboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PageLayout from '../components/PageLayout';

// Skeleton component for loading state
const LeaderboardSkeleton = () => (
  <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8 animate-pulse">
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-xl p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-center sm:text-left">
          <div className="h-4 bg-slate-200 rounded w-32" />
          <div className="h-10 bg-slate-200 rounded w-24 mt-2" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-24 bg-white/20 rounded-xl" />
          <div className="h-10 w-32 bg-white/20 rounded-xl" />
        </div>
      </div>
    </div>
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="px-6 py-5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
        <div className="h-6 bg-slate-200 rounded w-48" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px]">
          <thead className="bg-slate-50 border-b-2 border-slate-200">
            <tr>
              <th className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-12" /></th>
              <th className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20" /></th>
              <th className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-16 ml-auto" /></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[...Array(5)].map((_, i) => (
              <tr key={i}>
                <td className="px-6 py-4"><div className="h-5 bg-slate-200 rounded w-16" /></td>
                <td className="px-6 py-4"><div className="h-5 bg-slate-200 rounded w-32" /></td>
                <td className="px-6 py-4"><div className="h-5 bg-slate-200 rounded w-20 ml-auto" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const Leaderboard = React.memo(() => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showRank, setShowRank] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await api.get('/user/leaderboard');
      setLeaderboard(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const toggleShowRank = useCallback(() => setShowRank(prev => !prev), []);

  const currentUserRank = leaderboard.find(entry => entry.userId === user?.id)?.rank || null;

  const getRankEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  if (loading) return <LeaderboardSkeleton />;

  return (
    <PageLayout title="Leaderboard" subtitle="See how you rank among MindEase users.">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">
        {/* Stats Summary Card */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-6 text-white">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <p className="text-indigo-100 text-xs sm:text-sm uppercase tracking-wide">Your Global Rank</p>
              {showRank ? (
                <p className="text-3xl sm:text-5xl font-black">#{currentUserRank || '?'}</p>
              ) : (
                <p className="text-xl sm:text-3xl font-semibold opacity-80">––––</p>
              )}
              <p className="text-indigo-100 text-xs sm:text-sm mt-1">
                {!showRank && "Click 'Show My Rank' to reveal"}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-3 sm:px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-bold rounded-xl transition-all active:scale-95 touch-manipulation text-sm sm:text-base"
              >
                {refreshing ? '⟳ ...' : '⟳ Refresh'}
              </button>
              <button
                onClick={toggleShowRank}
                className="px-4 sm:px-6 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-bold rounded-xl transition-all active:scale-95 touch-manipulation text-sm sm:text-base"
              >
                {showRank ? '🔒 Hide My Rank' : '👁️ Show My Rank'}
              </button>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 sm:py-5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
              <span className="text-xl sm:text-2xl">🏆</span>
              Global Rankings
              <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-normal text-slate-500">
                ({leaderboard.length} participants)
              </span>
            </h2>
          </div>

          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full min-w-[500px] sm:min-w-full">
              <thead className="bg-slate-50 border-b-2 border-slate-200">
                <tr>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Rank</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-right text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Total Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaderboard.map((entry) => {
                  const isCurrentUser = entry.userId === user?.id;
                  const rankEmoji = getRankEmoji(entry.rank);
                  return (
                    <tr key={entry.userId} className={isCurrentUser ? 'bg-indigo-50/50 hover:bg-indigo-100/50' : 'hover:bg-slate-50'}>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                          {rankEmoji && <span className="text-base sm:text-xl">{rankEmoji}</span>}
                          <span className={`font-bold text-sm sm:text-base ${entry.rank <= 3 ? 'text-indigo-600' : 'text-slate-700'}`}>#{entry.rank}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-800 text-sm sm:text-base break-words">{entry.username}</span>
                          {isCurrentUser && <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-indigo-100 text-indigo-800">You</span>}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                        <span className="text-base sm:text-lg font-bold text-indigo-600">{entry.totalPoints.toLocaleString()}</span>
                        <span className="text-[10px] sm:text-xs text-slate-400 ml-0.5">pts</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {leaderboard.length === 0 && (
            <div className="text-center py-12 sm:py-16 px-4">
              <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🏆</div>
              <h3 className="text-lg sm:text-xl font-semibold text-slate-700 mb-2">No visible participants yet</h3>
              <p className="text-slate-500 text-sm sm:text-base max-w-md mx-auto">
                Start using MindEase to earn points, then go to your Profile and set
                <span className="font-medium text-indigo-600"> "Visible on leaderboard"</span>
                to appear here.
              </p>
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-center">
          <p className="text-slate-600 text-xs sm:text-sm">
            💡 Only users who choose to be visible appear on the leaderboard.
            You can change this anytime in your profile settings.
          </p>
        </div>
      </div>
    </PageLayout>
  );
});

Leaderboard.displayName = 'Leaderboard';
export default Leaderboard;