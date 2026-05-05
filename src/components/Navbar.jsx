import React, { useState, useEffect, useCallback, lazy, Suspense, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// Lazy load NotificationPanel to split bundle (~40KB saved)
const NotificationPanel = lazy(() => import('./NotificationPanel'));

// Memoized confetti function – loads only on demand
let confettiModule = null;
const loadConfetti = () => import('canvas-confetti').then(mod => { confettiModule = mod.default; return mod.default; });

const triggerConfetti = () => {
  if (!confettiModule) return;
  confettiModule({
    particleCount: 200, spread: 70, origin: { y: 0.6 }, startVelocity: 20,
    colors: ["#2563eb", "#3b82f6", "#60a5fa", "#1d4ed8", "#f59e0b", "#10b981", "#ef4444"], decay: 0.9, gravity: 1,
  });
  confettiModule({ particleCount: 100, angle: 60, spread: 55, origin: { x: 0, y: 0.5 }, startVelocity: 25, colors: ["#8b5cf6", "#ec4899", "#06b6d4"] });
  confettiModule({ particleCount: 100, angle: 120, spread: 55, origin: { x: 1, y: 0.5 }, startVelocity: 25, colors: ["#f97316", "#84cc16", "#a855f7"] });
};

// Static navigation groups – defined outside component to avoid recreation
const navGroups = [
  { label: "✨ Dashboard", links: [{ to: "/dashboard", label: "Overview" }] },
  { label: "🧠 Emotional Wellness", links: [{ to: "/hourly-emotion", label: "Hourly Emotions" }, { to: "/emotional", label: "Daily Check‑in" }, { to: "/react-response", label: "React vs Response" }] },
  { label: "🌱 Growth Tools", links: [{ to: "/affirmations", label: "Affirmations" }, { to: "/therapy", label: "Therapy Exercises" }, { to: "/letters", label: "Letters to Self" }, { to: "/ikigai", label: "Ikigai (Purpose)" }] },
  { label: "📊 Daily Tracking", links: [{ to: "/gratitude", label: "Gratitude Journal" }, { to: "/dailytracker", label: "Habit Tracker" }, { to: "/sleep", label: "Sleep Log" }, { to: "/time-dashboard", label: "Quality Time" }, { to: "/device-usage", label: "Digital Wellbeing" }, { to: "/tiny-wins", label: "Tiny Wins" }] },
  { label: "📈 Insights & Achievements", links: [{ to: "/analytics", label: "Personal Analytics" }, { to: "/badges", label: "Achievement Badges" }, { to: "/leaderboard", label: "Leaderboard" }, { to: "/export", label: "Export Report" }] },
  { label: "🧘 Therapeutic Tools", links: [{ to: "/cbt", label: "CBT Thought Record" }, { to: "/coping-cards", label: "Coping Cards" }] },
  { label: "💡 Motivation", links: [{ to: "/motivation", label: "Inspiring Thoughts" }] },
  { label: "🛠️ Support & Resources", links: [{ to: "/chat", label: "Live Support" }, { to: "/install-guide", label: "Install App" }, { to: "/how-to-use", label: "How to Use" }] },
  { label: "👥 Community", links: [{ to: "/testimonials", label: "Testimonials" }, { to: "/feedback-form", label: "Give Feedback" }] },
  { label: "⚙️ Account", links: [{ to: "/profile", label: "My Profile" }] },
  { label: "ℹ️ About", links: [{ to: "/developer", label: "Developer" }] },
];

const Navbar = React.memo(() => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Scroll listener (memoized)
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ESC to close menu
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') setIsMenuOpen(false); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.data.count);
    } catch (err) { console.error('Failed to fetch unread count:', err); }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 60000);
      return () => clearInterval(interval);
    }
  }, [user, fetchUnreadCount]);

  const handleLogout = useCallback(() => {
    setIsMenuOpen(false);
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const handleLogoClick = useCallback(async (e) => {
    e.preventDefault();
    // Load confetti only when user clicks logo (lazy load)
    if (!confettiModule) await loadConfetti();
    triggerConfetti();
    setTimeout(() => navigate('/dashboard'), 50);
  }, [navigate]);

  const handleLinkClick = useCallback(() => {
    setOpenDropdown(null);
    setIsMenuOpen(false);
  }, []);

  // Memoized nav groups – stable reference
  const memoizedNavGroups = useMemo(() => navGroups, []);

  if (!user) return null;

  return (
    <>
      <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-indigo-600/90 backdrop-blur-md py-2 shadow-xl' 
          : 'bg-indigo-600 py-3 sm:py-4'
      } text-white`}>
        <div className="container mx-auto px-4 sm:px-6 flex justify-between items-center">
          {/* Logo – touch‑friendly */}
          <button onClick={handleLogoClick} className="flex items-center space-x-2 sm:space-x-3 group focus:outline-none touch-manipulation">
            <div className="bg-white p-1.5 rounded-xl transition-transform group-hover:scale-110 shadow-lg">
              <span className="text-lg sm:text-xl">🌿</span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight">Mind<span className="text-indigo-200">Ease</span></h1>
          </button>

          {/* Right side – username hidden on very small screens */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setShowNotifications(true)}
              className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors touch-manipulation"
              aria-label="Notifications"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Username – hidden on screens < 480px */}
            <div className="hidden xs:flex flex-col items-end mr-1 sm:mr-2">
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-indigo-200 font-bold">Welcome back</span>
              <span className="text-xs sm:text-sm font-semibold truncate max-w-[100px]">{user?.username}</span>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors touch-manipulation"
              aria-label="Menu"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? 
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /> : 
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile/Desktop Side Menu */}
      <div className={`fixed inset-0 z-40 transition-all duration-500 ${isMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
        <div className="absolute inset-0 bg-indigo-950/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
        <div className={`absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-5 sm:p-8 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6 sm:mb-8">
              <h2 className="text-indigo-900 text-xl sm:text-2xl font-bold">Menu</h2>
              <button onClick={() => setIsMenuOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 touch-manipulation">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-grow overflow-y-auto pr-2 -mr-2">
              {memoizedNavGroups.map((group) => (
                <div key={group.label} className="mb-5 sm:mb-6">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">{group.label}</h3>
                  <div className="space-y-1.5 sm:space-y-2">
                    {group.links.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={handleLinkClick}
                        className={`block px-3 sm:px-4 py-2 rounded-xl transition text-sm sm:text-base ${
                          location.pathname === link.to
                            ? 'bg-indigo-50 text-indigo-600 font-bold'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-gray-100">
              <button onClick={handleLogout} className="w-full bg-red-50 text-red-600 font-bold py-3 sm:py-4 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2 touch-manipulation text-sm sm:text-base">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lazy‑loaded Notification Panel */}
      {showNotifications && (
        <Suspense fallback={null}>
          <NotificationPanel onClose={() => setShowNotifications(false)} />
        </Suspense>
      )}
      <div className="h-14 sm:h-16" />
    </>
  );
});

Navbar.displayName = 'Navbar';
export default Navbar;