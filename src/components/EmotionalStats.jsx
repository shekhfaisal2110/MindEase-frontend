import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import api from '../services/api';

const EmotionalStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/emotional/stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  const recentEmotionData = Object.entries(stats.recent.emotionCounts).map(([name, count]) => ({ name, count }));
  const allTimeEmotionData = Object.entries(stats.allTime.emotionCounts).map(([name, count]) => ({ name, count }));

  const dailyTrendData = Object.entries(stats.dailyTrend).map(([date, data]) => ({
    date,
    avgIntensity: parseFloat(data.avgIntensity),
    count: data.count
  })).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-30);

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last 30 Days</p>
          <p className="text-3xl font-black text-indigo-600 mt-2">{stats.recent.total}</p>
          <p className="text-sm text-slate-500 mt-1">check-ins</p>
        </div>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">All Time</p>
          <p className="text-3xl font-black text-indigo-600 mt-2">{stats.allTime.total}</p>
          <p className="text-sm text-slate-500 mt-1">check-ins</p>
        </div>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Intensity</p>
          <p className="text-3xl font-black text-indigo-600 mt-2">{stats.recent.avgIntensity}</p>
          <p className="text-sm text-slate-500 mt-1">/10 (last 30 days)</p>
        </div>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Most Frequent</p>
          <p className="text-2xl font-black text-indigo-600 mt-2 capitalize">{stats.recent.mostFrequent || '—'}</p>
          <p className="text-sm text-slate-500 mt-1">in last 30 days</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Emotion Frequency */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">📊 Emotions (Last 30 days)</h3>
          {recentEmotionData.length === 0 ? (
            <p className="text-slate-400 text-center py-10">No data in the last 30 days.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={recentEmotionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* All-Time Emotion Frequency */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">📊 Emotions (All time)</h3>
          {allTimeEmotionData.length === 0 ? (
            <p className="text-slate-400 text-center py-10">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={allTimeEmotionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Daily Trend Line Chart */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">📈 Average Intensity Trend (Last 30 days)</h3>
        {dailyTrendData.length === 0 ? (
          <p className="text-slate-400 text-center py-10">No data.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={70} />
              <YAxis domain={[1, 10]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="avgIntensity" stroke="#8884d8" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default EmotionalStats;