import React, { useState, useRef, useCallback, memo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// Self‑contained registration form – manages its own email check state
const RegistrationForm = memo(({ onSubmit, serverError }) => {
  const usernameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  
  const [emailExists, setEmailExists] = useState(false);
  const [recentLogins, setRecentLogins] = useState([]);
  const [localError, setLocalError] = useState('');
  const checkTimeout = useRef(null);
  const emailCheckLock = useRef(false);

  const checkEmail = useCallback((emailValue) => {
    if (checkTimeout.current) clearTimeout(checkTimeout.current);
    checkTimeout.current = setTimeout(async () => {
      if (!emailValue || emailCheckLock.current) return;
      emailCheckLock.current = true;
      try {
        const res = await api.get(`/auth/check-email/${emailValue}`);
        if (res.data.exists) {
          setEmailExists(true);
          setRecentLogins(res.data.recentLogins || []);
        } else {
          setEmailExists(false);
          setRecentLogins([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        emailCheckLock.current = false;
      }
    }, 500);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formValues = {
      username: usernameRef.current?.value || '',
      email: emailRef.current?.value || '',
      password: passwordRef.current?.value || '',
      confirmPassword: confirmPasswordRef.current?.value || '',
    };
    // Basic frontend validation
    if (!formValues.username) {
      setLocalError('Username is required');
      usernameRef.current?.focus();
      return;
    }
    if (formValues.username.length < 3) {
      setLocalError('Username must be at least 3 characters');
      usernameRef.current?.focus();
      return;
    }
    if (!formValues.email) {
      setLocalError('Email is required');
      emailRef.current?.focus();
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      setLocalError('Please enter a valid email address');
      emailRef.current?.focus();
      return;
    }
    if (!formValues.password) {
      setLocalError('Password is required');
      passwordRef.current?.focus();
      return;
    }
    if (formValues.password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      passwordRef.current?.focus();
      return;
    }
    if (formValues.password !== formValues.confirmPassword) {
      setLocalError('Passwords do not match');
      confirmPasswordRef.current?.focus();
      return;
    }
    setLocalError('');
    onSubmit(formValues);
  };

  const displayError = localError || serverError;

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Username</label>
        <input
          ref={usernameRef}
          type="text"
          name="username"
          placeholder="e.g. wanderer_01"
          className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-100 outline-none"
        />
      </div>

      <div>
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Email Address</label>
        <input
          ref={emailRef}
          type="email"
          name="email"
          placeholder="you@example.com"
          onBlur={(e) => checkEmail(e.target.value)}
          className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-100 outline-none"
        />
      </div>

      {emailExists && (
        <div className="p-3 bg-amber-50 rounded-xl text-sm">
          <p className="font-bold text-amber-700">⚠️ This email already has an account</p>
          {recentLogins.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-semibold text-amber-600">Recent logins:</p>
              <ul className="text-xs text-amber-600 space-y-1 mt-1">
                {recentLogins.map((login, idx) => (
                  <li key={idx}>{new Date(login.timestamp).toLocaleString()}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-xs text-amber-600 mt-2">
            <Link to="/forgot-password" className="underline">Forgot password?</Link> or{' '}
            <Link to="/login" className="underline">login here</Link>.
          </p>
        </div>
      )}

      <div>
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Password</label>
        <input
          ref={passwordRef}
          type="password"
          name="password"
          placeholder="••••••••"
          className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-100 outline-none"
        />
      </div>

      <div>
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Confirm Password</label>
        <input
          ref={confirmPasswordRef}
          type="password"
          name="confirmPassword"
          placeholder="••••••••"
          className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-100 outline-none"
        />
      </div>

      {displayError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-xl">
          {displayError}
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-black py-4 rounded-2xl transition-all shadow-xl active:scale-[0.98]"
      >
        Create Account
      </button>

      <div className="pt-6 text-center">
        <p className="text-sm font-medium text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 font-black hover:underline underline-offset-4">
            Log in
          </Link>
        </p>
      </div>
    </form>
  );
});

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);

  const handleRegister = useCallback(async (formValues) => {
    setError('');
    try {
      const res = await api.post('/auth/register', formValues);
      setUserId(res.data.userId);
      setEmail(formValues.email);
      setStep(2);
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
    }
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    const otp = e.target.otp.value;
    if (!/^\d{6}$/.test(otp)) {
      setError('Please enter a valid 6-digit code');
      return;
    }
    setError('');
    try {
      const res = await api.post('/auth/verify-otp', { userId, otp });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || 'Verification failed. Please try again.';
      setError(message);
    }
  };

  const resendOTP = async () => {
    setIsResending(true);
    try {
      await api.post('/auth/resend-otp', { email });
      alert('A new code has been sent to your email.');
    } catch (err) {
      alert('Failed to resend. Please try again later.');
    } finally {
      setIsResending(false);
    }
  };

  const AuthContainer = ({ children, title, subtitle }) => (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
      <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-2xl shadow-indigo-100 p-8 sm:p-12 max-w-md w-full border border-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
          <div className={`h-full bg-indigo-600 transition-all duration-700 ${step === 1 ? 'w-1/2' : 'w-full'}`} />
        </div>
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">{title}</h2>
          <p className="text-slate-500 font-medium mt-2">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );

  if (step === 1) {
    return (
      <AuthContainer title="Join the Journey" subtitle="Create your account to get started.">
        <RegistrationForm onSubmit={handleRegister} serverError={error} />
      </AuthContainer>
    );
  }

  return (
    <AuthContainer title="Verify Identity" subtitle={`We've sent a 6-digit code to ${email}`}>
      <form onSubmit={handleVerify} className="space-y-6">
        <div className="relative group">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 block text-center">
            Verification Code
          </label>
          <input 
            name="otp" 
            type="text" 
            autoFocus
            maxLength="6" 
            className="w-full text-center text-4xl font-black tracking-[0.4em] py-5 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-indigo-700" 
            placeholder="000000" 
          />
        </div>
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-2xl flex items-center">
            <svg className="w-4 h-4 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
        <div className="space-y-3">
          <button type="submit" className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-black py-4 rounded-2xl transition-all shadow-xl active:scale-[0.98]">
            Confirm & Finish
          </button>
          <button type="button" onClick={resendOTP} disabled={isResending} className="w-full py-2 text-sm font-bold text-slate-400 hover:text-indigo-600 disabled:opacity-50 transition-colors">
            {isResending ? 'Sending code...' : "Didn't get the code? Resend"}
          </button>
        </div>
      </form>
    </AuthContainer>
  );
};

export default Register;