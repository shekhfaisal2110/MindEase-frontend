import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PageLayout from '../components/PageLayout';

const FeedbackForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Confetti celebration
  const triggerConfetti = () => {
    confetti({
      particleCount: 200,
      spread: 70,
      origin: { y: 0.6 },
      startVelocity: 20,
      colors: ["#2563eb", "#3b82f6", "#60a5fa", "#1d4ed8", "#f59e0b", "#10b981", "#ef4444"],
      decay: 0.9,
      gravity: 1,
    });
    confetti({
      particleCount: 100,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.5 },
      startVelocity: 25,
      colors: ["#8b5cf6", "#ec4899", "#06b6d4"],
    });
    confetti({
      particleCount: 100,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.5 },
      startVelocity: 25,
      colors: ["#f97316", "#84cc16", "#a855f7"],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please write your feedback');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/feedback/submit', { rating, comment });
      triggerConfetti(); // 🎉 celebrate successful submission
      setSubmitted(true);
      setComment('');
      setRating(5);
      setTimeout(() => {
        navigate('/testimonials');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <PageLayout title="Thank You" subtitle="Your feedback matters.">
        <div className="max-w-2xl mx-auto text-center p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border border-green-100 shadow-md animate-in fade-in zoom-in-95 duration-500">
          <div className="text-6xl mb-4">🙏</div>
          <h3 className="text-2xl font-bold text-emerald-800 mb-2">Thank you!</h3>
          <p className="text-emerald-600">Your feedback means the world to us.</p>
          <p className="text-sm text-emerald-500 mt-2">Redirecting to testimonials in a moment...</p>
          <div className="mt-6 w-24 h-1 bg-emerald-200 rounded-full mx-auto overflow-hidden">
            <div className="h-full w-full bg-emerald-500 rounded-full animate-pulse" />
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Share Your Feedback" subtitle="Help us make MindEase even better.">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 transition-all hover:shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 text-xl">
              💬
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Your Experience Matters</h2>
          </div>
          <p className="text-slate-500 mb-8 border-l-4 border-indigo-200 pl-4 italic">
            “Your voice helps us build a better MindEase community.”
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-2">How would you rate MindEase?</label>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-4xl transition-all hover:scale-110 focus:outline-none ${
                      star <= rating ? 'text-yellow-400 drop-shadow-md' : 'text-gray-200'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700 block mb-2">Your Honest Feedback</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="5"
                placeholder="What has been your experience with MindEase? What would you like to see improved?"
                className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-300"
                required
              />
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm p-3 rounded-xl flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-slate-900 hover:bg-indigo-600 text-white font-bold py-4 rounded-2xl transition-all duration-200 shadow-lg flex items-center justify-center gap-2 ${
                loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.01] active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span>Send Feedback</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              All feedback is reviewed by our team and may be featured anonymously on our testimonials page.
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default FeedbackForm;