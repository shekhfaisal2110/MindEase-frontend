import React, { useState, useEffect } from 'react';
import api from '../services/api';

const DeviceUsageLog = ({ selectedDate, onUpdate }) => {
  const [totalMinutes, setTotalMinutes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchUsage();
  }, [selectedDate]);

  const fetchUsage = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/usage/device/${selectedDate}`);
      setTotalMinutes(res.data.totalMinutes || '');
      setLastUpdated(res.data.updatedAt || null);
    } catch (err) {
      console.error(err);
      setError('Failed to load data. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!totalMinutes) {
      setError('Please enter a valid number of minutes.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await api.post('/usage/device', { date: selectedDate, totalMinutes: parseInt(totalMinutes) });
      setLastUpdated(res.data.updatedAt);
      if (onUpdate) onUpdate();
      alert('✅ Device usage saved!');
    } catch (err) {
      console.error(err);
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const formatMinutes = (min) => {
    const hrs = Math.floor(min / 60);
    const mins = min % 60;
    if (hrs === 0) return `${mins} min`;
    if (mins === 0) return `${hrs} hr`;
    return `${hrs} hr ${mins} min`;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return null;
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6">
      <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        <span>📱</span> Daily Device Usage
      </h2>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Total Screen Time (minutes)
            </label>
            <input
              type="number"
              min="0"
              value={totalMinutes}
              onChange={e => setTotalMinutes(e.target.value)}
              placeholder="e.g., 180 (3 hours)"
              className="w-full bg-slate-50 border-none rounded-xl p-3 text-base focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              required
            />
            {totalMinutes > 0 && (
              <p className="text-xs text-slate-400 mt-1">
                ≈ {formatMinutes(parseInt(totalMinutes))}
              </p>
            )}
            {lastUpdated && (
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Last saved: {formatTime(lastUpdated)}
              </p>
            )}
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm p-3 rounded-xl">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-100"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </span>
            ) : (
              'Save Device Usage'
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default DeviceUsageLog;