import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';

// Lazy load canvas-confetti – reduces initial bundle by ~30KB
let confettiModule = null;
const loadConfetti = () => import('canvas-confetti').then(mod => { confettiModule = mod.default; return mod.default; });

const triggerReactConfetti = () => {
  if (!confettiModule) return;
  confettiModule({
    particleCount: 300, spread: 120, origin: { y: 0.6 }, startVelocity: 30,
    colors: ["#ef4444", "#f97316", "#f59e0b", "#dc2626", "#ea580c"], decay: 0.9, gravity: 1,
  });
  confettiModule({ particleCount: 180, angle: 60, spread: 60, origin: { x: 0, y: 0.5 }, startVelocity: 35, colors: ["#ef4444", "#f97316", "#f59e0b"] });
  confettiModule({ particleCount: 180, angle: 120, spread: 60, origin: { x: 1, y: 0.5 }, startVelocity: 35, colors: ["#ef4444", "#f97316", "#f59e0b"] });
};

const triggerResponseConfetti = () => {
  if (!confettiModule) return;
  confettiModule({
    particleCount: 250, spread: 80, origin: { y: 0.6 }, startVelocity: 20,
    colors: ["#10b981", "#3b82f6", "#8b5cf6", "#34d399", "#60a5fa"], decay: 0.9, gravity: 0.8,
  });
  confettiModule({ particleCount: 120, angle: 60, spread: 45, origin: { x: 0, y: 0.5 }, startVelocity: 25, colors: ["#10b981", "#3b82f6", "#8b5cf6"] });
  confettiModule({ particleCount: 120, angle: 120, spread: 45, origin: { x: 1, y: 0.5 }, startVelocity: 25, colors: ["#10b981", "#3b82f6", "#8b5cf6"] });
};

// --- Skeleton components for instant perceived loading ---
const ListSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] p-6 h-32" />
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 md:p-8 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-slate-100 h-20" />
        <div className="p-4 rounded-2xl bg-slate-100 h-20" />
      </div>
      <div className="space-y-4">
        <div className="h-4 bg-slate-200 rounded w-32" />
        <div className="h-12 bg-slate-100 rounded-xl" />
        <div className="h-4 bg-slate-200 rounded w-32" />
        <div className="h-24 bg-slate-100 rounded-xl" />
      </div>
      <div className="h-12 bg-slate-200 rounded-2xl" />
    </div>
    <div className="space-y-4">
      <div className="h-6 bg-slate-200 rounded w-40 ml-2" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-[2rem] p-5 flex items-start gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between"><div className="h-3 bg-slate-200 rounded w-16" /><div className="h-3 bg-slate-200 rounded w-20" /></div>
            <div className="h-5 bg-slate-200 rounded w-3/4" />
            <div className="h-4 bg-slate-200 rounded w-full" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const CalendarSkeleton = () => (
  <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-6 md:p-10 animate-pulse">
    <div className="flex justify-between items-center mb-8">
      <div className="w-10 h-10 bg-slate-200 rounded-full" />
      <div className="h-6 bg-slate-200 rounded w-40" />
      <div className="w-10 h-10 bg-slate-200 rounded-full" />
    </div>
    <div className="grid grid-cols-7 gap-3 mb-4">
      {[...Array(7)].map((_, i) => <div key={i} className="h-4 bg-slate-200 rounded" />)}
    </div>
    <div className="grid grid-cols-7 gap-3">
      {[...Array(35)].map((_, i) => <div key={i} className="aspect-square bg-slate-100 rounded-2xl" />)}
    </div>
  </div>
);

const ReactResponse = React.memo(() => {
  const [entries, setEntries] = useState([]);
  const [monthlyData, setMonthlyData] = useState({});
  const [viewMode, setViewMode] = useState('log');
  const [form, setForm] = useState({ choice: 'response', situation: '', outcome: '' });
  const [loading, setLoading] = useState(true);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());

  // Record page view (non‑blocking)
  useEffect(() => {
    const recordPageView = async () => {
      try {
        const res = await api.post('/daily-activity/page-view', { pageName: 'reactResponse' });
        if (!res.data.alreadyRecorded) await api.post('/activity/add', { actionType: 'pageView', points: 1 });
      } catch (err) { console.error(err); }
    };
    recordPageView();
    fetchEntries();
    fetchMonthlySummary(currentYear, currentMonth);
  }, []);

  useEffect(() => {
    if (viewMode === 'calendar') fetchMonthlySummary(currentYear, currentMonth);
  }, [currentYear, currentMonth, viewMode]);

  const fetchEntries = useCallback(async () => {
    try {
      const res = await api.get('/react-response');
      const entriesArray = res.data.entries || res.data;
      setEntries(entriesArray);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  const fetchMonthlySummary = useCallback(async (year, month) => {
    setCalendarLoading(true);
    try {
      const res = await api.get(`/react-response/month/${year}/${month + 1}`);
      setMonthlyData(res.data);
    } catch (err) { console.error(err); }
    finally { setCalendarLoading(false); }
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/react-response', form);
      setEntries(prev => [res.data, ...prev]);
      setForm({ choice: 'response', situation: '', outcome: '' });
      await fetchMonthlySummary(currentYear, currentMonth);
      await api.post('/activity/add', { actionType: 'reactResponse', points: 5 });

      if (!confettiModule) await loadConfetti();
      if (form.choice === 'react') triggerReactConfetti();
      else triggerResponseConfetti();
    } catch (err) {
      alert('Failed to save');
    }
  }, [form, currentYear, currentMonth, fetchMonthlySummary]);

  const deleteEntry = useCallback(async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await api.delete(`/react-response/${id}`);
      setEntries(prev => prev.filter(e => e._id !== id));
      await fetchMonthlySummary(currentYear, currentMonth);
    } catch (err) { console.error(err); }
  }, [currentYear, currentMonth, fetchMonthlySummary]);

  const changeMonth = useCallback((delta) => {
    setCurrentMonth(prev => {
      let newMonth = prev + delta;
      let newYear = currentYear;
      if (newMonth < 0) { newMonth = 11; newYear--; }
      else if (newMonth > 11) { newMonth = 0; newYear++; }
      setCurrentYear(newYear);
      return newMonth;
    });
  }, [currentYear]);

  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setViewMode('calendar');
  }, []);

  const renderCalendar = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const todayStr = new Date().toISOString().split('T')[0];
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayData = monthlyData[dateStr];
      const isToday = dateStr === todayStr;

      let statusColor = "bg-slate-50 text-slate-400";
      let indicator = null;

      if (dayData) {
        if (dayData.response > dayData.react) {
          statusColor = "bg-emerald-100 text-emerald-700 font-bold";
          indicator = "✓";
        } else if (dayData.react > dayData.response) {
          statusColor = "bg-rose-100 text-rose-700 font-bold";
          indicator = "!";
        } else if (dayData.react > 0 || dayData.response > 0) {
          statusColor = "bg-amber-100 text-amber-700 font-bold";
          indicator = "•";
        }
      }

      days.push(
        <div
          key={dateStr}
          className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all hover:scale-105 border border-transparent touch-manipulation ${statusColor} ${isToday ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
        >
          <span className="text-sm">{d}</span>
          {indicator && <span className="text-[10px] mt-0.5">{indicator}</span>}
        </div>
      );
    }
    return days;
  }, [currentYear, currentMonth, monthlyData]);

  if (loading && viewMode === 'log') return <ListSkeleton />;
  if (loading && viewMode === 'calendar') return <CalendarSkeleton />;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Mindful Awareness</h1>
            <p className="text-slate-500 text-sm sm:text-base font-medium">Choosing the path of Response over Reaction.</p>
          </div>
          <div className="inline-flex p-1 bg-slate-200/50 rounded-2xl">
            {['log', 'calendar'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 sm:px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all touch-manipulation ${
                  viewMode === mode ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {viewMode === 'calendar' ? (
          <div className="bg-white rounded-2xl sm:rounded-[2.5rem] shadow-sm border border-slate-100 p-5 sm:p-6 md:p-10 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6 sm:mb-8 flex-wrap gap-2">
              <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-50 rounded-full transition-colors active:scale-95 touch-manipulation">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <div className="flex items-center gap-3">
                <h2 className="text-base sm:text-xl font-black text-slate-800">
                  {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
                <button onClick={goToToday} className="px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 active:scale-95">Today</button>
              </div>
              <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-50 rounded-full transition-colors active:scale-95 touch-manipulation">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-3 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">{day}</div>
              ))}
            </div>
            {calendarLoading ? (
              <div className="grid grid-cols-7 gap-2">
                {[...Array(35)].map((_, i) => <div key={i} className="aspect-square bg-slate-100 rounded-2xl animate-pulse" />)}
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-2 sm:gap-3">{renderCalendar}</div>
            )}
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* Zen Tip Card – responsive */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl sm:rounded-[2rem] p-5 sm:p-6 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-base sm:text-lg font-bold mb-2 flex items-center">
                  <span className="mr-2">💡</span> The "Golden Pause"
                </h3>
                <p className="text-indigo-50 text-xs sm:text-sm leading-relaxed max-w-2xl">
                  <strong>Reaction</strong> is a reflex—fast and impulsive. <strong>Response</strong> is a choice—it creates a space between trigger and action. Try to find that space today.
                </p>
              </div>
            </div>

            {/* Form Section */}
            <div className="bg-white rounded-2xl sm:rounded-[2rem] shadow-sm border border-slate-100 p-5 sm:p-6 md:p-8">
              <h2 className="text-lg sm:text-xl font-black text-slate-800 mb-5 sm:mb-6">Log an Angry Moment</h2>
              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, choice: 'react' }))}
                    className={`p-3 sm:p-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 sm:gap-3 font-bold touch-manipulation ${
                      form.choice === 'react' ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-50 bg-slate-50 text-slate-400'
                    }`}
                  >
                    <span className="text-lg sm:text-xl">😠</span>
                    <span className="text-sm sm:text-base">I Reacted</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, choice: 'response' }))}
                    className={`p-3 sm:p-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 sm:gap-3 font-bold touch-manipulation ${
                      form.choice === 'response' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-50 bg-slate-50 text-slate-400'
                    }`}
                  >
                    <span className="text-lg sm:text-xl">🧘</span>
                    <span className="text-sm sm:text-base">I Responded</span>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Trigger / Situation</label>
                    <input
                      type="text"
                      value={form.situation}
                      onChange={(e) => setForm(prev => ({ ...prev, situation: e.target.value }))}
                      className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-100 outline-none transition-all font-medium text-slate-700 text-sm sm:text-base touch-manipulation"
                      placeholder="What triggered the spark?"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Outcome / Feelings</label>
                    <textarea
                      value={form.outcome}
                      onChange={(e) => setForm(prev => ({ ...prev, outcome: e.target.value }))}
                      rows="2"
                      className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-100 outline-none transition-all font-medium text-slate-700 text-sm sm:text-base resize-none touch-manipulation"
                      placeholder="How do you feel after the event?"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-black py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all shadow-lg active:scale-95 touch-manipulation">
                  Save Entry
                </button>
              </form>
            </div>

            {/* List Section */}
            <div className="space-y-4 pb-10">
              <h2 className="text-lg sm:text-xl font-black text-slate-800 ml-2">Recent Timeline</h2>
              {entries.length === 0 ? (
                <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-10 text-center border border-dashed border-slate-200">
                  <p className="text-slate-400 font-medium text-sm sm:text-base">The path to mindfulness starts with the first log.</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {entries.map(entry => (
                    <div key={entry._id} className="bg-white rounded-2xl sm:rounded-[2rem] shadow-sm border border-slate-100 p-4 sm:p-5 flex items-start gap-3 sm:gap-4 group transition-all hover:border-indigo-100">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        entry.choice === 'react' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                      }`}>
                        <span className="text-lg sm:text-xl">{entry.choice === 'react' ? '😠' : '🧘'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center gap-2 mb-1 flex-wrap">
                          <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${
                            entry.choice === 'react' ? 'text-rose-500' : 'text-emerald-500'
                          }`}>
                            {entry.choice}
                          </span>
                          <span className="text-[9px] sm:text-[10px] font-bold text-slate-300 whitespace-nowrap">
                            {new Date(entry.date).toLocaleDateString()}
                          </span>
                        </div>
                        {entry.situation && <p className="text-sm font-bold text-slate-800 mb-1 break-words">{entry.situation}</p>}
                        {entry.outcome && <p className="text-xs text-slate-500 leading-relaxed italic break-words">"{entry.outcome}"</p>}
                      </div>
                      <button
                        onClick={() => deleteEntry(entry._id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 transition-all active:scale-95 touch-manipulation"
                        aria-label="Delete entry"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

ReactResponse.displayName = 'ReactResponse';
export default ReactResponse;