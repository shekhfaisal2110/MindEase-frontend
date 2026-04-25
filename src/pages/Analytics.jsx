import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../services/api';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';

const Analytics = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [last30DaysTotal, setLast30DaysTotal] = useState(0);
  const [allTimeTotal, setAllTimeTotal] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const [historyRes, allTimeRes] = await Promise.all([
        api.get('/activity/history?days=30'),
        api.get('/activity/all-time-total')
      ]);
      setHistory(historyRes.data);
      const total = historyRes.data.reduce((sum, day) => sum + day.totalPoints, 0);
      setLast30DaysTotal(total);
      setAllTimeTotal(allTimeRes.data.allTimeTotal);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load analytics. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    fetchData();
  };

  const lineData = history.map(day => ({
    date: new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    points: day.totalPoints
  }));

  const breakdownTotals = history.reduce((acc, day) => {
    acc.pageView += day.breakdown.pageView;
    acc.hourlyEmotion += day.breakdown.hourlyEmotion;
    acc.emotionalCheckIn += day.breakdown.emotionalCheckIn;
    acc.gratitude += day.breakdown.gratitude;
    acc.affirmation += day.breakdown.affirmation;
    acc.growthHealing += day.breakdown.growthHealing;
    acc.letterToSelf += day.breakdown.letterToSelf;
    acc.dailyTask += day.breakdown.dailyTask;
    acc.reactResponse += day.breakdown.reactResponse;
    acc.ikigaiItem += day.breakdown.ikigaiItem;
    return acc;
  }, {
    pageView: 0, hourlyEmotion: 0, emotionalCheckIn: 0, gratitude: 0,
    affirmation: 0, growthHealing: 0, letterToSelf: 0, dailyTask: 0,
    reactResponse: 0, ikigaiItem: 0
  });

  const pieData = Object.entries(breakdownTotals)
    .map(([name, value]) => ({
      name: name.replace(/([A-Z])/g, ' $1').trim(),
      value
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F', '#FFBB28', '#FF8042', '#a4de6c', '#d0ed57', '#8dd1e1'];

  const radarData = Object.entries(breakdownTotals).map(([name, value]) => ({
    subject: name.replace(/([A-Z])/g, ' $1').trim(),
    value
  }));

  if (loading && !refreshing) return <LoadingSpinner />;

  if (error && !refreshing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={handleRefresh} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">Your Activity Analytics</h1>
            <p className="text-sm text-gray-500">Track your engagement and earn points for self‑care actions.</p>
          </div>
          <button onClick={handleRefresh} disabled={refreshing} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition disabled:opacity-50 flex items-center space-x-2 shadow-sm">
            {refreshing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Refreshing...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                <span>Refresh Data</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 md:p-6 text-white shadow-lg">
            <p className="text-xs md:text-sm uppercase tracking-wider opacity-80">Points Earned (Last 30 Days)</p>
            <p className="text-3xl md:text-5xl font-black mt-2">{last30DaysTotal}</p>
            <p className="text-xs mt-2 opacity-80">Keep going! Every action counts.</p>
          </div>
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-5 md:p-6 text-white shadow-lg">
            <p className="text-xs md:text-sm uppercase tracking-wider opacity-80">All‑Time Total Points</p>
            <p className="text-3xl md:text-5xl font-black mt-2">{allTimeTotal}</p>
            <p className="text-xs mt-2 opacity-80">Your cumulative self‑care impact.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <div className="bg-white rounded-2xl shadow p-4 md:p-6">
            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-4">📈 Daily Points Trend</h2>
            <div className="w-full h-64 md:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 10 }} interval={Math.ceil(lineData.length / 6)} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="points" stroke="#8884d8" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-4 md:p-6">
            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-4">📊 Points per Day</h2>
            <div className="w-full h-64 md:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lineData} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 10 }} interval={Math.ceil(lineData.length / 6)} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="points" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-4 md:p-6">
            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-4">🥧 Points by Activity</h2>
            <div className="w-full h-64 md:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-xs text-gray-500 flex flex-wrap justify-center gap-2">
              {pieData.slice(0, 5).map((item, idx) => (
                <span key={idx} className="flex items-center"><span className="w-3 h-3 rounded-full mr-1" style={{backgroundColor: COLORS[idx % COLORS.length]}}></span> {item.name} ({item.value})</span>
              ))}
              {pieData.length > 5 && <span className="text-gray-400">+{pieData.length - 5} more</span>}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-4 md:p-6">
            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-4">📉 Cumulative Points</h2>
            <div className="w-full h-64 md:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={lineData} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 10 }} interval={Math.ceil(lineData.length / 6)} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="points" stackId="1" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-4 md:p-6 lg:col-span-2">
            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-4">⚡ Activity Radar</h2>
            <div className="w-full h-80 md:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                  <Radar name="Points" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 rounded-2xl p-4 md:p-6 text-center text-sm text-blue-700">
          💡 Tip: Earn more points by completing daily tasks, writing gratitudes, and logging emotions. Every small action adds up!
        </div>
      </div>
    </div>
  );
};

export default Analytics;