import React, { useState, useEffect } from 'react';
import api from '../services/api';
import PageLayout from '../components/PageLayout';
import LoadingSpinner from '../components/LoadingSpinner';

const cognitiveDistortionsList = [
  'All-or-Nothing Thinking', 'Overgeneralization', 'Mental Filter', 'Disqualifying the Positive',
  'Jumping to Conclusions', 'Magnification/Minimization', 'Emotional Reasoning', 'Should Statements',
  'Labeling', 'Personalization', 'Blaming'
];

const commonEmotions = ['Sad', 'Anxious', 'Angry', 'Guilty', 'Ashamed', 'Hopeless', 'Worthless', 'Lonely', 'Irritable'];

const ThoughtRecord = () => {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    situation: '',
    automaticThoughts: '',
    feelings: [],
    cognitiveDistortions: [],
    balancedResponse: '',
    outcomeEmotions: []
  });
  const [tempFeelings, setTempFeelings] = useState([{ emotion: '', intensity: 5 }]);
  const [tempOutcomeFeelings, setTempOutcomeFeelings] = useState([{ emotion: '', intensity: 5 }]);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchRecords();
    fetchStats();
  }, [page]);

  const fetchRecords = async () => {
    try {
      const res = await api.get(`/thought-records?page=${page}&limit=10`);
      setRecords(res.data.records);
      setTotalPages(res.data.pagination.pages);
    } catch (err) { console.error(err); }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/thought-records/stats');
      setStats(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const addFeeling = (type) => {
    if (type === 'pre') setTempFeelings([...tempFeelings, { emotion: '', intensity: 5 }]);
    else setTempOutcomeFeelings([...tempOutcomeFeelings, { emotion: '', intensity: 5 }]);
  };

  const updateFeeling = (idx, field, value, type) => {
    if (type === 'pre') {
      const updated = [...tempFeelings];
      updated[idx][field] = field === 'intensity' ? parseInt(value) : value;
      setTempFeelings(updated);
    } else {
      const updated = [...tempOutcomeFeelings];
      updated[idx][field] = field === 'intensity' ? parseInt(value) : value;
      setTempOutcomeFeelings(updated);
    }
  };

  const removeFeeling = (idx, type) => {
    if (type === 'pre') setTempFeelings(tempFeelings.filter((_, i) => i !== idx));
    else setTempOutcomeFeelings(tempOutcomeFeelings.filter((_, i) => i !== idx));
  };

  const toggleDistortion = (distortion) => {
    setFormData(prev => ({
      ...prev,
      cognitiveDistortions: prev.cognitiveDistortions.includes(distortion)
        ? prev.cognitiveDistortions.filter(d => d !== distortion)
        : [...prev.cognitiveDistortions, distortion]
    }));
  };

  const handleSubmit = async (e) => {
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
      fetchRecords();
      fetchStats();
      // Optionally add points
      await api.post('/activity/add', { actionType: 'cbtThoughtRecord', points: 10 });
    } catch (err) { alert(err.response?.data?.message); }
    finally { setSubmitting(false); }
  };

  const resetForm = () => {
    setFormData({ situation: '', automaticThoughts: '', feelings: [], cognitiveDistortions: [], balancedResponse: '', outcomeEmotions: [] });
    setTempFeelings([{ emotion: '', intensity: 5 }]);
    setTempOutcomeFeelings([{ emotion: '', intensity: 5 }]);
  };

  const deleteRecord = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await api.delete(`/thought-records/${id}`);
      fetchRecords();
      fetchStats();
    } catch (err) { console.error(err); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <PageLayout title="CBT Thought Record" subtitle="Challenge negative thoughts and build balanced thinking.">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Stats Cards */}
        {stats && stats.totalRecords > 0 && (
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
        )}

        {/* New Record Button */}
        <div className="flex justify-end">
          <button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold">+ New Thought Record</button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-3xl shadow-lg p-6 space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">CBT Thought Record</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block font-bold mb-1">Situation</label>
                <textarea rows="2" value={formData.situation} onChange={e => setFormData({...formData, situation: e.target.value})} className="w-full border rounded-xl p-3" required />
              </div>
              <div>
                <label className="block font-bold mb-1">Automatic Negative Thoughts</label>
                <textarea rows="3" value={formData.automaticThoughts} onChange={e => setFormData({...formData, automaticThoughts: e.target.value})} className="w-full border rounded-xl p-3" required />
              </div>
              <div>
                <label className="block font-bold mb-2">Feelings (Before)</label>
                {tempFeelings.map((f, idx) => (
                  <div key={idx} className="flex gap-3 mb-2">
                    <select value={f.emotion} onChange={e => updateFeeling(idx, 'emotion', e.target.value, 'pre')} className="flex-1 border rounded-xl p-2">
                      <option value="">Select emotion</option>
                      {commonEmotions.map(e => <option key={e}>{e}</option>)}
                    </select>
                    <input type="number" min="0" max="10" value={f.intensity} onChange={e => updateFeeling(idx, 'intensity', e.target.value, 'pre')} className="w-20 border rounded-xl p-2 text-center" />
                    <button type="button" onClick={() => removeFeeling(idx, 'pre')} className="text-rose-500">✖</button>
                  </div>
                ))}
                <button type="button" onClick={() => addFeeling('pre')} className="text-indigo-500 text-sm">+ Add feeling</button>
              </div>

              <div>
                <label className="block font-bold mb-2">Cognitive Distortions</label>
                <div className="flex flex-wrap gap-2">
                  {cognitiveDistortionsList.map(d => (
                    <button key={d} type="button" onClick={() => toggleDistortion(d)} className={`px-3 py-1 rounded-full text-sm ${formData.cognitiveDistortions.includes(d) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}>{d}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Balanced / Rational Response</label>
                <textarea rows="3" value={formData.balancedResponse} onChange={e => setFormData({...formData, balancedResponse: e.target.value})} className="w-full border rounded-xl p-3" />
              </div>

              <div>
                <label className="block font-bold mb-2">Feelings (After)</label>
                {tempOutcomeFeelings.map((f, idx) => (
                  <div key={idx} className="flex gap-3 mb-2">
                    <select value={f.emotion} onChange={e => updateFeeling(idx, 'emotion', e.target.value, 'post')} className="flex-1 border rounded-xl p-2">
                      <option value="">Select emotion</option>
                      {commonEmotions.map(e => <option key={e}>{e}</option>)}
                    </select>
                    <input type="number" min="0" max="10" value={f.intensity} onChange={e => updateFeeling(idx, 'intensity', e.target.value, 'post')} className="w-20 border rounded-xl p-2 text-center" />
                    <button type="button" onClick={() => removeFeeling(idx, 'post')} className="text-rose-500">✖</button>
                  </div>
                ))}
                <button type="button" onClick={() => addFeeling('post')} className="text-indigo-500 text-sm">+ Add feeling</button>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={submitting} className="bg-indigo-600 text-white px-6 py-2 rounded-xl">{submitting ? 'Saving...' : 'Save Record (+10 pts)'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="bg-slate-200 text-slate-700 px-6 py-2 rounded-xl">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Past Records List */}
        <div className="bg-white rounded-3xl shadow p-6">
          <h3 className="text-xl font-bold mb-4">Past Entries</h3>
          {records.length === 0 ? <p>No thought records yet.</p> : (
            <div className="space-y-4">
              {records.map(rec => (
                <div key={rec._id} className="border rounded-xl p-4">
                  <div className="flex justify-between">
                    <p className="font-bold">{new Date(rec.date).toLocaleDateString()}</p>
                    <button onClick={() => deleteRecord(rec._id)} className="text-rose-500 text-sm">Delete</button>
                  </div>
                  <p className="text-sm mt-1"><span className="font-semibold">Situation:</span> {rec.situation}</p>
                  <p className="text-sm"><span className="font-semibold">Automatic Thoughts:</span> {rec.automaticThoughts}</p>
                  <details className="mt-2">
                    <summary className="cursor-pointer text-indigo-600">Show full CBT breakdown</summary>
                    <div className="mt-2 pl-4 border-l-2 border-indigo-200">
                      <p><strong>Feelings (before):</strong> {rec.feelings.map(f => `${f.emotion}(${f.intensity})`).join(', ') || '-'}</p>
                      <p><strong>Distortions:</strong> {rec.cognitiveDistortions.join(', ') || '-'}</p>
                      <p><strong>Balanced response:</strong> {rec.balancedResponse || '-'}</p>
                      <p><strong>Feelings after:</strong> {rec.outcomeEmotions.map(f => `${f.emotion}(${f.intensity})`).join(', ') || '-'}</p>
                    </div>
                  </details>
                </div>
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex justify-center gap-3 mt-6">
              <button disabled={page===1} onClick={()=>setPage(p=>p-1)} className="px-4 py-2 bg-slate-100 rounded-xl">Previous</button>
              <span>Page {page} of {totalPages}</span>
              <button disabled={page===totalPages} onClick={()=>setPage(p=>p+1)} className="px-4 py-2 bg-slate-100 rounded-xl">Next</button>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default ThoughtRecord;