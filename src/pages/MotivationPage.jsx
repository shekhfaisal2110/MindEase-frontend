// src/pages/MotivationPage.jsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import api from '../services/api';
import PageLayout from '../components/PageLayout';
import { useAuth } from '../context/AuthContext';

// Skeleton loader – instant visual feedback
const CarouselSkeleton = () => (
  <div className="max-w-4xl mx-auto animate-pulse">
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12 text-center">
      <div className="h-6 w-16 bg-slate-200 rounded mx-auto mb-4" />
      <div className="h-24 bg-slate-100 rounded w-3/4 mx-auto" />
      <div className="flex justify-center gap-2 mt-6">
        <div className="w-10 h-10 bg-slate-200 rounded-full" />
        <div className="text-left"><div className="h-5 w-24 bg-slate-200 rounded mb-1" /><div className="h-3 w-16 bg-slate-200 rounded" /></div>
      </div>
    </div>
  </div>
);

const MotivationPage = React.memo(() => {
  const { user } = useAuth();
  const [thoughts, setThoughts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [newThought, setNewThought] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [dotWindowStart, setDotWindowStart] = useState(0);
  const autoRotateRef = useRef(null);
  const MAX_VISIBLE_DOTS = 5;

  const fetchThoughts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/motivation/thoughts?page=1&limit=50');
      setThoughts(res.data.thoughts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThoughts();
  }, [fetchThoughts]);

  useEffect(() => {
    if (thoughts.length <= 1) {
      if (autoRotateRef.current) clearInterval(autoRotateRef.current);
      return;
    }
    autoRotateRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % thoughts.length);
    }, 10000);
    return () => clearInterval(autoRotateRef.current);
  }, [thoughts.length]);

  useEffect(() => {
    if (thoughts.length <= MAX_VISIBLE_DOTS) return;
    let newStart = currentIndex - Math.floor(MAX_VISIBLE_DOTS / 2);
    newStart = Math.max(0, Math.min(newStart, thoughts.length - MAX_VISIBLE_DOTS));
    setDotWindowStart(newStart);
  }, [currentIndex, thoughts.length]);

  const resetAutoRotate = useCallback(() => {
    if (autoRotateRef.current) {
      clearInterval(autoRotateRef.current);
      if (thoughts.length > 1) {
        autoRotateRef.current = setInterval(() => {
          setCurrentIndex((prev) => (prev + 1) % thoughts.length);
        }, 10000);
      }
    }
  }, [thoughts.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? thoughts.length - 1 : prev - 1));
    resetAutoRotate();
  }, [thoughts.length, resetAutoRotate]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % thoughts.length);
    resetAutoRotate();
  }, [thoughts.length, resetAutoRotate]);

  const goToSlide = useCallback((index) => {
    setCurrentIndex(index);
    resetAutoRotate();
  }, [resetAutoRotate]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!newThought.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/motivation/thoughts', { thought: newThought });
      alert('Your thought has been submitted for admin review.');
      setNewThought('');
      setShowSubmitModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  }, [newThought]);

  const visibleDots = useMemo(() => {
    if (thoughts.length <= MAX_VISIBLE_DOTS) return thoughts;
    return thoughts.slice(dotWindowStart, dotWindowStart + MAX_VISIBLE_DOTS);
  }, [thoughts, dotWindowStart]);

  if (loading) return <CarouselSkeleton />;

  if (thoughts.length === 0) {
    return (
      <PageLayout title="Motivation Corner" subtitle="No inspiring thoughts yet. Be the first to share!">
        <div className="text-center py-12">
          <p className="text-slate-500">No thoughts available. Submit one to inspire others!</p>
          {user && (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-bold shadow transition active:scale-95 touch-manipulation"
            >
              Share a Thought
            </button>
          )}
        </div>
      </PageLayout>
    );
  }

  const currentThought = thoughts[currentIndex];

  return (
    <PageLayout title="Motivation Corner" subtitle="Daily inspiration from our community">
      <div className="max-w-4xl mx-auto px-4 sm:px-0">
        {/* Carousel Container – relative, overflow-visible, z-index context */}
        <div className="relative bg-gradient-to-br from-white to-slate-50 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8 md:p-12 text-center overflow-visible">
          <div className="text-5xl sm:text-6xl text-indigo-300 mb-4">“</div>
          <div className="min-h-[120px] transition-opacity duration-500">
            <p className="text-slate-700 text-base sm:text-xl md:text-2xl leading-relaxed italic break-words">
              {currentThought.thought}
            </p>
          </div>
          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              {(currentThought.user?.username?.charAt(0) || 'A').toUpperCase()}
            </div>
            <div className="text-left">
              <p className="font-bold text-slate-800">{currentThought.user?.username || 'Anonymous'}</p>
              <p className="text-xs text-slate-400">MindEase Member</p>
            </div>
          </div>

          {/* Left/Right navigation arrows – always visible, large touch area */}
          
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={goToPrevious}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2.5 sm:p-3 shadow-md transition active:scale-95 touch-manipulation z-10 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            aria-label="Previous thought"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {visibleDots.map((_, idx) => {
            const actualIndex = dotWindowStart + idx;
            return (
              <button
                key={idx}
                onClick={() => goToSlide(actualIndex)}
                className={`h-2 rounded-full transition-all touch-manipulation ${
                  actualIndex === currentIndex ? 'w-6 bg-indigo-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Go to slide ${actualIndex + 1}`}
              />
            );
          })}
          <button
            onClick={goToNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2.5 sm:p-3 shadow-md transition active:scale-95 touch-manipulation z-10 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            aria-label="Next thought"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Submit Button */}
        {user && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl shadow transition active:scale-95 touch-manipulation"
            >
              💡 Share Your Thought
            </button>
          </div>
        )}
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSubmitModal(false)}
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-slate-800">Share Your Motivation</h3>
              <button onClick={() => setShowSubmitModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full touch-manipulation">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <textarea
                rows={4}
                value={newThought}
                onChange={e => setNewThought(e.target.value)}
                placeholder="Write something inspiring..."
                className="w-full border border-slate-200 rounded-xl p-3 mb-4 focus:ring-2 focus:ring-indigo-500 outline-none resize-none touch-manipulation"
                required
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition active:scale-95 disabled:opacity-50 touch-manipulation"
              >
                {submitting ? 'Submitting...' : 'Submit for Review'}
              </button>
              <p className="text-xs text-slate-400 mt-3 text-center">
                Your thought will be reviewed by our admin team before it appears in the carousel.
              </p>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  );
});

MotivationPage.displayName = 'MotivationPage';
export default MotivationPage;