import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../services/api';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F', '#FFBB28', '#FF8042', '#a4de6c'];

// Skeleton loader – shows instantly while data loads
const ChartSkeleton = ({ height = 280 }) => (
  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6 animate-pulse">
    <div className="h-6 bg-slate-200 rounded w-32 mb-6" />
    <div className="flex justify-center items-center" style={{ height }}>
      <div className="w-full h-full bg-slate-100 rounded-xl" />
    </div>
  </div>
);

const formatMinutes = (min) => {
  const hrs = Math.floor(min / 60);
  const mins = min % 60;
  if (hrs === 0) return `${mins} min`;
  if (mins === 0) return `${hrs} hr`;
  return `${hrs}h ${mins}m`;
};

const TimeAnalytics = React.memo(() => {
  const [monthlyData, setMonthlyData] = useState({});
  const [allEntries, setAllEntries] = useState([]);
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [summaryRes, entriesRes] = await Promise.all([
        api.get(`/time/entries/monthly/${currentYear}/${currentMonth}`),
        api.get('/time/entries/all')
      ]);
      setMonthlyData(summaryRes.data);
      setAllEntries(entriesRes.data.entries || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentYear, currentMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const pieData = useMemo(() => 
    Object.entries(monthlyData).map(([name, minutes]) => ({
      name,
      minutes,
      hours: (minutes / 60).toFixed(1)
    })),
    [monthlyData]
  );

  const trendData = useMemo(() => {
    const dailyTrend = {};
    (allEntries || []).forEach(entry => {
      const date = new Date(entry.date).toISOString().split('T')[0];
      dailyTrend[date] = (dailyTrend[date] || 0) + entry.duration;
    });
    return Object.entries(dailyTrend)
      .slice(-30)
      .map(([date, minutes]) => ({
        date,
        hours: (minutes / 60).toFixed(1)
      }));
  }, [allEntries]);

  const changeMonth = useCallback((delta) => {
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
  }, [currentMonth, currentYear]);

  const goToCurrentMonth = useCallback(() => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth() + 1);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6 w-full px-4 sm:px-0">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-xl text-center mx-4 sm:mx-0">
        ⚠️ {error}
        <button
          onClick={() => window.location.reload()}
          className="ml-3 underline hover:no-underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-0">
      {/* Month Picker */}
      <div className="flex justify-between items-center mb-6 sm:mb-8 flex-wrap gap-3">
        <button
          onClick={() => changeMonth(-1)}
          className="p-2 sm:p-3 hover:bg-slate-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-200 active:scale-95 touch-manipulation"
          aria-label="Previous month"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center">
          <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-800">
            {new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' })}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">{currentYear}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={goToCurrentMonth}
            className="px-3 py-1.5 text-xs sm:text-sm font-medium bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 active:scale-95 transition-all touch-manipulation"
          >
            Today
          </button>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 sm:p-3 hover:bg-slate-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-200 active:scale-95 touch-manipulation"
            aria-label="Next month"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
        {/* Pie Chart */}
        {pieData.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6 text-center py-10">
            <p className="text-slate-400">No data for this month.</p>
            <p className="text-xs mt-1">Start logging your time to see insights.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span>📊</span> Monthly Breakdown
            </h3>
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
                    label={({ name, percent }) => window.innerWidth < 640 ? '' : `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatMinutes(value)} contentStyle={{ fontSize: 12 }} />
                  <Legend
                    wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                    layout={window.innerWidth < 640 ? 'horizontal' : 'vertical'}
                    align={window.innerWidth < 640 ? 'center' : 'right'}
                    verticalAlign={window.innerWidth < 640 ? 'bottom' : 'middle'}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Bar Chart */}
        {trendData.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6 text-center py-10">
            <p className="text-slate-400">No entries yet.</p>
            <p className="text-xs mt-1">Log your daily time to see progress.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span>📈</span> Daily Trend (Last 30 days)
            </h3>
            <div className="w-full h-[280px] sm:h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} margin={{ left: 5, right: 5, top: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#64748b' } }}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip formatter={(value) => [`${value} hrs`, 'Time']} contentStyle={{ fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="hours" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

TimeAnalytics.displayName = 'TimeAnalytics';
export default TimeAnalytics;