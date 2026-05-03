// src/components/NotificationPanel.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const NotificationPanel = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/notifications?page=${page}&limit=15`);
      setNotifications(res.data.notifications);
      setTotalPages(res.data.pagination.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.data.count);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) { console.error(err); }
  };

  const deleteNotification = async (id) => {
    if (!window.confirm('Delete this notification?')) return;
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      const wasUnread = notifications.find(n => n._id === id)?.isRead === false;
      if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) { console.error(err); }
  };

  const getTypeStyles = (type) => {
    switch (type) {
      case 'success': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
      case 'warning': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
      case 'system': return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
      default: return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] shadow-2xl flex flex-col">
        <div className="flex justify-between items-center p-5 border-b">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔔</span>
            <h2 className="text-xl font-bold text-slate-800">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount} new</span>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100">
            <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading && <div className="text-center py-8">Loading...</div>}
          {!loading && notifications.length === 0 && (
            <div className="text-center py-10 text-slate-400">No notifications yet.</div>
          )}
          {!loading && notifications.map(notif => {
            const styles = getTypeStyles(notif.type);
            return (
              <div key={notif._id} className={`p-4 rounded-2xl border ${styles.border} ${!notif.isRead ? 'bg-white shadow-md' : styles.bg}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-bold ${!notif.isRead ? 'text-slate-900' : styles.text}`}>{notif.title}</h3>
                      {!notif.isRead && <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full">New</span>}
                    </div>
                    <p className="text-sm text-slate-600">{notif.message}</p>
                    <p className="text-xs text-slate-400 mt-2">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {!notif.isRead && (
                      <button onClick={() => markAsRead(notif._id)} className="text-indigo-500 hover:text-indigo-700 text-sm font-medium">
                        Mark read
                      </button>
                    )}
                    <button onClick={() => deleteNotification(notif._id)} className="text-rose-500 hover:text-rose-700 text-sm font-medium">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded-lg bg-slate-100 disabled:opacity-40"
            >Previous</button>
            <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded-lg bg-slate-100 disabled:opacity-40"
            >Next</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;