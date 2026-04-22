import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';

const Ikigai = () => {
  const [ikigai, setIkigai] = useState({
    love: [], skill: [], worldNeed: [], earn: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newItem, setNewItem] = useState({ category: 'love', text: '' });

  // ✅ Global storage: page view recorded once per day via backend
  useEffect(() => {
    const recordPageView = async () => {
      try {
        const res = await api.post('/daily-activity/page-view', { pageName: 'ikigai' });
        if (!res.data.alreadyRecorded) {
          await api.post('/activity/add', { actionType: 'pageView', points: 1 });
        }
      } catch (err) { console.error(err); }
    };
    recordPageView();
    fetchIkigai();
  }, []);

  const fetchIkigai = async () => {
    try {
      const res = await api.get('/ikigai');
      setIkigai(res.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const addItem = async (category) => {
    const textToAdd = newItem.category === category ? newItem.text.trim() : "";
    if (!textToAdd) return;

    if (ikigai[category].includes(textToAdd)) {
      alert(`"${textToAdd}" is already in this list.`);
      return;
    }

    const updated = { ...ikigai };
    updated[category] = [...updated[category], textToAdd];
    setIkigai(updated);
    setNewItem({ category: 'love', text: '' });

    // Add activity points for this item (+10)
    try {
      await api.post('/activity/add', { actionType: 'ikigaiItem', points: 10 });
      console.log(`✅ +10 points for adding to ${category}: ${textToAdd}`);
    } catch (err) {
      console.error('Failed to add activity points:', err);
    }
  };

  const removeItem = (category, index) => {
    const updated = { ...ikigai };
    updated[category] = updated[category].filter((_, i) => i !== index);
    setIkigai(updated);
  };

  const saveIkigai = async () => {
    setSaving(true);
    try {
      await api.put('/ikigai', ikigai);
      alert('Your Ikigai journey has been saved.');
    } catch (err) {
      alert('Failed to save');
    } finally { setSaving(false); }
  };

  const findOverlap = (cat1, cat2) => ikigai[cat1].filter(item => ikigai[cat2].includes(item));

  const passion = findOverlap('love', 'skill');
  const mission = findOverlap('love', 'worldNeed');
  const vocation = findOverlap('skill', 'earn');
  const profession = findOverlap('worldNeed', 'earn');
  const ikigaiCenter = passion.filter(item => ikigai.worldNeed.includes(item) && ikigai.earn.includes(item));

  const categories = [
    { key: 'love', label: 'What you Love', icon: '❤️', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100', accent: 'bg-rose-500' },
    { key: 'skill', label: 'What you are Good At', icon: '⭐', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100', accent: 'bg-indigo-500' },
    { key: 'worldNeed', label: 'What the World Needs', icon: '🌍', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', accent: 'bg-emerald-500' },
    { key: 'earn', label: 'What you can be Paid For', icon: '💰', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', accent: 'bg-amber-500' },
  ];

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium animate-pulse">Reflecting on your purpose...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        
        {/* Header Section */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
            Ikigai
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
            The Japanese secret to a long and happy life. Find the intersection of your passion, mission, vocation, and profession.
          </p>
        </header>

        {/* 2x2 Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {categories.map(cat => (
            <div key={cat.key} className={`${cat.bg} ${cat.border} border-2 rounded-[2.5rem] p-6 md:p-8 transition-all hover:shadow-xl hover:shadow-slate-200/50`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-black ${cat.text} flex items-center`}>
                  <span className="mr-3 text-2xl">{cat.icon}</span>
                  {cat.label}
                </h2>
                <span className="text-xs font-black uppercase tracking-widest opacity-40">{ikigai[cat.key].length} Items</span>
              </div>

              {/* Input Area */}
              <div className="relative mb-6">
                <input
                  type="text"
                  value={newItem.category === cat.key ? newItem.text : ''}
                  onChange={(e) => setNewItem({ category: cat.key, text: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && addItem(cat.key)}
                  placeholder="Type and press Enter..."
                  className="w-full bg-white/60 backdrop-blur-sm border-none rounded-2xl py-4 pl-5 pr-14 text-sm font-medium focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 outline-none transition-all"
                />
                <button 
                  onClick={() => addItem(cat.key)}
                  className={`absolute right-2 top-2 bottom-2 px-4 rounded-xl text-white font-bold text-xs transition-transform active:scale-90 ${cat.accent}`}
                >
                  Add
                </button>
              </div>

              {/* List Area */}
              <div className="flex flex-wrap gap-2">
                {ikigai[cat.key].map((item, idx) => (
                  <div key={idx} className="group bg-white/80 backdrop-blur-sm border border-slate-100 pl-4 pr-2 py-2 rounded-xl flex items-center shadow-sm animate-in fade-in slide-in-from-bottom-2">
                    <span className="text-sm font-bold text-slate-700 mr-3">{item}</span>
                    <button 
                      onClick={() => removeItem(cat.key, idx)} 
                      className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
                {ikigai[cat.key].length === 0 && (
                  <p className="text-sm text-slate-400 font-medium italic py-2">Start typing to add your first reflection...</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Insights Section */}
        <section className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-8 md:p-12 mb-10">
          <div className="flex items-center mb-10">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg shadow-indigo-100">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Purpose Insights</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: 'Passion', items: passion, color: 'text-rose-600', sub: 'Love + Skill' },
              { label: 'Mission', items: mission, color: 'text-emerald-600', sub: 'Love + World Need' },
              { label: 'Vocation', items: vocation, color: 'text-indigo-600', sub: 'Skill + Earn' },
              { label: 'Profession', items: profession, color: 'text-amber-600', sub: 'Need + Earn' },
            ].map(insight => (
              <div key={insight.label} className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{insight.sub}</span>
                <h3 className={`text-xl font-black ${insight.color} mb-3`}>{insight.label}</h3>
                <div className="flex flex-wrap gap-2">
                  {insight.items.length > 0 ? insight.items.map(item => (
                    <span key={item} className="bg-slate-50 text-slate-600 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-slate-100">{item}</span>
                  )) : (
                    <span className="text-xs text-slate-300 italic">No intersections found yet</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Central Ikigai Badge */}
          {ikigaiCenter.length > 0 && (
            <div className="mt-12 p-8 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2rem] text-center shadow-2xl shadow-indigo-200 animate-in zoom-in-95">
              <span className="inline-block px-4 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-widest mb-4">The Sweet Spot</span>
              <h3 className="text-3xl font-black text-white mb-4">🌟 Your True Ikigai</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {ikigaiCenter.map(item => (
                  <span key={item} className="bg-white text-indigo-700 font-black px-6 py-2 rounded-xl shadow-lg">{item}</span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Action Button */}
        <div className="max-w-xs mx-auto">
          <button
            onClick={saveIkigai}
            disabled={saving}
            className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-black py-5 px-8 rounded-2xl transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {saving ? (
              <span className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Preserving...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                Save Journey
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Ikigai;