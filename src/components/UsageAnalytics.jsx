// src/components/UsageAnalytics.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../services/api';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F', '#FFBB28', '#FF8042', '#a4de6c'];

// Helper: format minutes
const formatMinutes = (min) => {
  if (!min) return '0 min';
  const hrs = Math.floor(min / 60);
  const mins = min % 60;
  if (hrs === 0) return `${mins} min`;
  if (mins === 0) return `${hrs} hr`;
  return `${hrs} hr ${mins} min`;
};

// Skeleton component (shown while data loads)
const AnalyticsSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="flex justify-center"><div className="inline-flex p-1 bg-slate-100 rounded-2xl gap-1"><div className="w-24 h-10 bg-slate-200 rounded-xl" /><div className="w-24 h-10 bg-slate-200 rounded-xl" /><div className="w-24 h-10 bg-slate-200 rounded-xl" /></div></div>
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-6 h-36" />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-3xl p-6 h-[320px] animate-pulse bg-slate-100" />
      <div className="bg-white rounded-3xl p-6 h-[320px] animate-pulse bg-slate-100" />
    </div>
    <div className="bg-white rounded-3xl p-6 h-64 animate-pulse bg-slate-100" />
  </div>
);

const UsageAnalytics = React.memo(() => {
  const [activePeriod, setActivePeriod] = useState('month');
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth() + 1);
  const [appTotals, setAppTotals] = useState({});
  const [totalDeviceTime, setTotalDeviceTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const formatMinutesMemo = useCallback(formatMinutes, []);

  // Data fetching functions
  const fetchMonthly = useCallback(async () => {
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
  }, [currentYear, currentMonth]);

  const fetchLast30Days = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/usage/last30days');
      setAppTotals(res.data.appTotals);
      setTotalDeviceTime(0);
    } catch (err) {
      setError('Failed to load last 30 days data.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLifetime = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/usage/lifetime');
      setAppTotals(res.data.appTotals);
      setTotalDeviceTime(0);
    } catch (err) {
      setError('Failed to load lifetime data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activePeriod === 'month') fetchMonthly();
    else if (activePeriod === '30days') fetchLast30Days();
    else fetchLifetime();
  }, [activePeriod, currentYear, currentMonth, fetchMonthly, fetchLast30Days, fetchLifetime]);

  const pieData = useMemo(() => 
    Object.entries(appTotals)
      .map(([name, minutes]) => ({ name, minutes, hours: (minutes / 60).toFixed(1) }))
      .sort((a, b) => b.minutes - a.minutes),
    [appTotals]
  );

  const highestApp = useMemo(() => pieData.length > 0 ? pieData[0] : { name: 'None', minutes: 0 }, [pieData]);
  const totalMinutes = useMemo(() => pieData.reduce((sum, item) => sum + item.minutes, 0), [pieData]);
  const totalFormatted = useMemo(() => formatMinutes(totalMinutes), [totalMinutes]);

  const changeMonth = useCallback((delta) => {
    let newMonth = currentMonth + delta;
    let newYear = currentYear;
    if (newMonth < 1) { newMonth = 12; newYear--; }
    else if (newMonth > 12) { newMonth = 1; newYear++; }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  }, [currentMonth, currentYear]);

  const goToCurrentMonth = useCallback(() => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth() + 1);
  }, []);

  if (loading) return <AnalyticsSkeleton />;
  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-xl text-center mx-4 sm:mx-0">
        ⚠️ {error}
        <button onClick={() => window.location.reload()} className="ml-3 underline hover:no-underline">Retry</button>
      </div>
    );
  }
  if (pieData.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 bg-white rounded-3xl p-8 mx-4 sm:mx-0">
        <div className="text-5xl mb-3">📱</div>
        <p className="font-medium">No app usage data for this period.</p>
        <p className="text-sm mt-1">Start logging your app usage in the "App Usage" tab.</p>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-0">
      {/* Period Tabs */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex p-1 bg-slate-100 rounded-2xl gap-1">
          {[
            { id: 'month', label: '📅 Month' },
            { id: '30days', label: '📊 Last 30 Days' },
            { id: 'lifetime', label: '🌍 Lifetime' }
          ].map(period => (
            <button
              key={period.id}
              onClick={() => setActivePeriod(period.id)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all touch-manipulation ${
                activePeriod === period.id
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Month Picker (only for Month tab) */}
      {activePeriod === 'month' && (
        <div className="flex justify-between items-center mb-6 sm:mb-8 flex-wrap gap-2">
          <button onClick={() => changeMonth(-1)} className="p-2 sm:p-3 hover:bg-slate-100 rounded-full transition-colors active:scale-95 touch-manipulation" aria-label="Previous month">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="text-center">
            <h2 className="text-base sm:text-xl md:text-2xl font-black text-slate-800">
              {new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' })}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">{currentYear}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={goToCurrentMonth} className="px-3 py-1.5 text-xs sm:text-sm font-medium bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 active:scale-95 touch-manipulation">Today</button>
            <button onClick={() => changeMonth(1)} className="p-2 sm:p-3 hover:bg-slate-100 rounded-full transition-colors active:scale-95 touch-manipulation" aria-label="Next month">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6 md:space-y-8">
        {/* Top App Card */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-lg text-center sm:text-left">
          <p className="text-xs sm:text-sm uppercase tracking-wider opacity-80">Most Used App</p>
          <p className="text-xl sm:text-3xl md:text-4xl font-black mt-2 break-words">{highestApp.name}</p>
          <p className="text-base sm:text-xl mt-1">{formatMinutes(highestApp.minutes)}</p>
          <p className="text-xs opacity-80 mt-2">{pieData.length} app{pieData.length !== 1 ? 's' : ''} total</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Pie Chart */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><span>📊</span> App Usage Breakdown</h3>
            <div className="w-full h-[280px] sm:h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="minutes"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius="70%"
                    labelLine={false}
                    label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                  >
                    {pieData.map((entry, idx) => <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value) => formatMinutes(value)} contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} layout="horizontal" verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Total Time Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6 flex flex-col justify-center items-center text-center">
            <div className="text-4xl sm:text-5xl mb-3">📱</div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-2">Total App Screen Time</h3>
            <p className="text-2xl sm:text-3xl font-black text-indigo-600">{totalFormatted}</p>
            {activePeriod === 'month' && totalDeviceTime > 0 && (
              <p className="text-xs text-slate-400 mt-2">Device total: {formatMinutes(totalDeviceTime)}</p>
            )}
          </div>
        </div>

        {/* Top Apps List */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><span>🏆</span> Top Apps by Usage</h3>
          <div className="space-y-3">
            {pieData.slice(0, 5).map((app, idx) => (
              <div key={app.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-base sm:text-lg font-bold text-indigo-600 w-6">#{idx + 1}</span>
                  <span className="font-medium text-slate-800 text-sm sm:text-base break-words">{app.name}</span>
                </div>
                <div className="text-xs sm:text-sm text-slate-500 font-bold">{formatMinutes(app.minutes)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

UsageAnalytics.displayName = 'UsageAnalytics';
export default UsageAnalytics;