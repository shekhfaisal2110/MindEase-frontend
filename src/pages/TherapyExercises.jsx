import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import api from '../services/api';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import TherapyCalendar from '../components/TherapyCalendar';

const TherapyExercises = () => {
  const [exercises, setExercises] = useState([]);
  const [type, setType] = useState('hotpotato');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [targetPeriod, setTargetPeriod] = useState('year');
  const [confettiTriggered, setConfettiTriggered] = useState(false);
  const [uniqueDays, setUniqueDays] = useState(0);

  const targetMap = { week: 55, month: 33, year: 11 };
  const targetCount = targetMap[targetPeriod];

  useEffect(() => {
    const recordPageView = async () => {
      try {
        const res = await api.post('/daily-activity/page-view', { pageName: 'therapy' });
        if (!res.data.alreadyRecorded) {
          await api.post('/activity/add', { actionType: 'pageView', points: 1 });
        }
      } catch (err) { console.error(err); }
    };
    recordPageView();
    fetchExercises();
    fetchStats();
  }, []);

  const fetchExercises = async () => {
    try {
      const res = await api.get('/therapy');
      setExercises(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/therapy/stats');
      setUniqueDays(res.data.uniqueDays);
    } catch (err) { console.error(err); }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 300,
      spread: 100,
      origin: { y: 0.6 },
      startVelocity: 25,
      colors: ["#2563eb", "#3b82f6", "#60a5fa", "#1d4ed8", "#f59e0b", "#10b981", "#ef4444"],
      decay: 0.9,
      gravity: 1,
    });
    confetti({
      particleCount: 150,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.5 },
      startVelocity: 30,
      colors: ["#8b5cf6", "#ec4899", "#06b6d4"],
    });
    confetti({
      particleCount: 150,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.5 },
      startVelocity: 30,
      colors: ["#f97316", "#84cc16", "#a855f7"],
    });
  };

  const addExercise = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      const res = await api.post('/therapy', { type, content });
      setExercises([res.data, ...exercises]);
      setContent('');
      await api.post('/activity/add', { actionType: 'growthHealing', points: 1 });
      console.log('✅ +1 point for adding a growth exercise');
    } catch (err) { console.error(err); }
  };

  const incrementRep = async (id) => {
    const exercise = exercises.find(ex => ex._id === id);
    if (!exercise) return;
    if (exercise.count >= targetCount) {
      alert(`This exercise has already reached the ${targetCount}‑rep goal.`);
      return;
    }
    try {
      const res = await api.post(`/therapy/increment/${id}`);
      const updated = res.data;
      setExercises(exercises.map(ex => ex._id === id ? updated : ex));
      // Check if all exercises have reached target
      const updatedExercises = exercises.map(ex => ex._id === id ? updated : ex);
      const allCompleted = updatedExercises.every(ex => ex.count >= targetCount);
      if (allCompleted && !confettiTriggered) {
        triggerConfetti();
        setConfettiTriggered(true);
      }
      // Refresh stats
      const statsRes = await api.get('/therapy/stats');
      setUniqueDays(statsRes.data.uniqueDays);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteExercise = async (id) => {
    if (!window.confirm('Delete this exercise? All repetitions will be lost.')) return;
    try {
      await api.delete(`/therapy/${id}`);
      setExercises(exercises.filter(ex => ex._id !== id));
      const statsRes = await api.get('/therapy/stats');
      setUniqueDays(statsRes.data.uniqueDays);
      setConfettiTriggered(false);
    } catch (err) { console.error(err); }
  };

  const getTypeStyles = (type) => {
    const styles = {
      hotpotato: "bg-amber-100 text-amber-700 border-amber-200",
      forgiveness: "bg-purple-100 text-purple-700 border-purple-200",
      selftalk: "bg-blue-100 text-blue-700 border-blue-200",
      receiving: "bg-emerald-100 text-emerald-700 border-emerald-200",
    };
    return styles[type] || "bg-gray-100 text-gray-700";
  };

  const getCreationDate = (exercise) => {
    const date = exercise.date || exercise.createdAt;
    if (!date) return null;
    return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const completedExercises = exercises.filter(ex => ex.count >= targetCount).length;
  const totalExercises = exercises.length;
  const progressPercent = totalExercises === 0 ? 0 : (completedExercises / totalExercises) * 100;
  const allCompleted = totalExercises > 0 && completedExercises === totalExercises;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-800 pb-12">
      <Navbar />
      
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        {/* Progress Header */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Therapy Challenge</h3>
              <p className="text-sm text-slate-500">Each exercise must be repeated {targetCount} times.</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={targetPeriod}
                onChange={(e) => setTargetPeriod(e.target.value)}
                className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-100 outline-none"
              >
                <option value="week">1 Week (55 reps each)</option>
                <option value="month">1 Month (33 reps each)</option>
                <option value="year">1 Year (11 reps each)</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <span className="text-2xl font-black text-indigo-600">{completedExercises}</span>
            <span className="text-sm text-slate-400">/ {totalExercises} exercises completed</span>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-700" style={{ width: `${progressPercent}%` }} />
          </div>
          {allCompleted && (
            <div className="mt-4 text-center text-emerald-600 font-bold">
              🎉 Congratulations! You've completed all exercises for the {targetPeriod} challenge! 🎉
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 bg-slate-100 rounded-2xl">
            <button
              onClick={() => setViewMode('list')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              📝 Exercises
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'calendar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              📅 Calendar
            </button>
          </div>
        </div>

        {viewMode === 'list' ? (
          <>
            {/* Hot Potato Card */}
            <section className="mb-12 relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-200 to-orange-200 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-amber-50 rounded-[2.5rem] p-6 md:p-8 border border-amber-100 shadow-sm">
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-2xl">🔥</span>
                  <h2 className="text-xl font-black text-amber-900">Hot Potato Exercise</h2>
                </div>
                <p className="text-amber-800 text-sm mb-6 leading-relaxed">
                  Repeat these phrases as many times as you like. Each click counts as one repetition.
                </p>
                <div className="grid sm:grid-cols-3 gap-3">
                  {['I am responsible for everything', 'I am sorry, please forgive me', 'Thank you, I love you'].map((phrase, i) => (
                    <div key={i} className="bg-white/60 backdrop-blur-sm p-3 rounded-2xl text-xs font-bold text-amber-900 border border-amber-200/50 shadow-sm">
                      "{phrase}"
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Add Exercise Form */}
            <section className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-6 md:p-8 border border-slate-100 mb-12">
              <form onSubmit={addExercise} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">
                    Exercise Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['hotpotato', 'forgiveness', 'selftalk', 'receiving'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        className={`py-2 px-1 text-[10px] font-black rounded-xl border-2 transition-all truncate uppercase tracking-tighter ${
                          type === t 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                          : 'border-slate-50 bg-slate-50 text-slate-400'
                        }`}
                      >
                        {t.replace('hotpotato', 'Potato')}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea 
                  placeholder="What are we focusing on today?" 
                  value={content} 
                  onChange={e => setContent(e.target.value)} 
                  className="w-full bg-slate-50 border-none rounded-2xl p-5 text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all min-h-[120px] shadow-inner" 
                  required 
                />

                <button type="submit" className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-black py-4 rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center space-x-2">
                  <span>Commit to Exercise</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                </button>
              </form>
            </section>

            {/* Exercises List */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-2">Active Practice</h2>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                  {uniqueDays} days active
                </span>
              </div>
              {exercises.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-medium">Ready to start? Add your first exercise above.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {exercises.map(ex => {
                    const creationDate = getCreationDate(ex);
                    const isCompleted = ex.count >= targetCount;
                    return (
                      <div key={ex._id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 group">
                        <div className="flex flex-col sm:flex-row justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center flex-wrap gap-2 mb-1">
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg border tracking-wider ${getTypeStyles(ex.type)}`}>
                                {ex.type}
                              </span>
                              {creationDate && (
                                <span className="text-[9px] text-slate-400 flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                  {creationDate}
                                </span>
                              )}
                              {isCompleted && (
                                <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                  Goal Met
                                </span>
                              )}
                            </div>
                            <p className="text-slate-700 font-medium leading-relaxed break-words">
                              {ex.content}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="flex items-center gap-1 bg-slate-50 rounded-full px-3 py-1">
                              <span className="text-lg font-bold text-indigo-600">{ex.count}</span>
                              <span className="text-xs text-slate-400">/ {targetCount}</span>
                            </div>
                            <button 
                              onClick={() => incrementRep(ex._id)} 
                              disabled={isCompleted}
                              className={`font-bold px-4 py-2 rounded-2xl transition flex items-center gap-1 ${
                                isCompleted
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-indigo-100 hover:bg-indigo-600 text-indigo-600 hover:text-white'
                              }`}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                              +1
                            </button>
                            <button 
                              onClick={() => deleteExercise(ex._id)} 
                              className="text-slate-300 hover:text-rose-500 transition p-1"
                              title="Delete exercise"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          <TherapyCalendar />
        )}
      </div>
    </div>
  );
};

export default TherapyExercises;