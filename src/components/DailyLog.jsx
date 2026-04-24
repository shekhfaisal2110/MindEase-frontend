import React, { useState, useEffect } from 'react';
import api from '../services/api';

const DailyLog = ({ people, onEntryAdded }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ personId: '', duration: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, [selectedDate]);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/time/entries/date/${selectedDate}`);
      setEntries(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.personId || !form.duration) return;
    setSaving(true);
    try {
      await api.post('/time/entries', {
        personId: form.personId,
        date: selectedDate,
        duration: parseInt(form.duration),
        notes: form.notes,
      });
      setForm({ personId: '', duration: '', notes: '' });
      fetchEntries();
      if (onEntryAdded) onEntryAdded();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const formatDuration = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins} min`;
    if (mins === 0) return `${hrs} hr`;
    return `${hrs} hr ${mins} min`;
  };

  const getTotalDuration = () => entries.reduce((sum, e) => sum + e.duration, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-0">
      {/* Date Selector – responsive flexible row */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="font-bold text-slate-800 bg-transparent border-none focus:ring-0 focus:outline-none cursor-pointer"
          />
        </div>
        <div className="text-sm text-slate-500 font-medium bg-slate-50 px-3 py-1 rounded-full">
          Total: {formatDuration(getTotalDuration())}
        </div>
      </div>

      {/* Add Entry Form – fully responsive, stack on mobile */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6 mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span>📝</span> Log Time
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Person
            </label>
            <select
              value={form.personId}
              onChange={e => setForm({ ...form, personId: e.target.value })}
              className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              required
            >
              <option value="">Select a person</option>
              {people.map(p => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              min="1"
              value={form.duration}
              onChange={e => setForm({ ...form, duration: e.target.value })}
              placeholder="e.g., 30"
              className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Notes (optional)
            </label>
            <textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="What did you do together?"
              rows="2"
              className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none"
            />
          </div>

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
              'Add Entry'
            )}
          </button>
        </form>
      </div>

      {/* Today's Entries – responsive grid/cards */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-800 px-1 flex items-center justify-between">
          <span>Today's Activities</span>
          <span className="text-sm font-normal text-slate-400">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </span>
        </h3>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-medium">No time logged yet today.</p>
            <p className="text-slate-300 text-sm mt-1">Add your first entry above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {entries.map(entry => (
              <div
                key={entry._id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 flex justify-between items-start gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-slate-800 truncate">{entry.person.name}</p>
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                      {entry.person.type === 'family' ? '👨‍👩‍👧 Family' : '👫 Friend'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{formatDuration(entry.duration)}</p>
                  {entry.notes && (
                    <p className="text-xs text-slate-400 mt-2 italic line-clamp-2">{entry.notes}</p>
                  )}
                </div>
                {/* Optional delete/edit buttons could be added here */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyLog;