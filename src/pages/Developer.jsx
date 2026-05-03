import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PageLayout from '../components/PageLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaGithub, FaLinkedin, FaWhatsapp, FaEnvelope, FaGlobe, FaBriefcase, FaTimes } from 'react-icons/fa';
import confetti from 'canvas-confetti';
import DeveloperPhoto from '../assets/my_image.jpeg';

const Developer = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [form, setForm] = useState({ subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showFullscreenPhoto, setShowFullscreenPhoto] = useState(false);

  useEffect(() => {
    fetchMyMessages();
  }, []);

  const fetchMyMessages = async () => {
  try {
    const res = await api.get('/contact/my-messages');
    // If response has a `messages` array (paginated), use that; otherwise assume it's the array.
    const messagesData = res.data.messages || res.data;
    setMessages(Array.isArray(messagesData) ? messagesData : []);
  } catch (err) {
    console.error(err);
    setMessages([]);
  }
};

  const formatRelativeTime = (date) => {
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
  };

  const handleSubmit = async (e) => {
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
  };

  // Confetti animation triggered when developer photo is clicked
  const triggerConfetti = () => {
    confetti({
      particleCount: 300,
      spread: 100,
      origin: { y: 0.6 },
      startVelocity: 25,
      colors: ["#2563eb", "#3b82f6", "#60a5fa", "#1d4ed8", "#f59e0b", "#10b981", "#ef4444"],
      decay: 0.9,
      gravity: 1,
    });
    confetti({
      particleCount: 150,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.5 },
      startVelocity: 30,
      colors: ["#8b5cf6", "#ec4899", "#06b6d4"],
    });
    confetti({
      particleCount: 150,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.5 },
      startVelocity: 30,
      colors: ["#f97316", "#84cc16", "#a855f7"],
    });
  };

  const handlePhotoClick = () => {
    triggerConfetti();
    setShowFullscreenPhoto(true);
  };

  // Developer social links
  const socialLinks = [
    { icon: FaGlobe, label: 'Portfolio', url: 'https://shekhfaisal-portfolio.netlify.app/', color: 'text-slate-700' },
    { icon: FaLinkedin, label: 'LinkedIn', url: 'https://www.linkedin.com/in/faisal-shaikh-3064582a4', color: 'text-blue-600' },
  ];

  return (
    <>
      <PageLayout title="Developer" subtitle="Meet the creator & get in touch.">
        <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 px-4 sm:px-0">
          {/* Developer Profile */}
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-md border border-slate-100 p-5 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
              {/* Developer Photo - Clickable with confetti animation and fullscreen modal */}
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden shadow-lg cursor-pointer flex-shrink-0">
                <img
                  src={DeveloperPhoto}
                  alt="Shekh Faisal - Developer"
                  className="w-full h-full object-cover"
                  onClick={handlePhotoClick}
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-xl md:text-3xl font-bold text-slate-800">Shekh Faisal</h2>
                <p className="text-indigo-600 font-medium text-sm md:text-base mt-1">Full Stack Developer</p>
                <p className="text-slate-600 text-sm md:text-base mt-3 leading-relaxed">
                  Passionate about building compassionate technology that supports mental wellbeing. 
                  MindEase is my effort to combine modern web development with evidence-based mental health practices.
                </p>
                
                {/* Social & Contact Icons */}
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-5">
                  {socialLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-all duration-200 group"
                      title={link.label}
                    >
                      <link.icon className={`w-5 h-5 ${link.color} group-hover:scale-110 transition-transform`} />
                      <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600">{link.label}</span>
                    </a>
                  ))}
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mt-6">
                  {['React', 'Node.js', 'ExpressJS', 'MongoDB', 'Tailwind', 'PWA'].map(skill => (
                    <span key={skill} className="bg-slate-100 text-slate-600 text-xs px-3 py-1 rounded-full">{skill}</span>
                  ))}
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
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="e.g., Feature suggestion, Bug report"
                  className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-1">Message</label>
                <textarea
                  rows="4"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Your feedback or inquiry..."
                  className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none"
                  required
                />
              </div>
              {error && <div className="text-rose-600 text-sm bg-rose-50 p-2 rounded-lg">{error}</div>}
              {success && <div className="text-emerald-600 text-sm bg-emerald-50 p-2 rounded-lg">{success}</div>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 text-sm md:text-base"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Message History */}
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-md border border-slate-100 p-5 md:p-6">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex justify-between items-center text-left font-bold text-slate-800"
            >
              <span className="text-base md:text-lg flex items-center gap-2">
                <span>📬</span> Conversations
                <span className="text-xs font-normal text-slate-400 ml-1">({messages.length})</span>
              </span>
              <svg className={`w-5 h-5 transition-transform ${showHistory ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showHistory && (
              <div className="mt-5 space-y-5">
                {messages.length === 0 ? (
                  <p className="text-slate-400 text-center py-6 text-sm">No messages yet. Send one above.</p>
                ) : (
                  messages.map((msg) => (
                    <div key={msg._id} className="border border-slate-100 rounded-xl p-4 hover:shadow-sm transition-all">
                      <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                        <h3 className="font-bold text-slate-800 text-base md:text-lg break-words pr-2">{msg.subject}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            msg.status === 'replied' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {msg.status === 'replied' ? 'Replied' : 'Pending'}
                          </span>
                          <span className="text-xs text-slate-400 whitespace-nowrap" title={new Date(msg.createdAt).toLocaleString()}>
                            {formatRelativeTime(msg.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 mb-3">
                        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>
                      </div>
                      {msg.adminReply && (
                        <div className="mt-3 pl-3 border-l-4 border-indigo-300">
                          <div className="flex flex-wrap justify-between items-center gap-1 mb-1">
                            <div className="flex items-center gap-1">
                              <svg className="w-3 h-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span className="text-xs font-semibold text-indigo-700">Admin</span>
                            </div>
                            <span className="text-xs text-slate-400" title={new Date(msg.repliedAt).toLocaleString()}>
                              {formatRelativeTime(msg.repliedAt)}
                            </span>
                          </div>
                          <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.adminReply}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </PageLayout>

      {/* Fullscreen Photo Modal */}
      {showFullscreenPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setShowFullscreenPhoto(false)}
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <button
              onClick={() => setShowFullscreenPhoto(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              aria-label="Close fullscreen photo"
            >
              <FaTimes className="w-8 h-8" />
            </button>
            <img
              src={DeveloperPhoto}
              alt="Shekh Faisal - Full screen"
              className="w-auto h-auto max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Developer;