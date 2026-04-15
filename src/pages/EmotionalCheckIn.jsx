import React, { useState, useEffect } from 'react';
import api from '../services/api';
import PageLayout from '../components/PageLayout';

const EmotionalCheckIn = () => {
  const [activities, setActivities] = useState([]);
  const [emotion, setEmotion] = useState('');
  const [intensity, setIntensity] = useState(5);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);

  const quickEmotions = [
    { label: 'Peaceful', emoji: '😌' },
    { label: 'Anxious', emoji: '😟' },
    { label: 'Grateful', emoji: '🙏' },
    { label: 'Sad', emoji: '☁️' },
    { label: 'Energized', emoji: '⚡' },
    { label: 'Frustrated', emoji: '😤' }
  ];

  useEffect(() => { fetchActivities(); }, []);

  const fetchActivities = async () => {
    try {
      const res = await api.get('/emotional');
      setActivities(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const addCheckIn = async (e) => {
    e.preventDefault();
    if (!emotion) return;
    try {
      const res = await api.post('/emotional', { emotion, intensity, note });
      setActivities([res.data, ...activities]);
      setEmotion(''); setIntensity(5); setNote('');
    } catch (err) { console.error(err); }
  };

  const getIntensityColor = (val) => {
    if (val <= 3) return 'bg-emerald-500';
    if (val <= 7) return 'bg-indigo-500';
    return 'bg-rose-500';
  };

  return (
    <PageLayout 
      title="Emotional Check-In" 
      subtitle="Take a moment to acknowledge how you're feeling right now."
      maxWidth="max-w-4xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Input Form */}
        <div className="lg:col-span-5">
          <form 
            onSubmit={addCheckIn} 
            className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 lg:sticky lg:top-24"
          >
            <div className="mb-6">
              <label className="block text-sm font-black text-slate-800 uppercase tracking-widest mb-4">
                What's your mood?
              </label>
              
              {/* Quick Select Chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {quickEmotions.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setEmotion(item.label)}
                    className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all border-2 ${
                      emotion === item.label 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                      : 'bg-slate-50 border-transparent text-slate-600 hover:bg-white hover:border-indigo-100'
                    }`}
                  >
                    {item.emoji} {item.label}
                  </button>
                ))}
              </div>

              <input 
                type="text" 
                placeholder="Or type another emotion..." 
                value={emotion} 
                onChange={e => setEmotion(e.target.value)} 
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all" 
                required 
              />
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-black text-slate-800 uppercase tracking-widest">
                  Intensity
                </label>
                <span className={`px-3 py-1 rounded-full text-white text-xs font-black ${getIntensityColor(intensity)}`}>
                  Level {intensity}
                </span>
              </div>
              <input 
                type="range" 
                min="1" max="10" 
                value={intensity} 
                onChange={e => setIntensity(e.target.value)} 
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-black text-slate-800 uppercase tracking-widest mb-2">
                Context (Optional)
              </label>
              <textarea 
                placeholder="What triggered this feeling?" 
                value={note} 
                onChange={e => setNote(e.target.value)} 
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-100 outline-none min-h-[100px]" 
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-black py-4 rounded-2xl transition-all shadow-lg active:scale-95"
            >
              Check In
            </button>
          </form>
        </div>

        {/* Right: History Feed */}
        <div className="lg:col-span-7">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
            <span className="mr-2">📖</span> History
          </h2>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(n => (
                <div key={n} className="h-24 bg-white animate-pulse rounded-3xl" />
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-100">
              <p className="text-slate-400 font-medium">Your emotional journey starts here.</p>
            </div>
          ) : (
            <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:via-slate-100 before:to-transparent">
              {activities.map(act => (
                <div key={act._id} className="relative pl-12 group">
                  {/* Timeline Dot */}
                  <div className={`absolute left-0 w-10 h-10 rounded-full border-4 border-white shadow-sm flex items-center justify-center text-xs z-10 transition-transform group-hover:scale-110 ${getIntensityColor(act.intensity)}`}>
                    <span className="text-white font-black">{act.intensity}</span>
                  </div>

                  <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-50 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-black text-slate-800 capitalize">
                        {act.emotion}
                      </h3>
                      <time className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {new Date(act.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </time>
                    </div>
                    
                    {act.note && (
                      <p className="text-slate-600 text-sm italic leading-relaxed">
                        "{act.note}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default EmotionalCheckIn;