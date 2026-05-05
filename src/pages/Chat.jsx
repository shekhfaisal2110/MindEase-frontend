// import React, { useState, useEffect, useRef } from 'react';
// import api from '../services/api';
// import PageLayout from '../components/PageLayout';
// import { useAuth } from '../context/AuthContext';
// import MessageBubble from '../components/MessageBubble';
// import LoadingSpinner from '../components/LoadingSpinner';

// const Chat = () => {
//   const { user } = useAuth();
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [adminId, setAdminId] = useState(null);
//   const [uploading, setUploading] = useState(false);
//   const messagesEndRef = useRef(null);
//   const pollingRef = useRef(null);
//   const fileInputRef = useRef(null);

//   useEffect(() => {
//     const getAdmin = async () => {
//       try {
//         const res = await api.get('/auth/admin');
//         setAdminId(res.data.id);
//       } catch (err) {
//         console.error('Failed to fetch admin:', err);
//         setLoading(false);
//       }
//     };
//     getAdmin();
//   }, []);

//   const fetchMessages = async () => {
//     if (!adminId) return;
//     try {
//       const res = await api.get(`/messages/conversation/${adminId}`);
//       // Extract messages array from paginated response or direct array
//       const messagesData = res.data.messages || res.data;
//       setMessages(Array.isArray(messagesData) ? messagesData : []);
//       await api.post('/messages/mark-read', { otherUserId: adminId });
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (adminId) {
//       fetchMessages();
//       pollingRef.current = setInterval(fetchMessages, 3000);
//       return () => clearInterval(pollingRef.current);
//     }
//   }, [adminId]);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   const sendMessage = async (e) => {
//     e.preventDefault();
//     if (!newMessage.trim() || !adminId) return;
//     try {
//       await api.post('/messages', { receiverId: adminId, content: newMessage });
//       setNewMessage('');
//       fetchMessages();
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleImageUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     const formData = new FormData();
//     formData.append('image', file);
//     formData.append('receiverId', adminId);
//     setUploading(true);
//     try {
//       await api.post('/messages/image', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' }
//       });
//       fetchMessages();
//     } catch (err) {
//       alert('Failed to upload image');
//     } finally {
//       setUploading(false);
//       fileInputRef.current.value = '';
//     }
//   };

//   const handleMessageUpdated = (updatedMessage) => {
//     setMessages(prev => prev.map(msg => msg._id === updatedMessage._id ? updatedMessage : msg));
//   };

//   const handleMessageDeleted = (messageId) => {
//     setMessages(prev => prev.filter(msg => msg._id !== messageId));
//   };

//   if (loading) return <LoadingSpinner />;

//   return (
//     <PageLayout title="Support Chat" subtitle="Talk to our admin for help or guidance.">
//       <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[70vh]">
//         <div className="p-4 bg-indigo-50 border-b border-indigo-100">
//           <h2 className="font-bold text-indigo-800">💬 Chat with Admin</h2>
//           <p className="text-xs text-indigo-600">We usually reply within a few hours.</p>
//         </div>
        
//         <div className="flex-1 overflow-y-auto p-4 space-y-3">
//           {messages.length === 0 ? (
//             <div className="text-center py-10 text-slate-400">No messages yet. Start a conversation.</div>
//           ) : (
//             messages.map((msg) => (
//               <MessageBubble
//                 key={msg._id}
//                 message={msg}
//                 isMyMessage={msg.sender?._id === user?.id}
//                 onMessageUpdated={handleMessageUpdated}
//                 onMessageDeleted={handleMessageDeleted}
//               />
//             ))
//           )}
//           <div ref={messagesEndRef} />
//         </div>

//         <form onSubmit={sendMessage} className="p-4 border-t border-slate-100 flex gap-2">
//           <input
//             type="text"
//             value={newMessage}
//             onChange={(e) => setNewMessage(e.target.value)}
//             placeholder="Type your message..."
//             className="flex-1 bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none"
//           />
//           <button
//             type="button"
//             onClick={() => fileInputRef.current.click()}
//             disabled={uploading}
//             className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-2 rounded-2xl transition"
//           >
//             {uploading ? '📤' : '📷'}
//           </button>
//           <input
//             type="file"
//             ref={fileInputRef}
//             accept="image/*"
//             onChange={handleImageUpload}
//             className="hidden"
//           />
//           <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2 rounded-2xl transition">Send</button>
//         </form>
//       </div>
//     </PageLayout>
//   );
// };

// export default Chat;



// src/pages/Chat.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import api from '../services/api';
import PageLayout from '../components/PageLayout';
import { useAuth } from '../context/AuthContext';
import MessageBubble from '../components/MessageBubble';
import LoadingSpinner from '../components/LoadingSpinner';

// Skeleton for chat messages – shows instantly while loading
const ChatSkeleton = () => (
  <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[70vh]">
    <div className="p-4 bg-indigo-50 border-b border-indigo-100 animate-pulse">
      <div className="h-5 bg-indigo-200 rounded w-32" />
      <div className="h-3 bg-indigo-100 rounded w-48 mt-1" />
    </div>
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex justify-start animate-pulse">
          <div className="max-w-[70%] rounded-2xl p-3 bg-slate-100">
            <div className="h-4 bg-slate-200 rounded w-48" />
          </div>
        </div>
      ))}
    </div>
    <div className="p-4 border-t border-slate-100 flex gap-2">
      <div className="flex-1 h-11 bg-slate-100 rounded-2xl animate-pulse" />
      <div className="w-11 h-11 bg-slate-200 rounded-2xl animate-pulse" />
      <div className="w-16 h-11 bg-slate-200 rounded-2xl animate-pulse" />
    </div>
  </div>
);

const Chat = React.memo(() => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [adminId, setAdminId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch admin ID once
  useEffect(() => {
    const getAdmin = async () => {
      try {
        const res = await api.get('/auth/admin');
        setAdminId(res.data.id);
      } catch (err) {
        console.error('Failed to fetch admin:', err);
        setLoading(false);
      }
    };
    getAdmin();
  }, []);

  // Memoized fetchMessages to avoid recreating on each adminId change
  const fetchMessages = useCallback(async () => {
    if (!adminId) return;
    try {
      const res = await api.get(`/messages/conversation/${adminId}`);
      const messagesData = res.data.messages || res.data;
      setMessages(Array.isArray(messagesData) ? messagesData : []);

      // Mark messages as read in the background
      await api.post('/messages/mark-read', { otherUserId: adminId });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [adminId]);

  // Initial load and polling setup
  useEffect(() => {
    if (adminId) {
      fetchMessages();
      pollingRef.current = setInterval(fetchMessages, 3000);
      return () => {
        if (pollingRef.current) clearInterval(pollingRef.current);
      };
    }
  }, [adminId, fetchMessages]);

  // Auto‑scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !adminId) return;
    try {
      await api.post('/messages', { receiverId: adminId, content: newMessage });
      setNewMessage('');
      fetchMessages(); // immediate refresh
    } catch (err) {
      console.error(err);
    }
  }, [newMessage, adminId, fetchMessages]);

  const handleImageUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    formData.append('receiverId', adminId);
    setUploading(true);
    try {
      await api.post('/messages/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchMessages();
    } catch (err) {
      alert('Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [adminId, fetchMessages]);

  const handleMessageUpdated = useCallback((updatedMessage) => {
    setMessages(prev => prev.map(msg => msg._id === updatedMessage._id ? updatedMessage : msg));
  }, []);

  const handleMessageDeleted = useCallback((messageId) => {
    setMessages(prev => prev.filter(msg => msg._id !== messageId));
  }, []);

  // Show skeleton while loading initial data
  if (loading && !adminId) return <ChatSkeleton />;

  return (
    <PageLayout title="Support Chat" subtitle="Talk to our admin for help or guidance.">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[70vh]">
        {/* Chat header */}
        <div className="p-4 bg-indigo-50 border-b border-indigo-100">
          <h2 className="font-bold text-indigo-800">💬 Chat with Admin</h2>
          <p className="text-xs text-indigo-600">We usually reply within a few hours.</p>
        </div>

        {/* Messages container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              No messages yet. Start a conversation.
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble
                key={msg._id}
                message={msg}
                isMyMessage={msg.sender?._id === user?.id}
                onMessageUpdated={handleMessageUpdated}
                onMessageDeleted={handleMessageDeleted}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area – responsive, touch‑friendly */}
        <form onSubmit={sendMessage} className="p-3 sm:p-4 border-t border-slate-100 flex gap-2 bg-white">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none touch-manipulation"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-2 rounded-2xl transition active:scale-95 touch-manipulation disabled:opacity-50"
            aria-label="Attach image"
          >
            {uploading ? '📤' : '📷'}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 sm:px-6 py-2 rounded-2xl transition active:scale-95 touch-manipulation"
          >
            Send
          </button>
        </form>
      </div>
    </PageLayout>
  );
});

Chat.displayName = 'Chat';
export default Chat;