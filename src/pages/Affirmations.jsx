import React, { useState, useEffect } from 'react';
import * as Yup from 'yup';
import confetti from 'canvas-confetti';
import api from '../services/api';
import PageLayout from '../components/PageLayout';
import FormikForm from '../components/FormikForm';

const Affirmations = () => {
  const [affirmations, setAffirmations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Record page view for analytics (once per day)
  useEffect(() => {
    const recordPageView = async () => {
      try {
        const res = await api.post('/daily-activity/page-view', { pageName: 'affirmations' });
        if (!res.data.alreadyRecorded) {
          await api.post('/activity/add', { actionType: 'pageView', points: 1 });
        }
      } catch (err) { console.error(err); }
    };
    recordPageView();
    fetchAffirmations();
  }, []);

  const fetchAffirmations = async () => {
    try {
      const res = await api.get('/affirmations');
      setAffirmations(res.data);

      // Award points based on total affirmations / 2, but only once per day
      const pointsCheck = await api.post('/daily-activity/page-view', { pageName: 'affirmationPoints' });
      if (!pointsCheck.data.alreadyRecorded && res.data.length > 0) {
        const pointsToAdd = Math.floor(res.data.length / 2);
        if (pointsToAdd > 0) {
          await api.post('/activity/add', { 
            actionType: 'affirmation', 
            meta: { totalAffirmations: res.data.length } 
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const triggerConfetti = () => {
    // Main burst from center
    confetti({
      particleCount: 300,
      spread: 100,
      origin: { y: 0.6 },
      startVelocity: 25,
      colors: ["#2563eb", "#3b82f6", "#60a5fa", "#1d4ed8", "#f59e0b", "#10b981", "#ef4444"],
      decay: 0.9,
      gravity: 1,
    });
    // Left corner burst
    confetti({
      particleCount: 150,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.5 },
      startVelocity: 30,
      colors: ["#8b5cf6", "#ec4899", "#06b6d4"],
    });
    // Right corner burst
    confetti({
      particleCount: 150,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.5 },
      startVelocity: 30,
      colors: ["#f97316", "#84cc16", "#a855f7"],
    });
  };

  const initialValues = { text: '', targetCount: 30 };
  const validationSchema = Yup.object({
    text: Yup.string().required('Write your affirmation').min(3, 'Make it a bit longer'),
    targetCount: Yup.number().min(1, 'Target must be at least 1').max(100, 'Keep it realistic!'),
  });

  const fields = [
    { name: 'text', label: 'New Intention', type: 'textarea', placeholder: 'e.g., I am growing and learning every day', required: true },
    { name: 'targetCount', label: 'Monthly Goal (Days)', type: 'number', placeholder: '30', required: true },
  ];

  const handleAdd = async (values) => {
    const res = await api.post('/affirmations', values);
    setAffirmations(prev => [res.data, ...prev]);
  };

  const increment = async (id) => {
    // Find the current affirmation to check if it was already completed
    const current = affirmations.find(a => a._id === id);
    const wasComplete = current && current.count >= current.targetCount;

    const res = await api.put(`/affirmations/increment/${id}`);
    const updated = res.data;
    setAffirmations(prev => prev.map(a => a._id === id ? updated : a));

    // If the increment made the count reach or exceed the target, and it wasn't already complete, trigger confetti
    if (!wasComplete && updated.count >= updated.targetCount) {
      triggerConfetti();
    }
  };

  const deleteAff = async (id) => {
    if (!window.confirm('Would you like to remove this affirmation?')) return;
    await api.delete(`/affirmations/${id}`);
    setAffirmations(prev => prev.filter(a => a._id !== id));
  };

  return (
    <PageLayout 
      title="Positive Affirmations" 
      subtitle="Words have power. Speak kindness into your life today."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Input Form (Sticky on Desktop) */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-24">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <span className="mr-2">✍️</span> Add New
            </h2>
            <FormikForm 
              initialValues={initialValues} 
              validationSchema={validationSchema} 
              onSubmit={handleAdd} 
              fields={fields} 
              submitLabel="Plant this seed" 
              successMessage="Saved to your garden!" 
            />
          </div>
        </div>

        {/* Right Column: Affirmation Display */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-800 flex items-center">
              <span className="mr-2">🌱</span> My Journey
            </h2>
            <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
              {affirmations.length} Active
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 4].map(n => (
                <div key={n} className="h-40 bg-gray-100 animate-pulse rounded-3xl" />
              ))}
            </div>
          ) : affirmations.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="text-lg font-bold text-slate-800">Your garden is empty</h3>
              <p className="text-slate-500 max-w-xs mx-auto mt-2">
                Add your first positive affirmation to start building a more resilient mindset.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {affirmations.map(aff => {
                const progress = Math.min(100, (aff.count / aff.targetCount) * 100);
                const isComplete = progress >= 100;

                return (
                  <div 
                    key={aff._id} 
                    className="group bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className={`text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded ${isComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {isComplete ? 'Goal Met' : 'In Progress'}
                        </span>
                        <button 
                          onClick={() => deleteAff(aff._id)}
                          className="text-slate-300 hover:text-rose-500 p-1 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                      
                      <p className="text-lg font-bold text-slate-800 leading-tight mb-6">
                        "{aff.text}"
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-2xl font-black text-indigo-600">
                          {aff.count}<span className="text-sm text-slate-400 font-normal">/{aff.targetCount}</span>
                        </span>
                        <span className="text-xs font-bold text-slate-400">{Math.round(progress)}% Complete</span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-slate-100 rounded-full h-3 mb-6 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${isComplete ? 'from-emerald-400 to-teal-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'from-indigo-500 to-purple-500'}`}
                          style={{ width: `${progress}%` }} 
                        />
                      </div>

                      <button 
                        onClick={() => increment(aff._id)}
                        disabled={isComplete}
                        className={`w-full py-3 rounded-2xl font-bold transition-all flex items-center justify-center space-x-2 ${
                          isComplete 
                          ? 'bg-emerald-50 text-emerald-600 cursor-default' 
                          : 'bg-slate-900 text-white hover:bg-indigo-600 active:scale-95 shadow-lg shadow-slate-200'
                        }`}
                      >
                        {isComplete ? (
                          <><span>✨ Completed</span></>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            <span>I repeated this</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Affirmations;