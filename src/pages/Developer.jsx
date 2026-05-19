import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PageLayout from '../components/PageLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaGithub, FaLinkedin, FaWhatsapp, FaEnvelope, FaGlobe, FaBriefcase, FaTimes, FaCheckCircle, FaRocket } from 'react-icons/fa';
import DeveloperPhoto from '../assets/my_image.jpeg';

// Lazy load confetti
let confettiModule = null;
const loadConfetti = () => import('canvas-confetti').then(mod => { confettiModule = mod.default; return mod.default; });

const triggerConfetti = () => {
  if (!confettiModule) return;
  confettiModule({
    particleCount: 300, spread: 100, origin: { y: 0.6 }, startVelocity: 25,
    colors: ["#2563eb", "#3b82f6", "#60a5fa", "#1d4ed8", "#f59e0b", "#10b981", "#ef4444"], decay: 0.9, gravity: 1,
  });
  confettiModule({ particleCount: 150, angle: 60, spread: 55, origin: { x: 0, y: 0.5 }, startVelocity: 30, colors: ["#8b5cf6", "#ec4899", "#06b6d4"] });
  confettiModule({ particleCount: 150, angle: 120, spread: 55, origin: { x: 1, y: 0.5 }, startVelocity: 30, colors: ["#f97316", "#84cc16", "#a855f7"] });
};

// Skeletons
const ProfileSkeleton = () => (
  <div className="bg-white rounded-2xl md:rounded-3xl shadow-md border border-slate-100 p-5 md:p-8 animate-pulse">
    <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
      <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-slate-200" />
      <div className="flex-1 text-center md:text-left space-y-3">
        <div className="h-8 bg-slate-200 rounded w-40 mx-auto md:mx-0" />
        <div className="h-5 bg-slate-200 rounded w-28 mx-auto md:mx-0" />
        <div className="h-16 bg-slate-200 rounded w-full" />
        <div className="flex gap-3 justify-center md:justify-start">{[...Array(2)].map((_, i) => <div key={i} className="h-10 w-24 bg-slate-200 rounded-full" />)}</div>
      </div>
    </div>
  </div>
);

const FormSkeleton = () => (
  <div className="bg-white rounded-2xl md:rounded-3xl shadow-md border border-slate-100 p-5 md:p-6 animate-pulse">
    <div className="flex items-center gap-3 mb-5"><div className="w-9 h-9 bg-slate-200 rounded-xl" /><div className="h-7 bg-slate-200 rounded w-40" /></div>
    <div className="space-y-4"><div className="h-12 bg-slate-100 rounded-xl" /><div className="h-24 bg-slate-100 rounded-xl" /><div className="h-12 bg-slate-200 rounded-xl" /></div>
  </div>
);

const FreelanceSkeleton = () => (
  <div className="bg-white rounded-2xl md:rounded-3xl shadow-md border border-slate-100 p-5 md:p-6 animate-pulse">
    <div className="flex items-center gap-3 mb-5"><div className="w-9 h-9 bg-slate-200 rounded-xl" /><div className="h-7 bg-slate-200 rounded w-48" /></div>
    <div className="space-y-3"><div className="h-4 bg-slate-200 rounded w-full" /><div className="h-4 bg-slate-200 rounded w-5/6" /><div className="h-4 bg-slate-200 rounded w-4/6" /></div>
  </div>
);

const Developer = React.memo(() => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [form, setForm] = useState({ subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showFullscreenPhoto, setShowFullscreenPhoto] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchMyMessages = useCallback(async () => {
    try {
      const res = await api.get('/contact/my-messages');
      const messagesData = res.data.messages || res.data;
      setMessages(Array.isArray(messagesData) ? messagesData : []);
    } catch (err) {
      console.error(err);
      setMessages([]);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyMessages();
  }, [fetchMyMessages]);

  const formatRelativeTime = useCallback((date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return 'now';
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      setError('Please fill in both subject and message');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/contact/send', { subject: form.subject, message: form.message });
      setSuccess('Message sent! Admin will reply soon.');
      setForm({ subject: '', message: '' });
      fetchMyMessages();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send');
    } finally {
      setLoading(false);
    }
  }, [form, fetchMyMessages]);

  const handlePhotoClick = useCallback(() => {
    if (!confettiModule) loadConfetti().then(() => triggerConfetti());
    else triggerConfetti();
    setShowFullscreenPhoto(true);
  }, []);

  const socialLinks = React.useMemo(() => [
    { icon: FaGlobe, label: 'Portfolio', url: 'https://shekhfaisal-portfolio.netlify.app/', color: 'text-slate-700' },
    { icon: FaLinkedin, label: 'LinkedIn', url: 'https://www.linkedin.com/in/faisal-shaikh-3064582a4', color: 'text-blue-600' },
  ], []);

  const skills = React.useMemo(() => ['React', 'Node.js', 'ExpressJS', 'MongoDB', 'Tailwind CSS', 'PWA', 'REST APIs', 'JWT Auth'], []);

  if (initialLoading) {
    return (
      <PageLayout title="Developer" subtitle="Meet the creator & get in touch.">
        <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 px-4 sm:px-0">
          <ProfileSkeleton />
          <FormSkeleton />
          <FreelanceSkeleton />
        </div>
      </PageLayout>
    );
  }

  return (
    <>
      <PageLayout title="Developer" subtitle="Meet the creator & get in touch.">
        <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 px-4 sm:px-0">
          {/* Developer Profile */}
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-md border border-slate-100 p-5 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
              <div
                className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden shadow-lg cursor-pointer flex-shrink-0 active:scale-95 transition-transform touch-manipulation"
                onClick={handlePhotoClick}
              >
                <img src={DeveloperPhoto} alt="Shekh Faisal - Developer" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-xl md:text-3xl font-bold text-slate-800">Shekh Faisal</h2>
                <p className="text-indigo-600 font-medium text-sm md:text-base mt-1">Full Stack MERN Developer | Freelancer</p>
                <p className="text-slate-600 text-sm md:text-base mt-3 leading-relaxed">
                  Passionate about building compassionate technology that supports mental wellbeing. 
                  MindEase is my effort to combine modern web development with evidence-based mental health practices.
                  I specialize in creating full‑stack web applications using the MERN stack (MongoDB, Express, React, Node.js).
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-5">
                  {socialLinks.map((link, idx) => (
                    <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-full transition group touch-manipulation" title={link.label}>
                      <link.icon className={`w-5 h-5 ${link.color} group-hover:scale-110 transition`} />
                      <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600">{link.label}</span>
                    </a>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-5">
                  {skills.map(skill => <span key={skill} className="bg-slate-100 text-slate-600 text-xs px-3 py-1 rounded-full">{skill}</span>)}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-md border border-slate-100 p-5 md:p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-slate-800">Send a Message</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-1">Subject</label>
                <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g., Freelance project, Feature suggestion" className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none touch-manipulation" required />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-1">Message</label>
                <textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Your feedback, inquiry, or freelance request..." className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none resize-none touch-manipulation" required />
              </div>
              {error && <div className="text-rose-600 text-sm bg-rose-50 p-3 rounded-xl">{error}</div>}
              {success && <div className="text-emerald-600 text-sm bg-emerald-50 p-3 rounded-xl">{success}</div>}
              <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 text-sm md:text-base active:scale-95 touch-manipulation">
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Message History */}
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-md border border-slate-100 p-5 md:p-6">
            <button onClick={() => setShowHistory(prev => !prev)} className="w-full flex justify-between items-center text-left font-bold text-slate-800 touch-manipulation">
              <span className="text-base md:text-lg flex items-center gap-2"><span>📬</span> Conversations <span className="text-xs font-normal text-slate-400 ml-1">({messages.length})</span></span>
              <svg className={`w-5 h-5 transition-transform ${showHistory ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {showHistory && (
              <div className="mt-5 space-y-5">
                {messages.length === 0 ? <p className="text-slate-400 text-center py-6 text-sm">No messages yet. Send one above.</p> :
                  messages.map((msg) => (
                    <div key={msg._id} className="border border-slate-100 rounded-xl p-4 hover:shadow-sm transition-all">
                      <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                        <h3 className="font-bold text-slate-800 text-base md:text-lg break-words pr-2">{msg.subject}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${msg.status === 'replied' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{msg.status === 'replied' ? 'Replied' : 'Pending'}</span>
                          <span className="text-xs text-slate-400 whitespace-nowrap" title={new Date(msg.createdAt).toLocaleString()}>{formatRelativeTime(msg.createdAt)}</span>
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 mb-3"><p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p></div>
                      {msg.adminReply && (
                        <div className="mt-3 pl-3 border-l-4 border-indigo-300">
                          <div className="flex flex-wrap justify-between items-center gap-1 mb-1">
                            <div className="flex items-center gap-1"><svg className="w-3 h-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg><span className="text-xs font-semibold text-indigo-700">Admin</span></div>
                            <span className="text-xs text-slate-400" title={new Date(msg.repliedAt).toLocaleString()}>{formatRelativeTime(msg.repliedAt)}</span>
                          </div>
                          <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.adminReply}</p>
                        </div>
                      )}
                    </div>
                  ))
                }
              </div>
            )}
          </div>

          {/* Available for Freelance Work Section */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl md:rounded-3xl shadow-md border border-indigo-100 p-5 md:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
                <FaRocket className="w-5 h-5" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-indigo-800">Available for Freelance Work</h2>
            </div>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-4">
              I am actively looking for freelance opportunities to build custom MERN stack applications. 
              Whether you need a full‑stack web app, a PWA, an admin dashboard, or API integration, 
              I can deliver high‑quality, scalable solutions with a fast turnaround.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div className="flex items-center gap-2 text-sm text-slate-700"><FaCheckCircle className="text-emerald-500 w-4 h-4" /> Custom Web Applications</div>
              <div className="flex items-center gap-2 text-sm text-slate-700"><FaCheckCircle className="text-emerald-500 w-4 h-4" /> PWA & Mobile‑first Design</div>
              <div className="flex items-center gap-2 text-sm text-slate-700"><FaCheckCircle className="text-emerald-500 w-4 h-4" /> Real‑time Features (Socket.io)</div>
              <div className="flex items-center gap-2 text-sm text-slate-700"><FaCheckCircle className="text-emerald-500 w-4 h-4" /> REST APIs & Third‑party Integration</div>
              <div className="flex items-center gap-2 text-sm text-slate-700"><FaCheckCircle className="text-emerald-500 w-4 h-4" /> Admin Dashboards & Analytics</div>
              <div className="flex items-center gap-2 text-sm text-slate-700"><FaCheckCircle className="text-emerald-500 w-4 h-4" /> Performance Optimization & Deployment</div>
            </div>
            <div className="text-center">
              <button
                onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition active:scale-95 shadow-md touch-manipulation"
              >
                <FaBriefcase className="w-5 h-5" /> Let's Work Together
              </button>
              <p className="text-xs text-slate-400 mt-3">📬 Use the contact form above to discuss your project.</p>
            </div>
          </div>
        </div>
      </PageLayout>

      {/* Fullscreen Photo Modal */}
      {showFullscreenPhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowFullscreenPhoto(false)}>
          <div className="relative max-w-5xl max-h-[90vh]">
            <button onClick={() => setShowFullscreenPhoto(false)} className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors touch-manipulation" aria-label="Close fullscreen photo"><FaTimes className="w-8 h-8" /></button>
            <img src={DeveloperPhoto} alt="Shekh Faisal - Full screen" className="w-auto h-auto max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
          </div>
        </div>
      )}
    </>
  );
});

Developer.displayName = 'Developer';
export default Developer;