import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import api from '../services/api';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';

const LettersToSelf = () => {
  const [letters, setLetters] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  // Global storage: page view recorded once per day via backend
  useEffect(() => {
    const recordPageView = async () => {
      try {
        const res = await api.post('/daily-activity/page-view', { pageName: 'letters' });
        if (!res.data.alreadyRecorded) {
          await api.post('/activity/add', { actionType: 'pageView', points: 1 });
        }
      } catch (err) { console.error(err); }
    };
    recordPageView();
    fetchLetters();
  }, []);

  const fetchLetters = async () => {
    try {
      const res = await api.get('/letters');
      setLetters(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
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

  const addLetter = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      const res = await api.post('/letters', { content });
      setLetters([res.data, ...letters]);
      setContent('');

      // Add activity points for this letter (+20)
      await api.post('/activity/add', { actionType: 'letterToSelf', points: 20 });
      console.log('✅ +20 points for writing a letter to yourself');

      // 🎉 Celebrate with confetti
      triggerConfetti();
    } catch (err) { console.error(err); }
  };

  const markRead = async (id) => {
    try {
      await api.put(`/letters/read/${id}`);
      setLetters(letters.map(l => l._id === id ? { ...l, isRead: true } : l));
    } catch (err) { console.error(err); }
  };

  const deleteLetter = async (id) => {
    if (!window.confirm('This letter will be lost forever. Proceed?')) return;
    try {
      await api.delete(`/letters/${id}`);
      setLetters(letters.filter(l => l._id !== id));
    } catch (err) { console.error(err); }
  };

  // Show full‑page loading spinner while fetching data
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800">
      <Navbar />
      
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        {/* Header Section */}
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">
            Letters to Myself
          </h1>
          <p className="text-slate-500 font-medium italic">
            "Your future self is listening. What do they need to hear?"
          </p>
        </header>

        {/* Input Form - The Compose Section */}
        <section className="mb-12">
          <form 
            onSubmit={addLetter} 
            className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 p-6 md:p-8 border border-slate-100"
          >
            <div className="flex items-center space-x-2 mb-4">
              <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                New Letter
              </span>
            </div>
            <textarea 
              placeholder="Dear Future Me..." 
              value={content} 
              onChange={e => setContent(e.target.value)} 
              className="w-full bg-[#FCFBF7] border-none rounded-2xl p-5 text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all min-h-[180px] leading-relaxed shadow-inner" 
              required 
            />
            <div className="mt-4 flex justify-end">
              <button 
                type="submit" 
                className="bg-slate-900 hover:bg-indigo-600 text-white font-bold py-3 px-8 rounded-2xl transition-all shadow-lg active:scale-95 flex items-center space-x-2"
              >
                <span>Seal & Save</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </section>

        {/* Letters List */}
        <div className="space-y-6">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">
            Recent Correspondence
          </h2>

          {letters.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-16 text-center">
              <p className="text-slate-400 font-medium">Your mailbox is currently empty.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {letters.map(letter => (
                <div 
                  key={letter._id} 
                  className={`relative group bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border transition-all duration-300 ${
                    !letter.isRead ? 'border-l-4 border-l-indigo-500 border-slate-100' : 'border-slate-100 opacity-90'
                  } hover:shadow-md hover:-translate-y-1`}
                >
                  {/* Status Indicator for Unread */}
                  {!letter.isRead && (
                    <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg animate-bounce">
                      NEW
                    </span>
                  )}

                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed mb-6 font-medium">
                    {letter.content}
                  </p>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-6 border-t border-slate-50 gap-4">
                    <div className="flex items-center text-slate-400">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <time className="text-xs font-bold tracking-wide">
                        {new Date(letter.date).toLocaleDateString(undefined, { 
                          year: 'numeric', month: 'long', day: 'numeric' 
                        })}
                      </time>
                    </div>

                    <div className="flex space-x-2 w-full sm:w-auto">
                      {!letter.isRead && (
                        <button 
                          onClick={() => markRead(letter._id)} 
                          className="flex-1 sm:flex-none bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-4 py-2 rounded-xl text-xs font-black transition-colors"
                        >
                          Mark as Read
                        </button>
                      )}
                      <button 
                        onClick={() => deleteLetter(letter._id)} 
                        className="flex-1 sm:flex-none p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        title="Delete Permanently"
                      >
                        <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LettersToSelf;