// // import React, { useState, useEffect } from 'react';
// // import api from '../services/api';

// // const GratitudeCalendar = ({ onMonthChange }) => {
// //   const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
// //   const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
// //   const [completionDates, setCompletionDates] = useState([]);
// //   const [loading, setLoading] = useState(false);

// //   useEffect(() => {
// //     fetchCompletionDates();
// //   }, [currentYear, currentMonth]);

// //   const fetchCompletionDates = async () => {
// //     setLoading(true);
// //     try {
// //       const res = await api.get(`/gratitude/completion-dates/${currentYear}/${currentMonth + 1}`);
// //       setCompletionDates(res.data);
// //       if (onMonthChange) onMonthChange(res.data.length);
// //     } catch (err) {
// //       console.error(err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
// //   const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

// //   const renderCalendar = () => {
// //     const daysInMonth = getDaysInMonth(currentYear, currentMonth);
// //     const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
// //     const todayStr = new Date().toISOString().split('T')[0];
// //     const days = [];

// //     for (let i = 0; i < firstDay; i++) {
// //       days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
// //     }

// //     for (let d = 1; d <= daysInMonth; d++) {
// //       const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
// //       const isCompleted = completionDates.includes(dateStr);
// //       const isToday = dateStr === todayStr;

// //       days.push(
// //         <div
// //           key={dateStr}
// //           className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all
// //             ${isCompleted ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white border border-slate-100 hover:border-indigo-200'}
// //             ${isToday ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}
// //           `}
// //         >
// //           <span className={`text-sm font-bold ${isCompleted ? 'text-white' : 'text-slate-700'}`}>{d}</span>
// //           {isCompleted && <div className="w-1.5 h-1.5 rounded-full bg-white mt-1"></div>}
// //         </div>
// //       );
// //     }
// //     return days;
// //   };

// //   const changeMonth = (delta) => {
// //     let newMonth = currentMonth + delta;
// //     let newYear = currentYear;
// //     if (newMonth < 0) {
// //       newMonth = 11;
// //       newYear--;
// //     } else if (newMonth > 11) {
// //       newMonth = 0;
// //       newYear++;
// //     }
// //     setCurrentMonth(newMonth);
// //     setCurrentYear(newYear);
// //   };

// //   return (
// //     <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
// //       <div className="flex justify-between items-center mb-8">
// //         <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-50 rounded-full">←</button>
// //         <h2 className="text-xl font-black text-slate-800">
// //           {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
// //         </h2>
// //         <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-50 rounded-full">→</button>
// //       </div>

// //       <div className="grid grid-cols-7 gap-2 text-center mb-4">
// //         {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
// //           <div key={day} className="text-[10px] font-black uppercase tracking-widest text-slate-400">{day}</div>
// //         ))}
// //       </div>

// //       {loading ? (
// //         <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
// //       ) : (
// //         <div className="grid grid-cols-7 gap-2">
// //           {renderCalendar()}
// //         </div>
// //       )}

// //       <div className="mt-6 flex justify-center items-center gap-4 text-xs text-slate-500">
// //         <div className="flex items-center gap-1"><div className="w-3 h-3 bg-indigo-600 rounded-full"></div><span>Gratitude day</span></div>
// //         <div className="flex items-center gap-1"><div className="w-3 h-3 bg-white border border-slate-200 rounded-full"></div><span>No entry</span></div>
// //         <div className="flex items-center gap-1"><div className="w-3 h-3 ring-2 ring-indigo-500 rounded-full"></div><span>Today</span></div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default GratitudeCalendar;






// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import api from '../services/api';

// // Memoized day cell – prevents re-renders of all days when month changes
// const CalendarDay = React.memo(({ day, dateStr, isCompleted, isToday }) => (
//   <div
//     className={`
//       aspect-square rounded-2xl flex flex-col items-center justify-center transition-all
//       ${isCompleted 
//         ? 'bg-indigo-600 text-white shadow-md' 
//         : 'bg-white border border-slate-100 hover:border-indigo-200'
//       }
//       ${isToday ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}
//       active:scale-95 touch-manipulation
//     `}
//   >
//     <span className={`text-sm sm:text-base font-bold ${isCompleted ? 'text-white' : 'text-slate-700'}`}>
//       {day}
//     </span>
//     {isCompleted && <div className="w-1.5 h-1.5 rounded-full bg-white mt-0.5 sm:mt-1"></div>}
//   </div>
// ));

// // Skeleton loader for instant perceived loading
// const CalendarSkeleton = () => (
//   <div className="animate-pulse">
//     <div className="grid grid-cols-7 gap-2 mb-2">
//       {[...Array(7)].map((_, i) => (
//         <div key={i} className="aspect-square bg-slate-200 rounded-2xl"></div>
//       ))}
//     </div>
//     <div className="grid grid-cols-7 gap-2">
//       {[...Array(35)].map((_, i) => (
//         <div key={i} className="aspect-square bg-slate-100 rounded-2xl"></div>
//       ))}
//     </div>
//   </div>
// );

// const GratitudeCalendar = React.memo(({ onMonthChange }) => {
//   const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
//   const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
//   const [completionDates, setCompletionDates] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Memoized calculations
//   const daysInMonth = useMemo(
//     () => new Date(currentYear, currentMonth + 1, 0).getDate(),
//     [currentYear, currentMonth]
//   );
//   const firstDayOfMonth = useMemo(
//     () => new Date(currentYear, currentMonth, 1).getDay(),
//     [currentYear, currentMonth]
//   );
//   const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

//   const fetchCompletionDates = useCallback(async () => {
//     setLoading(true);
//     try {
//       const res = await api.get(`/gratitude/completion-dates/${currentYear}/${currentMonth + 1}`);
//       setCompletionDates(res.data);
//       if (onMonthChange) onMonthChange(res.data.length);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   }, [currentYear, currentMonth, onMonthChange]);

//   useEffect(() => {
//     fetchCompletionDates();
//   }, [fetchCompletionDates]);

//   const changeMonth = useCallback((delta) => {
//     let newMonth = currentMonth + delta;
//     let newYear = currentYear;
//     if (newMonth < 0) {
//       newMonth = 11;
//       newYear--;
//     } else if (newMonth > 11) {
//       newMonth = 0;
//       newYear++;
//     }
//     setCurrentMonth(newMonth);
//     setCurrentYear(newYear);
//   }, [currentMonth, currentYear]);

//   const goToToday = useCallback(() => {
//     const today = new Date();
//     setCurrentYear(today.getFullYear());
//     setCurrentMonth(today.getMonth());
//   }, []);

//   // Memoized calendar days
//   const calendarDays = useMemo(() => {
//     const days = [];
//     // Empty cells for days before month starts
//     for (let i = 0; i < firstDayOfMonth; i++) {
//       days.push(<div key={`empty-${i}`} className="aspect-square" />);
//     }
//     // Actual days
//     for (let d = 1; d <= daysInMonth; d++) {
//       const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
//       const isCompleted = completionDates.includes(dateStr);
//       const isToday = dateStr === todayStr;
//       days.push(
//         <CalendarDay
//           key={dateStr}
//           day={d}
//           dateStr={dateStr}
//           isCompleted={isCompleted}
//           isToday={isToday}
//         />
//       );
//     }
//     return days;
//   }, [firstDayOfMonth, daysInMonth, currentYear, currentMonth, completionDates, todayStr]);

//   return (
//     <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6 md:p-8">
//       {/* Header with navigation – touch‑friendly */}
//       <div className="flex justify-between items-center mb-6 sm:mb-8 flex-wrap gap-2">
//         <button
//           onClick={() => changeMonth(-1)}
//           className="p-2 sm:p-3 hover:bg-slate-50 rounded-full text-lg sm:text-xl active:scale-95 transition-all touch-manipulation"
//           aria-label="Previous month"
//         >
//           ←
//         </button>
//         <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-800">
//           {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
//         </h2>
//         <div className="flex gap-1">
//           <button
//             onClick={goToToday}
//             className="px-3 py-1.5 text-xs sm:text-sm font-medium bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 active:scale-95 transition-all touch-manipulation"
//           >
//             Today
//           </button>
//           <button
//             onClick={() => changeMonth(1)}
//             className="p-2 sm:p-3 hover:bg-slate-50 rounded-full text-lg sm:text-xl active:scale-95 transition-all touch-manipulation"
//             aria-label="Next month"
//           >
//             →
//           </button>
//         </div>
//       </div>

//       {/* Weekday headers – responsive */}
//       <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center mb-3 sm:mb-4">
//         {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
//           <div key={day} className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400">
//             {day}
//           </div>
//         ))}
//       </div>

//       {/* Calendar grid with skeleton while loading */}
//       {loading ? (
//         <CalendarSkeleton />
//       ) : (
//         <div className="grid grid-cols-7 gap-1 sm:gap-2">
//           {calendarDays}
//         </div>
//       )}

//       {/* Legend – responsive layout */}
//       <div className="mt-6 sm:mt-8 flex justify-center items-center gap-4 text-xs sm:text-sm text-slate-500 flex-wrap">
//         <div className="flex items-center gap-1">
//           <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
//           <span>Gratitude day</span>
//         </div>
//         <div className="flex items-center gap-1">
//           <div className="w-3 h-3 bg-white border border-slate-200 rounded-full"></div>
//           <span>No entry</span>
//         </div>
//         <div className="flex items-center gap-1">
//           <div className="w-3 h-3 ring-2 ring-indigo-500 rounded-full"></div>
//           <span>Today</span>
//         </div>
//       </div>
//     </div>
//   );
// });

// GratitudeCalendar.displayName = 'GratitudeCalendar';

// export default GratitudeCalendar;











import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import api from '../services/api';
import PageLayout from '../components/PageLayout';

// Lazy load the calendar component (splits the bundle)
const GratitudeCalendar = lazy(() => import('../components/GratitudeCalendar'));

// ----------------------------------------------------------------------
// Skeleton components (instant loading feedback)
// ----------------------------------------------------------------------
const FormSkeleton = () => (
  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 animate-pulse">
    <div className="h-6 bg-slate-200 rounded w-40 mb-4" />
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i}>
          <div className="h-4 bg-slate-200 rounded w-24 mb-1" />
          <div className="h-16 bg-slate-100 rounded-xl" />
        </div>
      ))}
      <div className="h-12 bg-slate-200 rounded-xl" />
    </div>
  </div>
);

const EntrySkeleton = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 animate-pulse">
    <div className="flex justify-between">
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-4 bg-slate-200 rounded w-1/2" />
        <div className="h-3 bg-slate-200 rounded w-24" />
      </div>
      <div className="w-16 h-8 bg-slate-200 rounded" />
    </div>
  </div>
);

const ListSkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => <EntrySkeleton key={i} />)}
  </div>
);

// ----------------------------------------------------------------------
// Main component
// ----------------------------------------------------------------------
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

  // Fetch entries from backend
  const fetchEntries = useCallback(async () => {
    try {
      const res = await api.get('/gratitude');
      const entriesArray = res.data.entries || res.data;
      setEntries(entriesArray);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Record page view once per day & load initial data
  useEffect(() => {
    const recordPageView = async () => {
      try {
        await api.post('/daily-activity/page-view', { pageName: 'gratitude' });
      } catch (err) { console.error(err); }
    };
    recordPageView();
    fetchEntries();
  }, [fetchEntries]);

  // Handle form changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  // Submit new entry
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
      // Reset form after successful save
      setFormData({ people: '', things: '', situations: '', notes: '' });
      // Refresh the list
      await fetchEntries();
      // Award points (+2)
      await api.post('/activity/add', { actionType: 'gratitude', points: 2 });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  }, [formData, submitting, fetchEntries]);

  // Delete an entry
  const deleteEntry = useCallback(async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await api.delete(`/gratitude/${id}`);
      await fetchEntries();
    } catch (err) {
      alert('Failed to delete');
    }
  }, [fetchEntries]);

  // Show skeleton while loading
  if (loading && viewMode === 'list') {
    return (
      <PageLayout title="Gratitude Journal" subtitle="Write down what you're thankful for each day.">
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="inline-flex p-1 bg-slate-100 rounded-2xl animate-pulse">
            <div className="w-24 h-10 bg-slate-200 rounded-xl" />
            <div className="w-24 h-10 bg-slate-200 rounded-xl ml-1" />
          </div>
        </div>
        <FormSkeleton />
        <ListSkeleton />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Gratitude Journal" subtitle="Write down what you're thankful for each day.">
      {/* View Toggle */}
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
          {/* Entry Form */}
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

          {/* List of entries */}
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
                    <div className="flex-1 min-w-0 space-y-2">
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
        <Suspense fallback={<div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100 animate-pulse h-96" />}>
          <GratitudeCalendar />
        </Suspense>
      )}
    </PageLayout>
  );
});

GratitudeJournal.displayName = 'GratitudeJournal';
export default GratitudeJournal;