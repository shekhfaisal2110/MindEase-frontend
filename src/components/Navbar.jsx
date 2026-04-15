import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // If not logged in, don't render navbar at all
  if (!user) return null;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/hourly-emotion", label: "Hourly Emotions" },
    { to: "/emotional", label: "Emotions" },
    { to: "/gratitude", label: "Gratitude" },
    { to: "/affirmations", label: "Affirmations" },
    { to: "/therapy", label: "Therapy" },
    { to: "/letters", label: "Letters" },
    { to: "/dailytracker", label: "Daily Tracker" },
    { to: "/react-response", label: "React vs Response" },
    { to: "/ikigai", label: "Ikigai" },
  ];

  return (
    <>
      <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-indigo-600/90 backdrop-blur-md py-2 shadow-xl' 
          : 'bg-indigo-600 py-4'
      } text-white`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className="bg-white p-1.5 rounded-xl transition-transform group-hover:scale-110 shadow-lg">
              <span className="text-xl">🌿</span>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight">Mind<span className="text-indigo-200">Ease</span></h1>
          </Link>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-[10px] uppercase tracking-widest text-indigo-200 font-bold">Welcome back</span>
              <span className="text-sm font-semibold">{user?.username}</span>
            </div>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors focus:ring-2 focus:ring-white/50 outline-none"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Full screen overlay menu */}
      <div className={`fixed inset-0 z-40 transition-all duration-500 ${isMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
        <div className="absolute inset-0 bg-indigo-950/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
        <div className={`absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-8 h-full flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-indigo-900 text-2xl font-bold">Menu</h2>
              <button onClick={() => setIsMenuOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-grow overflow-y-auto pr-2">
              <div className="grid gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                      location.pathname === link.to ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>{link.label}</span>
                    {location.pathname === link.to && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-100">
              <button onClick={handleLogout} className="w-full bg-red-50 text-red-600 font-bold py-4 rounded-2xl hover:bg-red-100 transition-colors flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="h-20" />
    </>
  );
};

export default Navbar;