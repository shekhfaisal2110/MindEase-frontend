// src/pages/Testimonials.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import PageLayout from '../components/PageLayout';

// Skeleton loader
const CarouselSkeleton = () => (
  <div className="max-w-4xl mx-auto animate-pulse">
    <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
      <div className="p-8 md:p-12 text-center">
        <div className="h-8 w-16 bg-slate-200 rounded mx-auto mb-6" />
        <div className="h-24 bg-slate-100 rounded w-3/4 mx-auto mb-6" />
        <div className="flex justify-center gap-1 my-5">
          {[...Array(5)].map((_, i) => <div key={i} className="w-6 h-6 bg-slate-200 rounded" />)}
        </div>
        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="w-12 h-12 bg-slate-200 rounded-full" />
          <div className="text-left"><div className="h-5 bg-slate-200 rounded w-32 mb-1" /><div className="h-3 bg-slate-200 rounded w-20" /></div>
        </div>
      </div>
    </div>
  </div>
);

const Testimonials = React.memo(() => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const fetchTestimonials = useCallback(async () => {
    try {
      const res = await api.get('/feedback/testimonials');
      let testimonialsArray = [];
      if (res.data.feedbacks && Array.isArray(res.data.feedbacks)) {
        testimonialsArray = res.data.feedbacks;
      } else if (res.data.testimonials && Array.isArray(res.data.testimonials)) {
        testimonialsArray = res.data.testimonials;
      } else if (res.data.data && Array.isArray(res.data.data)) {
        testimonialsArray = res.data.data;
      } else if (Array.isArray(res.data)) {
        testimonialsArray = res.data;
      }
      setTestimonials(testimonialsArray);
    } catch (err) {
      console.error('Failed to fetch testimonials:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const goToPrevious = useCallback(() => {
    if (isTransitioning || testimonials.length === 0) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning, testimonials.length]);

  const goToNext = useCallback(() => {
    if (isTransitioning || testimonials.length === 0) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning, testimonials.length]);

  const goToSlide = useCallback((index) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning, currentIndex]);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (testimonials.length <= 1) return;
    const interval = setInterval(() => {
      goToNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length, goToNext]);

  const displayedDots = useMemo(() => testimonials.slice(0, 5), [testimonials]);

  if (loading) return <CarouselSkeleton />;

  if (testimonials.length === 0) {
    return (
      <PageLayout title="Testimonials" subtitle="What our community says about MindEase.">
        <div className="max-w-4xl mx-auto text-center py-12 sm:py-16 bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100">
          <div className="text-5xl sm:text-6xl mb-4">🌟</div>
          <p className="text-slate-500 text-base sm:text-lg">No approved testimonials yet. Check back soon!</p>
          <p className="text-slate-400 text-sm mt-2">Approved testimonials appear here.</p>
          {/* Feedback button even when empty */}
          <div className="mt-8">
            <Link
              to="/feedback-form"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl transition active:scale-95 touch-manipulation shadow-md"
            >
              <span>💬</span> Share Your Feedback
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  const currentTestimonial = testimonials[currentIndex];

  return (
    <PageLayout title="Testimonials" subtitle="Real stories from our community">
      <div className="max-w-4xl mx-auto px-4 sm:px-0">
        {/* Main Carousel Card */}
        <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-indigo-50 rounded-full -mr-16 sm:-mr-20 -mt-16 sm:-mt-20 opacity-50" />
          <div className="absolute bottom-0 left-0 w-32 sm:w-40 h-32 sm:h-40 bg-purple-50 rounded-full -ml-16 sm:-ml-20 -mb-16 sm:-mb-20 opacity-50" />
          
          <div className="relative p-6 sm:p-8 md:p-12 text-center">
            <div className="text-5xl sm:text-6xl font-serif text-indigo-200 mb-3 sm:mb-4">“</div>
            <div
              key={currentTestimonial._id}
              className="transition-all duration-500 transform"
              style={{ animation: 'fadeInUp 0.5s ease-out' }}
            >
              <p className="text-slate-700 text-base sm:text-lg md:text-xl leading-relaxed italic break-words">
                {currentTestimonial.comment}
              </p>
            </div>
            
            <div className="flex justify-center gap-0.5 sm:gap-1 my-4 sm:my-5">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`text-xl sm:text-2xl transition-transform ${
                    i < currentTestimonial.rating ? 'text-yellow-400 scale-110' : 'text-gray-200'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-base sm:text-lg font-bold shadow-md">
                {currentTestimonial.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-800 text-sm sm:text-base">{currentTestimonial.username}</p>
                <p className="text-[10px] sm:text-xs text-slate-400">MindEase User</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex justify-center items-center gap-3 sm:gap-4 mt-6 sm:mt-8">
          <button
            onClick={goToPrevious}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow-md hover:shadow-lg text-indigo-600 flex items-center justify-center transition-all active:scale-95 touch-manipulation"
            aria-label="Previous testimonial"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="flex gap-2 items-center">
            {displayedDots.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`h-2 rounded-full transition-all touch-manipulation ${
                  idx === currentIndex ? 'w-6 bg-indigo-600' : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>
          
          <button
            onClick={goToNext}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow-md hover:shadow-lg text-indigo-600 flex items-center justify-center transition-all active:scale-95 touch-manipulation"
            aria-label="Next testimonial"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Feedback Section – CTA Button */}
        <div className="text-center mt-10 sm:mt-12">
          <Link
            to="/feedback-form"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl transition active:scale-95 touch-manipulation shadow-md"
          >
            <span>💬</span> Share Your Feedback
          </Link>
          <p className="text-xs text-slate-400 mt-3">
            Your voice helps us improve. Your feedback may be featured as a testimonial after review.
          </p>
        </div>

        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </PageLayout>
  );
});

Testimonials.displayName = 'Testimonials';
export default Testimonials;