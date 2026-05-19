import React, { useState, useCallback, useMemo } from 'react';
import api from '../services/api';

// Memoized menu dropdown to avoid re-rendering every bubble
const MenuDropdown = React.memo(({ onEdit, onDelete }) => (
  <div className="absolute right-0 mt-1 bg-white shadow-lg rounded-xl border border-slate-100 z-10 w-24 animate-in fade-in zoom-in-95 duration-150">
    <button
      onClick={onEdit}
      className="block w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-indigo-50 rounded-t-xl transition touch-manipulation"
    >
      Edit
    </button>
    <button
      onClick={onDelete}
      className="block w-full text-left px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-b-xl transition touch-manipulation"
    >
      Delete
    </button>
  </div>
));

const MessageBubble = React.memo(({ message, isMyMessage, onMessageUpdated, onMessageDeleted }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  // Memoized time string – avoids recalculation on every render
  const timeStr = useMemo(() => 
    new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    [message.createdAt]
  );

  const isRead = message.isRead;

  const handleEdit = useCallback(async () => {
    if (!editContent.trim()) return;
    try {
      const res = await api.put(`/messages/${message._id}`, { content: editContent });
      onMessageUpdated(res.data);
      setIsEditing(false);
      setShowMenu(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Edit failed');
    }
  }, [editContent, message._id, onMessageUpdated]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await api.delete(`/messages/${message._id}`);
      onMessageDeleted(message._id);
      setShowMenu(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  }, [message._id, onMessageDeleted]);

  const toggleMenu = useCallback(() => setShowMenu(prev => !prev), []);

  const cancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditContent(message.content);
  }, [message.content]);

  // Memoize image handling (opens in new tab)
  const openImage = useCallback(() => window.open(message.imageUrl, '_blank'), [message.imageUrl]);

  return (
    <div className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 ${isMyMessage ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'}`}>
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 rounded-lg text-sm text-slate-800 bg-white border focus:ring-2 focus:ring-indigo-100 outline-none resize-none"
              rows={2}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button onClick={handleEdit} className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-xl transition touch-manipulation">Save</button>
              <button onClick={cancelEdit} className="text-xs bg-slate-300 hover:bg-slate-400 text-slate-700 px-3 py-1.5 rounded-xl transition touch-manipulation">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            {message.content && <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>}
            {message.imageUrl && (
              <img
                src={message.imageUrl}
                alt="Shared"
                loading="lazy"
                className="max-w-full rounded-lg mt-2 cursor-pointer hover:opacity-90 transition"
                onClick={openImage}
              />
            )}
            <div className="flex justify-end items-center gap-1 mt-1">
              <span className="text-[10px] opacity-70">{timeStr}</span>
              {isMyMessage && (
                <span className="text-[10px] font-semibold">{isRead ? '✓✓ Seen' : '✓ Sent'}</span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Menu button (only for own messages, not when editing) */}
      {isMyMessage && !isEditing && (
        <div className="relative ml-1">
          <button
            onClick={toggleMenu}
            className="text-slate-400 hover:text-indigo-600 p-1 rounded-full transition touch-manipulation"
            aria-label="Message options"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          {showMenu && (
            <MenuDropdown
              onEdit={() => { setShowMenu(false); setIsEditing(true); }}
              onDelete={handleDelete}
            />
          )}
        </div>
      )}
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';

export default MessageBubble;