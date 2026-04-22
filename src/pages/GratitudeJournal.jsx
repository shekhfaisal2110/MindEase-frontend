import React, { useState, useEffect } from 'react';
import api from '../services/api';
import PageLayout from '../components/PageLayout';

const GratitudeJournal = () => {
  const [entries, setEntries] = useState([]);
  const [people, setPeople] = useState('');
  const [things, setThings] = useState('');
  const [situations, setSituations] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  // ✅ Global storage: page view recorded once per day via backend
  useEffect(() => {
    const recordPageView = async () => {
      try {
        const res = await api.post('/daily-activity/page-view', { pageName: 'gratitude' });
        if (!res.data.alreadyRecorded) {
          await api.post('/activity/add', { actionType: 'pageView', points: 1 });
        }
      } catch (err) { console.error(err); }
    };
    recordPageView();
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await api.get('/gratitude');
      setEntries(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const addEntry = async (e) => {
    e.preventDefault();
    if (!people && !things && !situations) return;
    try {
      const res = await api.post('/gratitude', { people, things, situations, notes });
      setEntries([res.data, ...entries]);
      setPeople(''); setThings(''); setSituations(''); setNotes('');

      // Add activity points for this entry (+2)
      await api.post('/activity/add', { actionType: 'gratitude', points: 2 });
      console.log('✅ +2 points for gratitude entry');
    } catch (err) { console.error(err); }
  };

  const deleteEntry = async (id) => {
    if (!window.confirm('Are you sure you want to remove this memory?')) return;
    try {
      await api.delete(`/gratitude/${id}`);
      setEntries(entries.filter(e => e._id !== id));
    } catch (err) { console.error(err); }
  };

  return (
    <PageLayout 
      title="Gratitude Journal" 
      subtitle="Focus on the good, and the good gets better."
    >
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Modern Entry Form */}
        <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-6 sm:p-10 relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16 opacity-50" />
          
          <h2 className="text-xl font-black text-slate-800 mb-8 flex items-center">
            <span className="bg-amber-100 text-amber-600 w-10 h-10 rounded-xl flex items-center justify-center mr-3 text-xl">✍️</span>
            What are you thankful for?
          </h2>

          <form onSubmit={addEntry} className="space-y-5 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">People</label>
                <input 
                  placeholder="Who brightened your day?" 
                  value={people} 
                  onChange={e => setPeople(e.target.value)} 
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-amber-200 outline-none transition-all placeholder:text-slate-300" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Things</label>
                <input 
                  placeholder="Small or big items..." 
                  value={things} 
                  onChange={e => setThings(e.target.value)} 
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-amber-200 outline-none transition-all placeholder:text-slate-300" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Situations</label>
                <input 
                  placeholder="Events or moments..." 
                  value={situations} 
                  onChange={e => setSituations(e.target.value)} 
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-amber-200 outline-none transition-all placeholder:text-slate-300" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Reflection</label>
              <textarea 
                placeholder="Expand on your thoughts... (optional)" 
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
                className="w-full bg-slate-50 border-none rounded-3xl p-4 text-sm focus:ring-2 focus:ring-amber-200 outline-none min-h-[100px] transition-all placeholder:text-slate-300" 
              />
            </div>

            <button 
              type="submit" 
              className="w-full sm:w-auto px-10 py-4 bg-slate-900 hover:bg-amber-600 text-white font-black rounded-2xl transition-all shadow-xl active:scale-95 flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              <span>Save to Journal</span>
            </button>
          </form>
        </section>

        {/* Entries List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-black text-slate-800">Your Journey</h3>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{entries.length} Reflections</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4">
              {[1, 2].map(n => <div key={n} className="h-40 bg-white/50 animate-pulse rounded-[2.5rem]" />)}
            </div>
          ) : entries.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] p-16 text-center border-2 border-dashed border-slate-100">
               <div className="text-4xl mb-4">🌱</div>
               <p className="text-slate-400 font-medium italic">Your journal is ready for your first entry.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {entries.map(entry => (
                <div key={entry._id} className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-sm border border-slate-50 hover:shadow-md transition-all flex flex-col group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full w-fit mb-1">
                        {new Date(entry.date).toLocaleDateString('default', { weekday: 'long' })}
                      </span>
                      <span className="text-xs text-slate-400 font-bold">
                        {new Date(entry.date).toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <button 
                      onClick={() => deleteEntry(entry._id)} 
                      className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>

                  <div className="space-y-4 flex-grow">
                    {entry.people && (
                      <div className="flex items-start">
                        <span className="text-lg mr-3">👥</span>
                        <p className="text-sm font-bold text-slate-700 leading-tight">{entry.people}</p>
                      </div>
                    )}
                    {entry.things && (
                      <div className="flex items-start">
                        <span className="text-lg mr-3">🎁</span>
                        <p className="text-sm font-bold text-slate-700 leading-tight">{entry.things}</p>
                      </div>
                    )}
                    {entry.situations && (
                      <div className="flex items-start">
                        <span className="text-lg mr-3">☀️</span>
                        <p className="text-sm font-bold text-slate-700 leading-tight">{entry.situations}</p>
                      </div>
                    )}
                  </div>

                  {entry.notes && (
                    <div className="mt-6 pt-6 border-t border-slate-50">
                      <p className="text-sm text-slate-500 leading-relaxed italic">
                        "{entry.notes}"
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default GratitudeJournal;