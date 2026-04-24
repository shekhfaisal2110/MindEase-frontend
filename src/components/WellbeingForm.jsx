import React, { useState } from 'react';

const WellbeingForm = ({ onSave, initialData = null }) => {
  const [form, setForm] = useState({
    name: initialData?.name || '',
    type: initialData?.type || 'happiness',
    stressReductionPercent: initialData?.stressReductionPercent || 50,
    notes: initialData?.notes || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Please enter an activity name.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onSave(form);
      if (!initialData) {
        setForm({ name: '', type: 'happiness', stressReductionPercent: 50, notes: '' });
      }
    } catch (err) {
      setError('Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        {initialData ? '✏️ Edit Activity' : '➕ Add New Activity'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Activity Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="e.g., Cooking, Walking, Meditation"
            className="w-full bg-slate-50 border-none rounded-xl p-3 text-base focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Type
          </label>
          <select
            value={form.type}
            onChange={e => setForm({ ...form, type: e.target.value })}
            className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            disabled={loading}
          >
            <option value="happiness">😊 Happiness (Things I enjoy)</option>
            <option value="stress_relief">🧘 Stress Relief (Reduces stress)</option>
          </select>
        </div>

        {form.type === 'stress_relief' && (
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Stress Reduction (%)
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={form.stressReductionPercent}
                onChange={e => setForm({ ...form, stressReductionPercent: parseInt(e.target.value) })}
                className="flex-1 w-full"
                disabled={loading}
              />
              <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-center min-w-[60px]">
                {form.stressReductionPercent}%
              </span>
            </div>
          </div>
        )}

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Notes (optional)
          </label>
          <textarea
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            placeholder="How does this activity make you feel?"
            rows="2"
            className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none"
            disabled={loading}
          />
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm p-3 rounded-xl">
            ⚠️ {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-100"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </span>
          ) : (
            initialData ? 'Update Activity' : 'Add Activity'
          )}
        </button>
      </form>
    </div>
  );
};

export default WellbeingForm;