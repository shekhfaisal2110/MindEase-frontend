import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginHistory, setLoginHistory] = useState([]);
  const [pinnedEmails, setPinnedEmails] = useState([]);
  const from = location.state?.from || '/dashboard';

  // Load pinned emails & history from localStorage
  useEffect(() => {
    const storedPinned = localStorage.getItem('pinnedLogins');
    if (storedPinned) setPinnedEmails(JSON.parse(storedPinned));
    loadHistoryFromLocal();
  }, []);

  const loadHistoryFromLocal = () => {
    const stored = localStorage.getItem('loginHistory');
    if (stored) setLoginHistory(JSON.parse(stored));
  };

  const saveHistoryToLocal = (history) => {
    localStorage.setItem('loginHistory', JSON.stringify(history));
    setLoginHistory(history);
  };

  // Auto‑login using stored refresh token
  const autoLogin = async (savedEmail) => {
    const refreshToken = localStorage.getItem(`refreshToken_${savedEmail}`);
    if (!refreshToken) return false;
    setLoading(true);
    try {
      const res = await api.post('/auth/refresh-token', { email: savedEmail, refreshToken });
      const { accessToken } = res.data;
      // Fetch user info – we need user details; add a /auth/me endpoint or embed in refresh response.
      // For simplicity, we call /auth/login-history which requires auth, so we can extract user from token? 
      // Better: modify refresh endpoint to return user object as well.
      // We'll assume refresh returns accessToken, then we can get user from stored data or make another call.
      // Simpler: store user data alongside refresh token.
      const storedUser = localStorage.getItem(`user_${savedEmail}`);
      if (storedUser) {
        const user = JSON.parse(storedUser);
        login(accessToken, user);
        navigate(from, { replace: true });
        return true;
      } else {
        // Fallback: fetch user info using accessToken
        const userRes = await api.get('/auth/me', { headers: { Authorization: `Bearer ${accessToken}` } });
        login(accessToken, userRes.data.user);
        navigate(from, { replace: true });
        return true;
      }
    } catch (err) {
      console.error('Auto-login failed', err);
      localStorage.removeItem(`refreshToken_${savedEmail}`);
      localStorage.removeItem(`user_${savedEmail}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password, rememberMe });
      const { accessToken, refreshToken, user } = res.data;
      if (rememberMe && refreshToken) {
        localStorage.setItem(`refreshToken_${email}`, refreshToken);
        localStorage.setItem(`user_${email}`, JSON.stringify(user));
      }
      login(accessToken, user);
      // Fetch fresh login history
      const historyRes = await api.get('/auth/login-history', { headers: { Authorization: `Bearer ${accessToken}` } });
      saveHistoryToLocal(historyRes.data);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const togglePin = (emailToPin) => {
    let updated;
    if (pinnedEmails.includes(emailToPin)) {
      updated = pinnedEmails.filter(e => e !== emailToPin);
    } else {
      updated = [...pinnedEmails, emailToPin];
    }
    setPinnedEmails(updated);
    localStorage.setItem('pinnedLogins', JSON.stringify(updated));
  };

  const handleRecentClick = async (entryEmail) => {
    const success = await autoLogin(entryEmail);
    if (!success) setEmail(entryEmail);
  };

  const displayedHistory = [
    ...pinnedEmails.map(email => ({ email, pinned: true, timestamp: null })),
    ...loginHistory.filter(entry => !pinnedEmails.includes(entry.email))
  ].slice(0, 5);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
      <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-2xl shadow-indigo-100 p-8 sm:p-12 max-w-md w-full border border-white">
        {/* Branding/Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-300">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 21c4.478 0 8.268-2.943 9.542-7H16c-2.28 0-4.321-.887-5.822-2.338l.001-.001zM11 11a1 1 0 112 0 1 1 0 01-2 0z" />
            </svg>
          </div>
        </div>

        <h2 className="text-3xl font-black text-center text-slate-800 mb-2 tracking-tight">Welcome Back</h2>
        <p className="text-center text-slate-500 text-sm mb-10 font-medium">Continue your journey with us.</p>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-2xl flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative group">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 absolute top-3 left-4 group-focus-within:text-indigo-600 transition-colors">Email Address</label>
            <input 
              type="email" 
              placeholder="name@example.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              className="w-full pt-7 pb-3 px-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 outline-none font-medium text-slate-700 transition-all placeholder:text-slate-300" 
            />
          </div>

          <div className="relative group">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 absolute top-3 left-4 group-focus-within:text-indigo-600 transition-colors">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              className="w-full pt-7 pb-3 px-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 outline-none font-medium text-slate-700 transition-all placeholder:text-slate-300" 
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={rememberMe} 
                onChange={e => setRememberMe(e.target.checked)} 
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" 
              />
              <span className="text-xs font-medium text-slate-600">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors">
              Forgot Password?
            </Link>
          </div>

          <button 
            disabled={loading} 
            className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-black py-4 rounded-2xl transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>Login to Account</span>
            )}
          </button>

          <div className="pt-6 text-center">
            <p className="text-sm font-medium text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-600 font-black hover:underline underline-offset-4">
                Join now
              </Link>
            </p>
          </div>
        </form>

        {displayedHistory.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              RECENT LOGINS
            </h3>
            <div className="space-y-2">
              {displayedHistory.map((entry, idx) => (
                <div key={entry.email + idx} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl hover:bg-slate-100 transition">
                  <button
                    onClick={() => handleRecentClick(entry.email)}
                    className="flex-1 text-left text-indigo-600 font-medium hover:underline truncate text-sm flex items-center space-x-2"
                    title={localStorage.getItem(`refreshToken_${entry.email}`) ? 'Auto-login available (click)' : 'Click to fill email'}
                  >
                    <span>{entry.email}</span>
                    {localStorage.getItem(`refreshToken_${entry.email}`) && (
                      <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">auto</span>
                    )}
                  </button>
                  <div className="flex items-center space-x-2">
                    {entry.timestamp && (
                      <span className="text-[10px] text-slate-400">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </span>
                    )}
                    <button
                      onClick={() => togglePin(entry.email)}
                      className={`text-sm ${pinnedEmails.includes(entry.email) ? 'text-yellow-500' : 'text-slate-300 hover:text-yellow-500'}`}
                      title={pinnedEmails.includes(entry.email) ? 'Unpin' : 'Pin'}
                    >
                      {pinnedEmails.includes(entry.email) ? '📌' : '📍'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;