import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PageLayout from '../components/PageLayout';
import LoadingSpinner from '../components/LoadingSpinner';

const DailyRoutine = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);

  // Record page view (growthHealing) using global daily-activity endpoint
  useEffect(() => {
    const recordPageView = async () => {
      try {
        const res = await api.post('/daily-activity/page-view', { pageName: 'growthHealing' });
        if (!res.data.alreadyRecorded) {
          await api.post('/activity/add', { actionType: 'growthHealing', points: 1 });
          console.log('✅ +1 point for visiting Growth & Healing');
        }
      } catch (err) {
        console.error('Failed to record page view:', err);
      }
    };
    recordPageView();
  }, []);

  useEffect(() => {
    fetchRoutine();
  }, [selectedDate]);

  const fetchRoutine = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/routine/${selectedDate}`);
      setRoutine(response.data);
    } catch (error) {
      console.error('Failed to fetch routine:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRoutineItem = async (itemIndex, completed) => {
    if (!routine) return;
    const wasCompleted = routine.items[itemIndex].completed;
    const taskName = routine.items[itemIndex].name;
    const shouldAddPoints = !wasCompleted && completed;

    const updatedItems = [...routine.items];
    updatedItems[itemIndex].completed = completed;

    try {
      const response = await api.put(`/routine/${selectedDate}`, {
        items: updatedItems,
        mood: routine.mood,
        notes: routine.notes,
      });
      setRoutine(response.data);

      if (shouldAddPoints) {
        // Check with backend if this routine item has already earned points today
        const checkRes = await api.post('/daily-activity/routine-item', { itemName: taskName });
        if (!checkRes.data.alreadyRecorded) {
          await api.post('/activity/add', { actionType: 'dailyTask', points: 3 });
          console.log(`✅ +3 points for completing ritual: ${taskName}`);
          alert(`✨ +3 points earned for completing "${taskName}"!`);
        } else {
          console.log(`⏭️ Points already awarded today for: ${taskName}`);
        }
      }
    } catch (error) {
      console.error('Failed to update routine:', error);
      alert('Failed to save progress. Please try again.');
    }
  };

  const updateMood = async (moodValue) => {
    if (!routine) return;
    try {
      const response = await api.put(`/routine/${selectedDate}`, {
        items: routine.items,
        mood: moodValue,
        notes: routine.notes,
      });
      setRoutine(response.data);
    } catch (error) {
      console.error('Failed to update mood:', error);
    }
  };

  const completedCount = routine?.items.filter((i) => i.completed).length || 0;
  const totalCount = routine?.items.length || 0;
  const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Show full‑screen loading spinner while fetching data
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <PageLayout title="Daily Rituals" subtitle="Small steps every day lead to big changes." maxWidth="max-w-3xl">
      <div className="space-y-6">
        {/* Date Selector */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Selected Day</p>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="font-bold text-slate-800 bg-transparent border-none focus:ring-0 p-0 cursor-pointer" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d.toISOString().split('T')[0]); }} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600">←</button>
            <button onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])} className="px-4 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100">Today</button>
            <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d.toISOString().split('T')[0]); }} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600">→</button>
          </div>
        </div>

        {/* Mood Tracker */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6">💭 How are you feeling?</h2>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-3">
            {[1,2,3,4,5,6,7,8,9,10].map(num => (
              <button key={num} onClick={() => updateMood(num)} className={`aspect-square rounded-2xl font-bold transition-all border-2 ${routine?.mood === num ? 'bg-indigo-600 border-indigo-600 text-white scale-110 shadow-lg' : 'bg-slate-50 border-transparent text-slate-500 hover:border-indigo-200'}`}>{num}</button>
            ))}
          </div>
          <div className="mt-6 flex justify-between px-2"><span className="text-xs font-bold text-slate-400">Very Low</span><span className="text-xs font-bold text-slate-400">Thriving</span></div>
        </div>

        {/* Checklist */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-slate-800">✨ Self-Care Rituals</h2>
            <div className="text-right"><p className="text-2xl font-black text-indigo-600">{completedCount}/{totalCount}</p><p className="text-[10px] font-bold text-slate-400 uppercase">Done</p></div>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full mb-8 overflow-hidden"><div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700" style={{ width: `${completionRate}%` }} /></div>
          <div className="space-y-3">
            {routine?.items.map((item, idx) => (
              <label key={idx} className={`flex items-center p-4 rounded-2xl cursor-pointer transition border-2 ${item.completed ? 'bg-slate-50/50 border-transparent' : 'bg-white border-slate-50 hover:border-indigo-100'}`}>
                <input type="checkbox" checked={item.completed} onChange={(e) => updateRoutineItem(idx, e.target.checked)} className="hidden" />
                <div className="w-6 h-6 border-2 border-slate-200 rounded-lg flex items-center justify-center mr-4">
                  {item.completed && <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                </div>
                <span className={`flex-1 font-bold ${item.completed ? 'text-slate-300 line-through' : 'text-slate-700'}`}>{item.name}</span>
                {item.completed && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Done</span>}
              </label>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default DailyRoutine;