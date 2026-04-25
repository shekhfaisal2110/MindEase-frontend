import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

const AppUsageLog = ({ selectedDate, onUpdate }) => {
  const [appUsages, setAppUsages] = useState([]);
  const [newAppName, setNewAppName] = useState('');
  const [newMinutes, setNewMinutes] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingMinutes, setEditingMinutes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deviceTotal, setDeviceTotal] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredApps, setFilteredApps] = useState([]);
  const minutesRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchDeviceUsage();
    fetchAppUsages();
    fetchDistinctApps();
  }, [selectedDate]);

  const fetchDeviceUsage = async () => {
    try {
      const res = await api.get(`/usage/device/${selectedDate}`);
      setDeviceTotal(res.data.totalMinutes || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAppUsages = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/usage/app/${selectedDate}`);
      setAppUsages(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchDistinctApps = async () => {
    try {
      const res = await api.get('/usage/apps/distinct');
      setSuggestions(res.data);
      setFilteredApps(res.data);
    } catch (err) { console.error(err); }
  };

  const checkAndUpdateDevice = async (newTotalAppMinutes, oldTotal = null) => {
    const currentTotal = oldTotal !== null ? deviceTotal - oldTotal + newTotalAppMinutes : deviceTotal;
    if (newTotalAppMinutes > currentTotal) {
      const userConfirmed = window.confirm(
        `Total app usage (${formatDuration(newTotalAppMinutes)}) exceeds device time (${formatDuration(currentTotal)}).\nUpdate device time to match app total?`
      );
      if (userConfirmed) {
        await api.post('/usage/device', { date: selectedDate, totalMinutes: newTotalAppMinutes });
        await fetchDeviceUsage();
        if (onUpdate) onUpdate();
        return true;
      }
      return false;
    }
    return true;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newAppName || !newMinutes) return;
    const minutes = parseInt(newMinutes);
    const newTotal = appUsages.reduce((sum, a) => sum + a.minutes, 0) + minutes;
    const canProceed = await checkAndUpdateDevice(newTotal);
    if (!canProceed) return;

    setSaving(true);
    try {
      await api.post('/usage/app', {
        date: selectedDate,
        appName: newAppName,
        minutes: minutes
      });
      setNewAppName('');
      setNewMinutes('');
      await fetchAppUsages();
      await fetchDeviceUsage();
      await fetchDistinctApps();
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
    const oldMinutes = appUsages.find(u => u._id === id).minutes;
    const newMinutesVal = parseInt(editingMinutes);
    const newTotal = appUsages.reduce((sum, a) => sum + a.minutes, 0) - oldMinutes + newMinutesVal;
    const canProceed = await checkAndUpdateDevice(newTotal, oldMinutes);
    if (!canProceed) return;

    setSaving(true);
    try {
      await api.post('/usage/app', {
        date: selectedDate,
        appName: appUsages.find(u => u._id === id).appName,
        minutes: newMinutesVal
      });
      setEditingId(null);
      setEditingMinutes('');
      await fetchAppUsages();
      await fetchDeviceUsage();
      if (onUpdate) onUpdate();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const deleteAppUsage = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    const toDelete = appUsages.find(u => u._id === id);
    const newTotal = appUsages.reduce((sum, a) => sum + a.minutes, 0) - toDelete.minutes;
    await checkAndUpdateDevice(newTotal, toDelete.minutes);
    try {
      await api.delete(`/usage/app/${id}`);
      await fetchAppUsages();
      await fetchDeviceUsage();
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

  const formatTime = (timestamp) => {
    if (!timestamp) return null;
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const totalMinutes = appUsages.reduce((sum, app) => sum + app.minutes, 0);
  const totalFormatted = formatDuration(totalMinutes);
  const isExceeding = totalMinutes > deviceTotal;

  const handleAppNameChange = (e) => {
    const value = e.target.value;
    setNewAppName(value);
    if (value.trim() === '') {
      setShowSuggestions(false);
      setFilteredApps(suggestions);
    } else {
      const filtered = suggestions.filter(app =>
        app.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredApps(filtered);
      setShowSuggestions(true);
    }
  };

  const selectSuggestion = (appName) => {
    setNewAppName(appName);
    setShowSuggestions(false);
    minutesRef.current?.focus();
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredApps(suggestions.filter(app => app.toLowerCase().includes(term)));
  };

  const shouldShowSearch = suggestions.length >= 20;

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
          <div className={`text-sm px-4 py-2 rounded-full font-bold inline-flex items-center gap-2 self-start sm:self-auto ${isExceeding ? 'bg-amber-100 text-amber-700' : 'bg-indigo-50 text-indigo-700'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Total: {totalFormatted}
            {isExceeding && <span className="text-xs ml-1">(exceeds device time)</span>}
          </div>
        )}
      </div>

      {/* Add Form with Auto‑suggestions */}
      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="App name (e.g., Instagram)"
            value={newAppName}
            onChange={handleAppNameChange}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            required
            autoComplete="off"
          />
          {showSuggestions && filteredApps.length > 0 && (
            <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {filteredApps.map(app => (
                <button
                  key={app}
                  type="button"
                  onClick={() => selectSuggestion(app)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 transition first:rounded-t-xl last:rounded-b-xl"
                >
                  {app}
                </button>
              ))}
              {!suggestions.includes(newAppName) && newAppName.trim() !== '' && (
                <button
                  type="button"
                  onClick={() => selectSuggestion(newAppName)}
                  className="w-full text-left px-4 py-2 text-sm text-indigo-600 font-medium border-t border-slate-100 hover:bg-indigo-50 transition rounded-b-xl"
                >
                  + Add "{newAppName.trim()}"
                </button>
              )}
            </div>
          )}
        </div>
        <div className="w-full sm:w-32">
          <input
            ref={minutesRef}
            type="number"
            placeholder="Minutes"
            value={newMinutes}
            onChange={e => setNewMinutes(e.target.value)}
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

      {/* Search bar for large app list */}
      {shouldShowSearch && (
        <div className="mb-6">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Search Apps</label>
          <input
            type="text"
            placeholder="Type to filter..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
          />
        </div>
      )}

      {/* Empty State */}
      {appUsages.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <div className="text-5xl mb-3">📱</div>
          <p className="text-slate-400 font-medium">No app usage logged for this day.</p>
          <p className="text-slate-300 text-sm mt-1">Add your first app above</p>
        </div>
      ) : (
        <div className="space-y-4">
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
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-800 text-base">{usage.appName}</span>
                          <span className="text-sm text-slate-500 bg-white px-2 py-0.5 rounded-full">
                            {formatDuration(usage.minutes)}
                          </span>
                          {usage.createdAt && (
                            <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto sm:ml-0">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              {formatTime(usage.createdAt)}
                            </span>
                          )}
                        </div>
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