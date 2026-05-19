import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import api from '../services/api';
import PageLayout from '../components/PageLayout';

// Lazy load tab components – reduce initial bundle
const PeopleManagement = lazy(() => import('../components/PeopleManagement'));
const DailyLog = lazy(() => import('../components/DailyLog'));
const TimeAnalytics = lazy(() => import('../components/TimeAnalytics'));

// Skeleton components for instant perceived loading
const TabSkeleton = () => (
  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 animate-pulse">
    <div className="h-6 bg-slate-200 rounded w-32 mb-4" />
    <div className="space-y-3">
      <div className="h-12 bg-slate-100 rounded-xl" />
      <div className="h-12 bg-slate-100 rounded-xl" />
    </div>
  </div>
);

const PeopleSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="bg-white rounded-3xl p-6">
      <div className="h-6 bg-slate-200 rounded w-40 mb-4" />
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="h-12 bg-slate-100 rounded-xl flex-1" />
        <div className="h-12 bg-slate-100 rounded-xl w-32" />
        <div className="h-12 bg-slate-100 rounded-xl w-20" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-3xl p-6"><div className="h-6 bg-slate-200 rounded w-32 mb-4" /><div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl" />)}</div></div>
      <div className="bg-white rounded-3xl p-6"><div className="h-6 bg-slate-200 rounded w-32 mb-4" /><div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl" />)}</div></div>
    </div>
  </div>
);

const TimeDashboard = React.memo(() => {
  const [activeTab, setActiveTab] = useState('manage');
  const [people, setPeople] = useState([]);
  const [loadingPeople, setLoadingPeople] = useState(true);

  const fetchPeople = useCallback(async () => {
    try {
      const res = await api.get('/time/people');
      setPeople(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPeople(false);
    }
  }, []);

  useEffect(() => {
    fetchPeople();
  }, [fetchPeople]);

  const handleAddPerson = useCallback(async (newPerson) => {
    try {
      const res = await api.post('/time/people', newPerson);
      setPeople(prev => [...prev, res.data]);
    } catch (err) { console.error(err); }
  }, []);

  const handleEditPerson = useCallback(async (id, newName) => {
    try {
      const res = await api.put(`/time/people/${id}`, { name: newName });
      setPeople(prev => prev.map(p => p._id === id ? res.data : p));
    } catch (err) { console.error(err); }
  }, []);

  const handleDeletePerson = useCallback(async (id) => {
    if (!window.confirm('Delete this person? All time entries will also be deleted.')) return;
    try {
      await api.delete(`/time/people/${id}`);
      setPeople(prev => prev.filter(p => p._id !== id));
    } catch (err) { console.error(err); }
  }, []);

  const refreshPeople = useCallback(() => fetchPeople(), [fetchPeople]);

  // Show skeleton if still loading people and the active tab is 'manage'
  if (loadingPeople && activeTab === 'manage') {
    return (
      <PageLayout title="Time with Loved Ones" subtitle="Track, manage, and analyze time spent with family and friends.">
        <div className="flex justify-center mb-6 sm:mb-8 overflow-x-auto pb-1">
          <div className="inline-flex p-1 bg-slate-100 rounded-2xl flex-nowrap animate-pulse">
            <div className="px-4 sm:px-6 py-2 rounded-xl w-24 h-10 bg-slate-200" />
            <div className="px-4 sm:px-6 py-2 rounded-xl w-24 h-10 bg-slate-200 ml-1" />
            <div className="px-4 sm:px-6 py-2 rounded-xl w-24 h-10 bg-slate-200 ml-1" />
          </div>
        </div>
        <PeopleSkeleton />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Time with Loved Ones" subtitle="Track, manage, and analyze time spent with family and friends.">
      {/* Tab Navigation – responsive, touch‑friendly */}
      <div className="flex justify-center mb-6 sm:mb-8 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="inline-flex p-1 bg-slate-100 rounded-2xl flex-nowrap gap-1">
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap touch-manipulation ${
              activeTab === 'manage'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            👥 My People
          </button>
          <button
            onClick={() => setActiveTab('log')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap touch-manipulation ${
              activeTab === 'log'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            📝 Daily Log
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap touch-manipulation ${
              activeTab === 'analytics'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            📊 Analytics
          </button>
        </div>
      </div>

      {/* Lazy‑loaded tab content with Suspense & fallback skeleton */}
      <div className="mt-4 sm:mt-6">
        <Suspense fallback={<TabSkeleton />}>
          {activeTab === 'manage' && (
            <PeopleManagement
              people={people}
              onAdd={handleAddPerson}
              onEdit={handleEditPerson}
              onDelete={handleDeletePerson}
            />
          )}
          {activeTab === 'log' && (
            <DailyLog people={people} onEntryAdded={refreshPeople} />
          )}
          {activeTab === 'analytics' && <TimeAnalytics />}
        </Suspense>
      </div>
    </PageLayout>
  );
});

TimeDashboard.displayName = 'TimeDashboard';
export default TimeDashboard;