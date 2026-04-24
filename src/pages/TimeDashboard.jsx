import React, { useState, useEffect } from 'react';
import api from '../services/api';
import PageLayout from '../components/PageLayout';
import PeopleManagement from '../components/PeopleManagement';
import DailyLog from '../components/DailyLog';
import TimeAnalytics from '../components/TimeAnalytics';
import LoadingSpinner from '../components/LoadingSpinner';

const TimeDashboard = () => {
  const [activeTab, setActiveTab] = useState('manage'); // 'manage', 'log', 'analytics'
  const [people, setPeople] = useState([]);
  const [loadingPeople, setLoadingPeople] = useState(true);

  useEffect(() => {
    fetchPeople();
  }, []);

  const fetchPeople = async () => {
    try {
      const res = await api.get('/time/people');
      setPeople(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPeople(false);
    }
  };

  const handleAddPerson = async (newPerson) => {
    try {
      const res = await api.post('/time/people', newPerson);
      setPeople([...people, res.data]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditPerson = async (id, newName) => {
    try {
      const res = await api.put(`/time/people/${id}`, { name: newName });
      setPeople(people.map(p => p._id === id ? res.data : p));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePerson = async (id) => {
    if (!window.confirm('Delete this person? All time entries will also be deleted.')) return;
    try {
      await api.delete(`/time/people/${id}`);
      setPeople(people.filter(p => p._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const refreshPeople = () => fetchPeople();

  // Show full‑page loading spinner while fetching people
  if (loadingPeople) {
    return <LoadingSpinner />;
  }

  return (
    <PageLayout title="Time with Loved Ones" subtitle="Track, manage, and analyze time spent with family and friends.">
      {/* Tab Navigation – responsive, scrollable on very small screens */}
      <div className="flex justify-center mb-6 sm:mb-8 overflow-x-auto pb-1">
        <div className="inline-flex p-1 bg-slate-100 rounded-2xl flex-nowrap">
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'manage'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            👥 My People
          </button>
          <button
            onClick={() => setActiveTab('log')}
            className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'log'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            📝 Daily Log
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

      {/* Tab Content – responsive spacing */}
      <div className="mt-4 sm:mt-6">
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
      </div>
    </PageLayout>
  );
};

export default TimeDashboard;