// import React, { useState } from 'react';

// const WellbeingList = ({ title, icon, activities, onEdit, onDelete, showPercent = false }) => {
//   const [editingId, setEditingId] = useState(null);
//   const [editForm, setEditForm] = useState({ name: '', stressReductionPercent: 50, notes: '' });
//   const [isSaving, setIsSaving] = useState(false);

//   const startEdit = (activity) => {
//     setEditingId(activity._id);
//     setEditForm({
//       name: activity.name,
//       stressReductionPercent: activity.stressReductionPercent,
//       notes: activity.notes,
//     });
//   };

//   const cancelEdit = () => {
//     setEditingId(null);
//     setEditForm({ name: '', stressReductionPercent: 50, notes: '' });
//   };

//   const saveEdit = async () => {
//     if (!editForm.name.trim()) return;
//     setIsSaving(true);
//     try {
//       await onEdit(editingId, editForm);
//       setEditingId(null);
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   return (
//     <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6">
//       <h3 className="text-lg sm:text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
//         <span className="text-xl sm:text-2xl">{icon}</span> {title}{' '}
//         <span className="text-sm font-normal text-slate-400">({activities.length})</span>
//       </h3>

//       <div className="space-y-3">
//         {activities.length === 0 ? (
//           <p className="text-slate-400 italic text-sm text-center py-6">No activities added yet.</p>
//         ) : (
//           activities.map(activity => (
//             <div
//               key={activity._id}
//               className="bg-slate-50 rounded-2xl p-3 sm:p-4 transition-all hover:shadow-sm"
//             >
//               {editingId === activity._id ? (
//                 // Edit Mode
//                 <div className="space-y-3">
//                   <input
//                     type="text"
//                     value={editForm.name}
//                     onChange={e => setEditForm({ ...editForm, name: e.target.value })}
//                     className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
//                     autoFocus
//                     disabled={isSaving}
//                   />
//                   {showPercent && (
//                     <div className="flex flex-col sm:flex-row sm:items-center gap-2">
//                       <label className="text-xs font-bold text-slate-500">Reduction %</label>
//                       <div className="flex items-center gap-3 flex-1">
//                         <input
//                           type="range"
//                           min="0"
//                           max="100"
//                           value={editForm.stressReductionPercent}
//                           onChange={e =>
//                             setEditForm({ ...editForm, stressReductionPercent: parseInt(e.target.value) })
//                           }
//                           className="flex-1"
//                           disabled={isSaving}
//                         />
//                         <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full min-w-[50px] text-center">
//                           {editForm.stressReductionPercent}%
//                         </span>
//                       </div>
//                     </div>
//                   )}
//                   <textarea
//                     value={editForm.notes}
//                     onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
//                     rows="2"
//                     className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
//                     placeholder="Notes"
//                     disabled={isSaving}
//                   />
//                   <div className="flex gap-2 justify-end">
//                     <button
//                       onClick={saveEdit}
//                       disabled={isSaving}
//                       className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-xl text-sm font-bold transition disabled:opacity-50"
//                     >
//                       {isSaving ? 'Saving...' : 'Save'}
//                     </button>
//                     <button
//                       onClick={cancelEdit}
//                       disabled={isSaving}
//                       className="bg-gray-200 hover:bg-gray-300 text-slate-700 px-4 py-1.5 rounded-xl text-sm font-bold transition"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </div>
//               ) : (
//                 // View Mode
//                 <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
//                   <div className="flex-1 min-w-0">
//                     <p className="font-bold text-slate-800 text-base break-words">{activity.name}</p>
//                     {showPercent && (
//                       <div className="mt-2">
//                         <div className="flex flex-col sm:flex-row sm:items-center gap-2">
//                           <span className="text-xs font-bold text-slate-500">Stress reduction:</span>
//                           <div className="flex items-center gap-2 flex-1">
//                             <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
//                               <div
//                                 className="h-full bg-emerald-500 rounded-full transition-all"
//                                 style={{ width: `${activity.stressReductionPercent}%` }}
//                               />
//                             </div>
//                             <span className="text-xs font-bold text-emerald-600 whitespace-nowrap">
//                               {activity.stressReductionPercent}%
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                     {activity.notes && (
//                       <p className="text-xs text-slate-500 mt-2 italic break-words">"{activity.notes}"</p>
//                     )}
//                   </div>
//                   <div className="flex gap-2 ml-auto sm:ml-0">
//                     <button
//                       onClick={() => startEdit(activity)}
//                       className="text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-lg text-sm font-medium transition"
//                     >
//                       Edit
//                     </button>
//                     <button
//                       onClick={() => onDelete(activity._id)}
//                       className="text-rose-600 hover:bg-rose-50 px-2 py-1 rounded-lg text-sm font-medium transition"
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default WellbeingList;


import React, { useState, useCallback, useMemo } from 'react';

// Memoized individual activity row to prevent re-rendering of all items when one is edited
const ActivityRow = React.memo(({ activity, showPercent, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: activity.name,
    stressReductionPercent: activity.stressReductionPercent || 50,
    notes: activity.notes || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const startEdit = useCallback(() => {
    setIsEditing(true);
    setEditForm({
      name: activity.name,
      stressReductionPercent: activity.stressReductionPercent || 50,
      notes: activity.notes || '',
    });
  }, [activity.name, activity.stressReductionPercent, activity.notes]);

  const cancelEdit = useCallback(() => setIsEditing(false), []);

  const handleNameChange = useCallback((e) => setEditForm(prev => ({ ...prev, name: e.target.value })), []);
  const handlePercentChange = useCallback((e) => setEditForm(prev => ({ ...prev, stressReductionPercent: parseInt(e.target.value) })), []);
  const handleNotesChange = useCallback((e) => setEditForm(prev => ({ ...prev, notes: e.target.value })), []);

  const saveEdit = useCallback(async () => {
    if (!editForm.name.trim()) return;
    setIsSaving(true);
    try {
      await onEdit(activity._id, editForm);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  }, [activity._id, editForm, onEdit]);

  const handleDelete = useCallback(() => onDelete(activity._id), [activity._id, onDelete]);

  if (isEditing) {
    return (
      <div className="bg-slate-50 rounded-2xl p-3 sm:p-4 space-y-3">
        <input
          type="text"
          value={editForm.name}
          onChange={handleNameChange}
          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200 outline-none touch-manipulation"
          autoFocus
          disabled={isSaving}
        />
        {showPercent && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="text-xs font-bold text-slate-500">Reduction %</label>
            <div className="flex items-center gap-3 flex-1">
              <input
                type="range"
                min="0"
                max="100"
                value={editForm.stressReductionPercent}
                onChange={handlePercentChange}
                className="flex-1 h-2 rounded-lg touch-manipulation"
                disabled={isSaving}
              />
              <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full min-w-[50px] text-center">
                {editForm.stressReductionPercent}%
              </span>
            </div>
          </div>
        )}
        <textarea
          value={editForm.notes}
          onChange={handleNotesChange}
          rows={2}
          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200 outline-none resize-none touch-manipulation"
          placeholder="Notes"
          disabled={isSaving}
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={saveEdit}
            disabled={isSaving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-xl text-sm font-bold transition disabled:opacity-50 active:scale-95 touch-manipulation"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={cancelEdit}
            disabled={isSaving}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-1.5 rounded-xl text-sm font-bold transition active:scale-95 touch-manipulation"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 rounded-2xl p-3 sm:p-4 transition-all hover:shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800 text-sm sm:text-base break-words">{activity.name}</p>
          {showPercent && (
            <div className="mt-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Stress reduction:</span>
                <div className="flex items-center gap-2 flex-1">
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${activity.stressReductionPercent}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-emerald-600 whitespace-nowrap">
                    {activity.stressReductionPercent}%
                  </span>
                </div>
              </div>
            </div>
          )}
          {activity.notes && (
            <p className="text-xs text-slate-500 mt-2 italic break-words line-clamp-2">"{activity.notes}"</p>
          )}
        </div>
        <div className="flex gap-2 ml-auto sm:ml-0">
          <button
            onClick={startEdit}
            className="text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-sm font-medium transition active:scale-95 touch-manipulation"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg text-sm font-medium transition active:scale-95 touch-manipulation"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
});

ActivityRow.displayName = 'ActivityRow';

const WellbeingList = React.memo(({ title, icon, activities, onEdit, onDelete, showPercent = false }) => {
  // Memoize the activities list to pass stable reference to child items
  const memoizedActivities = useMemo(() => activities, [activities]);

  // Stable callbacks that won't change on each render
  const handleEdit = useCallback((id, form) => onEdit(id, form), [onEdit]);
  const handleDelete = useCallback((id) => onDelete(id), [onDelete]);

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6">
      <h3 className="text-base sm:text-lg md:text-xl font-black text-slate-800 mb-4 flex items-center gap-2 flex-wrap">
        <span className="text-xl sm:text-2xl">{icon}</span> {title}
        <span className="text-sm font-normal text-slate-400">({activities.length})</span>
      </h3>

      <div className="space-y-3">
        {memoizedActivities.length === 0 ? (
          <p className="text-slate-400 italic text-sm text-center py-6">No activities added yet.</p>
        ) : (
          memoizedActivities.map(activity => (
            <ActivityRow
              key={activity._id}
              activity={activity}
              showPercent={showPercent}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
});

WellbeingList.displayName = 'WellbeingList';
export default WellbeingList;