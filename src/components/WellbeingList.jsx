import React, { useState } from 'react';

const WellbeingList = ({ title, icon, activities, onEdit, onDelete, showPercent = false }) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', stressReductionPercent: 50, notes: '' });
  const [isSaving, setIsSaving] = useState(false);

  const startEdit = (activity) => {
    setEditingId(activity._id);
    setEditForm({
      name: activity.name,
      stressReductionPercent: activity.stressReductionPercent,
      notes: activity.notes,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', stressReductionPercent: 50, notes: '' });
  };

  const saveEdit = async () => {
    if (!editForm.name.trim()) return;
    setIsSaving(true);
    try {
      await onEdit(editingId, editForm);
      setEditingId(null);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
        <span className="text-xl sm:text-2xl">{icon}</span> {title}{' '}
        <span className="text-sm font-normal text-slate-400">({activities.length})</span>
      </h3>

      <div className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-slate-400 italic text-sm text-center py-6">No activities added yet.</p>
        ) : (
          activities.map(activity => (
            <div
              key={activity._id}
              className="bg-slate-50 rounded-2xl p-3 sm:p-4 transition-all hover:shadow-sm"
            >
              {editingId === activity._id ? (
                // Edit Mode
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
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
                          onChange={e =>
                            setEditForm({ ...editForm, stressReductionPercent: parseInt(e.target.value) })
                          }
                          className="flex-1"
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
                    onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                    rows="2"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                    placeholder="Notes"
                    disabled={isSaving}
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={saveEdit}
                      disabled={isSaving}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-xl text-sm font-bold transition disabled:opacity-50"
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={isSaving}
                      className="bg-gray-200 hover:bg-gray-300 text-slate-700 px-4 py-1.5 rounded-xl text-sm font-bold transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-base break-words">{activity.name}</p>
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
                      <p className="text-xs text-slate-500 mt-2 italic break-words">"{activity.notes}"</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-auto sm:ml-0">
                    <button
                      onClick={() => startEdit(activity)}
                      className="text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-lg text-sm font-medium transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(activity._id)}
                      className="text-rose-600 hover:bg-rose-50 px-2 py-1 rounded-lg text-sm font-medium transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WellbeingList;