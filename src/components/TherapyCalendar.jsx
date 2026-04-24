import React, { useState, useEffect } from 'react';
import api from '../services/api';

const TherapyCalendar = () => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [completionDates, setCompletionDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateExercises, setDateExercises] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchCompletionDates();
  }, [currentYear, currentMonth]);

  const fetchCompletionDates = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/therapy/completion-dates/${currentYear}/${currentMonth + 1}`);
      setCompletionDates(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExercisesForDate = async (dateStr) => {
    try {
      const res = await api.get(`/therapy/exercises/${dateStr}`);
      setDateExercises(res.data);
      setSelectedDate(dateStr);
      setShowModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const todayStr = new Date().toISOString().split('T')[0];
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isCompleted = completionDates.includes(dateStr);
      const isToday = dateStr === todayStr;

      days.push(
        <button
          key={dateStr}
          onClick={() => fetchExercisesForDate(dateStr)}
          className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all
            ${isCompleted ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white border border-slate-100 hover:border-indigo-200'}
            ${isToday ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}
          `}
        >
          <span className={`text-sm font-bold ${isCompleted ? 'text-white' : 'text-slate-700'}`}>{d}</span>
          {isCompleted && <div className="w-1.5 h-1.5 rounded-full bg-white mt-1"></div>}
        </button>
      );
    }
    return days;
  };

  const changeMonth = (delta) => {
    let newMonth = currentMonth + delta;
    let newYear = currentYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getTypeIcon = (type) => {
    const icons = {
      hotpotato: '🔥',
      forgiveness: '🙏',
      selftalk: '💬',
      receiving: '🎁'
    };
    return icons[type] || '📝';
  };

  return (
    <>
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-50 rounded-full">←</button>
          <h2 className="text-xl font-black text-slate-800">
            {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-50 rounded-full">→</button>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-[10px] font-black uppercase tracking-widest text-slate-400">{day}</div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {renderCalendar()}
          </div>
        )}

        <div className="mt-6 flex justify-center items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-indigo-600 rounded-full"></div><span>Practice day</span></div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-white border border-slate-200 rounded-full"></div><span>No practice</span></div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 ring-2 ring-indigo-500 rounded-full"></div><span>Today</span></div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-black text-slate-800">{formatDate(selectedDate)}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {dateExercises.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <svg className="w-16 h-16 mx-auto mb-3 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>No practice on this day.</p>
                <p className="text-sm mt-1">Click ‘Exercises’ tab to start.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {dateExercises.map(ex => (
                  <div key={ex._id} className="bg-slate-50 rounded-xl p-3 flex items-start gap-3">
                    <div className="text-2xl">{getTypeIcon(ex.type)}</div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{ex.type}</p>
                      <p className="text-sm text-slate-700 font-medium">{ex.content}</p>
                      <p className="text-xs text-slate-400 mt-1">Repetitions: {ex.count}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowModal(false)}
              className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default TherapyCalendar;