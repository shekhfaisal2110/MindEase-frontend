import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';

const TherapyExercises = () => {
  const [exercises, setExercises] = useState([]);
  const [type, setType] = useState('hotpotato');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const res = await api.get('/therapy');
      setExercises(res.data);
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  };

  const addExercise = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      const res = await api.post('/therapy', { type, content });
      setExercises([res.data, ...exercises]);
      setContent('');
    } catch (err) { console.error(err) }
  };

  const completeExercise = async (id) => {
    try {
      const res = await api.put(`/therapy/complete/${id}`);
      setExercises(exercises.map(ex => ex._id === id ? res.data : ex));
    } catch (err) { console.error(err) }
  };

  const getTypeStyles = (type) => {
    const styles = {
      hotpotato: "bg-amber-100 text-amber-700 border-amber-200",
      forgiveness: "bg-purple-100 text-purple-700 border-purple-200",
      selftalk: "bg-blue-100 text-blue-700 border-blue-200",
      receiving: "bg-emerald-100 text-emerald-700 border-emerald-200",
    };
    return styles[type] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-800 pb-12">
      <Navbar />
      
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            Growth & Healing
          </h1>
          <p className="text-slate-500 font-medium italic">
            "One step at a time, one phrase at a time."
          </p>
        </header>

        {/* Hot Potato Instructional Card */}
        <section className="mb-12 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-200 to-orange-200 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-amber-50 rounded-[2.5rem] p-6 md:p-8 border border-amber-100 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-2xl">🔥</span>
              <h2 className="text-xl font-black text-amber-900">Hot Potato Exercise</h2>
            </div>
            <p className="text-amber-800 text-sm mb-6 leading-relaxed">
              Aim for <strong className="text-amber-950 font-black">33</strong> repetitions this month to clear the mental space.
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              {['I am responsible for everything', 'I am sorry, please forgive me', 'Thank you, I love you'].map((phrase, i) => (
                <div key={i} className="bg-white/60 backdrop-blur-sm p-3 rounded-2xl text-xs font-bold text-amber-900 border border-amber-200/50 shadow-sm">
                  "{phrase}"
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Form to add Exercise */}
        <section className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-6 md:p-8 border border-slate-100 mb-12">
          <form onSubmit={addExercise} className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">
                Exercise Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['hotpotato', 'forgiveness', 'selftalk', 'receiving'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`py-2 px-1 text-[10px] font-black rounded-xl border-2 transition-all truncate uppercase tracking-tighter ${
                      type === t 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                      : 'border-slate-50 bg-slate-50 text-slate-400'
                    }`}
                  >
                    {t.replace('hotpotato', 'Potato')}
                  </button>
                ))}
              </div>
            </div>

            <textarea 
              placeholder="What are we focusing on today?" 
              value={content} 
              onChange={e => setContent(e.target.value)} 
              className="w-full bg-slate-50 border-none rounded-2xl p-5 text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all min-h-[120px] shadow-inner" 
              required 
            />

            <button type="submit" className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-black py-4 rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center space-x-2">
              <span>Commit to Exercise</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
            </button>
          </form>
        </section>

        {/* Exercises List */}
        <div className="space-y-6">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Active Practice</h2>
          
          {loading ? (
            <div className="flex flex-col items-center py-10 animate-pulse space-y-4">
              <div className="h-16 w-full bg-slate-100 rounded-3xl" />
              <div className="h-16 w-full bg-slate-100 rounded-3xl" />
            </div>
          ) : exercises.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-medium">Ready to start? Add your first exercise above.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {exercises.map(ex => (
                <div 
                  key={ex._id} 
                  className={`bg-white p-5 rounded-3xl shadow-sm border transition-all duration-300 flex justify-between items-center group ${
                    ex.completed ? 'opacity-60 border-slate-100 shadow-none' : 'border-slate-100 hover:shadow-md hover:border-indigo-100'
                  }`}
                >
                  <div className="flex-1 pr-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg border tracking-wider ${getTypeStyles(ex.type)}`}>
                        {ex.type}
                      </span>
                      {ex.completed && (
                        <span className="flex items-center text-emerald-600 font-bold text-[10px] uppercase tracking-widest">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                          Completed
                        </span>
                      )}
                    </div>
                    <p className={`text-slate-700 font-medium leading-relaxed ${ex.completed ? 'line-through decoration-slate-300' : ''}`}>
                      {ex.content}
                    </p>
                  </div>

                  {!ex.completed && (
                    <button 
                      onClick={() => completeExercise(ex._id)} 
                      className="bg-emerald-50 hover:bg-emerald-500 hover:text-white text-emerald-600 w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90 flex-shrink-0 shadow-sm"
                      title="Mark Complete"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TherapyExercises;