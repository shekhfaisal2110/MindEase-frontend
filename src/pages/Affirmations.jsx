import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import * as Yup from 'yup';
import api from '../services/api';
import PageLayout from '../components/PageLayout';
import LoadingSpinner from '../components/LoadingSpinner';

// Lazy load heavy components to reduce initial bundle
const FormikForm = lazy(() => import('../components/FormikForm'));
const AffirmationCalendar = lazy(() => import('../components/AffirmationCalendar'));

// Lazy load confetti – only loads when needed
let confettiModule = null;
const loadConfetti = () => import('canvas-confetti').then(mod => { confettiModule = mod.default; return mod.default; });

const triggerConfetti = () => {
  if (!confettiModule) return;
  confettiModule({
    particleCount: 300, spread: 100, origin: { y: 0.6 }, startVelocity: 25,
    colors: ["#2563eb", "#3b82f6", "#60a5fa", "#1d4ed8", "#f59e0b", "#10b981", "#ef4444"],
    decay: 0.9, gravity: 1,
  });
  confettiModule({
    particleCount: 150, angle: 60, spread: 55, origin: { x: 0, y: 0.5 }, startVelocity: 30,
    colors: ["#8b5cf6", "#ec4899", "#06b6d4"],
  });
  confettiModule({
    particleCount: 150, angle: 120, spread: 55, origin: { x: 1, y: 0.5 }, startVelocity: 30,
    colors: ["#f97316", "#84cc16", "#a855f7"],
  });
};

// Skeleton for list view – instant visual feedback
const ListSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {[...Array(2)].map((_, i) => (
      <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 animate-pulse">
        <div className="flex justify-between items-start mb-4">
          <div className="h-5 bg-slate-200 rounded w-24"></div>
          <div className="w-5 h-5 bg-slate-200 rounded-full"></div>
        </div>
        <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-slate-200 rounded w-24 mb-2"></div>
        <div className="h-3 bg-slate-200 rounded-full mb-6"></div>
        <div className="h-11 bg-slate-200 rounded-2xl"></div>
      </div>
    ))}
  </div>
);

// Skeleton for calendar view
const CalendarSkeleton = () => (
  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6 md:p-8 animate-pulse">
    <div className="flex justify-between items-center mb-8">
      <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
      <div className="h-7 bg-slate-200 rounded w-40"></div>
      <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
    </div>
    <div className="grid grid-cols-7 gap-2 mb-4">
      {[...Array(7)].map((_, i) => <div key={i} className="h-4 bg-slate-200 rounded"></div>)}
    </div>
    <div className="grid grid-cols-7 gap-2">
      {[...Array(35)].map((_, i) => <div key={i} className="aspect-square bg-slate-100 rounded-2xl"></div>)}
    </div>
  </div>
);

// Memoized affirmation card component
const AffirmationCard = React.memo(({ affirmation, onIncrement, onDelete }) => {
  const progress = Math.min(100, (affirmation.count / affirmation.targetCount) * 100);
  const isComplete = progress >= 100;
  const lastUpdated = affirmation.updatedAt
    ? new Date(affirmation.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Recently';

  const handleIncrement = useCallback(() => onIncrement(affirmation._id), [affirmation._id, onIncrement]);
  const handleDelete = useCallback(() => onDelete(affirmation._id), [affirmation._id, onDelete]);

  return (
    <div className="group bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
          <span className={`text-[10px] sm:text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded ${isComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
            {isComplete ? 'Goal Met' : 'In Progress'}
          </span>
          <button onClick={handleDelete} className="text-slate-300 hover:text-rose-500 p-1 transition-colors touch-manipulation" aria-label="Delete affirmation">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        <p className="text-base sm:text-lg font-bold text-slate-800 leading-tight mb-2 break-words">
          "{affirmation.text}"
        </p>
        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-400 mb-4">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Last updated: {lastUpdated}</span>
        </div>
      </div>
      <div>
        <div className="flex justify-between items-end mb-2">
          <span className="text-xl sm:text-2xl font-black text-indigo-600">
            {affirmation.count}<span className="text-sm text-slate-400 font-normal">/{affirmation.targetCount}</span>
          </span>
          <span className="text-[10px] sm:text-xs font-bold text-slate-400">{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 mb-6 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${isComplete ? 'from-emerald-400 to-teal-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'from-indigo-500 to-purple-500'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <button
          onClick={handleIncrement}
          disabled={isComplete}
          className={`w-full py-3 rounded-xl sm:rounded-2xl font-bold transition-all flex items-center justify-center gap-2 touch-manipulation ${
            isComplete
              ? 'bg-emerald-50 text-emerald-600 cursor-default'
              : 'bg-slate-900 text-white hover:bg-indigo-600 active:scale-95 shadow-lg shadow-slate-200'
          }`}
        >
          {isComplete ? (
            <><span className="text-sm sm:text-base">✨ Completed</span></>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              <span className="text-sm sm:text-base">I repeated this</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
});

const Affirmations = () => {
  const [affirmations, setAffirmations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');

  // Record page view (non‑blocking)
  useEffect(() => {
    const recordPageView = async () => {
      try {
        const res = await api.post('/daily-activity/page-view', { pageName: 'affirmations' });
        if (!res.data.alreadyRecorded) {
          await api.post('/activity/add', { actionType: 'pageView', points: 1 });
        }
      } catch (err) { console.error(err); }
    };
    recordPageView();
    fetchAffirmations();
  }, []);

  const fetchAffirmations = useCallback(async () => {
    try {
      const res = await api.get('/affirmations');
      const affirmationsArray = res.data.affirmations || [];
      const sorted = affirmationsArray.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setAffirmations(sorted);

      // Award points only once per day
      const pointsCheck = await api.post('/daily-activity/page-view', { pageName: 'affirmationPoints' });
      if (!pointsCheck.data.alreadyRecorded && sorted.length > 0) {
        const pointsToAdd = Math.floor(sorted.length / 2);
        if (pointsToAdd > 0) {
          await api.post('/activity/add', { actionType: 'affirmation', meta: { totalAffirmations: sorted.length } });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAdd = useCallback(async (values) => {
    const res = await api.post('/affirmations', values);
    setAffirmations(prev => [res.data, ...prev]);
    // Preload confetti on first add (background)
    if (!confettiModule) loadConfetti();
  }, []);

  const handleIncrement = useCallback(async (id) => {
    const current = affirmations.find(a => a._id === id);
    const wasComplete = current && current.count >= current.targetCount;
    const res = await api.put(`/affirmations/increment/${id}`);
    const updated = res.data;
    setAffirmations(prev => prev.map(a => a._id === id ? updated : a));
    if (!wasComplete && updated.count >= updated.targetCount) {
      // Load confetti only when first completion happens
      if (!confettiModule) await loadConfetti();
      triggerConfetti();
    }
  }, [affirmations]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Would you like to remove this affirmation?')) return;
    await api.delete(`/affirmations/${id}`);
    setAffirmations(prev => prev.filter(a => a._id !== id));
  }, []);

  // Form configuration (static to avoid recreation)
  const initialValues = { text: '', targetCount: 30 };
  const validationSchema = Yup.object({
    text: Yup.string().required('Write your affirmation').min(3, 'Make it a bit longer'),
    targetCount: Yup.number().min(1, 'Target must be at least 1').max(100, 'Keep it realistic!'),
  });
  const fields = [
    { name: 'text', label: 'New Intention', type: 'textarea', placeholder: 'e.g., I am growing and learning every day', required: true },
    { name: 'targetCount', label: 'Monthly Goal (Days)', type: 'number', placeholder: '30', required: true },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <PageLayout
      title="Positive Affirmations"
      subtitle="Words have power. Speak kindness into your life today."
    >
      {/* View Toggle – responsive */}
      <div className="flex justify-center mb-6 sm:mb-8">
        <div className="inline-flex p-1 bg-slate-100 rounded-2xl">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all touch-manipulation ${
              viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            🌱 My Journey
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all touch-manipulation ${
              viewMode === 'calendar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            📅 Calendar
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Left Column: Add Form – lazy loaded */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-5 flex items-center">
                <span className="mr-2">✍️</span> Add New
              </h2>
              <Suspense fallback={<div className="bg-white rounded-3xl p-6 shadow-sm border h-80 animate-pulse" />}>
                <FormikForm
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={handleAdd}
                  fields={fields}
                  submitLabel="Plant this seed"
                  successMessage="Saved to your garden!"
                />
              </Suspense>
            </div>
          </div>

          {/* Right Column: Affirmation Cards */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-5 sm:mb-8 flex-wrap gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center">
                <span className="mr-2">🌱</span> My Journey
              </h2>
              <span className="text-[10px] sm:text-xs font-bold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
                {affirmations.length} Active
              </span>
            </div>

            {affirmations.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center">
                <div className="text-4xl sm:text-5xl mb-4">✨</div>
                <h3 className="text-base sm:text-lg font-bold text-slate-800">Your garden is empty</h3>
                <p className="text-slate-500 max-w-xs mx-auto mt-2 text-sm sm:text-base">
                  Add your first positive affirmation to start building a more resilient mindset.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                {affirmations.map(aff => (
                  <AffirmationCard
                    key={aff._id}
                    affirmation={aff}
                    onIncrement={handleIncrement}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <Suspense fallback={<CalendarSkeleton />}>
          <AffirmationCalendar />
        </Suspense>
      )}
    </PageLayout>
  );
};

export default React.memo(Affirmations);