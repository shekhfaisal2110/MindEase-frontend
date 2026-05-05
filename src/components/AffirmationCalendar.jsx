// import React, { useState, useEffect } from 'react';
// import api from '../services/api';

// const AffirmationCalendar = () => {
//   const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
//   const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
//   const [completionDates, setCompletionDates] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     fetchCompletionDates();
//   }, [currentYear, currentMonth]);

//   const fetchCompletionDates = async () => {
//     setLoading(true);
//     try {
//       const res = await api.get(`/affirmations/completion-dates/${currentYear}/${currentMonth + 1}`);
//       setCompletionDates(res.data);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
//   const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

//   const renderCalendar = () => {
//     const daysInMonth = getDaysInMonth(currentYear, currentMonth);
//     const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
//     const todayStr = new Date().toISOString().split('T')[0];
//     const days = [];

//     for (let i = 0; i < firstDay; i++) {
//       days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
//     }
//     for (let d = 1; d <= daysInMonth; d++) {
//       const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
//       const isCompleted = completionDates.includes(dateStr);
//       const isToday = dateStr === todayStr;
//       days.push(
//         <div
//           key={dateStr}
//           className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all
//             ${isCompleted ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white border border-slate-100 hover:border-indigo-200'}
//             ${isToday ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}
//           `}
//         >
//           <span className={`text-sm font-bold ${isCompleted ? 'text-white' : 'text-slate-700'}`}>{d}</span>
//           {isCompleted && <div className="w-1.5 h-1.5 rounded-full bg-white mt-1"></div>}
//         </div>
//       );
//     }
//     return days;
//   };

//   const changeMonth = (delta) => {
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
//   };

//   return (
//     <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
//       <div className="flex justify-between items-center mb-8">
//         <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-50 rounded-full">←</button>
//         <h2 className="text-xl font-black text-slate-800">
//           {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
//         </h2>
//         <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-50 rounded-full">→</button>
//       </div>

//       <div className="grid grid-cols-7 gap-2 text-center mb-4">
//         {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
//           <div key={day} className="text-[10px] font-black uppercase tracking-widest text-slate-400">{day}</div>
//         ))}
//       </div>

//       {loading ? (
//         <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
//       ) : (
//         <div className="grid grid-cols-7 gap-2">
//           {renderCalendar()}
//         </div>
//       )}

//       <div className="mt-6 flex justify-center items-center gap-4 text-xs text-slate-500">
//         <div className="flex items-center gap-1"><div className="w-3 h-3 bg-indigo-600 rounded-full"></div><span>Practice day</span></div>
//         <div className="flex items-center gap-1"><div className="w-3 h-3 bg-white border border-slate-200 rounded-full"></div><span>No practice</span></div>
//         <div className="flex items-center gap-1"><div className="w-3 h-3 ring-2 ring-indigo-500 rounded-full"></div><span>Today</span></div>
//       </div>
//     </div>
//   );
// };

// export default AffirmationCalendar;





import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';

// Memoized day cell component – prevents re-rendering all days on month change
const CalendarDay = React.memo(({ date, day, isCompleted, isToday }) => (
  <div
    className={`
      aspect-square rounded-2xl flex flex-col items-center justify-center transition-all
      ${isCompleted 
        ? 'bg-indigo-600 text-white shadow-md' 
        : 'bg-white border border-slate-100 hover:border-indigo-200'
      }
      ${isToday ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}
      active:scale-95 touch-manipulation
    `}
  >
    <span className={`text-sm sm:text-base font-bold ${isCompleted ? 'text-white' : 'text-slate-700'}`}>
      {day}
    </span>
    {isCompleted && <div className="w-1.5 h-1.5 rounded-full bg-white mt-0.5 sm:mt-1"></div>}
  </div>
));

// Skeleton loader for fast perceived loading
const CalendarSkeleton = () => (
  <div className="animate-pulse">
    <div className="grid grid-cols-7 gap-2 mb-2">
      {[...Array(7)].map((_, i) => (
        <div key={i} className="aspect-square bg-slate-200 rounded-2xl"></div>
      ))}
    </div>
    <div className="grid grid-cols-7 gap-2">
      {[...Array(35)].map((_, i) => (
        <div key={i} className="aspect-square bg-slate-100 rounded-2xl"></div>
      ))}
    </div>
  </div>
);

const AffirmationCalendar = () => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [completionDates, setCompletionDates] = useState([]);
  const [loading, setLoading] = useState(true); // start with true for skeleton

  // Memoized calculations – avoid recalculating on every render
  const daysInMonth = useMemo(
    () => new Date(currentYear, currentMonth + 1, 0).getDate(),
    [currentYear, currentMonth]
  );
  const firstDayOfMonth = useMemo(
    () => new Date(currentYear, currentMonth, 1).getDay(),
    [currentYear, currentMonth]
  );
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Memoized fetch function
  const fetchCompletionDates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/affirmations/completion-dates/${currentYear}/${currentMonth + 1}`);
      setCompletionDates(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentYear, currentMonth]);

  useEffect(() => {
    fetchCompletionDates();
  }, [fetchCompletionDates]);

  // Memoized calendar days rendering (only recomputes when dependencies change)
  const calendarDays = useMemo(() => {
    const days = [];
    // Empty cells before month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }
    // Actual days of month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isCompleted = completionDates.includes(dateStr);
      const isToday = dateStr === todayStr;
      days.push(
        <CalendarDay
          key={dateStr}
          date={dateStr}
          day={d}
          isCompleted={isCompleted}
          isToday={isToday}
        />
      );
    }
    return days;
  }, [firstDayOfMonth, daysInMonth, currentYear, currentMonth, completionDates, todayStr]);

  // Memoized month navigation handlers
  const changeMonth = useCallback((delta) => {
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
  }, [currentMonth, currentYear]);

  // Go to current month
  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  }, []);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6 md:p-8">
      {/* Header with navigation – touch‑friendly buttons */}
      <div className="flex justify-between items-center mb-6 sm:mb-8 flex-wrap gap-2">
        <button
          onClick={() => changeMonth(-1)}
          className="p-2 sm:p-3 hover:bg-slate-50 rounded-full text-lg sm:text-xl active:scale-95 transition-all touch-manipulation"
          aria-label="Previous month"
        >
          ←
        </button>
        <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-800">
          {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-1">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-xs sm:text-sm font-medium bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 active:scale-95 transition-all touch-manipulation"
          >
            Today
          </button>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 sm:p-3 hover:bg-slate-50 rounded-full text-lg sm:text-xl active:scale-95 transition-all touch-manipulation"
            aria-label="Next month"
          >
            →
          </button>
        </div>
      </div>

      {/* Weekday headers – responsive text size */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center mb-3 sm:mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid with skeleton while loading */}
      {loading ? (
        <CalendarSkeleton />
      ) : (
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {calendarDays}
        </div>
      )}

      {/* Legend – responsive layout */}
      <div className="mt-6 sm:mt-8 flex justify-center items-center gap-4 text-xs sm:text-sm text-slate-500 flex-wrap">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
          <span>Practice day</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-white border border-slate-200 rounded-full"></div>
          <span>No practice</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 ring-2 ring-indigo-500 rounded-full"></div>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(AffirmationCalendar);