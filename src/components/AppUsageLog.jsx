import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AppUsageLog = ({ selectedDate, onUpdate }) => {
  const [appUsages, setAppUsages] = useState([]);
  const [newApp, setNewApp] = useState({ appName: '', minutes: '' });
  const [editingId, setEditingId] = useState(null);
  const [editingMinutes, setEditingMinutes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAppUsages();
  }, [selectedDate]);

  const fetchAppUsages = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/usage/app/${selectedDate}`);
      setAppUsages(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newApp.appName || !newApp.minutes) return;
    setSaving(true);
    try {
      await api.post('/usage/app', {
        date: selectedDate,
        appName: newApp.appName,
        minutes: parseInt(newApp.minutes)
      });
      setNewApp({ appName: '', minutes: '' });
      fetchAppUsages();
      if (onUpdate) onUpdate();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const startEdit = (usage) => {
    setEditingId(usage._id);
    setEditingMinutes(usage.minutes);
  };

  const saveEdit = async (id) => {
    if (editingMinutes === undefined) return;
    setSaving(true);
    try {
      await api.post('/usage/app', {
        date: selectedDate,
        appName: appUsages.find(u => u._id === id).appName,
        minutes: parseInt(editingMinutes)
      });
      setEditingId(null);
      setEditingMinutes('');
      fetchAppUsages();
      if (onUpdate) onUpdate();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const deleteAppUsage = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await api.delete(`/usage/app/${id}`);
      fetchAppUsages();
      if (onUpdate) onUpdate();
    } catch (err) { console.error(err); }
  };

  const formatDuration = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins} min`;
    if (mins === 0) return `${hrs} hr`;
    return `${hrs}h ${mins}m`;
  };

  // Calculate total minutes from all apps
  const totalMinutes = appUsages.reduce((sum, app) => sum + app.minutes, 0);
  const totalFormatted = formatDuration(totalMinutes);

  // Skeleton loader
  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="h-12 bg-slate-200 rounded-xl flex-1"></div>
            <div className="h-12 bg-slate-200 rounded-xl w-32"></div>
            <div className="h-12 bg-slate-200 rounded-xl w-20"></div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl"></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="text-2xl">📱</span> App Usage
        </h2>
        {appUsages.length > 0 && (
          <div className="text-sm bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full font-bold inline-flex items-center gap-2 self-start sm:self-auto">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Total: {totalFormatted}
          </div>
        )}
      </div>

      {/* Add Form */}
      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="flex-1">
          <label className="sr-only">App Name</label>
          <input
            type="text"
            placeholder="App name (e.g., Instagram)"
            value={newApp.appName}
            onChange={e => setNewApp({ ...newApp, appName: e.target.value })}
            className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            required
          />
        </div>
        <div className="w-full sm:w-32">
          <label className="sr-only">Minutes</label>
          <input
            type="number"
            placeholder="Minutes"
            value={newApp.minutes}
            onChange={e => setNewApp({ ...newApp, minutes: e.target.value })}
            className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            required
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            'Add'
          )}
        </button>
      </form>

      {/* Empty State */}
      {appUsages.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <div className="text-5xl mb-3">📱</div>
          <p className="text-slate-400 font-medium">No app usage logged for this day.</p>
          <p className="text-slate-300 text-sm mt-1">Add your first app above</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Usage List */}
          <div className="space-y-3">
            {appUsages.map((usage, idx) => {
              const percentage = totalMinutes > 0 ? (usage.minutes / totalMinutes) * 100 : 0;
              return (
                <div
                  key={usage._id}
                  className="bg-slate-50 rounded-2xl p-4 transition-all hover:shadow-md animate-in fade-in-zoom duration-200"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {editingId === usage._id ? (
                    // Edit Mode
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                          <input
                            type="number"
                            value={editingMinutes}
                            onChange={e => setEditingMinutes(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-100 outline-none"
                            autoFocus
                          />
                        </div>
                        <div className="flex gap-2 sm:justify-end">
                          <button
                            onClick={() => saveEdit(usage._id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition disabled:opacity-50"
                            disabled={saving}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Normal View
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-800 text-base">{usage.appName}</span>
                          <span className="text-sm text-slate-500 bg-white px-2 py-0.5 rounded-full">
                            {formatDuration(usage.minutes)}
                          </span>
                        </div>
                        {/* Progress bar */}
                        <div className="mt-2">
                          <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                            <span>Usage share</span>
                            <span>{Math.round(percentage)}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 self-end sm:self-center">
                        <button
                          onClick={() => startEdit(usage)}
                          className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition text-sm font-medium"
                          aria-label="Edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteAppUsage(usage._id)}
                          className="text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition text-sm font-medium"
                          aria-label="Delete"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Usage insight */}
          {appUsages.length >= 2 && (
            <div className="mt-6 p-4 bg-indigo-50 rounded-xl">
              <p className="text-sm text-indigo-800 flex items-center gap-2">
                <span>💡</span>
                Your most used app is{' '}
                <strong className="font-black">
                  {appUsages.reduce((max, app) => app.minutes > max.minutes ? app : max, appUsages[0]).appName}
                </strong>{' '}
                with {formatDuration(Math.max(...appUsages.map(a => a.minutes)))}.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AppUsageLog;