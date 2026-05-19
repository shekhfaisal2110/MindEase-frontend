import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import api from '../services/api';
import PageLayout from '../components/PageLayout';

// Lazy load Recharts to reduce initial bundle (~80KB saved)
const ResponsiveContainer = lazy(() => import('recharts').then(mod => ({ default: mod.ResponsiveContainer })));
const LineChart = lazy(() => import('recharts').then(mod => ({ default: mod.LineChart })));
const Line = lazy(() => import('recharts').then(mod => ({ default: mod.Line })));
const XAxis = lazy(() => import('recharts').then(mod => ({ default: mod.XAxis })));
const YAxis = lazy(() => import('recharts').then(mod => ({ default: mod.YAxis })));
const CartesianGrid = lazy(() => import('recharts').then(mod => ({ default: mod.CartesianGrid })));
const Tooltip = lazy(() => import('recharts').then(mod => ({ default: mod.Tooltip })));
const Legend = lazy(() => import('recharts').then(mod => ({ default: mod.Legend })));

// --- Skeleton components for instant perceived loading ---
const FormSkeleton = () => (
  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 animate-pulse">
    <div className="h-6 bg-slate-200 rounded w-32 mb-6" />
    <div className="space-y-5">
      <div><div className="h-4 bg-slate-200 rounded w-24 mb-1" /><div className="h-10 bg-slate-100 rounded-xl" /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><div className="h-4 bg-slate-200 rounded w-16 mb-1" /><div className="h-10 bg-slate-100 rounded-xl" /></div>
        <div><div className="h-4 bg-slate-200 rounded w-16 mb-1" /><div className="h-10 bg-slate-100 rounded-xl" /></div>
      </div>
      <div><div className="h-4 bg-slate-200 rounded w-20 mb-1" /><div className="h-10 bg-slate-100 rounded-xl" /></div>
      <div><div className="h-4 bg-slate-200 rounded w-24 mb-1" /><div className="h-16 bg-slate-100 rounded-xl" /></div>
      <div className="h-12 bg-slate-200 rounded-xl" />
    </div>
  </div>
);

const LogsSkeleton = () => (
  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 animate-pulse">
    <div className="h-6 bg-slate-200 rounded w-40 mb-4" />
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
          <div className="space-y-2 flex-1"><div className="h-5 bg-slate-200 rounded w-24" /><div className="h-3 bg-slate-200 rounded w-32" /><div className="h-3 bg-slate-200 rounded w-16" /></div>
          <div className="w-12 h-8 bg-slate-200 rounded" />
        </div>
      ))}
    </div>
  </div>
);

const ChartSkeleton = () => (
  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 animate-pulse">
    <div className="h-6 bg-slate-200 rounded w-64 mb-4" />
    <div className="h-80 bg-slate-100 rounded" />
  </div>
);

const SleepLog = React.memo(() => {
  const [logs, setLogs] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [chartsReady, setChartsReady] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    bedtime: '22:00',
    wakeTime: '06:00',
    quality: 3,
    notes: ''
  });

  const fetchLogs = useCallback(async () => {
    try {
      const res = await api.get('/sleep');
      const logsData = Array.isArray(res.data) ? res.data : (res.data.logs || []);
      setLogs(logsData);
    } catch (err) { console.error(err); }
  }, []);

  const fetchTrends = useCallback(async () => {
    try {
      const res = await api.get('/sleep/trends?days=30');
      setTrendData(res.data);
    } catch (err) { console.error(err); }
    finally {
      setLoading(false);
      // allow charts to render after data loads
      setTimeout(() => setChartsReady(true), 50);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchLogs(), fetchTrends()]);
  }, [fetchLogs, fetchTrends]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!form.date || !form.bedtime || !form.wakeTime) return;
    setSubmitting(true);
    try {
      await api.post('/sleep', form);
      await api.post('/activity/add', { actionType: 'sleepLog', points: 2 });
      await Promise.all([fetchLogs(), fetchTrends()]);
      setForm({
        date: new Date().toISOString().split('T')[0],
        bedtime: '22:00',
        wakeTime: '06:00',
        quality: 3,
        notes: ''
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  }, [form, fetchLogs, fetchTrends]);

  const deleteLog = useCallback(async (id) => {
    if (!window.confirm('Delete this sleep log?')) return;
    try {
      await api.delete(`/sleep/${id}`);
      await Promise.all([fetchLogs(), fetchTrends()]);
    } catch (err) { console.error(err); }
  }, [fetchLogs, fetchTrends]);

  const formatTime = useCallback((timeStr) => timeStr.slice(0, 5), []);

  if (loading) {
    return (
      <PageLayout title="Sleep Tracker" subtitle="Log your sleep and see how it affects your mood.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <FormSkeleton />
          <LogsSkeleton />
        </div>
        <div className="mt-10"><ChartSkeleton /></div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Sleep Tracker" subtitle="Log your sleep and see how it affects your mood.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Form Section – responsive */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 p-5 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-5 sm:mb-6">📝 Log Sleep</h2>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Date (night of)</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm({...form, date: e.target.value})}
                max={new Date().toISOString().split('T')[0]}
                className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none touch-manipulation"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Bedtime</label>
                <input
                  type="time"
                  value={form.bedtime}
                  onChange={e => setForm({...form, bedtime: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none touch-manipulation"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Wake time</label>
                <input
                  type="time"
                  value={form.wakeTime}
                  onChange={e => setForm({...form, wakeTime: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none touch-manipulation"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Quality (1-5)</label>
              <div className="flex items-center gap-3 mt-1">
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={form.quality}
                  onChange={e => setForm({...form, quality: parseInt(e.target.value)})}
                  className="flex-1 h-2 rounded-lg touch-manipulation"
                />
                <span className="text-base sm:text-lg font-bold text-indigo-600 w-8 text-center">{form.quality}</span>
              </div>
              <div className="flex justify-between text-[10px] sm:text-xs text-slate-400 mt-1">
                <span>Poor</span><span>Fair</span><span>Good</span><span>Very good</span><span>Excellent</span>
              </div>
            </div>
            <div>
              <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Notes (optional)</label>
              <textarea
                value={form.notes}
                onChange={e => setForm({...form, notes: e.target.value})}
                rows="2"
                className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none resize-none touch-manipulation"
                placeholder="Any dreams or disturbances?"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition active:scale-95 disabled:opacity-50 touch-manipulation"
            >
              {submitting ? 'Saving...' : 'Save Sleep Log (+2 points)'}
            </button>
          </form>
        </div>

        {/* Recent Logs – responsive */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 p-5 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4">📜 Recent Sleep Logs</h2>
          {logs.length === 0 ? (
            <p className="text-slate-400 text-center py-8 text-sm">No sleep logs yet. Add your first above.</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {logs.slice(0, 10).map(log => {
                const durationHours = log.duration ? log.duration.toFixed(1) : '?';
                return (
                  <div key={log._id} className="flex justify-between items-start p-3 bg-slate-50 rounded-xl gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm sm:text-base">{new Date(log.date).toLocaleDateString()}</p>
                      <p className="text-xs text-slate-500">{formatTime(log.bedtime)} → {formatTime(log.wakeTime)} ({durationHours} hrs)</p>
                      <p className="text-xs text-slate-500">Quality: {log.quality}/5</p>
                      {log.notes && <p className="text-xs text-slate-400 italic mt-1 break-words">{log.notes}</p>}
                    </div>
                    <button onClick={() => deleteLog(log._id)} className="text-rose-500 hover:text-rose-700 text-sm font-medium shrink-0 touch-manipulation">Delete</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Trend Chart – lazy loaded */}
      <div className="mt-8 sm:mt-10 bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 p-5 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4">📊 Sleep Duration vs Next‑Day Mood</h2>
        {trendData.length === 0 ? (
          <p className="text-slate-400 text-center py-10 text-sm">Not enough data to show trends. Add more sleep logs and mood check‑ins.</p>
        ) : (
          <Suspense fallback={<div className="h-80 bg-slate-100 rounded animate-pulse" />}>
            {chartsReady && (
              <div className="w-full h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ left: 5, right: 5, top: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" angle={-45} textAnchor="end" height={55} tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                    <YAxis yAxisId="left" tick={{ fontSize: 10 }} width={35} label={{ value: 'Sleep (hrs)', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }} />
                    <YAxis yAxisId="right" orientation="right" domain={[1, 10]} tick={{ fontSize: 10 }} width={35} label={{ value: 'Mood (1-10)', angle: 90, position: 'insideRight', style: { fontSize: 10 } }} />
                    <Tooltip contentStyle={{ fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line yAxisId="left" type="monotone" dataKey="sleepHours" stroke="#8884d8" name="Sleep (hours)" strokeWidth={2} dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="nextDayMood" stroke="#82ca9d" name="Next Day Mood" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Suspense>
        )}
        <p className="text-center text-[10px] sm:text-xs text-slate-500 mt-4">
          Shows your logged sleep duration (hours) and the average mood on the following day. More data = better insights.
        </p>
      </div>
    </PageLayout>
  );
});

SleepLog.displayName = 'SleepLog';
export default SleepLog;