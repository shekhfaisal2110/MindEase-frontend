import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';

const HourlyEmotionTracker = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [hourlyData, setHourlyData] = useState({});
  const [monthlySummary, setMonthlySummary] = useState({});
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('today');
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [customBlocks, setCustomBlocks] = useState([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [startTime, setStartTime] = useState('06:00');
  const [endTime, setEndTime] = useState('08:00');
  const [errorMsg, setErrorMsg] = useState('');

  const defaultHourBlocks = [
    '6:00 - 8:00', '8:00 - 10:00', '10:00 - 12:00', '12:00 - 14:00',
    '14:00 - 16:00', '16:00 - 18:00', '18:00 - 20:00', '20:00 - 22:00'
  ];

  const allBlocks = [...defaultHourBlocks, ...customBlocks];

  useEffect(() => {
    if (viewMode === 'today') {
      fetchHourlyData(selectedDate);
      fetchCustomBlocks(selectedDate);
    } else {
      fetchMonthlySummaryForYearMonth(currentYear, currentMonth);
    }
  }, [viewMode, selectedDate, currentYear, currentMonth]);

  const fetchHourlyData = async (date) => {
    setLoading(true);
    try {
      const res = await api.get(`/emotion-hourly/date/${date}`);
      const dataMap = {};
      res.data.forEach(item => { dataMap[item.hourBlock] = item.emotion; });
      setHourlyData(dataMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomBlocks = async (date) => {
    try {
      const res = await api.get(`/custom-blocks/${date}`);
      setCustomBlocks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const saveCustomBlocks = async (date, blocks) => {
    try {
      await api.post(`/custom-blocks/${date}`, { blocks });
      setCustomBlocks(blocks);
    } catch (err) {
      console.error(err);
    }
  };

  const saveEmotion = async (hourBlock, emotion) => {
    try {
      await api.post('/emotion-hourly', {
        date: selectedDate,
        hourBlock,
        emotion
      });
      setHourlyData(prev => ({ ...prev, [hourBlock]: emotion }));
    } catch (err) {
      alert('Failed to save');
    }
  };

  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const addCustomBlock = () => {
    setErrorMsg('');
    if (!startTime || !endTime) {
      setErrorMsg('Please select both start and end time.');
      return;
    }
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    if (startMinutes >= endMinutes) {
      setErrorMsg('End time must be after start time.');
      return;
    }
    const startFormatted = startTime.slice(0, 5);
    const endFormatted = endTime.slice(0, 5);
    const newBlock = `${startFormatted} - ${endFormatted}`;

    // Check duplicate (exact same label)
    if (allBlocks.includes(newBlock)) {
      setErrorMsg(`Time block "${newBlock}" already exists.`);
      return;
    }
    const updated = [...customBlocks, newBlock];
    saveCustomBlocks(selectedDate, updated);
    setStartTime('06:00');
    setEndTime('08:00');
    setShowCustomInput(false);
  };

  const removeCustomBlock = async (blockToRemove) => {
    const updated = customBlocks.filter(block => block !== blockToRemove);
    await saveCustomBlocks(selectedDate, updated);
    if (hourlyData[blockToRemove]) {
      const newData = { ...hourlyData };
      delete newData[blockToRemove];
      setHourlyData(newData);
    }
  };

  const fetchMonthlySummaryForYearMonth = async (year, month) => {
    setLoading(true);
    try {
      const res = await api.get(`/emotion-hourly/month/${year}/${month + 1}`);
      setMonthlySummary(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const changeMonth = (delta) => {
    let newMonth = currentMonth + delta;
    let newYear = currentYear;
    if (newMonth < 0) { newMonth = 11; newYear--; }
    else if (newMonth > 11) { newMonth = 0; newYear++; }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const todayStr = new Date().toISOString().split('T')[0];
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const sentiment = monthlySummary[dateStr];
      const isToday = dateStr === todayStr;
      let statusStyles = "bg-slate-50 text-slate-400";
      if (sentiment === 'positive') statusStyles = "bg-emerald-100 text-emerald-700 font-bold";
      else if (sentiment === 'negative') statusStyles = "bg-rose-100 text-rose-700 font-bold";
      else if (sentiment === 'neutral') statusStyles = "bg-amber-100 text-amber-700 font-bold";
      days.push(
        <button
          key={dateStr}
          onClick={() => { setSelectedDate(dateStr); setViewMode('today'); }}
          className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all hover:scale-105 ${statusStyles} ${isToday ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
        >
          <span className="text-sm">{d}</span>
          {sentiment && <div className="w-1.5 h-1.5 rounded-full bg-current mt-1"></div>}
        </button>
      );
    }
    return days;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mood Timeline</h1>
            <p className="text-slate-500 font-medium">Track your energy shifts through the day.</p>
          </div>
          <div className="inline-flex p-1 bg-slate-200/50 rounded-2xl backdrop-blur-sm">
            <button onClick={() => setViewMode('today')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'today' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Today</button>
            <button onClick={() => setViewMode('calendar')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'calendar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Calendar</button>
          </div>
        </div>

        {viewMode === 'calendar' ? (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-6 md:p-10">
            <div className="flex justify-between items-center mb-8">
              <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-50 rounded-full">←</button>
              <h2 className="text-xl font-black text-slate-800">{new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
              <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-50 rounded-full">→</button>
            </div>
            <div className="grid grid-cols-7 gap-3 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-3">{renderCalendar()}</div>
            <div className="mt-10 flex flex-wrap justify-center gap-6 pt-6 border-t border-slate-50">
              <div className="flex items-center text-xs font-bold text-slate-500"><div className="w-3 h-3 bg-emerald-200 rounded-sm mr-2"></div> Positive</div>
              <div className="flex items-center text-xs font-bold text-slate-500"><div className="w-3 h-3 bg-amber-100 rounded-sm mr-2"></div> Neutral</div>
              <div className="flex items-center text-xs font-bold text-slate-500"><div className="w-3 h-3 bg-rose-200 rounded-sm mr-2"></div> Negative</div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <h2 className="text-lg font-bold text-slate-800">Viewing Logs for:</h2>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-slate-50 border-none rounded-xl px-4 py-2 font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none" />
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allBlocks.map(block => {
                    const currentEmotion = hourlyData[block];
                    return (
                      <div key={block} className="bg-white rounded-3xl border border-slate-100 p-5 flex items-center justify-between group hover:border-indigo-100 transition-all">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Block</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-700">{block}</span>
                            {customBlocks.includes(block) && (
                              <button onClick={() => removeCustomBlock(block)} className="text-rose-400 hover:text-rose-600 text-xs" title="Remove custom block">✕</button>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {[
                            { id: 'positive', label: '😊', color: 'hover:bg-emerald-50 text-emerald-500 border-emerald-100', active: 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-100' },
                            { id: 'neutral', label: '😐', color: 'hover:bg-amber-50 text-amber-500 border-amber-100', active: 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-100' },
                            { id: 'negative', label: '😞', color: 'hover:bg-rose-50 text-rose-500 border-rose-100', active: 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-100' },
                          ].map(emo => (
                            <button key={emo.id} onClick={() => saveEmotion(block, emo.id)} className={`w-12 h-12 rounded-2xl text-xl flex items-center justify-center border-2 transition-all active:scale-90 ${currentEmotion === emo.id ? emo.active : `bg-white border-slate-50 ${emo.color}`}`}>{emo.label}</button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 flex justify-center">
                  {!showCustomInput ? (
                    <button onClick={() => setShowCustomInput(true)} className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-50 text-indigo-600 font-bold text-sm hover:bg-indigo-100 transition">
                      + Add Custom Time Block
                    </button>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex flex-col sm:flex-row gap-3 items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-slate-500">Start</label>
                          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-xl text-sm" />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-slate-500">End</label>
                          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-xl text-sm" />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={addCustomBlock} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold">Add</button>
                          <button onClick={() => setShowCustomInput(false)} className="px-4 py-2 text-slate-500 text-sm">Cancel</button>
                        </div>
                      </div>
                      {errorMsg && (
                        <div className="text-rose-500 text-xs font-medium bg-rose-50 px-4 py-2 rounded-full">
                          ⚠️ {errorMsg}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default HourlyEmotionTracker;