import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// Skeleton loader for instant perceived loading
const InsightsSkeleton = () => (
  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6 mb-6">
    <div className="flex justify-between items-center mb-4">
      <div className="h-7 bg-slate-200 rounded w-32 animate-pulse"></div>
      <div className="h-4 bg-slate-200 rounded w-16 animate-pulse"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="p-4 rounded-2xl bg-slate-100 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const InsightsCard = React.memo(() => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/insights');
      setInsights(res.data.insights);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshInsights = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await api.post('/insights/regenerate');
      setInsights(res.data.insights);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const getIcon = useCallback((type) => {
    if (type === 'positive') return '🎉';
    if (type === 'warning') return '⚠️';
    return '💡';
  }, []);

  const getBgClass = useCallback((type) => {
    if (type === 'positive') return 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200';
    if (type === 'warning') return 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200';
    return 'bg-gradient-to-br from-blue-50 to-indigo-50 border-indigo-200';
  }, []);

  if (loading) {
    return <InsightsSkeleton />;
  }

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="text-xl sm:text-2xl">🧠</span> Your Insights
        </h2>
        <button
          onClick={refreshInsights}
          disabled={refreshing}
          className="text-indigo-500 hover:text-indigo-700 text-xs sm:text-sm font-medium flex items-center gap-1 self-start sm:self-auto px-3 py-1.5 rounded-full hover:bg-indigo-50 transition touch-manipulation"
        >
          <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm">
          No insights yet. Keep using MindEase to generate personalized insights.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border ${getBgClass(insight.type)} transition-all hover:shadow-md animate-in fade-in duration-300`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="text-xl sm:text-2xl flex-shrink-0">{getIcon(insight.type)}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base truncate">{insight.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed line-clamp-3">{insight.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-[10px] sm:text-xs text-slate-400 mt-4 text-center">
        Insights are based on your last 30 days of activity and update daily.
      </p>
    </div>
  );
});

InsightsCard.displayName = 'InsightsCard';

export default InsightsCard;