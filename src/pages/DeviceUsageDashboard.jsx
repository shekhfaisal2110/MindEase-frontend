import React, { useState } from 'react';
import PageLayout from '../components/PageLayout';
import DeviceUsageLog from '../components/DeviceUsageLog';
import AppUsageLog from '../components/AppUsageLog';
import UsageAnalytics from '../components/UsageAnalytics';
import LoadingSpinner from '../components/LoadingSpinner'; // Imported for consistency (used by lazy loading)

const DeviceUsageDashboard = () => {
  const [activeTab, setActiveTab] = useState('device'); // 'device', 'apps', 'analytics'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const refreshAll = () => {
    // Could be used to refresh data across components
  };

  // Note: This component does not have its own data fetching, so no internal loading state.
  // The lazy‑loaded chunk of this page will show LoadingSpinner via Suspense in App.js.
  // Child components (DeviceUsageLog, AppUsageLog, UsageAnalytics) handle their own loading states.

  return (
    <PageLayout title="Digital Wellbeing" subtitle="Track device & app usage to build healthier digital habits.">
      {/* Date Selector – responsive, wraps on small screens */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 sm:mb-8">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="font-bold text-slate-800 bg-transparent border-none focus:ring-0 focus:outline-none cursor-pointer text-base sm:text-lg"
          />
        </div>
        <div className="text-sm text-slate-500 bg-slate-50 px-3 py-1 rounded-full">
          Log for selected day
        </div>
      </div>

      {/* Tab Navigation – responsive, scrollable on very small screens */}
      <div className="flex justify-center mb-6 sm:mb-8 overflow-x-auto pb-1">
        <div className="inline-flex p-1 bg-slate-100 rounded-2xl flex-nowrap">
          <button
            onClick={() => setActiveTab('device')}
            className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'device'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            📱 Device Time
          </button>
          <button
            onClick={() => setActiveTab('apps')}
            className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'apps'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            📱 App Usage
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            📊 Analytics
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-4 sm:mt-6">
        {activeTab === 'device' && (
          <DeviceUsageLog selectedDate={selectedDate} onUpdate={refreshAll} />
        )}
        {activeTab === 'apps' && (
          <AppUsageLog selectedDate={selectedDate} onUpdate={refreshAll} />
        )}
        {activeTab === 'analytics' && <UsageAnalytics />}
      </div>
    </PageLayout>
  );
};

export default DeviceUsageDashboard;