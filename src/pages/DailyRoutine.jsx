import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PageLayout from '../components/PageLayout';

const DailyRoutine = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);

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
    const updatedItems = [...routine.items];
    updatedItems[itemIndex].completed = completed;

    try {
      const response = await api.put(`/routine/${selectedDate}`, {
        items: updatedItems,
        mood: routine.mood,
        notes: routine.notes,
      });
      setRoutine(response.data);
    } catch (error) {
      console.error('Failed to update routine:', error);
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

  // Helper to get mood color
  const getMoodColor = (num) => {
    if (num <= 3) return 'bg-rose-100 text-rose-700 border-rose-200';
    if (num <= 7) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  };

  const completedCount = routine?.items.filter((i) => i.completed).length || 0;
  const totalCount = routine?.items.length || 0;
  const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <PageLayout 
      title="Daily Rituals" 
      subtitle="Small steps every day lead to big changes."
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        
        {/* Date Selector Card */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Selected Day</p>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="font-bold text-slate-800 bg-transparent border-none focus:ring-0 p-0 cursor-pointer"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() - 1);
                setSelectedDate(d.toISOString().split('T')[0]);
              }}
              className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button 
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="px-4 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
            >
              Today
            </button>
            <button 
              onClick={() => {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() + 1);
                setSelectedDate(d.toISOString().split('T')[0]);
              }}
              className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-12 flex flex-col items-center justify-center space-y-4">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
             <p className="text-slate-500 font-medium">Gathering your routine...</p>
          </div>
        ) : (
          <>
            {/* Mood Tracker Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                <span className="mr-3 text-2xl">💭</span>
                How are you feeling?
              </h2>
              
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    onClick={() => updateMood(num)}
                    className={`
                      aspect-square rounded-2xl font-bold transition-all duration-300 border-2
                      ${routine?.mood === num 
                        ? 'bg-indigo-600 border-indigo-600 text-white scale-110 shadow-lg shadow-indigo-100' 
                        : 'bg-slate-50 border-transparent text-slate-500 hover:border-indigo-200 hover:bg-indigo-50'
                      }
                    `}
                  >
                    {num}
                  </button>
                ))}
              </div>
              
              <div className="mt-6 flex items-center justify-between px-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Very Low</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Thriving</span>
              </div>
            </div>

            {/* Checklist Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-slate-800 flex items-center">
                  <span className="mr-3 text-2xl">✨</span>
                  Self-Care Rituals
                </h2>
                <div className="text-right">
                  <p className="text-2xl font-black text-indigo-600 leading-none">{completedCount}/{totalCount}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Done</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-slate-100 rounded-full mb-8 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700 ease-out"
                  style={{ width: `${completionRate}%` }}
                />
              </div>

              <div className="grid grid-cols-1 gap-3">
                {routine?.items.length > 0 ? routine.items.map((item, index) => (
                  <label
                    key={index}
                    className={`
                      group flex items-center p-4 rounded-2xl cursor-pointer transition-all duration-200 border-2
                      ${item.completed 
                        ? 'bg-slate-50/50 border-transparent' 
                        : 'bg-white border-slate-50 hover:border-indigo-100 hover:shadow-sm'
                      }
                    `}
                  >
                    <div className="relative flex items-center justify-center mr-4">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={(e) => updateRoutineItem(index, e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="w-6 h-6 border-2 border-slate-200 rounded-lg peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-all flex items-center justify-center">
                        <svg className={`w-4 h-4 text-white transition-transform ${item.completed ? 'scale-100' : 'scale-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                      </div>
                    </div>
                    
                    <span className={`flex-1 font-bold transition-all ${
                      item.completed ? 'text-slate-300 line-through' : 'text-slate-700'
                    }`}>
                      {item.name}
                    </span>

                    {item.completed && (
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-md">
                        Done
                      </span>
                    )}
                  </label>
                )) : (
                   <div className="py-10 text-center">
                      <p className="text-slate-400 font-medium">No rituals set for this day.</p>
                   </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
};

export default DailyRoutine;