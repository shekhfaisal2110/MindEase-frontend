import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import api from '../services/api';
import Navbar from '../components/Navbar';

const ReactResponse = () => {
  const [entries, setEntries] = useState([]);
  const [monthlyData, setMonthlyData] = useState({});
  const [viewMode, setViewMode] = useState('log');
  const [form, setForm] = useState({ choice: 'response', situation: '', outcome: '' });
  const [loading, setLoading] = useState(true);

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  // Global storage: page view recorded once per day via backend
  useEffect(() => {
    const recordPageView = async () => {
      try {
        const res = await api.post('/daily-activity/page-view', { pageName: 'reactResponse' });
        if (!res.data.alreadyRecorded) {
          await api.post('/activity/add', { actionType: 'pageView', points: 1 });
        }
      } catch (err) { console.error(err); }
    };
    recordPageView();
    fetchEntries();
    fetchMonthlySummary(currentYear, currentMonth);
  }, []);

  useEffect(() => {
    if (viewMode === 'calendar') {
      fetchMonthlySummary(currentYear, currentMonth);
    }
  }, [currentYear, currentMonth]);

  const fetchEntries = async () => {
    try {
      const res = await api.get('/react-response');
      setEntries(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchMonthlySummary = async (year, month) => {
    try {
      const res = await api.get(`/react-response/month/${year}/${month + 1}`);
      setMonthlyData(res.data);
    } catch (err) { console.error(err); }
  };

  // 🔥 React animation – fiery, explosive
  const triggerReactConfetti = () => {
    // Main burst from center
    confetti({
      particleCount: 300,
      spread: 120,
      origin: { y: 0.6 },
      startVelocity: 30,
      colors: ["#ef4444", "#f97316", "#f59e0b", "#dc2626", "#ea580c"],
      decay: 0.9,
      gravity: 1,
    });
    // Left corner burst
    confetti({
      particleCount: 180,
      angle: 60,
      spread: 60,
      origin: { x: 0, y: 0.5 },
      startVelocity: 35,
      colors: ["#ef4444", "#f97316", "#f59e0b"],
    });
    // Right corner burst
    confetti({
      particleCount: 180,
      angle: 120,
      spread: 60,
      origin: { x: 1, y: 0.5 },
      startVelocity: 35,
      colors: ["#ef4444", "#f97316", "#f59e0b"],
    });
  };

  // 🌿 Response animation – calm, soothing
  const triggerResponseConfetti = () => {
    // Main burst from center – softer, slower
    confetti({
      particleCount: 250,
      spread: 80,
      origin: { y: 0.6 },
      startVelocity: 20,
      colors: ["#10b981", "#3b82f6", "#8b5cf6", "#34d399", "#60a5fa"],
      decay: 0.9,
      gravity: 0.8,
    });
    // Gentle side bursts
    confetti({
      particleCount: 120,
      angle: 60,
      spread: 45,
      origin: { x: 0, y: 0.5 },
      startVelocity: 25,
      colors: ["#10b981", "#3b82f6", "#8b5cf6"],
    });
    confetti({
      particleCount: 120,
      angle: 120,
      spread: 45,
      origin: { x: 1, y: 0.5 },
      startVelocity: 25,
      colors: ["#10b981", "#3b82f6", "#8b5cf6"],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/react-response', form);
      setEntries([res.data, ...entries]);
      setForm({ choice: 'response', situation: '', outcome: '' });
      fetchMonthlySummary(currentYear, currentMonth);

      // Add activity points (+5)
      await api.post('/activity/add', { actionType: 'reactResponse', points: 5 });
      console.log('✅ +5 points for mindful awareness entry');

      // Trigger confetti based on choice
      if (form.choice === 'react') {
        triggerReactConfetti();
      } else {
        triggerResponseConfetti();
      }
    } catch (err) {
      alert('Failed to save');
    }
  };

  const deleteEntry = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await api.delete(`/react-response/${id}`);
      setEntries(entries.filter(e => e._id !== id));
      fetchMonthlySummary(currentYear, currentMonth);
    } catch (err) { console.error(err); }
  };

  const changeMonth = (delta) => {
    let newMonth = currentMonth + delta;
    let newYear = currentYear;
    if (newMonth < 0) { newMonth = 11; newYear--; }
    else if (newMonth > 11) { newMonth = 0; newYear++; }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const renderCalendar = () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const todayStr = new Date().toISOString().split('T')[0];
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
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
          className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all hover:scale-105 border border-transparent ${statusColor} ${isToday ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
        >
          <span className="text-sm">{d}</span>
          {indicator && <span className="text-[10px] mt-0.5">{indicator}</span>}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mindful Awareness</h1>
            <p className="text-slate-500 font-medium">Choosing the path of Response over Reaction.</p>
          </div>
          <div className="inline-flex p-1 bg-slate-200/50 rounded-2xl">
            {['log', 'calendar'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all ${viewMode === mode ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {viewMode === 'calendar' ? (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-6 md:p-10 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8">
              <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <h2 className="text-xl font-black text-slate-800">
                {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
            <div className="grid grid-cols-7 gap-3 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-3">
              {renderCalendar()}
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* Zen Tip Card */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] p-6 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-2 flex items-center">
                  <span className="mr-2">💡</span> The "Golden Pause"
                </h3>
                <p className="text-indigo-50 text-sm leading-relaxed max-w-2xl">
                  <strong>Reaction</strong> is a reflex—fast and impulsive. <strong>Response</strong> is a choice—it creates a space between trigger and action. Try to find that space today.
                </p>
              </div>
              <div className="absolute top-[-20%] right-[-5%] w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            </div>

            {/* Form Section */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 md:p-8">
              <h2 className="text-xl font-black text-slate-800 mb-6">Log an Angry Moment</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setForm({...form, choice: 'react'})}
                    className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-center space-x-3 font-bold ${form.choice === 'react' ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                  >
                    <span className="text-xl">😠</span>
                    <span>I Reacted</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({...form, choice: 'response'})}
                    className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-center space-x-3 font-bold ${form.choice === 'response' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                  >
                    <span className="text-xl">🧘</span>
                    <span>I Responded</span>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Trigger / Situation</label>
                    <input 
                      type="text"
                      value={form.situation} 
                      onChange={(e) => setForm({...form, situation: e.target.value})} 
                      className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-100 outline-none transition-all font-medium text-slate-700" 
                      placeholder="What triggered the spark?" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Outcome / Feelings</label>
                    <textarea 
                      value={form.outcome} 
                      onChange={(e) => setForm({...form, outcome: e.target.value})} 
                      rows="2" 
                      className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-100 outline-none transition-all font-medium text-slate-700" 
                      placeholder="How do you feel after the event?" 
                    />
                  </div>
                </div>

                <button type="submit" className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-black py-4 rounded-2xl transition-all shadow-lg active:scale-95">
                  Save Entry
                </button>
              </form>
            </div>

            {/* List Section */}
            <div className="space-y-4 pb-10">
              <h2 className="text-xl font-black text-slate-800 ml-2">Recent Timeline</h2>
              {loading ? (
                <div className="flex justify-center py-10"><div className="w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>
              ) : entries.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-slate-200">
                  <p className="text-slate-400 font-medium">The path to mindfulness starts with the first log.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {entries.map(entry => (
                    <div key={entry._id} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-5 flex items-start gap-4 group transition-all hover:border-indigo-100">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${entry.choice === 'react' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {entry.choice === 'react' ? '😠' : '🧘'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${entry.choice === 'react' ? 'text-rose-500' : 'text-emerald-500'}`}>
                            {entry.choice}
                          </span>
                          <span className="text-[10px] font-bold text-slate-300">
                            {new Date(entry.date).toLocaleDateString()}
                          </span>
                        </div>
                        {entry.situation && <p className="text-sm font-bold text-slate-800 mb-1">{entry.situation}</p>}
                        {entry.outcome && <p className="text-xs text-slate-500 leading-relaxed italic">"{entry.outcome}"</p>}
                      </div>
                      <button 
                        onClick={() => deleteEntry(entry._id)} 
                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 transition-all"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
};

export default ReactResponse;