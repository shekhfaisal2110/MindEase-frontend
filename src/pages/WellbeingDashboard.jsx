import React, { useState, useEffect } from 'react';
import api from '../services/api';
import PageLayout from '../components/PageLayout';
import WellbeingForm from '../components/WellbeingForm';
import WellbeingList from '../components/WellbeingList';
import StressThermometer from '../components/StressThermometer';

const WellbeingDashboard = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('happiness'); // 'happiness', 'stress', 'add'

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await api.get('/wellbeing');
      setActivities(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addActivity = async (data) => {
    try {
      const res = await api.post('/wellbeing', data);
      setActivities([res.data, ...activities]);
    } catch (err) {
      console.error(err);
    }
  };

  const updateActivity = async (id, updatedData) => {
    try {
      const res = await api.put(`/wellbeing/${id}`, updatedData);
      setActivities(activities.map(a => a._id === id ? res.data : a));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteActivity = async (id) => {
    if (!window.confirm('Delete this activity?')) return;
    try {
      await api.delete(`/wellbeing/${id}`);
      setActivities(activities.filter(a => a._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const happinessActivities = activities.filter(a => a.type === 'happiness');
  const stressReliefActivities = activities.filter(a => a.type === 'stress_relief');

  // Find highest stress reduction activity
  const highestStressRelief = stressReliefActivities.length > 0
    ? stressReliefActivities.reduce((max, a) => a.stressReductionPercent > max.stressReductionPercent ? a : max, stressReliefActivities[0])
    : null;

  if (loading) {
    return (
      <PageLayout title="Wellbeing Toolkit" subtitle="Discover what brings you joy and reduces stress.">
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Wellbeing Toolkit" subtitle="Discover what brings you joy and reduces stress.">
      {/* Stress Thermometer – responsive */}
      <div className="mb-6 sm:mb-8">
        {highestStressRelief && <StressThermometer highestActivity={highestStressRelief} />}
      </div>

      {/* Tab Navigation – responsive, scrollable on very small screens */}
      <div className="flex justify-center mb-6 sm:mb-8 overflow-x-auto pb-1">
        <div className="inline-flex p-1 bg-slate-100 rounded-2xl flex-nowrap">
          <button
            onClick={() => setActiveTab('add')}
            className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'add'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            ✨ Add New
          </button>
          <button
            onClick={() => setActiveTab('happiness')}
            className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'happiness'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            😊 Happiness
          </button>
          <button
            onClick={() => setActiveTab('stress')}
            className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'stress'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            🧘 Stress Relief
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-4 sm:mt-6">
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
      </div>

      {/* Inspiration Section – responsive padding */}
      <div className="mt-8 sm:mt-10 bg-blue-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-center text-xs sm:text-sm text-blue-700">
        💡 Tip: Adding activities that you truly enjoy or that help you relax can significantly improve your mental wellbeing. Revisit this list whenever you feel stressed!
      </div>
    </PageLayout>
  );
};

export default WellbeingDashboard;