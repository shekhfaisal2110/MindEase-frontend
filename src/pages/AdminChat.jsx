import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import PageLayout from '../components/PageLayout';
import { useAuth } from '../context/AuthContext';
import MessageBubble from '../components/MessageBubble';

const AdminChat = () => {
  const { user, logout } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);
  const fileInputRef = useRef(null);

  const isAdmin = user?.email === import.meta.env.VITE_ADMIN_EMAIL;

  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/admin/conversations');
      setConversations(res.data);
      setLoading(false);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        window.location.href = '/login';
      }
      console.error(err);
    }
  };

  const fetchMessages = async (userId) => {
    if (!userId) return;
    try {
      const res = await api.get(`/messages/conversation/${userId}`);
      setMessages(res.data);
      await api.post('/messages/mark-read', { otherUserId: userId });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser._id);
      pollingRef.current = setInterval(() => fetchMessages(selectedUser._id), 3000);
      return () => clearInterval(pollingRef.current);
    }
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;
    try {
      await api.post('/messages', { receiverId: selectedUser._id, content: newMessage });
      setNewMessage('');
      fetchMessages(selectedUser._id);
      fetchConversations();
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedUser) return;
    const formData = new FormData();
    formData.append('image', file);
    formData.append('receiverId', selectedUser._id);
    setUploading(true);
    try {
      await api.post('/messages/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchMessages(selectedUser._id);
      fetchConversations();
    } catch (err) {
      alert('Failed to upload image');
    } finally {
      setUploading(false);
      fileInputRef.current.value = '';
    }
  };

  const handleMessageUpdated = (updatedMessage) => {
    setMessages(prev => prev.map(msg => msg._id === updatedMessage._id ? updatedMessage : msg));
  };

  const handleMessageDeleted = (messageId) => {
    setMessages(prev => prev.filter(msg => msg._id !== messageId));
    fetchConversations();
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl">Access denied. Admin only.</div>
      </div>
    );
  }

  return (
    <PageLayout title="Admin Chat" subtitle="Communicate with users">
      <div className="flex h-[75vh] bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Sidebar - User list */}
        <div className="w-80 border-r border-slate-100 flex flex-col">
          <div className="p-4 bg-slate-50 border-b">
            <h3 className="font-bold text-slate-800">Conversations</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-slate-400">No conversations yet</div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.user._id}
                  onClick={() => setSelectedUser(conv.user)}
                  className={`w-full text-left p-4 border-b border-slate-50 hover:bg-slate-50 transition ${selectedUser?._id === conv.user._id ? 'bg-indigo-50' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-800">{conv.user.username}</p>
                      <p className="text-xs text-slate-500 truncate">{conv.user.email}</p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{conv.unreadCount}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-1">{conv.lastMessage}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
              <div className="p-4 bg-slate-50 border-b">
                <p className="font-bold text-slate-800">{selectedUser.username}</p>
                <p className="text-xs text-slate-500">{selectedUser.email}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg._id}
                    message={msg}
                    isMyMessage={msg.sender._id === user?.id}
                    onMessageUpdated={handleMessageUpdated}
                    onMessageDeleted={handleMessageDeleted}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={sendMessage} className="p-4 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type reply..."
                  className="flex-1 bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  disabled={uploading}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-2 rounded-2xl transition"
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
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2 rounded-2xl transition">Send</button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">Select a conversation</div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default AdminChat;