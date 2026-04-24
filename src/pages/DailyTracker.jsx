import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import api from '../services/api';
import PageLayout from '../components/PageLayout';
import LoadingSpinner from '../components/LoadingSpinner';

const DailyTracker = () => {
  const [track, setTrack] = useState({
    silenceCompleted: false, affirmationCompleted: false, happinessCompleted: false,
    exerciseCompleted: false, readingCompleted: false, journalingCompleted: false,
    affirmationText: '', journalingText: '', notes: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [calendarData, setCalendarData] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('today');
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [confettiTriggered, setConfettiTriggered] = useState(false);

  // Record page view once per day
  useEffect(() => {
    const recordPageView = async () => {
      try {
        const res = await api.post('/daily-activity/page-view', { pageName: 'dailytracker' });
        if (!res.data.alreadyRecorded) {
          await api.post('/activity/add', { actionType: 'pageView', points: 1 });
        }
      } catch (err) { console.error(err); }
    };
    recordPageView();
    fetchToday();
    fetchAllTracks();
  }, []);

  useEffect(() => { if (viewMode === 'today') fetchDateTrack(selectedDate); }, [selectedDate]);

  const fetchToday = async () => {
    try { const res = await api.get('/dailytrack/today'); if(res.data) setTrack(res.data); } 
    catch(err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchAllTracks = async () => {
    try { 
      const res = await api.get('/dailytrack/all'); 
      const map = {}; 
      res.data.forEach(t => { map[t.date.split('T')[0]] = t; }); 
      setCalendarData(map); 
    } catch(err) { console.error(err); }
  };

  const fetchDateTrack = async (dateStr) => {
    setLoading(true);
    try {
      const res = await api.get(`/dailytrack/date/${dateStr}`);
      setTrack(res.data || { 
        silenceCompleted: false, affirmationCompleted: false, happinessCompleted: false, 
        exerciseCompleted: false, readingCompleted: false, journalingCompleted: false, 
        affirmationText: '', journalingText: '', notes: '' 
      });
      setConfettiTriggered(false);
    } catch(err) { console.error(err); }
    finally { setLoading(false); }
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

  const handleCheckboxChange = async (key, checked) => {
    const wasCompleted = track[key];
    const taskName = activities.find(a => a.key === key)?.label || key;
    const shouldAddPoints = !wasCompleted && checked;

    setTrack(prev => ({ ...prev, [key]: checked }));

    const newCompletedCount = activities.filter(a => 
      (a.key === key ? checked : track[a.key])
    ).length;
    const allTasksCompleted = newCompletedCount === activities.length;

    if (allTasksCompleted && !confettiTriggered) {
      triggerConfetti();
      setConfettiTriggered(true);
    }

    if (shouldAddPoints) {
      try {
        const checkRes = await api.post('/daily-activity/routine-item', { itemName: taskName });
        if (!checkRes.data.alreadyRecorded) {
          await api.post('/activity/add', { actionType: 'dailyTask', points: 3 });
          console.log(`✅ +3 points for completing: ${taskName}`);
        } else {
          console.log(`⏩ Points already awarded today for: ${taskName}`);
        }
      } catch (err) {
        console.error('Failed to add activity points:', err);
      }
    }
  };

  const saveTracking = async () => {
    setSaving(true);
    try {
      await api.put(`/dailytrack/date/${selectedDate}`, track);
      fetchAllTracks();
      alert('Progress saved successfully!');
    } catch(err) { alert('Failed to save'); }
    finally { setSaving(false); }
  };

  const activities = [
    { key: 'silenceCompleted', label: '🧘 Silence', target: '5 min', color: 'indigo' },
    { key: 'affirmationCompleted', label: '💬 Affirmation', target: '5 min', color: 'purple' },
    { key: 'happinessCompleted', label: '😊 Happiness', target: '5 min', color: 'amber' },
    { key: 'exerciseCompleted', label: '🏃 Exercise', target: '20 min', color: 'emerald' },
    { key: 'readingCompleted', label: '📖 Reading', target: '20 min', color: 'blue' },
    { key: 'journalingCompleted', label: '✍️ Journaling', target: '5 min', color: 'rose' },
  ];

  const completedCount = activities.filter(a => track[a.key]).length;
  const progressPercent = (completedCount / activities.length) * 100;

  const getDaysInMonth = (y,m) => new Date(y,m+1,0).getDate();
  const getFirstDay = (y,m) => new Date(y,m,1).getDay();

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDay(currentYear, currentMonth);
    const todayStr = new Date().toISOString().split('T')[0];
    let days = [];

    for (let i=0; i<firstDay; i++) days.push(<div key={`e-${i}`} className="aspect-square"></div>);
    for (let d=1; d<=daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const t = calendarData[dateStr];
      const itemsDone = t ? activities.filter(a => t[a.key]).length : 0;
      const allDone = itemsDone === activities.length;
      const isToday = dateStr === todayStr;
      const isSelected = dateStr === selectedDate;

      days.push(
        <button 
          key={dateStr} 
          onClick={() => { setSelectedDate(dateStr); setViewMode('today'); }} 
          className={`relative aspect-square flex flex-col items-center justify-center rounded-2xl transition-all duration-300 group
            ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}
            ${allDone ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border border-slate-100 hover:border-indigo-200'}
          `}
        >
          <span className={`text-sm font-bold ${allDone ? 'text-white' : 'text-slate-700'}`}>{d}</span>
          {itemsDone > 0 && !allDone && (
            <div className="flex gap-0.5 mt-1">
              {[...Array(itemsDone)].map((_, i) => <div key={i} className="w-1 h-1 rounded-full bg-indigo-400" />)}
            </div>
          )}
          {isToday && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full" />}
        </button>
      );
    }
    return days;
  };

  // Show loading spinner while initial data is being fetched
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <PageLayout title="Daily Growth" subtitle="Track your 6 core habits for a balanced mind.">
      <div className="flex p-1 bg-slate-100 rounded-2xl mb-8 max-w-xs mx-auto">
        <button 
          onClick={() => setViewMode('today')} 
          className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${viewMode==='today' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Today
        </button>
        <button 
          onClick={() => setViewMode('calendar')} 
          className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${viewMode==='calendar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Insights
        </button>
      </div>

      {viewMode === 'calendar' ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 animate-in fade-in zoom-in-95">
          <div className="flex justify-between items-center mb-8">
            <button className="p-2 hover:bg-slate-50 rounded-lg" onClick={() => { let nm = currentMonth-1; if(nm<0){ setCurrentMonth(11); setCurrentYear(cy=>cy-1); } else setCurrentMonth(nm); }}>&larr;</button>
            <h2 className="text-lg font-black text-slate-800">{new Date(currentYear, currentMonth).toLocaleString('default',{month:'long',year:'numeric'})}</h2>
            <button className="p-2 hover:bg-slate-50 rounded-lg" onClick={() => { let nm = currentMonth+1; if(nm>11){ setCurrentMonth(0); setCurrentYear(cy=>cy+1); } else setCurrentMonth(nm); }}>&rarr;</button>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center mb-4">
            {['S','M','T','W','T','F','S'].map(d=> <div key={d} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-3">{renderCalendar()}</div>
          <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-center space-x-4">
            <div className="flex items-center text-xs text-slate-500"><div className="w-3 h-3 bg-indigo-600 rounded-sm mr-2" /> All Done</div>
            <div className="flex items-center text-xs text-slate-500"><div className="w-3 h-3 bg-indigo-100 rounded-sm mr-2" /> Partial</div>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4">
          {/* Main Progress Header */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 overflow-hidden relative">
            <div className="relative z-10 flex justify-between items-end">
              <div>
                <p className="text-xs font-black text-indigo-500 uppercase tracking-wider mb-1">Today's Completion</p>
                <h3 className="text-3xl font-black text-slate-800">{completedCount}<span className="text-slate-300">/{activities.length}</span></h3>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-slate-400">{Math.round(progressPercent)}%</span>
              </div>
            </div>
            <div className="mt-4 w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-1000" style={{width:`${progressPercent}%`}} />
            </div>
          </div>

          {/* Activity Cards */}
          <div className="space-y-3">
            {activities.map(act => (
              <div key={act.key} className={`bg-white rounded-2xl border-2 transition-all duration-300 ${track[act.key] ? 'border-transparent bg-slate-50/50' : 'border-slate-50 hover:border-indigo-100 shadow-sm'}`}>
                <div className="p-4">
                  <label className="flex items-center cursor-pointer">
                    <div className="relative flex items-center justify-center mr-4">
                      <input 
                        type="checkbox" 
                        checked={track[act.key]} 
                        onChange={e => handleCheckboxChange(act.key, e.target.checked)} 
                        className="peer sr-only" 
                      />
                      <div className="w-6 h-6 border-2 border-slate-200 rounded-lg transition-all peer-checked:bg-indigo-600 peer-checked:border-indigo-600 flex items-center justify-center">
                        <svg className={`w-4 h-4 text-white transition-transform ${track[act.key] ? 'scale-100' : 'scale-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                      </div>
                    </div>
                    <div className="flex-grow">
                      <span className={`font-bold block ${track[act.key] ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{act.label}</span>
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{act.target} goal</span>
                    </div>
                  </label>
                  
                  {act.key === 'affirmationCompleted' && track.affirmationCompleted && (
                    <div className="mt-4 animate-in slide-in-from-top-2">
                      <textarea 
                        value={track.affirmationText} 
                        onChange={e => setTrack({...track, affirmationText: e.target.value})} 
                        placeholder="Speak it into existence..." 
                        className="w-full p-4 bg-white border border-indigo-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none" 
                        rows="2" 
                      />
                    </div>
                  )}
                  {act.key === 'journalingCompleted' && track.journalingCompleted && (
                    <div className="mt-4 animate-in slide-in-from-top-2">
                      <textarea 
                        value={track.journalingText} 
                        onChange={e => setTrack({...track, journalingText: e.target.value})} 
                        placeholder="What's on your mind?" 
                        className="w-full p-4 bg-white border border-indigo-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none" 
                        rows="4" 
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center">
              <span className="mr-2">📝</span> Daily Reflections
            </h4>
            <textarea 
              value={track.notes} 
              onChange={e => setTrack({...track, notes: e.target.value})} 
              placeholder="Any other thoughts on today?" 
              rows="3" 
              className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none" 
            />
          </div>

          <div className="sticky bottom-6 left-0 right-0 py-4 px-2">
            <button 
              onClick={saveTracking} 
              disabled={saving} 
              className={`w-full py-4 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95 flex items-center justify-center space-x-2
                ${saving ? 'bg-slate-400' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}
              `}
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  <span>Sync Progress</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default DailyTracker;