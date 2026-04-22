import React, { useState } from 'react';
import api from '../services/api';

const MessageBubble = ({ message, isMyMessage, onMessageUpdated, onMessageDeleted }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    try {
      const res = await api.put(`/messages/${message._id}`, { content: editContent });
      onMessageUpdated(res.data);
      setIsEditing(false);
      setShowMenu(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Edit failed');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await api.delete(`/messages/${message._id}`);
      onMessageDeleted(message._id);
      setShowMenu(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const isRead = message.isRead;
  const timeStr = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] rounded-2xl p-3 ${isMyMessage ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'}`}>
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 rounded-lg text-sm text-slate-800 bg-white border focus:ring-2 focus:ring-indigo-100 outline-none"
              rows="2"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button onClick={handleEdit} className="text-xs bg-green-500 text-white px-2 py-1 rounded">Save</button>
              <button onClick={() => { setIsEditing(false); setEditContent(message.content); }} className="text-xs bg-gray-300 text-slate-700 px-2 py-1 rounded">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            {message.content && <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>}
            {message.imageUrl && (
              <img
                src={message.imageUrl}
                alt="Shared"
                className="max-w-full rounded-lg mt-2 cursor-pointer"
                onClick={() => window.open(message.imageUrl, '_blank')}
              />
            )}
            <div className="flex justify-end items-center gap-1 mt-1">
              <p className="text-[10px] opacity-70">{timeStr}</p>
              {isMyMessage && (
                <span className="text-[10px] font-semibold">{isRead ? '✓✓ Seen' : '✓ Sent'}</span>
              )}
            </div>
          </>
        )}
      </div>
      {isMyMessage && !isEditing && (
        <div className="relative ml-1">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-slate-400 hover:text-indigo-600 p-1 rounded-full transition"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-1 bg-white shadow-lg rounded-xl border border-slate-100 z-10 w-24">
              <button
                onClick={() => { setShowMenu(false); setIsEditing(true); }}
                className="block w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-indigo-50 rounded-t-xl transition"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="block w-full text-left px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-b-xl transition"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageBubble;