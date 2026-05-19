import React, { useState, useCallback, lazy, Suspense } from 'react';
import PageLayout from '../components/PageLayout';

// Lazy load heavy components to reduce initial bundle
const DeviceUsageLog = lazy(() => import('../components/DeviceUsageLog'));
const AppUsageLog = lazy(() => import('../components/AppUsageLog'));
const UsageAnalytics = lazy(() => import('../components/UsageAnalytics'));

// Skeleton components – show instantly while real components load
const TabSkeleton = () => (
  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 animate-pulse">
    <div className="h-6 bg-slate-200 rounded w-32 mb-4" />
    <div className="space-y-3">
      <div className="h-12 bg-slate-100 rounded-xl" />
      <div className="h-12 bg-slate-100 rounded-xl" />
      <div className="h-12 bg-slate-100 rounded-xl" />
    </div>
  </div>
);

const DeviceUsageDashboard = React.memo(() => {
  const [activeTab, setActiveTab] = useState('device');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  const handleTabChange = useCallback((tab) => setActiveTab(tab), []);

  return (
    <PageLayout title="Digital Wellbeing" subtitle="Track device & app usage to build healthier digital habits.">
      {/* Date selector – responsive */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 sm:mb-8">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="font-bold text-slate-800 bg-transparent border-none focus:ring-0 focus:outline-none cursor-pointer text-base sm:text-lg w-full sm:w-auto"
          />
        </div>
        <div className="text-sm text-slate-500 bg-slate-50 px-3 py-1 rounded-full self-end sm:self-auto">
          Log for selected day
        </div>
      </div>

      {/* Tab navigation – touch‑friendly, scrollable on small screens */}
      <div className="flex justify-center mb-6 sm:mb-8 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="inline-flex p-1 bg-slate-100 rounded-2xl flex-nowrap gap-1">
          <button
            onClick={() => handleTabChange('device')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap touch-manipulation ${
              activeTab === 'device'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            📱 Device Time
          </button>
          <button
            onClick={() => handleTabChange('apps')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap touch-manipulation ${
              activeTab === 'apps'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            📱 App Usage
          </button>
          <button
            onClick={() => handleTabChange('analytics')}
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

      {/* Content area with Suspense and fallback skeleton */}
      <div className="mt-4 sm:mt-6">
        <Suspense fallback={<TabSkeleton />}>
          {activeTab === 'device' && <DeviceUsageLog selectedDate={selectedDate} onUpdate={() => {}} />}
          {activeTab === 'apps' && <AppUsageLog selectedDate={selectedDate} onUpdate={() => {}} />}
          {activeTab === 'analytics' && <UsageAnalytics />}
        </Suspense>
      </div>
    </PageLayout>
  );
});

DeviceUsageDashboard.displayName = 'DeviceUsageDashboard';
export default DeviceUsageDashboard;