// // src/pages/GratitudeJournal.jsx
// import React, { useState, useEffect } from 'react';
// import api from '../services/api';
// import PageLayout from '../components/PageLayout';
// import LoadingSpinner from '../components/LoadingSpinner';

// // Simple calendar component inline
// const GratitudeCalendar = ({ completionDates, currentYear, currentMonth }) => {
//   const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
//   const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
//   const todayStr = new Date().toISOString().split('T')[0];

//   const daysInMonth = getDaysInMonth(currentYear, currentMonth);
//   const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
//   const days = [];

//   for (let i = 0; i < firstDay; i++) {
//     days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
//   }
//   for (let d = 1; d <= daysInMonth; d++) {
//     const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
//     const hasEntry = completionDates.includes(dateStr);
//     const isToday = dateStr === todayStr;

//     days.push(
//       <div
//         key={dateStr}
//         className={`aspect-square flex items-center justify-center rounded-xl transition-all ${
//           hasEntry
//             ? 'bg-indigo-600 text-white shadow-md'
//             : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'
//         } ${isToday ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
//       >
//         <span className="text-sm font-bold">{d}</span>
//       </div>
//     );
//   }
//   return days;
// };

// const GratitudeJournal = () => {
//   const [entries, setEntries] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [formData, setFormData] = useState({
//     people: '',
//     things: '',
//     situations: '',
//     notes: '',
//   });
//   const [submitting, setSubmitting] = useState(false);
//   const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
//   const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
//   const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
//   const [completionDates, setCompletionDates] = useState([]);

//   useEffect(() => {
//     fetchEntries();
//     api.post('/daily-activity/page-view', { pageName: 'gratitude' }).catch(() => {});
//   }, []);

//   useEffect(() => {
//     if (viewMode === 'calendar') {
//       fetchCompletionDates();
//     }
//   }, [currentYear, currentMonth, viewMode]);

//   const fetchEntries = async () => {
//     try {
//       const res = await api.get('/gratitude');
//       setEntries(res.data.entries || res.data);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchCompletionDates = async () => {
//     try {
//       const res = await api.get(`/gratitude/completion-dates/${currentYear}/${currentMonth + 1}`);
//       setCompletionDates(res.data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (submitting) return;
//     const hasContent = Object.values(formData).some(val => val.trim().length > 0);
//     if (!hasContent) {
//       alert('Please fill at least one field');
//       return;
//     }
//     setSubmitting(true);
//     try {
//       await api.post('/gratitude', formData);
//       setFormData({ people: '', things: '', situations: '', notes: '' });
//       await fetchEntries();
//       await fetchCompletionDates();
//       alert('Gratitude saved! +2 points');
//     } catch (err) {
//       alert(err.response?.data?.message || 'Failed to save');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const deleteEntry = async (id) => {
//     if (!window.confirm('Delete this entry?')) return;
//     try {
//       await api.delete(`/gratitude/${id}`);
//       await fetchEntries();
//       await fetchCompletionDates();
//     } catch (err) {
//       alert('Failed to delete');
//     }
//   };

//   const handlePreviousMonth = () => {
//     if (currentMonth === 0) {
//       setCurrentMonth(11);
//       setCurrentYear(currentYear - 1);
//     } else {
//       setCurrentMonth(currentMonth - 1);
//     }
//   };

//   const handleNextMonth = () => {
//     if (currentMonth === 11) {
//       setCurrentMonth(0);
//       setCurrentYear(currentYear + 1);
//     } else {
//       setCurrentMonth(currentMonth + 1);
//     }
//   };

//   if (loading) return <LoadingSpinner />;

//   return (
//     <PageLayout title="Gratitude Journal" subtitle="Write down what you're thankful for each day.">
//       {/* View Toggle */}
//       <div className="flex justify-center mb-8">
//         <div className="inline-flex p-1 bg-slate-100 rounded-2xl">
//           <button
//             onClick={() => setViewMode('list')}
//             className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
//           >
//             📝 Journal
//           </button>
//           <button
//             onClick={() => setViewMode('calendar')}
//             className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'calendar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
//           >
//             📅 Calendar
//           </button>
//         </div>
//       </div>

//       {viewMode === 'list' ? (
//         <div className="max-w-4xl mx-auto space-y-10">
//           {/* Entry Form */}
//           <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 mb-8">
//             <h2 className="text-xl font-bold text-slate-800 mb-4">Add Today's Gratitude</h2>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div>
//                 <label className="text-sm font-bold text-slate-600">People</label>
//                 <textarea
//                   name="people"
//                   value={formData.people}
//                   onChange={handleChange}
//                   rows="2"
//                   className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none"
//                   placeholder="Family, friends, mentors..."
//                 />
//               </div>
//               <div>
//                 <label className="text-sm font-bold text-slate-600">Things</label>
//                 <textarea
//                   name="things"
//                   value={formData.things}
//                   onChange={handleChange}
//                   rows="2"
//                   className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none"
//                   placeholder="Health, home, nature..."
//                 />
//               </div>
//               <div>
//                 <label className="text-sm font-bold text-slate-600">Situations</label>
//                 <textarea
//                   name="situations"
//                   value={formData.situations}
//                   onChange={handleChange}
//                   rows="2"
//                   className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none"
//                   placeholder="Job opportunities, sunny weather..."
//                 />
//               </div>
//               <div>
//                 <label className="text-sm font-bold text-slate-600">Notes (optional)</label>
//                 <textarea
//                   name="notes"
//                   value={formData.notes}
//                   onChange={handleChange}
//                   rows="2"
//                   className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none"
//                   placeholder="Anything else you're grateful for..."
//                 />
//               </div>
//               <button
//                 type="submit"
//                 disabled={submitting}
//                 className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
//               >
//                 {submitting ? 'Saving...' : 'Save Gratitude (+2 points)'}
//               </button>
//             </form>
//           </div>

//           {/* List of entries */}
//           <div className="space-y-4">
//             <h2 className="text-xl font-bold text-slate-800">Your Gratitude Entries</h2>
//             {entries.length === 0 ? (
//               <div className="bg-white rounded-3xl p-8 text-center text-slate-400 border border-slate-100">
//                 No entries yet. Start writing!
//               </div>
//             ) : (
//               entries.map(entry => (
//                 <div key={entry._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
//                   <div className="flex justify-between items-start">
//                     <div className="space-y-2 flex-1">
//                       {entry.people && <p><span className="font-bold text-indigo-600">👥 People:</span> {entry.people}</p>}
//                       {entry.things && <p><span className="font-bold text-indigo-600">📦 Things:</span> {entry.things}</p>}
//                       {entry.situations && <p><span className="font-bold text-indigo-600">✨ Situations:</span> {entry.situations}</p>}
//                       {entry.notes && <p className="text-slate-500 italic">{entry.notes}</p>}
//                       <p className="text-xs text-slate-400">{new Date(entry.date).toLocaleDateString()}</p>
//                     </div>
//                     <button onClick={() => deleteEntry(entry._id)} className="text-rose-500 hover:text-rose-700 text-sm">Delete</button>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       ) : (
//         // Calendar View
//         <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
//           <div className="flex justify-between items-center mb-6">
//             <button onClick={handlePreviousMonth} className="p-2 hover:bg-slate-100 rounded-full">
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
//             </button>
//             <h2 className="text-lg font-bold text-slate-800">
//               {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
//             </h2>
//             <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-full">
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
//             </button>
//           </div>
//           <div className="grid grid-cols-7 gap-2 text-center mb-4">
//             {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
//               <div key={day} className="text-[10px] font-bold text-slate-400 uppercase">{day}</div>
//             ))}
//           </div>
//           <div className="grid grid-cols-7 gap-2">
//             <GratitudeCalendar
//               completionDates={completionDates}
//               currentYear={currentYear}
//               currentMonth={currentMonth}
//             />
//           </div>
//           <div className="mt-6 text-center text-xs text-slate-500">
//             💡 Days with a gratitude entry are highlighted in indigo.
//           </div>
//         </div>
//       )}
//     </PageLayout>
//   );
// };

// export default GratitudeJournal;




// src/pages/GratitudeJournal.jsx
import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import api from '../services/api';
import PageLayout from '../components/PageLayout';
import LoadingSpinner from '../components/LoadingSpinner';

// Memoized calendar component – prevents re‑renders when parent state changes
const GratitudeCalendar = React.memo(({ completionDates, currentYear, currentMonth, onMonthChange }) => {
  const getDaysInMonth = useCallback((year, month) => new Date(year, month + 1, 0).getDate(), []);
  const getFirstDayOfMonth = useCallback((year, month) => new Date(year, month, 1).getDay(), []);
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  
  const days = useMemo(() => {
    const result = [];
    for (let i = 0; i < firstDay; i++) {
      result.push(<div key={`empty-${i}`} className="aspect-square" />);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const hasEntry = completionDates.includes(dateStr);
      const isToday = dateStr === todayStr;
      result.push(
        <div
          key={dateStr}
          className={`aspect-square flex items-center justify-center rounded-xl transition-all ${
            hasEntry
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'
          } ${isToday ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
        >
          <span className="text-sm font-bold">{d}</span>
        </div>
      );
    }
    return result;
  }, [firstDay, daysInMonth, currentYear, currentMonth, completionDates, todayStr]);

  return <div className="grid grid-cols-7 gap-2">{days}</div>;
});

// Skeleton for list view (entries & form)
const ListSkeleton = () => (
  <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
      <div className="h-6 bg-slate-200 rounded w-40 mb-4" />
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i}><div className="h-4 bg-slate-200 rounded w-24 mb-1" /><div className="h-16 bg-slate-100 rounded-xl" /></div>
        ))}
        <div className="h-12 bg-slate-200 rounded-xl" />
      </div>
    </div>
    <div className="space-y-4">
      <div className="h-6 bg-slate-200 rounded w-48" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100">
          <div className="flex justify-between"><div className="h-4 bg-slate-200 rounded w-3/4" /><div className="w-16 h-8 bg-slate-200 rounded" /></div>
          <div className="h-4 bg-slate-200 rounded w-1/2 mt-3" />
        </div>
      ))}
    </div>
  </div>
);

// Skeleton for calendar view
const CalendarSkeleton = () => (
  <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 p-6 animate-pulse">
    <div className="flex justify-between items-center mb-6">
      <div className="w-8 h-8 bg-slate-200 rounded-full" />
      <div className="h-6 bg-slate-200 rounded w-40" />
      <div className="w-8 h-8 bg-slate-200 rounded-full" />
    </div>
    <div className="grid grid-cols-7 gap-2 text-center mb-4">
      {[...Array(7)].map((_, i) => <div key={i} className="h-4 bg-slate-200 rounded" />)}
    </div>
    <div className="grid grid-cols-7 gap-2">
      {[...Array(35)].map((_, i) => <div key={i} className="aspect-square bg-slate-100 rounded-xl" />)}
    </div>
  </div>
);

const GratitudeJournal = React.memo(() => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    people: '',
    things: '',
    situations: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [completionDates, setCompletionDates] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(false);

  const fetchEntries = useCallback(async () => {
    try {
      const res = await api.get('/gratitude');
      setEntries(res.data.entries || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompletionDates = useCallback(async () => {
    setCalendarLoading(true);
    try {
      const res = await api.get(`/gratitude/completion-dates/${currentYear}/${currentMonth + 1}`);
      setCompletionDates(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCalendarLoading(false);
    }
  }, [currentYear, currentMonth]);

  useEffect(() => {
    fetchEntries();
    api.post('/daily-activity/page-view', { pageName: 'gratitude' }).catch(() => {});
  }, [fetchEntries]);

  useEffect(() => {
    if (viewMode === 'calendar') {
      fetchCompletionDates();
    }
  }, [viewMode, fetchCompletionDates, currentYear, currentMonth]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (submitting) return;
    const hasContent = Object.values(formData).some(val => val.trim().length > 0);
    if (!hasContent) {
      alert('Please fill at least one field');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/gratitude', formData);
      setFormData({ people: '', things: '', situations: '', notes: '' });
      await fetchEntries();
      if (viewMode === 'calendar') await fetchCompletionDates();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  }, [formData, submitting, fetchEntries, fetchCompletionDates, viewMode]);

  const deleteEntry = useCallback(async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await api.delete(`/gratitude/${id}`);
      await fetchEntries();
      if (viewMode === 'calendar') await fetchCompletionDates();
    } catch (err) {
      alert('Failed to delete');
    }
  }, [fetchEntries, fetchCompletionDates, viewMode]);

  const handlePreviousMonth = useCallback(() => {
    setCurrentMonth(prev => {
      if (prev === 0) {
        setCurrentYear(y => y - 1);
        return 11;
      }
      return prev - 1;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth(prev => {
      if (prev === 11) {
        setCurrentYear(y => y + 1);
        return 0;
      }
      return prev + 1;
    });
  }, []);

  if (loading && viewMode === 'list') return <ListSkeleton />;

  return (
    <PageLayout title="Gratitude Journal" subtitle="Write down what you're thankful for each day.">
      {/* View Toggle – responsive, touch‑friendly */}
      <div className="flex justify-center mb-6 sm:mb-8">
        <div className="inline-flex p-1 bg-slate-100 rounded-2xl">
          <button
            onClick={() => setViewMode('list')}
            className={`px-5 sm:px-6 py-2 rounded-xl text-sm font-bold transition-all touch-manipulation ${
              viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            📝 Journal
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-5 sm:px-6 py-2 rounded-xl text-sm font-bold transition-all touch-manipulation ${
              viewMode === 'calendar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            📅 Calendar
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="max-w-4xl mx-auto space-y-8 sm:space-y-10">
          {/* Entry Form – responsive padding */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 p-5 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4">Add Today's Gratitude</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-600">People</label>
                <textarea
                  name="people"
                  value={formData.people}
                  onChange={handleChange}
                  rows="2"
                  className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none resize-none"
                  placeholder="Family, friends, mentors..."
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-600">Things</label>
                <textarea
                  name="things"
                  value={formData.things}
                  onChange={handleChange}
                  rows="2"
                  className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none resize-none"
                  placeholder="Health, home, nature..."
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-600">Situations</label>
                <textarea
                  name="situations"
                  value={formData.situations}
                  onChange={handleChange}
                  rows="2"
                  className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none resize-none"
                  placeholder="Job opportunities, sunny weather..."
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-600">Notes (optional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="2"
                  className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none resize-none"
                  placeholder="Anything else you're grateful for..."
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition active:scale-95 disabled:opacity-50 touch-manipulation"
              >
                {submitting ? 'Saving...' : 'Save Gratitude (+2 points)'}
              </button>
            </form>
          </div>

          {/* Entries List */}
          <div className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800">Your Gratitude Entries</h2>
            {entries.length === 0 ? (
              <div className="bg-white rounded-2xl sm:rounded-3xl p-8 text-center text-slate-400 border border-slate-100">
                No entries yet. Start writing!
              </div>
            ) : (
              entries.map(entry => (
                <div key={entry._id} className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-5">
                  <div className="flex justify-between items-start gap-3">
                    <div className="space-y-2 flex-1 min-w-0">
                      {entry.people && <p className="text-sm break-words"><span className="font-bold text-indigo-600">👥 People:</span> {entry.people}</p>}
                      {entry.things && <p className="text-sm break-words"><span className="font-bold text-indigo-600">📦 Things:</span> {entry.things}</p>}
                      {entry.situations && <p className="text-sm break-words"><span className="font-bold text-indigo-600">✨ Situations:</span> {entry.situations}</p>}
                      {entry.notes && <p className="text-slate-500 italic text-sm break-words">{entry.notes}</p>}
                      <p className="text-xs text-slate-400">{new Date(entry.date).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={() => deleteEntry(entry._id)}
                      className="text-rose-500 hover:text-rose-700 text-sm font-medium touch-manipulation flex-shrink-0"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        // Calendar View
        <div className="max-w-3xl mx-auto bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 p-5 sm:p-6">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
            <button onClick={handlePreviousMonth} className="p-2 hover:bg-slate-100 rounded-full active:scale-95 touch-manipulation">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h2 className="text-base sm:text-lg font-bold text-slate-800">
              {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-full active:scale-95 touch-manipulation">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center mb-4">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-[10px] font-bold text-slate-400 uppercase">{day}</div>
            ))}
          </div>
          {calendarLoading ? (
            <div className="grid grid-cols-7 gap-2">
              {[...Array(35)].map((_, i) => <div key={i} className="aspect-square bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <GratitudeCalendar
              completionDates={completionDates}
              currentYear={currentYear}
              currentMonth={currentMonth}
            />
          )}
          <div className="mt-6 text-center text-xs text-slate-500">
            💡 Days with a gratitude entry are highlighted in indigo.
          </div>
        </div>
      )}
    </PageLayout>
  );
});

GratitudeJournal.displayName = 'GratitudeJournal';
export default GratitudeJournal;