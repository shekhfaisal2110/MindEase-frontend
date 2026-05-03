import React, { useState, useEffect } from 'react';
import api from '../services/api';

const InsightsCard = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await api.get('/insights');
      setInsights(res.data.insights);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const refreshInsights = async () => {
    setRefreshing(true);
    try {
      const res = await api.post('/insights/regenerate');
      setInsights(res.data.insights);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const getIcon = (type) => {
    if (type === 'positive') return '🎉';
    if (type === 'warning') return '⚠️';
    return '💡';
  };

  const getBgClass = (type) => {
    if (type === 'positive') return 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200';
    if (type === 'warning') return 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200';
    return 'bg-gradient-to-br from-blue-50 to-indigo-50 border-indigo-200';
  };

  if (loading) return null; // or a skeleton loader

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="text-2xl">🧠</span> Your Insights
        </h2>
        <button
          onClick={refreshInsights}
          disabled={refreshing}
          className="text-indigo-500 hover:text-indigo-700 text-sm font-medium flex items-center gap-1"
        >
          <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-2xl border ${getBgClass(insight.type)} transition-all hover:shadow-md`}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">{getIcon(insight.type)}</div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800">{insight.title}</h3>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">{insight.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-400 mt-4 text-center">
        Insights are based on your last 30 days of activity and update daily.
      </p>
    </div>
  );
};

export default InsightsCard;