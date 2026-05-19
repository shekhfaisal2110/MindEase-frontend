// src/pages/ExportReport.jsx
import React, { useState, useCallback, useMemo } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';

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
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [loadingFull, setLoadingFull] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const years = useMemo(() => getYears(), []);

  const handleDownloadProgress = useCallback(async () => {
    setLoadingProgress(true);
    setError(null);
    setSuccess(null);
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
      setSuccess('Progress report downloaded successfully!');
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error(err);
      setError('Failed to generate progress report. Please try again later.');
    } finally {
      setLoadingProgress(false);
    }
  }, [period, selectedYear, selectedMonth]);

  const handleDownloadFull = useCallback(async () => {
    setLoadingFull(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await api.get('/export/full-report', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      link.download = `mindEase_full_report_${year}_${month}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
      setSuccess('Full monthly report downloaded successfully!');
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error(err);
      setError('Failed to generate full report. Please try again later.');
    } finally {
      setLoadingFull(false);
    }
  }, []);

  const setMonthly = useCallback(() => setPeriod('monthly'), []);
  const setYearly = useCallback(() => setPeriod('yearly'), []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 md:py-12 max-w-5xl">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4 mx-auto">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3 sm:mb-4">
            Your Progress, Unfolded
          </h1>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto px-2">
            Download a beautifully designed PDF report of your wellness journey – including points, activities, sleep, emotions, and more.
          </p>
        </div>

        {/* Progress Report Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-white/50 p-5 sm:p-6 md:p-8 transition-all hover:shadow-2xl mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Left side – description */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl">📊</span>
                <h2 className="text-xl sm:text-2xl font-semibold text-slate-800">Monthly / Yearly Summary</h2>
              </div>
              <ul className="space-y-1.5 text-slate-600 text-sm sm:text-base">
                <li className="flex items-start gap-2"><span className="text-indigo-500">▹</span> Total points & active days</li>
                <li className="flex items-start gap-2"><span className="text-indigo-500">▹</span> Activity counts (gratitude, therapy, tasks...)</li>
                <li className="flex items-start gap-2"><span className="text-indigo-500">▹</span> Emotional trends & sleep averages</li>
                <li className="flex items-start gap-2"><span className="text-indigo-500">▹</span> Screen time & top used apps</li>
              </ul>
            </div>

            {/* Right side – form */}
            <div className="flex-1 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Report period</label>
                <div className="flex gap-3">
                  <button
                    onClick={setMonthly}
                    className={`flex-1 py-2.5 rounded-xl font-semibold transition-all touch-manipulation ${
                      period === 'monthly'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={setYearly}
                    className={`flex-1 py-2.5 rounded-xl font-semibold transition-all touch-manipulation ${
                      period === 'yearly'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Yearly
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {period === 'monthly' && (
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">Month</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  >
                    {months.map(month => (
                      <option key={month.value} value={month.value}>{month.label}</option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={handleDownloadProgress}
                disabled={loadingProgress}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.98]"
              >
                {loadingProgress ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Progress Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Full Monthly Report Card – separate, not nested */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-white/50 p-5 sm:p-6 md:p-8 transition-all hover:shadow-2xl">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl">📓</span>
                <h2 className="text-xl sm:text-2xl font-semibold text-slate-800">Full Monthly Report</h2>
              </div>
              <ul className="space-y-1.5 text-slate-600 text-sm sm:text-base">
                <li className="flex items-start gap-2"><span className="text-indigo-500">▹</span> Every activity logged for the current month</li>
                <li className="flex items-start gap-2"><span className="text-indigo-500">▹</span> Daily breakdown (gratitude, emotions, sleep, tasks)</li>
                <li className="flex items-start gap-2"><span className="text-indigo-500">▹</span> Ikigai summary & emotional highlights</li>
                <li className="flex items-start gap-2"><span className="text-indigo-500">▹</span> In‑depth analysis of your month</li>
              </ul>
              <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                Always includes the current month (up to today)
              </p>
            </div>
            <div className="flex-1 flex items-center justify-center lg:justify-end">
              <button
                onClick={handleDownloadFull}
                disabled={loadingFull}
                className="w-full lg:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.98]"
              >
                {loadingFull ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    Download Full Report (This Month)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error / Success Messages */}
        {error && (
          <div className="mt-8 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-sm animate-in fade-in duration-300 text-center flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
            {error}
          </div>
        )}
        {success && (
          <div className="mt-8 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-sm animate-in fade-in duration-300 text-center flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            {success}
          </div>
        )}
      </div>
    </div>
  );
});

ExportReport.displayName = 'ExportReport';
export default ExportReport;