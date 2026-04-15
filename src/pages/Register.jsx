import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import FormikForm from '../components/FormikForm';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);

  const initialValues = { username: '', email: '', password: '', confirmPassword: '' };
  
  const validationSchema = Yup.object({
    username: Yup.string().required('Username is required').min(3, 'Minimum 3 characters'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().required('Password is required').min(6, 'Must be at least 6 characters'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Please confirm your password'),
  });

  const fields = [
    { name: 'username', label: 'Choose a Username', type: 'text', required: true, placeholder: 'e.g. wanderer_01' },
    { name: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'you@example.com' },
    { name: 'password', label: 'Create Password', type: 'password', required: true, placeholder: '••••••••' },
    { name: 'confirmPassword', label: 'Repeat Password', type: 'password', required: true, placeholder: '••••••••' },
  ];

  const handleRegister = async (values) => {
    setError('');
    try {
      const res = await api.post('/auth/register', values);
      setUserId(res.data.userId);
      setEmail(values.email);
      setStep(2);
    } catch (err) {
      // Extract error message from backend response
      const message = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setError(message);
    }
  };

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
        <FormikForm 
          initialValues={initialValues} 
          validationSchema={validationSchema} 
          onSubmit={handleRegister} 
          fields={fields} 
          submitLabel="Create Account" 
          successMessage="Security code sent! Please check your email."
        />
        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-xl">
            {error}
          </div>
        )}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm font-medium text-slate-500">
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} className="text-indigo-600 font-black hover:underline underline-offset-4">
              Log in
            </button>
          </p>
        </div>
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