import React, { useState, useCallback, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PageLayout from '../components/PageLayout';

// Lazy load confetti to reduce initial bundle size (saves ~30KB)
const loadConfetti = () => import('canvas-confetti');
let confettiModule = null;

// Preload confetti on hover or idle
const preloadConfetti = () => {
  if (!confettiModule) {
    loadConfetti().then(module => { confettiModule = module.default; });
  }
};

const triggerConfetti = () => {
  if (!confettiModule) return;
  confettiModule({
    particleCount: 200,
    spread: 70,
    origin: { y: 0.6 },
    startVelocity: 20,
    colors: ["#2563eb", "#3b82f6", "#60a5fa", "#1d4ed8", "#f59e0b", "#10b981", "#ef4444"],
    decay: 0.9,
    gravity: 1,
  });
  confettiModule({
    particleCount: 100,
    angle: 60,
    spread: 55,
    origin: { x: 0, y: 0.5 },
    startVelocity: 25,
    colors: ["#8b5cf6", "#ec4899", "#06b6d4"],
  });
  confettiModule({
    particleCount: 100,
    angle: 120,
    spread: 55,
    origin: { x: 1, y: 0.5 },
    startVelocity: 25,
    colors: ["#f97316", "#84cc16", "#a855f7"],
  });
};

const FeedbackForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please write your feedback');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/feedback', { rating, comment });
      // Load confetti only when needed (first successful submission)
      if (!confettiModule) {
        const module = await loadConfetti();
        confettiModule = module.default;
      }
      triggerConfetti();
      setSubmitted(true);
      setComment('');
      setRating(5);
      setTimeout(() => navigate('/testimonials'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  }, [rating, comment, navigate]);

  if (submitted) {
    return (
      <PageLayout title="Thank You" subtitle="Your feedback matters.">
        <div className="max-w-2xl mx-auto text-center p-6 sm:p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl sm:rounded-3xl border border-green-100 shadow-md animate-in fade-in zoom-in-95 duration-500">
          <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🙏</div>
          <h3 className="text-xl sm:text-2xl font-bold text-emerald-800 mb-2">Thank you!</h3>
          <p className="text-emerald-600 text-sm sm:text-base">Your feedback means the world to us.</p>
          <p className="text-xs sm:text-sm text-emerald-500 mt-2">Redirecting to testimonials in a moment...</p>
          <div className="mt-5 sm:mt-6 w-20 sm:w-24 h-1 bg-emerald-200 rounded-full mx-auto overflow-hidden">
            <div className="h-full w-full bg-emerald-500 rounded-full animate-pulse" />
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Share Your Feedback" subtitle="Help us make MindEase even better.">
      <div className="max-w-2xl mx-auto px-4 sm:px-0">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-100 p-5 sm:p-8 transition-all hover:shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-xl sm:rounded-2xl flex items-center justify-center text-indigo-600 text-lg sm:text-xl">
              💬
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Your Experience Matters</h2>
          </div>
          <p className="text-slate-500 mb-6 sm:mb-8 border-l-4 border-indigo-200 pl-3 sm:pl-4 italic text-sm sm:text-base">
            “Your voice helps us build a better MindEase community.”
          </p>

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div>
              <label className="text-xs sm:text-sm font-bold text-slate-700 block mb-2">How would you rate MindEase?</label>
              <div className="flex gap-2 sm:gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={preloadConfetti}
                    onFocus={preloadConfetti}
                    className={`text-3xl sm:text-4xl transition-all hover:scale-110 focus:outline-none touch-manipulation ${
                      star <= rating ? 'text-yellow-400 drop-shadow-md' : 'text-gray-200'
                    }`}
                    aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs sm:text-sm font-bold text-slate-700 block mb-2">Your Honest Feedback</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
                placeholder="What has been your experience with MindEase? What would you like to see improved?"
                className="w-full bg-slate-50 border-none rounded-xl sm:rounded-2xl p-4 sm:p-5 text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-300 resize-none"
                required
              />
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm p-3 rounded-xl flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-slate-900 hover:bg-indigo-600 text-white font-bold py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-200 shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base ${
                loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.01] active:scale-95 touch-manipulation'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
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

          <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-slate-100 text-center">
            <p className="text-[11px] sm:text-xs text-slate-400">
              All feedback is reviewed by our team and may be featured anonymously on our testimonials page.
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default React.memo(FeedbackForm);