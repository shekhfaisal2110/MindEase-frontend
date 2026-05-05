// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../services/api';

// const ForgotPassword = () => {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState('');
//   const [userId, setUserId] = useState('');
//   const [otp, setOtp] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [step, setStep] = useState(1);
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleSend = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);
//     try {
//       const res = await api.post('/auth/forgot-password', { email });
//       setUserId(res.data.userId);
//       setStep(2);
//     } catch (err) {
//       setError(err.response?.data?.message || 'Something went wrong. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleReset = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);
//     try {
//       await api.post('/auth/reset-password', { userId, otp, newPassword });
//       // Using a custom success toast or better UI alert is preferred, but alert works for logic
//       alert('Password reset successful! You can now log in.');
//       navigate('/login');
//     } catch (err) {
//       setError(err.response?.data?.message || 'Invalid OTP or session expired.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-50 via-white to-purple-50 flex items-center justify-center p-6">
//       <div className="bg-white/80 backdrop-blur-sm rounded-[2.5rem] shadow-2xl shadow-indigo-100 p-8 sm:p-12 max-w-md w-full border border-white">
        
//         {/* Logo/Icon Space */}
//         <div className="flex justify-center mb-6">
//           <div className="w-16 h-16 bg-indigo-600 rounded-2xl rotate-12 flex items-center justify-center shadow-lg shadow-indigo-200">
//             <svg className="w-8 h-8 text-white -rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//             </svg>
//           </div>
//         </div>

//         <h2 className="text-3xl font-black text-center text-slate-800 mb-2">Reset Password</h2>
//         <p className="text-center text-slate-500 text-sm mb-8 px-4">
//           {step === 1 
//             ? "Enter your email and we'll send you a recovery code." 
//             : "Check your inbox. We've sent a 6-digit code to your email."}
//         </p>

//         {/* Step Indicator */}
//         <div className="flex items-center justify-center space-x-2 mb-8">
//           <div className={`h-1.5 w-10 rounded-full transition-all ${step >= 1 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
//           <div className={`h-1.5 w-10 rounded-full transition-all ${step === 2 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
//         </div>

//         {error && (
//           <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-2xl animate-pulse">
//             ⚠️ {error}
//           </div>
//         )}

//         {step === 1 ? (
//           <form onSubmit={handleSend} className="space-y-4">
//             <div className="relative">
//               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 absolute top-3 left-4">Email Address</label>
//               <input 
//                 type="email" 
//                 placeholder="name@example.com" 
//                 value={email} 
//                 onChange={(e) => setEmail(e.target.value)} 
//                 required 
//                 className="w-full pt-7 pb-3 px-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 outline-none font-medium transition-all" 
//               />
//             </div>
            
//             <button 
//               type="submit" 
//               disabled={loading} 
//               className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-black py-4 rounded-2xl transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? (
//                 <div className="flex items-center justify-center space-x-2">
//                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                   <span>Sending...</span>
//                 </div>
//               ) : 'Send Reset Code'}
//             </button>

//             <button 
//               type="button" 
//               onClick={() => navigate('/login')} 
//               className="w-full text-slate-400 text-xs font-bold hover:text-indigo-600 transition-colors pt-2"
//             >
//               &larr; Back to Login
//             </button>
//           </form>
//         ) : (
//           <form onSubmit={handleReset} className="space-y-4">
//             <div className="relative">
//               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 absolute top-3 left-4">Verification OTP</label>
//               <input 
//                 type="text" 
//                 placeholder="000000" 
//                 value={otp} 
//                 onChange={(e) => setOtp(e.target.value)} 
//                 required 
//                 className="w-full pt-7 pb-3 px-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 outline-none font-bold tracking-[0.5em] text-center transition-all" 
//               />
//             </div>

//             <div className="relative">
//               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 absolute top-3 left-4">New Password</label>
//               <input 
//                 type="password" 
//                 placeholder="••••••••" 
//                 value={newPassword} 
//                 onChange={(e) => setNewPassword(e.target.value)} 
//                 required 
//                 className="w-full pt-7 pb-3 px-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 outline-none font-medium transition-all" 
//               />
//             </div>

//             <button 
//               type="submit" 
//               disabled={loading} 
//               className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50"
//             >
//               {loading ? 'Updating Password...' : 'Reset Password'}
//             </button>

//             <button 
//               type="button" 
//               onClick={() => setStep(1)} 
//               className="w-full text-slate-400 text-xs font-bold hover:text-indigo-600 transition-colors pt-2"
//             >
//               Didn't get a code? Try again
//             </button>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ForgotPassword;



// src/pages/ForgotPassword.jsx
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const ForgotPassword = React.memo(() => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Memoized handlers to avoid recreation on every render
  const handleSend = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setUserId(res.data.userId);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email]);

  const handleReset = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { userId, otp, newPassword });
      alert('Password reset successful! You can now log in.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP or session expired.');
    } finally {
      setLoading(false);
    }
  }, [userId, otp, newPassword, navigate]);

  const goToLogin = useCallback(() => navigate('/login'), [navigate]);
  const goBackToStep1 = useCallback(() => setStep(1), []);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl sm:rounded-[2.5rem] shadow-2xl shadow-indigo-100 p-6 sm:p-10 md:p-12 max-w-md w-full border border-white transition-all">
        
        {/* Logo / Icon */}
        <div className="flex justify-center mb-5 sm:mb-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-indigo-600 rounded-2xl rotate-12 flex items-center justify-center shadow-lg shadow-indigo-200">
            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white -rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-center text-slate-800 mb-2">Reset Password</h2>
        <p className="text-center text-slate-500 text-xs sm:text-sm mb-6 sm:mb-8 px-2">
          {step === 1 
            ? "Enter your email and we'll send you a recovery code." 
            : "Check your inbox. We've sent a 6-digit code to your email."}
        </p>

        {/* Step indicators – touch‑friendly */}
        <div className="flex items-center justify-center space-x-2 mb-6 sm:mb-8">
          <div className={`h-1.5 w-8 sm:w-10 rounded-full transition-all ${step >= 1 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
          <div className={`h-1.5 w-8 sm:w-10 rounded-full transition-all ${step === 2 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-5 p-3 sm:p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-2xl animate-in fade-in duration-300">
            ⚠️ {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSend} className="space-y-4">
            <div className="relative">
              <label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-400 absolute top-3 left-4">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pt-7 pb-3 px-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 outline-none font-medium transition-all touch-manipulation"
                aria-label="Email address"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-black py-4 rounded-2xl transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Sending...</span>
                </div>
              ) : (
                'Send Reset Code'
              )}
            </button>

            <button
              type="button"
              onClick={goToLogin}
              className="w-full text-slate-400 text-xs font-bold hover:text-indigo-600 transition-colors pt-2 touch-manipulation"
            >
              &larr; Back to Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="relative">
              <label htmlFor="otp" className="text-[10px] font-black uppercase tracking-widest text-slate-400 absolute top-3 left-4">
                Verification OTP
              </label>
              <input
                id="otp"
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                required
                className="w-full pt-7 pb-3 px-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 outline-none font-bold tracking-[0.3em] sm:tracking-[0.5em] text-center transition-all touch-manipulation"
                aria-label="One-time password"
              />
            </div>

            <div className="relative">
              <label htmlFor="newPassword" className="text-[10px] font-black uppercase tracking-widest text-slate-400 absolute top-3 left-4">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full pt-7 pb-3 px-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 outline-none font-medium transition-all touch-manipulation"
                aria-label="New password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50 touch-manipulation"
            >
              {loading ? 'Updating Password...' : 'Reset Password'}
            </button>

            <button
              type="button"
              onClick={goBackToStep1}
              className="w-full text-slate-400 text-xs font-bold hover:text-indigo-600 transition-colors pt-2 touch-manipulation"
            >
              Didn't get a code? Try again
            </button>
          </form>
        )}
      </div>
    </div>
  );
});

ForgotPassword.displayName = 'ForgotPassword';
export default ForgotPassword;