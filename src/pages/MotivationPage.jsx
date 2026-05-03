import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import PageLayout from '../components/PageLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const MotivationPage = () => {
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

  // Fetch approved thoughts (first 50)
  const fetchThoughts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/motivation/thoughts?page=1&limit=50');
      setThoughts(res.data.thoughts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThoughts();
  }, [fetchThoughts]);

  // Auto‑rotate every 10 seconds
  useEffect(() => {
    if (thoughts.length <= 1) return;
    autoRotateRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % thoughts.length);
    }, 10000);
    return () => clearInterval(autoRotateRef.current);
  }, [thoughts.length]);

  // Update dot window whenever currentIndex changes
  useEffect(() => {
    if (thoughts.length <= MAX_VISIBLE_DOTS) {
      setDotWindowStart(0);
      return;
    }
    // Center the window around the current index
    let newStart = currentIndex - Math.floor(MAX_VISIBLE_DOTS / 2);
    newStart = Math.max(0, Math.min(newStart, thoughts.length - MAX_VISIBLE_DOTS));
    setDotWindowStart(newStart);
  }, [currentIndex, thoughts.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? thoughts.length - 1 : prev - 1));
    resetAutoRotate();
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % thoughts.length);
    resetAutoRotate();
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
    resetAutoRotate();
  };

  const resetAutoRotate = () => {
    if (autoRotateRef.current) clearInterval(autoRotateRef.current);
    if (thoughts.length > 1) {
      autoRotateRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % thoughts.length);
      }, 10000);
    }
  };

  const scrollDotsLeft = () => {
    const newStart = Math.max(0, dotWindowStart - MAX_VISIBLE_DOTS);
    setDotWindowStart(newStart);
  };

  const scrollDotsRight = () => {
    const newStart = Math.min(thoughts.length - MAX_VISIBLE_DOTS, dotWindowStart + MAX_VISIBLE_DOTS);
    setDotWindowStart(newStart);
  };

  const handleSubmit = async (e) => {
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
  };

  if (loading) return <LoadingSpinner />;

  if (thoughts.length === 0) {
    return (
      <PageLayout title="Motivation Corner" subtitle="No inspiring thoughts yet. Be the first to share!">
        <div className="text-center py-12">
          <p className="text-slate-500">No thoughts available. Submit one to inspire others!</p>
          {user && (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="mt-4 bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold shadow"
            >
              Share a Thought
            </button>
          )}
        </div>
      </PageLayout>
    );
  }

  const currentThought = thoughts[currentIndex];
  const visibleDots = thoughts.slice(dotWindowStart, dotWindowStart + MAX_VISIBLE_DOTS);
  const showLeftDotArrow = dotWindowStart > 0;
  const showRightDotArrow = dotWindowStart + MAX_VISIBLE_DOTS < thoughts.length;

  return (
    <PageLayout title="Motivation Corner" subtitle="Daily inspiration from our community">
      <div className="max-w-4xl mx-auto">
        {/* Carousel Container */}
        <div className="relative bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12 text-center">
          {/* Quote Icon */}
          <div className="text-6xl text-indigo-300 mb-4">“</div>

          {/* Thought Text */}
          <div className="min-h-[120px] transition-opacity duration-500">
            <p className="text-slate-700 text-xl md:text-2xl leading-relaxed italic">
              {currentThought.thought}
            </p>
          </div>

          {/* Author */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              {(currentThought.user?.username?.charAt(0) || 'A').toUpperCase()}
            </div>
            <div className="text-left">
              <p className="font-bold text-slate-800">{currentThought.user?.username || 'Anonymous'}</p>
              <p className="text-xs text-slate-400">MindEase Member</p>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition"
            aria-label="Previous"
          >
            <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7 7-7-7" />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition"
            aria-label="Next"
          >
            <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Dots with left/right scroll */}
        <div className="flex justify-center items-center gap-2 mt-6">
          <div className="flex gap-2">
            {visibleDots.map((_, idx) => {
              const actualIndex = dotWindowStart + idx;
              return (
                <button
                  key={idx}
                  onClick={() => goToSlide(actualIndex)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    actualIndex === currentIndex ? 'w-6 bg-indigo-600' : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Go to slide ${actualIndex + 1}`}
                />
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        {user && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-xl shadow transition"
            >
              💡 Share Your Thought
            </button>
          </div>
        )}
      </div>

      {/* Modal for Submission */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800">Share Your Motivation</h3>
              <button onClick={() => setShowSubmitModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <textarea
                rows="4"
                value={newThought}
                onChange={e => setNewThought(e.target.value)}
                placeholder="Write something inspiring..."
                className="w-full border border-slate-200 rounded-xl p-3 mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 text-white font-bold py-2 rounded-xl transition disabled:opacity-50"
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
};

export default MotivationPage;