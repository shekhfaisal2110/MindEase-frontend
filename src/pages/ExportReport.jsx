// // src/pages/ExportReport.jsx
// import React, { useState } from 'react';
// import api from '../services/api';
// import Navbar from '../components/Navbar';
// import LoadingSpinner from '../components/LoadingSpinner';

// const ExportReport = () => {
//   const [period, setPeriod] = useState('monthly');
//   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
//   const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(false);

//   // Generate years from 2022 to current year + 1
//   const currentYear = new Date().getFullYear();
//   const years = Array.from({ length: currentYear - 2022 + 2 }, (_, i) => 2022 + i);

//   const months = [
//     { value: 1, label: 'January' },
//     { value: 2, label: 'February' },
//     { value: 3, label: 'March' },
//     { value: 4, label: 'April' },
//     { value: 5, label: 'May' },
//     { value: 6, label: 'June' },
//     { value: 7, label: 'July' },
//     { value: 8, label: 'August' },
//     { value: 9, label: 'September' },
//     { value: 10, label: 'October' },
//     { value: 11, label: 'November' },
//     { value: 12, label: 'December' },
//   ];

//   const handleDownload = async () => {
//     setLoading(true);
//     setError(null);
//     setSuccess(false);
//     try {
//       let url = `/export/progress?period=${period}`;
//       if (period === 'monthly') {
//         url += `&year=${selectedYear}&month=${selectedMonth}`;
//       } else {
//         url += `&year=${selectedYear}`;
//       }
//       const response = await api.get(url, { responseType: 'blob' });
//       // Create a download link
//       const blob = new Blob([response.data], { type: 'application/pdf' });
//       const link = document.createElement('a');
//       link.href = URL.createObjectURL(blob);
//       link.download = `mindEase_${period}_${selectedYear}${period === 'monthly' ? `_${selectedMonth}` : ''}.pdf`;
//       link.click();
//       URL.revokeObjectURL(link.href);
//       setSuccess(true);
//       setTimeout(() => setSuccess(false), 5000);
//     } catch (err) {
//       console.error(err);
//       setError('Failed to generate report. Please try again later.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) return <LoadingSpinner />;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
//       <Navbar />
//       <div className="container mx-auto px-4 py-12 max-w-4xl">
//         {/* Hero Section */}
//         <div className="text-center mb-12">
//           <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
//             Your Progress, Unfolded
//           </h1>
//           <p className="text-slate-600 text-lg max-w-2xl mx-auto">
//             Download a beautiful PDF report of your wellness journey – including points, activities, sleep, emotions, and more.
//           </p>
//         </div>

//         {/* Card */}
//         <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl shadow-indigo-100/30 border border-white/50 p-8 md:p-10">
//           <div className="flex flex-col md:flex-row gap-8">
//             {/* Left: Description */}
//             <div className="flex-1 space-y-4">
//               <h2 className="text-2xl font-semibold text-slate-800">What's inside?</h2>
//               <ul className="space-y-2 text-slate-600">
//                 <li className="flex items-center gap-2">📊 <span>Total points earned</span></li>
//                 <li className="flex items-center gap-2">❤️ <span>Gratitude, affirmations, letters count</span></li>
//                 <li className="flex items-center gap-2">🧠 <span>Emotional trends & most frequent mood</span></li>
//                 <li className="flex items-center gap-2">😴 <span>Average sleep duration & quality</span></li>
//                 <li className="flex items-center gap-2">📱 <span>Screen time & top used apps</span></li>
//                 <li className="flex items-center gap-2">✅ <span>Completed tasks & therapy reps</span></li>
//               </ul>
//             </div>

//             {/* Right: Form */}
//             <div className="flex-1 space-y-6">
//               <div>
//                 <label className="text-sm font-medium text-slate-700 block mb-2">Report period</label>
//                 <div className="flex gap-4">
//                   <button
//                     onClick={() => setPeriod('monthly')}
//                     className={`px-6 py-2 rounded-full font-medium transition-all ${
//                       period === 'monthly'
//                         ? 'bg-indigo-600 text-white shadow-md'
//                         : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
//                     }`}
//                   >
//                     Monthly
//                   </button>
//                   <button
//                     onClick={() => setPeriod('yearly')}
//                     className={`px-6 py-2 rounded-full font-medium transition-all ${
//                       period === 'yearly'
//                         ? 'bg-indigo-600 text-white shadow-md'
//                         : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
//                     }`}
//                   >
//                     Yearly
//                   </button>
//                 </div>
//               </div>

//               {/* Year Picker */}
//               <div>
//                 <label className="text-sm font-medium text-slate-700 block mb-2">Year</label>
//                 <select
//                   value={selectedYear}
//                   onChange={(e) => setSelectedYear(parseInt(e.target.value))}
//                   className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
//                 >
//                   {years.map(year => (
//                     <option key={year} value={year}>{year}</option>
//                   ))}
//                 </select>
//               </div>

//               {/* Month Picker (only for monthly) */}
//               {period === 'monthly' && (
//                 <div>
//                   <label className="text-sm font-medium text-slate-700 block mb-2">Month</label>
//                   <select
//                     value={selectedMonth}
//                     onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
//                     className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
//                   >
//                     {months.map(month => (
//                       <option key={month.value} value={month.value}>{month.label}</option>
//                     ))}
//                   </select>
//                 </div>
//               )}

//               {/* Download Button */}
//               <button
//                 onClick={handleDownload}
//                 disabled={loading}
//                 className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
//               >
//                 {loading ? (
//                   <>
//                     <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                     Generating report...
//                   </>
//                 ) : (
//                   <>
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
//                     Download PDF Report
//                   </>
//                 )}
//               </button>

//               {/* Messages */}
//               {error && (
//                 <div className="mt-4 p-3 bg-rose-50 text-rose-700 rounded-xl text-sm">
//                   ⚠️ {error}
//                 </div>
//               )}
//               {success && (
//                 <div className="mt-4 p-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm">
//                   ✅ Report downloaded successfully!
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Decorative element */}
//         <div className="text-center mt-10 text-slate-400 text-sm">
//           * All data is securely retrieved and never stored on our servers after download.
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ExportReport;





// src/pages/ExportReport.jsx
import React, { useState, useCallback, useMemo } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';

// Helper: generate years array (static, outside component)
const getYears = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: currentYear - 2022 + 2 }, (_, i) => 2022 + i);
};

const months = [
  { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
  { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
  { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
  { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' },
];

const ExportReport = React.memo(() => {
  const [period, setPeriod] = useState('monthly');
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const years = useMemo(() => getYears(), []);

  const handleDownload = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      let url = `/export/progress?period=${period}`;
      if (period === 'monthly') {
        url += `&year=${selectedYear}&month=${selectedMonth}`;
      } else {
        url += `&year=${selectedYear}`;
      }
      const response = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `mindEase_${period}_${selectedYear}${period === 'monthly' ? `_${selectedMonth}` : ''}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error(err);
      setError('Failed to generate report. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [period, selectedYear, selectedMonth]);

  // Memoised period toggle handlers
  const setMonthly = useCallback(() => setPeriod('monthly'), []);
  const setYearly = useCallback(() => setPeriod('yearly'), []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
        {/* Hero Section – responsive text */}
        <div className="text-center mb-10 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3 sm:mb-4">
            Your Progress, Unfolded
          </h1>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto px-2">
            Download a beautiful PDF report of your wellness journey – including points, activities, sleep, emotions, and more.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl shadow-indigo-100/30 border border-white/50 p-6 sm:p-8 md:p-10 transition-all">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            {/* Left: Description */}
            <div className="flex-1 space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-800">What's inside?</h2>
              <ul className="space-y-2 text-slate-600 text-sm sm:text-base">
                <li className="flex items-center gap-2">📊 Total points earned</li>
                <li className="flex items-center gap-2">❤️ Gratitude, affirmations, letters count</li>
                <li className="flex items-center gap-2">🧠 Emotional trends & most frequent mood</li>
                <li className="flex items-center gap-2">😴 Average sleep duration & quality</li>
                <li className="flex items-center gap-2">📱 Screen time & top used apps</li>
                <li className="flex items-center gap-2">✅ Completed tasks & therapy reps</li>
              </ul>
            </div>

            {/* Right: Form */}
            <div className="flex-1 space-y-5">
              {/* Period toggle */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Report period</label>
                <div className="flex gap-3">
                  <button
                    onClick={setMonthly}
                    className={`px-5 py-2 rounded-full font-medium transition-all touch-manipulation ${
                      period === 'monthly'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={setYearly}
                    className={`px-5 py-2 rounded-full font-medium transition-all touch-manipulation ${
                      period === 'yearly'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Yearly
                  </button>
                </div>
              </div>

              {/* Year picker */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Month picker (only for monthly) */}
              {period === 'monthly' && (
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">Month</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  >
                    {months.map(month => (
                      <option key={month.value} value={month.value}>{month.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Download Button with inline loading spinner */}
              <button
                onClick={handleDownload}
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95 touch-manipulation"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating report...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Download PDF Report
                  </>
                )}
              </button>

              {/* Status messages */}
              {error && (
                <div className="mt-3 p-3 bg-rose-50 text-rose-700 rounded-xl text-sm animate-in fade-in duration-300">
                  ⚠️ {error}
                </div>
              )}
              {success && (
                <div className="mt-3 p-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm animate-in fade-in duration-300">
                  ✅ Report downloaded successfully!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center mt-8 sm:mt-10 text-slate-400 text-xs sm:text-sm">
          * All data is securely retrieved and never stored on our servers after download.
        </div>
      </div>
    </div>
  );
});

ExportReport.displayName = 'ExportReport';
export default ExportReport;