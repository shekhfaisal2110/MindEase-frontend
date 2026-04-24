import React, { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../services/api';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F', '#FFBB28', '#FF8042', '#a4de6c'];

const UsageAnalytics = () => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [appTotals, setAppTotals] = useState({});
  const [totalDeviceTime, setTotalDeviceTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, [currentYear, currentMonth]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/usage/monthly/${currentYear}/${currentMonth}`);
      setAppTotals(res.data.appTotals);
      setTotalDeviceTime(res.data.totalDeviceTime);
    } catch (err) {
      console.error(err);
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  const pieData = Object.entries(appTotals).map(([name, minutes]) => ({
    name,
    minutes,
    hours: (minutes / 60).toFixed(1)
  }));

  // Find highest usage app
  const highestApp = pieData.reduce((max, item) => item.minutes > max.minutes ? item : max, { name: 'None', minutes: 0 });

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

  // Responsive outer radius based on screen width
  const getOuterRadius = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return 80;
      if (window.innerWidth < 768) return 100;
    }
    return 110;
  };

  return (
    <div className="w-full px-4 sm:px-0">
      {/* Month Picker – responsive */}
      <div className="flex justify-between items-center mb-6 sm:mb-8">
        <button
          onClick={() => changeMonth(-1)}
          className="p-2 sm:p-3 hover:bg-slate-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-200"
          aria-label="Previous month"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-base sm:text-xl md:text-2xl font-black text-slate-800 text-center px-2">
          {new Date(currentYear, currentMonth - 1).toLocaleString('default', {
            month: 'long',
            year: 'numeric'
          })}
        </h2>
        <button
          onClick={() => changeMonth(1)}
          className="p-2 sm:p-3 hover:bg-slate-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-200"
          aria-label="Next month"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="space-y-8">
          {/* Highest App Card – responsive text */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-4 sm:p-6 text-white shadow-lg text-center sm:text-left">
            <p className="text-xs sm:text-sm uppercase tracking-wider opacity-80">Most Used App</p>
            <p className="text-2xl sm:text-3xl md:text-4xl font-black mt-2 break-words">{highestApp.name}</p>
            <p className="text-lg sm:text-xl mt-1">{formatMinutes(highestApp.minutes)}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Pie Chart – App Breakdown */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span>📊</span> App Usage Breakdown
              </h3>
              {pieData.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <p>No app data for this month.</p>
                  <p className="text-xs mt-1">Start logging your app usage.</p>
                </div>
              ) : (
                <div className="w-full h-[280px] sm:h-[320px] md:h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="minutes"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={getOuterRadius()}
                        label={({ name, minutes }) => {
                          if (window.innerWidth < 640) return '';
                          return `${name}: ${formatMinutes(minutes)}`;
                        }}
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

            {/* Total Device Time Card – flexible */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6 flex flex-col justify-center items-center text-center">
              <div className="text-4xl sm:text-5xl mb-3">📱</div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-2">Total Device Screen Time</h3>
              <p className="text-2xl sm:text-3xl font-black text-indigo-600">{formatMinutes(totalDeviceTime)}</p>
              <p className="text-xs text-slate-400 mt-2">
                Average per day: ~{totalDeviceTime ? formatMinutes(Math.round(totalDeviceTime / 30)) : '0 min'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsageAnalytics;