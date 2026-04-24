import React from 'react';

const StressThermometer = ({ highestActivity }) => {
  if (!highestActivity) return null;

  return (
    <div className="bg-gradient-to-r from-amber-50 to-rose-50 rounded-3xl border border-amber-100 shadow-md overflow-hidden">
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl sm:text-3xl">🌡️</span>
          <h3 className="text-lg sm:text-xl font-black text-slate-800">
            Stress Reduction Recommendation
          </h3>
        </div>

        <div className="text-center">
          <p className="text-slate-600 text-sm sm:text-base mb-2">
            Based on your activities, try:
          </p>
          <p className="text-2xl sm:text-3xl md:text-4xl font-black text-indigo-600 break-words">
            {highestActivity.name}
          </p>

          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <span className="text-sm font-bold text-slate-500">Stress reduction:</span>
            <div className="w-full sm:w-56 md:w-64 h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${highestActivity.stressReductionPercent}%` }}
              />
            </div>
            <span className="text-sm font-bold text-emerald-600 bg-white/50 px-2 py-1 rounded-full">
              {highestActivity.stressReductionPercent}%
            </span>
          </div>

          {highestActivity.notes && (
            <p className="text-xs sm:text-sm text-slate-500 mt-4 italic max-w-md mx-auto">
              "{highestActivity.notes}"
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StressThermometer;