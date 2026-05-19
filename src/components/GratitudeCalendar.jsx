import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import api from '../services/api';
import PageLayout from '../components/PageLayout';

// Lazy load the calendar component (splits the bundle)
const GratitudeCalendar = lazy(() => import('../components/GratitudeCalendar'));

// ----------------------------------------------------------------------
// Skeleton components (instant loading feedback)
// ----------------------------------------------------------------------
const FormSkeleton = () => (
  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 animate-pulse">
    <div className="h-6 bg-slate-200 rounded w-40 mb-4" />
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i}>
          <div className="h-4 bg-slate-200 rounded w-24 mb-1" />
          <div className="h-16 bg-slate-100 rounded-xl" />
        </div>
      ))}
      <div className="h-12 bg-slate-200 rounded-xl" />
    </div>
  </div>
);

const EntrySkeleton = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 animate-pulse">
    <div className="flex justify-between">
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-4 bg-slate-200 rounded w-1/2" />
        <div className="h-3 bg-slate-200 rounded w-24" />
      </div>
      <div className="w-16 h-8 bg-slate-200 rounded" />
    </div>
  </div>
);

const ListSkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => <EntrySkeleton key={i} />)}
  </div>
);

// ----------------------------------------------------------------------
// Main component
// ----------------------------------------------------------------------
const GratitudeJournal = React.memo(() => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    people: '',
    things: '',
    situations: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'

  // Fetch entries from backend
  const fetchEntries = useCallback(async () => {
    try {
      const res = await api.get('/gratitude');
      const entriesArray = res.data.entries || res.data;
      setEntries(entriesArray);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Record page view once per day & load initial data
  useEffect(() => {
    const recordPageView = async () => {
      try {
        await api.post('/daily-activity/page-view', { pageName: 'gratitude' });
      } catch (err) { console.error(err); }
    };
    recordPageView();
    fetchEntries();
  }, [fetchEntries]);

  // Handle form changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  // Submit new entry
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (submitting) return;
    const hasContent = Object.values(formData).some(val => val.trim().length > 0);
    if (!hasContent) {
      alert('Please fill at least one field');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/gratitude', formData);
      // Reset form after successful save
      setFormData({ people: '', things: '', situations: '', notes: '' });
      // Refresh the list
      await fetchEntries();
      // Award points (+2)
      await api.post('/activity/add', { actionType: 'gratitude', points: 2 });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  }, [formData, submitting, fetchEntries]);

  // Delete an entry
  const deleteEntry = useCallback(async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await api.delete(`/gratitude/${id}`);
      await fetchEntries();
    } catch (err) {
      alert('Failed to delete');
    }
  }, [fetchEntries]);

  // Show skeleton while loading
  if (loading && viewMode === 'list') {
    return (
      <PageLayout title="Gratitude Journal" subtitle="Write down what you're thankful for each day.">
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="inline-flex p-1 bg-slate-100 rounded-2xl animate-pulse">
            <div className="w-24 h-10 bg-slate-200 rounded-xl" />
            <div className="w-24 h-10 bg-slate-200 rounded-xl ml-1" />
          </div>
        </div>
        <FormSkeleton />
        <ListSkeleton />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Gratitude Journal" subtitle="Write down what you're thankful for each day.">
      {/* View Toggle */}
      <div className="flex justify-center mb-6 sm:mb-8">
        <div className="inline-flex p-1 bg-slate-100 rounded-2xl">
          <button
            onClick={() => setViewMode('list')}
            className={`px-5 sm:px-6 py-2 rounded-xl text-sm font-bold transition-all touch-manipulation ${
              viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            📝 Journal
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-5 sm:px-6 py-2 rounded-xl text-sm font-bold transition-all touch-manipulation ${
              viewMode === 'calendar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            📅 Calendar
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="max-w-4xl mx-auto space-y-8 sm:space-y-10">
          {/* Entry Form */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 p-5 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4">Add Today's Gratitude</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-600">People</label>
                <textarea
                  name="people"
                  value={formData.people}
                  onChange={handleChange}
                  rows="2"
                  className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none resize-none"
                  placeholder="Family, friends, mentors..."
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-600">Things</label>
                <textarea
                  name="things"
                  value={formData.things}
                  onChange={handleChange}
                  rows="2"
                  className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none resize-none"
                  placeholder="Health, home, nature..."
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-600">Situations</label>
                <textarea
                  name="situations"
                  value={formData.situations}
                  onChange={handleChange}
                  rows="2"
                  className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none resize-none"
                  placeholder="Job opportunities, sunny weather..."
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-600">Notes (optional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="2"
                  className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none resize-none"
                  placeholder="Anything else you're grateful for..."
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition active:scale-95 disabled:opacity-50 touch-manipulation"
              >
                {submitting ? 'Saving...' : 'Save Gratitude (+2 points)'}
              </button>
            </form>
          </div>

          {/* List of entries */}
          <div className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800">Your Gratitude Entries</h2>
            {entries.length === 0 ? (
              <div className="bg-white rounded-2xl sm:rounded-3xl p-8 text-center text-slate-400 border border-slate-100">
                No entries yet. Start writing!
              </div>
            ) : (
              entries.map(entry => (
                <div key={entry._id} className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-5">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0 space-y-2">
                      {entry.people && <p className="text-sm break-words"><span className="font-bold text-indigo-600">👥 People:</span> {entry.people}</p>}
                      {entry.things && <p className="text-sm break-words"><span className="font-bold text-indigo-600">📦 Things:</span> {entry.things}</p>}
                      {entry.situations && <p className="text-sm break-words"><span className="font-bold text-indigo-600">✨ Situations:</span> {entry.situations}</p>}
                      {entry.notes && <p className="text-slate-500 italic text-sm break-words">{entry.notes}</p>}
                      <p className="text-xs text-slate-400">{new Date(entry.date).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={() => deleteEntry(entry._id)}
                      className="text-rose-500 hover:text-rose-700 text-sm font-medium touch-manipulation flex-shrink-0"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <Suspense fallback={<div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100 animate-pulse h-96" />}>
          <GratitudeCalendar />
        </Suspense>
      )}
    </PageLayout>
  );
});

GratitudeJournal.displayName = 'GratitudeJournal';
export default GratitudeJournal;