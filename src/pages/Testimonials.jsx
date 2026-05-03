import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import PageLayout from '../components/PageLayout';
import LoadingSpinner from '../components/LoadingSpinner';

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const fetchTestimonials = async () => {
    try {
      const res = await api.get('/feedback/testimonials');
      // Extract testimonials array from paginated response or direct array
      const data = res.data.testimonials || res.data;
      setTestimonials(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const goToPrevious = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning, testimonials.length]);

  const goToNext = useCallback(() => {
    if (isTransitioning) return;
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

  if (loading) return <LoadingSpinner />;

  if (testimonials.length === 0) {
    return (
      <PageLayout title="Testimonials" subtitle="What our community says about MindEase.">
        <div className="max-w-4xl mx-auto text-center py-16 bg-white rounded-3xl shadow-sm border border-slate-100">
          <div className="text-6xl mb-4">🌟</div>
          <p className="text-slate-500 text-lg">No testimonials yet. Be the first to share your experience!</p>
        </div>
      </PageLayout>
    );
  }

  const currentTestimonial = testimonials[currentIndex];
  const displayedDots = testimonials.slice(0, 5);

  return (
    <PageLayout title="Testimonials" subtitle="Real stories from our community">
      <div className="max-w-4xl mx-auto">
        {/* Main Carousel Card */}
        <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 rounded-full -mr-20 -mt-20 opacity-50" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-50 rounded-full -ml-20 -mb-20 opacity-50" />
          
          <div className="relative p-8 md:p-12 text-center">
            <div className="text-6xl font-serif text-indigo-200 mb-4">“</div>
            <div
              key={currentTestimonial._id}
              className="transition-all duration-500 transform"
              style={{ animation: 'fadeInUp 0.5s ease-out' }}
            >
              <p className="text-slate-700 text-lg md:text-xl leading-relaxed italic">
                {currentTestimonial.comment}
              </p>
            </div>
            
            <div className="flex justify-center gap-1 my-5">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`text-2xl transition-transform ${
                    i < currentTestimonial.rating ? 'text-yellow-400 scale-110' : 'text-gray-200'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md">
                {currentTestimonial.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-800">{currentTestimonial.username}</p>
                <p className="text-xs text-slate-400">MindEase User</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={goToPrevious}
            className="w-10 h-10 rounded-full bg-white shadow-md hover:shadow-lg text-indigo-600 flex items-center justify-center transition-all hover:scale-110"
            aria-label="Previous testimonial"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="flex gap-2 items-center">
            {displayedDots.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex ? 'w-6 bg-indigo-600' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>
          
          <button
            onClick={goToNext}
            className="w-10 h-10 rounded-full bg-white shadow-md hover:shadow-lg text-indigo-600 flex items-center justify-center transition-all hover:scale-110"
            aria-label="Next testimonial"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <style>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </PageLayout>
  );
};

export default Testimonials;