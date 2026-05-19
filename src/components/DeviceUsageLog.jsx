import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';

// Skeleton loader for instant perceived loading
const DeviceUsageSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-7 bg-slate-200 rounded w-40"></div>
    <div className="space-y-3">
      <div className="h-4 bg-slate-200 rounded w-48"></div>
      <div className="h-12 bg-slate-200 rounded-xl"></div>
      <div className="h-12 bg-slate-200 rounded-xl"></div>
    </div>
  </div>
);

// Helper functions moved outside component to avoid recreation
const formatMinutes = (min) => {
  if (!min) return '';
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

const DeviceUsageLog = React.memo(({ selectedDate, onUpdate }) => {
  const [totalMinutes, setTotalMinutes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchUsage = useCallback(async () => {
    setError('');
    try {
      const res = await api.get(`/usage/device/${selectedDate}`);
      setTotalMinutes(res.data.totalMinutes ?? '');
      setLastUpdated(res.data.updatedAt || null);
    } catch (err) {
      console.error(err);
      setError('Failed to load data. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    setLoading(true);
    fetchUsage();
  }, [fetchUsage]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!totalMinutes || parseInt(totalMinutes) < 0) {
      setError('Please enter a valid number of minutes.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await api.post('/usage/device', { 
        date: selectedDate, 
        totalMinutes: parseInt(totalMinutes) 
      });
      setLastUpdated(res.data.updatedAt);
      if (onUpdate) onUpdate();
      // Optional: subtle feedback instead of alert for better UX
    } catch (err) {
      console.error(err);
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [totalMinutes, selectedDate, onUpdate]);

  // Memoized display values
  const formattedMinutes = useMemo(() => 
    totalMinutes && parseInt(totalMinutes) > 0 
      ? formatMinutes(parseInt(totalMinutes)) 
      : null,
    [totalMinutes]
  );

  const lastUpdatedTime = useMemo(() => 
    formatTime(lastUpdated),
    [lastUpdated]
  );

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6 md:p-8 w-full">
      <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        <span className="text-2xl">📱</span> Daily Device Usage
      </h2>

      {loading ? (
        <DeviceUsageSkeleton />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Total Screen Time (minutes)
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={totalMinutes}
              onChange={e => setTotalMinutes(e.target.value)}
              placeholder="e.g., 180 (3 hours)"
              className="w-full bg-slate-50 border-none rounded-xl p-3 text-base md:text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              required
              aria-label="Total screen time in minutes"
            />
            {formattedMinutes && (
              <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ≈ {formattedMinutes}
              </p>
            )}
            {lastUpdatedTime && (
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Last saved: {lastUpdatedTime}
              </p>
            )}
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm p-3 rounded-xl flex items-start gap-2">
              <span className="text-base">⚠️</span>
              <span className="flex-1">{error}</span>
              <button 
                type="button" 
                onClick={() => setError('')}
                className="text-rose-400 hover:text-rose-600"
                aria-label="Dismiss error"
              >
                ✕
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-100 touch-manipulation"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
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
});

DeviceUsageLog.displayName = 'DeviceUsageLog';

export default DeviceUsageLog;