// // src/components/NotificationPanel.jsx
// import React, { useState, useEffect, useCallback } from 'react';
// import api from '../services/api';

// const NotificationPanel = ({ onClose }) => {
//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   const fetchNotifications = useCallback(async () => {
//     setLoading(true);
//     try {
//       const res = await api.get(`/notifications?page=${page}&limit=15`);
//       setNotifications(res.data.notifications);
//       setTotalPages(res.data.pagination.pages);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   }, [page]);

//   const fetchUnreadCount = async () => {
//     try {
//       const res = await api.get('/notifications/unread-count');
//       setUnreadCount(res.data.count);
//     } catch (err) { console.error(err); }
//   };

//   useEffect(() => {
//     fetchNotifications();
//     fetchUnreadCount();
//   }, [fetchNotifications]);

//   const markAsRead = async (id) => {
//     try {
//       await api.put(`/notifications/${id}/read`);
//       setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
//       setUnreadCount(prev => Math.max(0, prev - 1));
//     } catch (err) { console.error(err); }
//   };

//   const deleteNotification = async (id) => {
//     if (!window.confirm('Delete this notification?')) return;
//     try {
//       await api.delete(`/notifications/${id}`);
//       setNotifications(prev => prev.filter(n => n._id !== id));
//       const wasUnread = notifications.find(n => n._id === id)?.isRead === false;
//       if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
//     } catch (err) { console.error(err); }
//   };

//   const getTypeStyles = (type) => {
//     switch (type) {
//       case 'success': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
//       case 'warning': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
//       case 'system': return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
//       default: return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
//       <div className="bg-white w-full sm:max-w-2xl max-h-[90vh] sm:rounded-3xl shadow-2xl flex flex-col sm:mx-4 overflow-hidden animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
//         {/* Header - sticky */}
//         <div className="flex justify-between items-center p-4 sm:p-5 border-b sticky top-0 bg-white z-10">
//           <div className="flex items-center gap-2">
//             <span className="text-2xl">🔔</span>
//             <h2 className="text-lg sm:text-xl font-bold text-slate-800">Notifications</h2>
//             {unreadCount > 0 && (
//               <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount} new</span>
//             )}
//           </div>
//           <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 active:bg-slate-200 transition">
//             <svg className="w-5 h-5 sm:w-6 sm:h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
//         </div>

//         {/* Notifications list */}
//         <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
//           {loading && (
//             <div className="text-center py-8 text-slate-400">Loading...</div>
//           )}
//           {!loading && notifications.length === 0 && (
//             <div className="text-center py-10 text-slate-400">No notifications yet.</div>
//           )}
//           {!loading && notifications.map(notif => {
//             const styles = getTypeStyles(notif.type);
//             return (
//               <div key={notif._id} className={`p-3 sm:p-4 rounded-2xl border ${styles.border} ${!notif.isRead ? 'bg-white shadow-md' : styles.bg} transition`}>
//                 <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
//                   <div className="flex-1 min-w-0">
//                     <div className="flex flex-wrap items-center gap-2 mb-1">
//                       <h3 className={`font-bold text-sm sm:text-base ${!notif.isRead ? 'text-slate-900' : styles.text}`}>
//                         {notif.title}
//                       </h3>
//                       {!notif.isRead && (
//                         <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full whitespace-nowrap">
//                           New
//                         </span>
//                       )}
//                     </div>
//                     <p className="text-xs sm:text-sm text-slate-600 break-words">
//                       {notif.message}
//                     </p>
//                     <p className="text-xs text-slate-400 mt-2">
//                       {new Date(notif.createdAt).toLocaleString()}
//                     </p>
//                   </div>
//                   <div className="flex gap-2 self-end sm:self-center shrink-0">
//                     {!notif.isRead && (
//                       <button
//                         onClick={() => markAsRead(notif._id)}
//                         className="px-3 py-1.5 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition active:scale-95"
//                       >
//                         Mark read
//                       </button>
//                     )}
//                     <button
//                       onClick={() => deleteNotification(notif._id)}
//                       className="px-3 py-1.5 text-xs font-medium rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 transition active:scale-95"
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {/* Pagination - only if needed */}
//         {totalPages > 1 && (
//           <div className="flex justify-center gap-3 p-4 border-t bg-white">
//             <button
//               onClick={() => setPage(p => Math.max(1, p - 1))}
//               disabled={page === 1}
//               className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium disabled:opacity-40 active:scale-95 transition"
//             >
//               Previous
//             </button>
//             <span className="text-sm text-slate-600 self-center">
//               Page {page} of {totalPages}
//             </span>
//             <button
//               onClick={() => setPage(p => Math.min(totalPages, p + 1))}
//               disabled={page === totalPages}
//               className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium disabled:opacity-40 active:scale-95 transition"
//             >
//               Next
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default NotificationPanel;






import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';

// Skeleton loader – shows instantly while data loads
const NotificationSkeleton = () => (
  <div className="space-y-3 p-3 sm:p-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="p-3 sm:p-4 rounded-2xl border border-slate-100 animate-pulse">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="h-5 bg-slate-200 rounded w-32 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-full mb-1"></div>
            <div className="h-3 bg-slate-200 rounded w-24 mt-2"></div>
          </div>
          <div className="flex gap-2 self-end sm:self-center">
            <div className="w-16 h-7 bg-slate-200 rounded-full"></div>
            <div className="w-16 h-7 bg-slate-200 rounded-full"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const NotificationPanel = React.memo(({ onClose }) => {
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

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.data.count);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  const markAsRead = useCallback(async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) { console.error(err); }
  }, []);

  const deleteNotification = useCallback(async (id) => {
    if (!window.confirm('Delete this notification?')) return;
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      const wasUnread = notifications.find(n => n._id === id)?.isRead === false;
      if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) { console.error(err); }
  }, [notifications]);

  const getTypeStyles = useCallback((type) => {
    switch (type) {
      case 'success': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
      case 'warning': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
      case 'system': return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
      default: return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
    }
  }, []);

  // Memoized pagination handlers
  const goPrev = useCallback(() => setPage(p => Math.max(1, p - 1)), []);
  const goNext = useCallback(() => setPage(p => Math.min(totalPages, p + 1)), [totalPages]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-2xl max-h-[90vh] sm:rounded-3xl shadow-2xl flex flex-col sm:mx-4 overflow-hidden animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-5 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">🔔</span>
            <h2 className="text-base sm:text-xl font-bold text-slate-800">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-indigo-100 text-indigo-700 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 active:bg-slate-200 transition touch-manipulation"
            aria-label="Close"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Notifications list with skeleton loading */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
          {loading && <NotificationSkeleton />}
          {!loading && notifications.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm sm:text-base">
              No notifications yet.
            </div>
          )}
          {!loading && notifications.map(notif => {
            const styles = getTypeStyles(notif.type);
            return (
              <div
                key={notif._id}
                className={`p-3 sm:p-4 rounded-2xl border ${styles.border} ${!notif.isRead ? 'bg-white shadow-md' : styles.bg} transition-all duration-200`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className={`font-bold text-sm sm:text-base ${!notif.isRead ? 'text-slate-900' : styles.text}`}>
                        {notif.title}
                      </h3>
                      {!notif.isRead && (
                        <span className="text-[9px] sm:text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full whitespace-nowrap">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 break-words">
                      {notif.message}
                    </p>
                    <p className="text-[10px] sm:text-xs text-slate-400 mt-2">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 self-end sm:self-center shrink-0">
                    {!notif.isRead && (
                      <button
                        onClick={() => markAsRead(notif._id)}
                        className="px-3 py-1.5 text-[11px] sm:text-xs font-medium rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition active:scale-95 touch-manipulation"
                      >
                        Mark read
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notif._id)}
                      className="px-3 py-1.5 text-[11px] sm:text-xs font-medium rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 transition active:scale-95 touch-manipulation"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination (only if needed) */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-3 p-4 border-t bg-white">
            <button
              onClick={goPrev}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium disabled:opacity-40 active:scale-95 transition touch-manipulation"
            >
              Previous
            </button>
            <span className="text-sm text-slate-600 self-center">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={goNext}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium disabled:opacity-40 active:scale-95 transition touch-manipulation"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

NotificationPanel.displayName = 'NotificationPanel';
export default NotificationPanel;