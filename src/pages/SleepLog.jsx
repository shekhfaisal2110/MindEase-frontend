// src/pages/SleepLog.jsx
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import PageLayout from '../components/PageLayout';
import LoadingSpinner from '../components/LoadingSpinner';

const SleepLog = () => {
  const [logs, setLogs] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    bedtime: '22:00',
    wakeTime: '06:00',
    quality: 3,
    notes: ''
  });

  useEffect(() => {
    fetchLogs();
    fetchTrends();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/sleep');
      // Handle both array and paginated { logs: [], pagination: {} }
      const logsData = Array.isArray(res.data) ? res.data : (res.data.logs || []);
      setLogs(logsData);
    } catch (err) { console.error(err); }
  };

  const fetchTrends = async () => {
    try {
      const res = await api.get('/sleep/trends?days=30');
      setTrendData(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.date || !form.bedtime || !form.wakeTime) return;
    setSubmitting(true);
    try {
      await api.post('/sleep', form);
      await api.post('/activity/add', { actionType: 'sleepLog', points: 2 });
      alert('Sleep log saved! (+2 points)');
      fetchLogs();
      fetchTrends();
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
  };

  const deleteLog = async (id) => {
    if (!window.confirm('Delete this sleep log?')) return;
    try {
      await api.delete(`/sleep/${id}`);
      fetchLogs();
      fetchTrends();
    } catch (err) { console.error(err); }
  };

  const formatTime = (timeStr) => timeStr.slice(0,5);

  if (loading) return <LoadingSpinner />;

  return (
    <PageLayout title="Sleep Tracker" subtitle="Log your sleep and see how it affects your mood.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6">📝 Log Sleep</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date (night of)</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm({...form, date: e.target.value})}
                max={new Date().toISOString().split('T')[0]}
                className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bedtime</label>
                <input
                  type="time"
                  value={form.bedtime}
                  onChange={e => setForm({...form, bedtime: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Wake time</label>
                <input
                  type="time"
                  value={form.wakeTime}
                  onChange={e => setForm({...form, wakeTime: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quality (1-5)</label>
              <div className="flex items-center gap-3 mt-1">
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={form.quality}
                  onChange={e => setForm({...form, quality: parseInt(e.target.value)})}
                  className="flex-1"
                />
                <span className="text-lg font-bold text-indigo-600 w-8 text-center">{form.quality}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Poor</span><span>Fair</span><span>Good</span><span>Very good</span><span>Excellent</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Notes (optional)</label>
              <textarea
                value={form.notes}
                onChange={e => setForm({...form, notes: e.target.value})}
                rows="2"
                className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none"
                placeholder="Any dreams or disturbances?"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Sleep Log (+2 points)'}
            </button>
          </form>
        </div>

        {/* Recent Logs */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">📜 Recent Sleep Logs</h2>
          {logs.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No sleep logs yet. Add your first above.</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {logs.slice(0, 10).map(log => {
                const durationHours = log.duration ? log.duration.toFixed(1) : '?';
                return (
                  <div key={log._id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-bold text-slate-800">{new Date(log.date).toLocaleDateString()}</p>
                      <p className="text-xs text-slate-500">{formatTime(log.bedtime)} → {formatTime(log.wakeTime)} ({durationHours} hrs)</p>
                      <p className="text-xs text-slate-500">Quality: {log.quality}/5</p>
                      {log.notes && <p className="text-xs text-slate-400 italic mt-1">{log.notes}</p>}
                    </div>
                    <button onClick={() => deleteLog(log._id)} className="text-rose-500 hover:text-rose-700 text-sm">Delete</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Trend Chart */}
      <div className="mt-10 bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">📊 Sleep Duration vs Next‑Day Mood</h2>
        {trendData.length === 0 ? (
          <p className="text-slate-400 text-center py-10">Not enough data to show trends. Add more sleep logs and mood check‑ins.</p>
        ) : (
          <div className="w-full h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} />
                <YAxis yAxisId="left" label={{ value: 'Sleep (hours)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" domain={[1, 10]} label={{ value: 'Mood (1-10)', angle: 90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="sleepHours" stroke="#8884d8" name="Sleep (hours)" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="nextDayMood" stroke="#82ca9d" name="Next Day Mood" strokeWidth={2} dot={{ r: 4 }} connectNulls={true} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        <p className="text-center text-xs text-slate-500 mt-4">
          Shows your logged sleep duration (hours) and the average mood on the following day. More data = better insights.
        </p>
      </div>
    </PageLayout>
  );
};

export default SleepLog;