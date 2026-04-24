import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../services/api';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F', '#FFBB28', '#FF8042', '#a4de6c'];

const TimeAnalytics = () => {
  const [monthlyData, setMonthlyData] = useState({});
  const [allEntries, setAllEntries] = useState([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [currentYear, currentMonth]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [summaryRes, entriesRes] = await Promise.all([
        api.get(`/time/entries/monthly/${currentYear}/${currentMonth}`),
        api.get('/time/entries/all')
      ]);
      setMonthlyData(summaryRes.data);
      setAllEntries(entriesRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pieData = Object.entries(monthlyData).map(([name, minutes]) => ({
    name,
    minutes,
    hours: (minutes / 60).toFixed(1)
  }));

  // Daily trend for last 30 days
  const dailyTrend = {};
  allEntries.forEach(entry => {
    const date = new Date(entry.date).toISOString().split('T')[0];
    dailyTrend[date] = (dailyTrend[date] || 0) + entry.duration;
  });
  const trendData = Object.entries(dailyTrend)
    .slice(-30)
    .map(([date, minutes]) => ({
      date,
      hours: (minutes / 60).toFixed(1)
    }));

  const formatMinutes = (min) => {
    const hrs = Math.floor(min / 60);
    const mins = min % 60;
    if (hrs === 0) return `${mins} min`;
    if (mins === 0) return `${hrs} hr`;
    return `${hrs} hr ${mins} min`;
  };

  const changeMonth = (delta) => {
    let newMonth = currentMonth + delta;
    let newYear = currentYear;
    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    } else if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  return (
    <div className="w-full px-4 sm:px-0">
      {/* Month Picker – responsive */}
      <div className="flex justify-between items-center mb-6 sm:mb-8">
        <button
          onClick={() => changeMonth(-1)}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-200"
          aria-label="Previous month"
        >
          <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-800 text-center">
          {new Date(currentYear, currentMonth - 1).toLocaleString('default', {
            month: 'long',
            year: 'numeric'
          })}
        </h2>
        <button
          onClick={() => changeMonth(1)}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-200"
          aria-label="Next month"
        >
          <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-3"></div>
          <p className="text-slate-500 text-sm">Loading analytics...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-xl text-center">
          ⚠️ {error}
        </div>
      ) : (
        <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Pie Chart – Monthly Breakdown */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span>📊</span> Monthly Breakdown
            </h3>
            {pieData.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <p>No data for this month.</p>
                <p className="text-xs mt-1">Start logging your time to see insights.</p>
              </div>
            ) : (
              <div className="w-full h-[280px] sm:h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="minutes"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={window.innerWidth < 640 ? 80 : 100}
                      label={({ name, minutes }) => window.innerWidth < 640 ? '' : `${name}: ${formatMinutes(minutes)}`}
                    >
                      {pieData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatMinutes(value)}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    {window.innerWidth >= 640 && <Legend />}
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Bar Chart – Daily Trend (Last 30 days) */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span>📈</span> Daily Trend (Last 30 days)
            </h3>
            {trendData.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <p>No entries yet.</p>
                <p className="text-xs mt-1">Log your daily time to see progress.</p>
              </div>
            ) : (
              <div className="w-full h-[280px] sm:h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData} margin={{ left: 0, right: 0, top: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="date"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      tick={{ fontSize: window.innerWidth < 640 ? 9 : 11 }}
                      interval={window.innerWidth < 640 ? 1 : 0}
                    />
                    <YAxis
                      label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { fontSize: '12px', fill: '#64748b' } }}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip
                      formatter={(value) => `${value} hrs`}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="hours" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeAnalytics;