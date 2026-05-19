import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import api from '../services/api';
import PageLayout from '../components/PageLayout';
import LoadingSpinner from '../components/LoadingSpinner';

// Lazy load EmotionalStats – reduces initial bundle by ~80KB (Recharts)
const EmotionalStats = lazy(() => import('../components/EmotionalStats'));

// Quick emotions list – static
const quickEmotions = [
  { label: 'Peaceful', emoji: '😌' },
  { label: 'Anxious', emoji: '😟' },
  { label: 'Grateful', emoji: '🙏' },
  { label: 'Sad', emoji: '☁️' },
  { label: 'Energized', emoji: '⚡' },
  { label: 'Frustrated', emoji: '😤' }
];

// Skeleton for history list – shows instantly while data loads
const HistorySkeleton = () => (
  <div className="space-y-4 animate-pulse">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="relative pl-12">
        <div className="absolute left-0 w-10 h-10 rounded-full bg-slate-200" />
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-50">
          <div className="h-5 bg-slate-200 rounded w-32 mb-2" />
          <div className="h-4 bg-slate-200 rounded w-24" />
        </div>
      </div>
    ))}
  </div>
);

const EmotionalCheckIn = React.memo(() => {
  const [activities, setActivities] = useState([]);
  const [emotion, setEmotion] = useState('');
  const [intensity, setIntensity] = useState(5);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('log'); // 'log' or 'stats'

  // Memoized helper for intensity colour
  const getIntensityColor = useCallback((val) => {
    if (val <= 3) return 'bg-emerald-500';
    if (val <= 7) return 'bg-indigo-500';
    return 'bg-rose-500';
  }, []);

  const fetchActivities = useCallback(async () => {
    try {
      // Use limit to get enough history without overfetch
      const res = await api.get('/emotional?limit=50');
      const data = res.data;
      const activitiesArray = Array.isArray(data) ? data : (data.activities || []);
      setActivities(activitiesArray);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Record page view (non‑blocking)
    const recordPageView = async () => {
      try {
        const res = await api.post('/daily-activity/page-view', { pageName: 'emotional' });
        if (!res.data.alreadyRecorded) {
          await api.post('/activity/add', { actionType: 'pageView', points: 1 });
        }
      } catch (err) { console.error(err); }
    };
    recordPageView();
    fetchActivities();
  }, [fetchActivities]);

  const addCheckIn = useCallback(async (e) => {
    e.preventDefault();
    if (!emotion.trim()) return;
    try {
      const res = await api.post('/emotional', { emotion, intensity, note });
      setActivities(prev => [res.data, ...prev]);
      setEmotion('');
      setIntensity(5);
      setNote('');

      await api.post('/activity/add', { actionType: 'emotionalCheckIn', points: 1 });
    } catch (err) {
      console.error(err);
    }
  }, [emotion, intensity, note]);

  // Memoised formatted activities (unchanged, just for stability)
  const memoisedActivities = useMemo(() => activities, [activities]);

  if (loading && viewMode === 'log') {
    return (
      <PageLayout title="Emotional Check-In" subtitle="Take a moment to acknowledge how you're feeling right now." maxWidth="max-w-4xl">
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 bg-slate-100 rounded-2xl animate-pulse">
            <div className="px-6 py-2 rounded-xl w-28 h-10 bg-slate-200" />
            <div className="px-6 py-2 rounded-xl w-28 h-10 bg-slate-200 ml-1" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 animate-pulse h-96" />
          </div>
          <div className="lg:col-span-7">
            <HistorySkeleton />
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Emotional Check-In"
      subtitle="Take a moment to acknowledge how you're feeling right now."
      maxWidth="max-w-4xl"
    >
      {/* Tab Navigation – responsive, touch‑friendly */}
      <div className="flex justify-center mb-6 sm:mb-8">
        <div className="inline-flex p-1 bg-slate-100 rounded-2xl">
          <button
            onClick={() => setViewMode('log')}
            className={`px-5 sm:px-6 py-2 rounded-xl text-sm font-bold transition-all touch-manipulation ${
              viewMode === 'log'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            📝 Log Emotion
          </button>
          <button
            onClick={() => setViewMode('stats')}
            className={`px-5 sm:px-6 py-2 rounded-xl text-sm font-bold transition-all touch-manipulation ${
              viewMode === 'stats'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            📊 Analytics
          </button>
        </div>
      </div>

      {viewMode === 'log' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Input Form */}
          <div className="lg:col-span-5">
            <form onSubmit={addCheckIn} className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 lg:sticky lg:top-24">
              <div className="mb-6">
                <label className="block text-xs sm:text-sm font-black text-slate-800 uppercase tracking-widest mb-4">
                  What's your mood?
                </label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {quickEmotions.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setEmotion(item.label)}
                      className={`px-3 py-2 rounded-2xl text-sm font-bold transition-all border-2 touch-manipulation ${
                        emotion === item.label
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100'
                          : 'bg-slate-50 border-transparent text-slate-600 hover:bg-white hover:border-indigo-100'
                      }`}
                    >
                      {item.emoji} {item.label}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Or type another emotion..."
                  value={emotion}
                  onChange={e => setEmotion(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-100 outline-none"
                  required
                />
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-widest">Intensity</label>
                  <span className={`px-3 py-1 rounded-full text-white text-xs font-black ${getIntensityColor(intensity)}`}>
                    Level {intensity}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={intensity}
                  onChange={e => setIntensity(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 touch-manipulation"
                />
              </div>

              <div className="mb-6">
                <label className="block text-xs sm:text-sm font-black text-slate-800 uppercase tracking-widest mb-2">Context (Optional)</label>
                <textarea
                  placeholder="What triggered this feeling?"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-100 outline-none min-h-[100px] resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-black py-4 rounded-2xl transition-all shadow-lg active:scale-95 touch-manipulation"
              >
                Check In
              </button>
            </form>
          </div>

          {/* Right: History Feed (with skeleton while loading) */}
          <div className="lg:col-span-7">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 sm:mb-6 flex items-center">
              <span className="mr-2">📖</span> History
            </h2>
            {loading ? (
              <HistorySkeleton />
            ) : activities.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-100">
                <p className="text-slate-400 font-medium">Your emotional journey starts here.</p>
              </div>
            ) : (
              <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:via-slate-100 before:to-transparent">
                {memoisedActivities.map(act => (
                  <div key={act._id} className="relative pl-12 group">
                    <div className={`absolute left-0 w-10 h-10 rounded-full border-4 border-white shadow-sm flex items-center justify-center text-xs z-10 transition-transform group-hover:scale-110 ${getIntensityColor(act.intensity)}`}>
                      <span className="text-white font-black">{act.intensity}</span>
                    </div>
                    <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-50 hover:shadow-md transition-all">
                      <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                        <h3 className="text-base sm:text-lg font-black text-slate-800 capitalize break-words">{act.emotion}</h3>
                        <time className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                          {new Date(act.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </time>
                      </div>
                      {act.note && <p className="text-slate-600 text-sm italic leading-relaxed break-words">"{act.note}"</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        // Lazy‑loaded analytics view with Suspense
        <Suspense fallback={<div className="py-20 text-center text-slate-500">Loading analytics...</div>}>
          <EmotionalStats />
        </Suspense>
      )}
    </PageLayout>
  );
});

EmotionalCheckIn.displayName = 'EmotionalCheckIn';
export default EmotionalCheckIn;