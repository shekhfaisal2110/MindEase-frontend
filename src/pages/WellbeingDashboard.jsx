// import React, { useState, useEffect } from 'react';
// import api from '../services/api';
// import PageLayout from '../components/PageLayout';
// import WellbeingForm from '../components/WellbeingForm';
// import WellbeingList from '../components/WellbeingList';
// import StressThermometer from '../components/StressThermometer';

// const WellbeingDashboard = () => {
//   const [activities, setActivities] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState('happiness'); // 'happiness', 'stress', 'add'

//   useEffect(() => {
//     fetchActivities();
//   }, []);

//   const fetchActivities = async () => {
//     try {
//       const res = await api.get('/wellbeing');
//       setActivities(res.data);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const addActivity = async (data) => {
//     try {
//       const res = await api.post('/wellbeing', data);
//       setActivities([res.data, ...activities]);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const updateActivity = async (id, updatedData) => {
//     try {
//       const res = await api.put(`/wellbeing/${id}`, updatedData);
//       setActivities(activities.map(a => a._id === id ? res.data : a));
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const deleteActivity = async (id) => {
//     if (!window.confirm('Delete this activity?')) return;
//     try {
//       await api.delete(`/wellbeing/${id}`);
//       setActivities(activities.filter(a => a._id !== id));
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const happinessActivities = activities.filter(a => a.type === 'happiness');
//   const stressReliefActivities = activities.filter(a => a.type === 'stress_relief');

//   // Find highest stress reduction activity
//   const highestStressRelief = stressReliefActivities.length > 0
//     ? stressReliefActivities.reduce((max, a) => a.stressReductionPercent > max.stressReductionPercent ? a : max, stressReliefActivities[0])
//     : null;

//   if (loading) {
//     return (
//       <PageLayout title="Wellbeing Toolkit" subtitle="Discover what brings you joy and reduces stress.">
//         <div className="flex justify-center py-20">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
//         </div>
//       </PageLayout>
//     );
//   }

//   return (
//     <PageLayout title="Wellbeing Toolkit" subtitle="Discover what brings you joy and reduces stress.">
//       {/* Stress Thermometer – responsive */}
//       <div className="mb-6 sm:mb-8">
//         {highestStressRelief && <StressThermometer highestActivity={highestStressRelief} />}
//       </div>

//       {/* Tab Navigation – responsive, scrollable on very small screens */}
//       <div className="flex justify-center mb-6 sm:mb-8 overflow-x-auto pb-1">
//         <div className="inline-flex p-1 bg-slate-100 rounded-2xl flex-nowrap">
//           <button
//             onClick={() => setActiveTab('add')}
//             className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
//               activeTab === 'add'
//                 ? 'bg-white text-indigo-600 shadow-sm'
//                 : 'text-slate-500 hover:text-slate-700'
//             }`}
//           >
//             ✨ Add New
//           </button>
//           <button
//             onClick={() => setActiveTab('happiness')}
//             className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
//               activeTab === 'happiness'
//                 ? 'bg-white text-indigo-600 shadow-sm'
//                 : 'text-slate-500 hover:text-slate-700'
//             }`}
//           >
//             😊 Happiness
//           </button>
//           <button
//             onClick={() => setActiveTab('stress')}
//             className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
//               activeTab === 'stress'
//                 ? 'bg-white text-indigo-600 shadow-sm'
//                 : 'text-slate-500 hover:text-slate-700'
//             }`}
//           >
//             🧘 Stress Relief
//           </button>
//         </div>
//       </div>

//       {/* Tab Content */}
//       <div className="mt-4 sm:mt-6">
//         {activeTab === 'add' && <WellbeingForm onSave={addActivity} />}
//         {activeTab === 'happiness' && (
//           <WellbeingList
//             title="Happiness Activities"
//             icon="😊"
//             activities={happinessActivities}
//             onEdit={updateActivity}
//             onDelete={deleteActivity}
//             showPercent={false}
//           />
//         )}
//         {activeTab === 'stress' && (
//           <WellbeingList
//             title="Stress Relief Activities"
//             icon="🧘"
//             activities={stressReliefActivities}
//             onEdit={updateActivity}
//             onDelete={deleteActivity}
//             showPercent={true}
//           />
//         )}
//       </div>

//       {/* Inspiration Section – responsive padding */}
//       <div className="mt-8 sm:mt-10 bg-blue-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-center text-xs sm:text-sm text-blue-700">
//         💡 Tip: Adding activities that you truly enjoy or that help you relax can significantly improve your mental wellbeing. Revisit this list whenever you feel stressed!
//       </div>
//     </PageLayout>
//   );
// };

// export default WellbeingDashboard;









// src/pages/WellbeingDashboard.jsx
import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import api from '../services/api';
import PageLayout from '../components/PageLayout';

// Lazy load subcomponents – reduce initial bundle
const WellbeingForm = lazy(() => import('../components/WellbeingForm'));
const WellbeingList = lazy(() => import('../components/WellbeingList'));
const StressThermometer = lazy(() => import('../components/StressThermometer'));

// Skeleton components – instant visual feedback
const ListSkeleton = () => (
  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 animate-pulse">
    <div className="h-6 bg-slate-200 rounded w-48 mb-4" />
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-4 bg-slate-50 rounded-xl">
          <div className="flex justify-between"><div className="h-5 bg-slate-200 rounded w-32" /><div className="w-16 h-8 bg-slate-200 rounded" /></div>
          <div className="h-4 bg-slate-200 rounded w-3/4 mt-2" />
        </div>
      ))}
    </div>
  </div>
);

const ThermometerSkeleton = () => (
  <div className="bg-gradient-to-r from-amber-50 to-rose-50 rounded-3xl border border-amber-100 shadow-md overflow-hidden animate-pulse">
    <div className="p-6"><div className="h-6 bg-amber-200 rounded w-48 mb-3" /><div className="h-8 bg-amber-100 rounded w-40 mx-auto" /></div>
  </div>
);

const FormSkeleton = () => (
  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 animate-pulse">
    <div className="h-6 bg-slate-200 rounded w-40 mb-4" />
    <div className="space-y-4">
      <div><div className="h-4 bg-slate-200 rounded w-24 mb-1" /><div className="h-12 bg-slate-100 rounded-xl" /></div>
      <div><div className="h-4 bg-slate-200 rounded w-16 mb-1" /><div className="h-12 bg-slate-100 rounded-xl" /></div>
      <div><div className="h-4 bg-slate-200 rounded w-24 mb-1" /><div className="h-4 bg-slate-100 rounded w-full" /></div>
      <div className="h-12 bg-slate-200 rounded-xl" />
    </div>
  </div>
);

const WellbeingDashboard = React.memo(() => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('happiness');

  const fetchActivities = useCallback(async () => {
    try {
      const res = await api.get('/wellbeing');
      setActivities(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const addActivity = useCallback(async (data) => {
    try {
      const res = await api.post('/wellbeing', data);
      setActivities(prev => [res.data, ...prev]);
    } catch (err) { console.error(err); }
  }, []);

  const updateActivity = useCallback(async (id, updatedData) => {
    try {
      const res = await api.put(`/wellbeing/${id}`, updatedData);
      setActivities(prev => prev.map(a => a._id === id ? res.data : a));
    } catch (err) { console.error(err); }
  }, []);

  const deleteActivity = useCallback(async (id) => {
    if (!window.confirm('Delete this activity?')) return;
    try {
      await api.delete(`/wellbeing/${id}`);
      setActivities(prev => prev.filter(a => a._id !== id));
    } catch (err) { console.error(err); }
  }, []);

  // Memoized filtered lists
  const happinessActivities = useMemo(() => activities.filter(a => a.type === 'happiness'), [activities]);
  const stressReliefActivities = useMemo(() => activities.filter(a => a.type === 'stress_relief'), [activities]);

  const highestStressRelief = useMemo(() => {
    if (stressReliefActivities.length === 0) return null;
    return stressReliefActivities.reduce((max, a) => a.stressReductionPercent > max.stressReductionPercent ? a : max, stressReliefActivities[0]);
  }, [stressReliefActivities]);

  // Show skeleton while loading initial data
  if (loading) {
    return (
      <PageLayout title="Wellbeing Toolkit" subtitle="Discover what brings you joy and reduces stress.">
        <div className="mb-6 sm:mb-8"><ThermometerSkeleton /></div>
        <div className="flex justify-center mb-6 sm:mb-8 overflow-x-auto pb-1">
          <div className="inline-flex p-1 bg-slate-100 rounded-2xl flex-nowrap animate-pulse gap-1">
            <div className="px-4 py-2 rounded-xl w-24 h-10 bg-slate-200" />
            <div className="px-4 py-2 rounded-xl w-28 h-10 bg-slate-200" />
            <div className="px-4 py-2 rounded-xl w-28 h-10 bg-slate-200" />
          </div>
        </div>
        <div className="mt-4 sm:mt-6">
          {activeTab === 'add' && <FormSkeleton />}
          {(activeTab === 'happiness' || activeTab === 'stress') && <ListSkeleton />}
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Wellbeing Toolkit" subtitle="Discover what brings you joy and reduces stress.">
      {/* Stress Thermometer – lazy loaded */}
      <div className="mb-6 sm:mb-8">
        <Suspense fallback={<ThermometerSkeleton />}>
          {highestStressRelief && <StressThermometer highestActivity={highestStressRelief} />}
        </Suspense>
      </div>

      {/* Tab Navigation – responsive, touch‑friendly */}
      <div className="flex justify-center mb-6 sm:mb-8 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="inline-flex p-1 bg-slate-100 rounded-2xl flex-nowrap gap-1">
          <button
            onClick={() => setActiveTab('add')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap touch-manipulation ${
              activeTab === 'add'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            ✨ Add New
          </button>
          <button
            onClick={() => setActiveTab('happiness')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap touch-manipulation ${
              activeTab === 'happiness'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            😊 Happiness
          </button>
          <button
            onClick={() => setActiveTab('stress')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap touch-manipulation ${
              activeTab === 'stress'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            🧘 Stress Relief
          </button>
        </div>
      </div>

      {/* Lazy‑loaded tab content with Suspense fallback */}
      <div className="mt-4 sm:mt-6">
        <Suspense fallback={activeTab === 'add' ? <FormSkeleton /> : <ListSkeleton />}>
          {activeTab === 'add' && <WellbeingForm onSave={addActivity} />}
          {activeTab === 'happiness' && (
            <WellbeingList
              title="Happiness Activities"
              icon="😊"
              activities={happinessActivities}
              onEdit={updateActivity}
              onDelete={deleteActivity}
              showPercent={false}
            />
          )}
          {activeTab === 'stress' && (
            <WellbeingList
              title="Stress Relief Activities"
              icon="🧘"
              activities={stressReliefActivities}
              onEdit={updateActivity}
              onDelete={deleteActivity}
              showPercent={true}
            />
          )}
        </Suspense>
      </div>

      {/* Inspiration Section – responsive */}
      <div className="mt-8 sm:mt-10 bg-blue-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-center text-xs sm:text-sm text-blue-700">
        💡 Tip: Adding activities that you truly enjoy or that help you relax can significantly improve your mental wellbeing. Revisit this list whenever you feel stressed!
      </div>
    </PageLayout>
  );
});

WellbeingDashboard.displayName = 'WellbeingDashboard';
export default WellbeingDashboard;