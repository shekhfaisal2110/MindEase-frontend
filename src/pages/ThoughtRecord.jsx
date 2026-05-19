import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import PageLayout from '../components/PageLayout';

// Static data (defined outside)
const cognitiveDistortionsList = [
  'All-or-Nothing Thinking', 'Overgeneralization', 'Mental Filter', 'Disqualifying the Positive',
  'Jumping to Conclusions', 'Magnification/Minimization', 'Emotional Reasoning', 'Should Statements',
  'Labeling', 'Personalization', 'Blaming'
];

const commonEmotions = ['Sad', 'Anxious', 'Angry', 'Guilty', 'Ashamed', 'Hopeless', 'Worthless', 'Lonely', 'Irritable'];

// ---- Skeleton Components ----
const StatsSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-slate-100 rounded-2xl p-5 h-28" />
    ))}
  </div>
);

const FormSkeleton = () => (
  <div className="bg-white rounded-3xl shadow-lg p-6 space-y-6 animate-pulse">
    <div className="h-7 bg-slate-200 rounded w-48" />
    <div className="space-y-5">
      <div><div className="h-5 bg-slate-200 rounded w-24 mb-1" /><div className="h-16 bg-slate-100 rounded-xl" /></div>
      <div><div className="h-5 bg-slate-200 rounded w-40 mb-1" /><div className="h-24 bg-slate-100 rounded-xl" /></div>
      <div><div className="h-5 bg-slate-200 rounded w-36 mb-2" /><div className="space-y-2">{[...Array(2)].map((_, i) => <div key={i} className="flex gap-3"><div className="h-10 bg-slate-100 rounded-xl flex-1" /><div className="w-20 h-10 bg-slate-100 rounded-xl" /></div>)}</div></div>
      <div><div className="h-5 bg-slate-200 rounded w-40 mb-2" /><div className="flex flex-wrap gap-2">{[...Array(5)].map((_, i) => <div key={i} className="w-20 h-8 bg-slate-100 rounded-full" />)}</div></div>
      <div><div className="h-5 bg-slate-200 rounded w-48 mb-1" /><div className="h-24 bg-slate-100 rounded-xl" /></div>
      <div className="flex gap-3"><div className="h-10 w-24 bg-slate-200 rounded-xl" /><div className="h-10 w-24 bg-slate-200 rounded-xl" /></div>
    </div>
  </div>
);

const RecordItemSkeleton = () => (
  <div className="border rounded-xl p-4 space-y-2 animate-pulse">
    <div className="flex justify-between"><div className="h-5 bg-slate-200 rounded w-24" /><div className="w-16 h-6 bg-slate-200 rounded" /></div>
    <div className="h-4 bg-slate-200 rounded w-full" />
    <div className="h-4 bg-slate-200 rounded w-3/4" />
    <div className="h-8 bg-slate-100 rounded w-32 mt-2" />
  </div>
);

// ---- Memoized Subcomponents ----
const StatsCards = React.memo(({ stats }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-5 text-center">
      <p className="text-sm font-bold text-indigo-600">Total Records</p>
      <p className="text-3xl font-black text-indigo-800">{stats.totalRecords}</p>
    </div>
    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-5 text-center">
      <p className="text-sm font-bold text-emerald-600">Avg. Intensity (Before)</p>
      <p className="text-3xl font-black text-emerald-800">{stats.avgIntensityBefore}/10</p>
    </div>
    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-5 text-center">
      <p className="text-sm font-bold text-amber-600">Avg. Intensity (After)</p>
      <p className="text-3xl font-black text-amber-800">{stats.avgIntensityAfter}/10</p>
    </div>
    <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-2xl p-5 text-center">
      <p className="text-sm font-bold text-rose-600">Improvement</p>
      <p className="text-3xl font-black text-rose-800">{stats.improvement} pts</p>
    </div>
  </div>
));

const FeelingsInput = React.memo(({ title, feelings, onUpdate, onAdd, onRemove, type }) => (
  <div>
    <label className="block font-bold mb-2">{title}</label>
    {feelings.map((f, idx) => (
      <div key={idx} className="flex flex-col sm:flex-row gap-3 mb-2">
        <select value={f.emotion} onChange={e => onUpdate(idx, 'emotion', e.target.value)} className="flex-1 border rounded-xl p-2 text-sm sm:text-base touch-manipulation">
          <option value="">Select emotion</option>
          {commonEmotions.map(e => <option key={e}>{e}</option>)}
        </select>
        <div className="flex gap-2 items-center">
          <input type="number" min="0" max="10" value={f.intensity} onChange={e => onUpdate(idx, 'intensity', e.target.value)} className="w-20 border rounded-xl p-2 text-center touch-manipulation" />
          <button type="button" onClick={() => onRemove(idx)} className="text-rose-500 p-1 touch-manipulation">✖</button>
        </div>
      </div>
    ))}
    <button type="button" onClick={onAdd} className="text-indigo-500 text-sm font-medium touch-manipulation">+ Add feeling</button>
  </div>
));

const ThoughtRecord = () => {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    situation: '',
    automaticThoughts: '',
    cognitiveDistortions: [],
    balancedResponse: '',
  });
  const [tempFeelings, setTempFeelings] = useState([{ emotion: '', intensity: 5 }]);
  const [tempOutcomeFeelings, setTempOutcomeFeelings] = useState([{ emotion: '', intensity: 5 }]);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Memoized fetch functions
  const fetchRecords = useCallback(async () => {
    try {
      const res = await api.get(`/thought-records?page=${page}&limit=10`);
      setRecords(res.data.records);
      setTotalPages(res.data.pagination.pages);
    } catch (err) { console.error(err); }
  }, [page]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/thought-records/stats');
      setStats(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    Promise.all([fetchRecords(), fetchStats()]);
  }, [fetchRecords, fetchStats]);

  // Memoized handlers
  const addFeeling = useCallback((type) => {
    if (type === 'pre') setTempFeelings(prev => [...prev, { emotion: '', intensity: 5 }]);
    else setTempOutcomeFeelings(prev => [...prev, { emotion: '', intensity: 5 }]);
  }, []);

  const updateFeeling = useCallback((idx, field, value, type) => {
    if (type === 'pre') {
      setTempFeelings(prev => prev.map((f, i) => i === idx ? { ...f, [field]: field === 'intensity' ? parseInt(value) : value } : f));
    } else {
      setTempOutcomeFeelings(prev => prev.map((f, i) => i === idx ? { ...f, [field]: field === 'intensity' ? parseInt(value) : value } : f));
    }
  }, []);

  const removeFeeling = useCallback((idx, type) => {
    if (type === 'pre') setTempFeelings(prev => prev.filter((_, i) => i !== idx));
    else setTempOutcomeFeelings(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const toggleDistortion = useCallback((distortion) => {
    setFormData(prev => ({
      ...prev,
      cognitiveDistortions: prev.cognitiveDistortions.includes(distortion)
        ? prev.cognitiveDistortions.filter(d => d !== distortion)
        : [...prev.cognitiveDistortions, distortion]
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({ situation: '', automaticThoughts: '', cognitiveDistortions: [], balancedResponse: '' });
    setTempFeelings([{ emotion: '', intensity: 5 }]);
    setTempOutcomeFeelings([{ emotion: '', intensity: 5 }]);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const payload = {
      situation: formData.situation,
      automaticThoughts: formData.automaticThoughts,
      feelings: tempFeelings.filter(f => f.emotion),
      cognitiveDistortions: formData.cognitiveDistortions,
      balancedResponse: formData.balancedResponse,
      outcomeEmotions: tempOutcomeFeelings.filter(f => f.emotion)
    };
    setSubmitting(true);
    try {
      await api.post('/thought-records', payload);
      setShowForm(false);
      resetForm();
      await Promise.all([fetchRecords(), fetchStats()]);
      await api.post('/activity/add', { actionType: 'cbtThoughtRecord', points: 10 });
    } catch (err) { alert(err.response?.data?.message); }
    finally { setSubmitting(false); }
  }, [formData, tempFeelings, tempOutcomeFeelings, resetForm, fetchRecords, fetchStats]);

  const deleteRecord = useCallback(async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await api.delete(`/thought-records/${id}`);
      await Promise.all([fetchRecords(), fetchStats()]);
    } catch (err) { console.error(err); }
  }, [fetchRecords, fetchStats]);

  if (loading) {
    return (
      <PageLayout title="CBT Thought Record" subtitle="Challenge negative thoughts and build balanced thinking.">
        <div className="max-w-6xl mx-auto space-y-8">
          <StatsSkeleton />
          <div className="flex justify-end"><div className="w-32 h-10 bg-slate-200 rounded-xl animate-pulse" /></div>
          <div className="bg-white rounded-3xl shadow p-6 space-y-4">
            {[...Array(3)].map((_, i) => <RecordItemSkeleton key={i} />)}
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="CBT Thought Record" subtitle="Challenge negative thoughts and build balanced thinking.">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 px-4 sm:px-0">
        {/* Stats Cards */}
        {stats && stats.totalRecords > 0 && <StatsCards stats={stats} />}

        {/* New Record Button */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowForm(prev => !prev)}
            className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold shadow-md active:scale-95 touch-manipulation"
          >
            {showForm ? '− Cancel' : '+ New Thought Record'}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-5 sm:p-6 space-y-5 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">CBT Thought Record</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Situation */}
              <div>
                <label className="block font-bold mb-1 text-sm">Situation *</label>
                <textarea rows="2" value={formData.situation} onChange={e => setFormData(prev => ({ ...prev, situation: e.target.value }))} className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-200 outline-none resize-none touch-manipulation" required />
              </div>
              {/* Automatic Thoughts */}
              <div>
                <label className="block font-bold mb-1 text-sm">Automatic Negative Thoughts *</label>
                <textarea rows="3" value={formData.automaticThoughts} onChange={e => setFormData(prev => ({ ...prev, automaticThoughts: e.target.value }))} className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-200 outline-none resize-none touch-manipulation" required />
              </div>
              {/* Feelings (Before) */}
              <FeelingsInput
                title="Feelings (Before)"
                feelings={tempFeelings}
                onUpdate={(idx, field, val) => updateFeeling(idx, field, val, 'pre')}
                onAdd={() => addFeeling('pre')}
                onRemove={(idx) => removeFeeling(idx, 'pre')}
                type="pre"
              />
              {/* Cognitive Distortions */}
              <div>
                <label className="block font-bold mb-2 text-sm">Cognitive Distortions</label>
                <div className="flex flex-wrap gap-2">
                  {cognitiveDistortionsList.map(d => (
                    <button key={d} type="button" onClick={() => toggleDistortion(d)} className={`px-3 py-1 rounded-full text-xs sm:text-sm transition touch-manipulation ${formData.cognitiveDistortions.includes(d) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{d}</button>
                  ))}
                </div>
              </div>
              {/* Balanced Response */}
              <div>
                <label className="block font-bold mb-1 text-sm">Balanced / Rational Response</label>
                <textarea rows="3" value={formData.balancedResponse} onChange={e => setFormData(prev => ({ ...prev, balancedResponse: e.target.value }))} className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-200 outline-none resize-none touch-manipulation" />
              </div>
              {/* Feelings (After) */}
              <FeelingsInput
                title="Feelings (After)"
                feelings={tempOutcomeFeelings}
                onUpdate={(idx, field, val) => updateFeeling(idx, field, val, 'post')}
                onAdd={() => addFeeling('post')}
                onRemove={(idx) => removeFeeling(idx, 'post')}
                type="post"
              />
              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button type="submit" disabled={submitting} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold active:scale-95 disabled:opacity-50 touch-manipulation">{submitting ? 'Saving...' : 'Save Record (+10 pts)'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="bg-slate-200 text-slate-700 px-6 py-2 rounded-xl font-bold active:scale-95 touch-manipulation">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Past Records List */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow p-5 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold mb-4">Past Entries</h3>
          {records.length === 0 ? (
            <p className="text-slate-500 text-center py-6 text-sm">No thought records yet. Start by creating one.</p>
          ) : (
            <div className="space-y-4">
              {records.map(rec => (
                <div key={rec._id} className="border rounded-xl p-4 hover:shadow-sm transition">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <p className="font-bold text-sm">{new Date(rec.date).toLocaleDateString()}</p>
                    <button onClick={() => deleteRecord(rec._id)} className="text-rose-500 text-sm font-medium touch-manipulation">Delete</button>
                  </div>
                  <p className="text-sm mt-2"><span className="font-semibold">Situation:</span> {rec.situation}</p>
                  <p className="text-sm"><span className="font-semibold">Automatic Thoughts:</span> {rec.automaticThoughts}</p>
                  <details className="mt-3">
                    <summary className="cursor-pointer text-indigo-600 text-sm font-medium">Show full CBT breakdown</summary>
                    <div className="mt-2 pl-3 border-l-2 border-indigo-200 space-y-1 text-sm">
                      <p><strong>Feelings (before):</strong> {rec.feelings?.map(f => `${f.emotion}(${f.intensity})`).join(', ') || '-'}</p>
                      <p><strong>Distortions:</strong> {rec.cognitiveDistortions?.join(', ') || '-'}</p>
                      <p><strong>Balanced response:</strong> {rec.balancedResponse || '-'}</p>
                      <p><strong>Feelings after:</strong> {rec.outcomeEmotions?.map(f => `${f.emotion}(${f.intensity})`).join(', ') || '-'}</p>
                    </div>
                  </details>
                </div>
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex justify-center gap-3 mt-6">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-medium disabled:opacity-40 active:scale-95 touch-manipulation">Previous</button>
              <span className="text-sm">Page {page} of {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-medium disabled:opacity-40 active:scale-95 touch-manipulation">Next</button>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default ThoughtRecord;