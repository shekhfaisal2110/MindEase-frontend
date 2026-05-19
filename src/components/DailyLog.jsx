import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import api from '../services/api';

// Lazy load heavy components (if any, here we keep inline but memoized)
// Skeleton component for entries list
const EntriesSkeleton = () => (
  <div className="space-y-4">
    <div className="flex justify-between items-center px-1">
      <div className="h-7 w-32 bg-slate-200 rounded animate-pulse"></div>
      <div className="h-5 w-20 bg-slate-200 rounded animate-pulse"></div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 animate-pulse">
          <div className="flex justify-between">
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              <div className="h-3 bg-slate-200 rounded w-2/3"></div>
            </div>
            <div className="flex gap-2">
              <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
              <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Memoized entry card component to prevent re-renders of untouched entries
const EntryCard = React.memo(({ entry, isEditing, editForm, onStartEdit, onSaveEdit, onCancelEdit, onDelete, setEditForm }) => {
  const formatDuration = useCallback((minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins} min`;
    if (mins === 0) return `${hrs} hr`;
    return `${hrs} hr ${mins} min`;
  }, []);

  const formatTime = useCallback((timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  if (isEditing) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">Duration (minutes)</label>
          <input
            type="number"
            value={editForm.duration}
            onChange={e => setEditForm(prev => ({ ...prev, duration: e.target.value }))}
            className="w-full bg-slate-50 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-100 outline-none"
            autoFocus
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">Notes</label>
          <textarea
            value={editForm.notes}
            onChange={e => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
            rows="2"
            className="w-full bg-slate-50 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-100 outline-none resize-none"
          />
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={() => onSaveEdit(entry._id)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition active:scale-95 touch-manipulation">Save</button>
          <button onClick={onCancelEdit} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition active:scale-95 touch-manipulation">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-slate-800 truncate">{entry.person.name}</p>
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full whitespace-nowrap">
              {entry.person.type === 'family' ? '👨‍👩‍👧 Family' : '👫 Friend'}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">{formatDuration(entry.duration)}</p>
          <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Added at {formatTime(entry.createdAt)}</span>
          </div>
          {entry.notes && (
            <p className="text-xs text-slate-400 mt-2 italic line-clamp-2">{entry.notes}</p>
          )}
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button onClick={() => onStartEdit(entry)} className="text-indigo-500 hover:text-indigo-700 p-2 rounded-full hover:bg-indigo-50 transition" title="Edit" aria-label="Edit">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button onClick={() => onDelete(entry._id)} className="text-rose-500 hover:text-rose-700 p-2 rounded-full hover:bg-rose-50 transition" title="Delete" aria-label="Delete">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
});

const DailyLog = ({ people, onEntryAdded }) => {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ personId: '', duration: '', notes: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ duration: '', notes: '' });

  // Memoized total duration
  const totalDuration = useMemo(() => entries.reduce((sum, e) => sum + e.duration, 0), [entries]);

  // Memoized format functions
  const formatDuration = useCallback((minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins} min`;
    if (mins === 0) return `${hrs} hr`;
    return `${hrs} hr ${mins} min`;
  }, []);

 const fetchEntries = useCallback(async () => {
  setLoading(true);
  try {
    const res = await api.get(`/time/entries/date/${selectedDate}`);
    // Extract the entries array from the response object
    setEntries(res.data.entries || []);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
}, [selectedDate]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleSubmit = useCallback(async (e) => {
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
      await fetchEntries();
      if (onEntryAdded) onEntryAdded();
    } catch (err) {
      console.error(err);
      alert('Failed to add entry');
    } finally {
      setSaving(false);
    }
  }, [form, selectedDate, fetchEntries, onEntryAdded]);

  const startEdit = useCallback((entry) => {
    setEditingId(entry._id);
    setEditForm({
      duration: entry.duration,
      notes: entry.notes || '',
    });
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditForm({ duration: '', notes: '' });
  }, []);

  const saveEdit = useCallback(async (id) => {
    if (!editForm.duration) return;
    try {
      const res = await api.put(`/time/entries/${id}`, {
        duration: parseInt(editForm.duration),
        notes: editForm.notes,
      });
      setEntries(prev => prev.map(e => (e._id === id ? res.data : e)));
      setEditingId(null);
      if (onEntryAdded) onEntryAdded();
    } catch (err) {
      console.error(err);
      alert('Failed to update entry');
    }
  }, [editForm, onEntryAdded]);

  const deleteEntry = useCallback(async (id) => {
    if (!window.confirm('Delete this entry permanently?')) return;
    try {
      await api.delete(`/time/entries/${id}`);
      setEntries(prev => prev.filter(e => e._id !== id));
      if (onEntryAdded) onEntryAdded();
    } catch (err) {
      console.error(err);
      alert('Failed to delete entry');
    }
  }, [onEntryAdded]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-0 pb-8">
      {/* Date Selector & Total */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="font-bold text-slate-800 bg-transparent focus:ring-0 focus:outline-none cursor-pointer text-base"
          />
        </div>
        <div className="text-sm text-slate-500 font-medium bg-slate-50 px-3 py-1 rounded-full">
          Total: {formatDuration(totalDuration)}
        </div>
      </div>

      {/* Add Entry Form */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6 mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span>📝</span> Log Time
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Person</label>
            <select
              value={form.personId}
              onChange={e => setForm(prev => ({ ...prev, personId: e.target.value }))}
              className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              required
            >
              <option value="">Select a person</option>
              {people.map(p => (
                <option key={p._id} value={p._id}>{p.name} ({p.type === 'family' ? 'Family' : 'Friend'})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Duration (minutes)</label>
            <input
              type="number"
              min="1"
              value={form.duration}
              onChange={e => setForm(prev => ({ ...prev, duration: e.target.value }))}
              placeholder="e.g., 30"
              className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="What did you do together?"
              rows="2"
              className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-100 touch-manipulation"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </span>
            ) : 'Add Entry'}
          </button>
        </form>
      </div>

      {/* Entries List with Skeleton Loading */}
      {loading ? (
        <EntriesSkeleton />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xl font-bold text-slate-800">Today's Activities</h3>
            <span className="text-sm font-normal text-slate-400">
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>

          {entries.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-medium">No time logged yet today.</p>
              <p className="text-slate-300 text-sm mt-1">Add your first entry above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {entries.map(entry => (
                <EntryCard
                  key={entry._id}
                  entry={entry}
                  isEditing={editingId === entry._id}
                  editForm={editForm}
                  onStartEdit={startEdit}
                  onSaveEdit={saveEdit}
                  onCancelEdit={cancelEdit}
                  onDelete={deleteEntry}
                  setEditForm={setEditForm}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(DailyLog);