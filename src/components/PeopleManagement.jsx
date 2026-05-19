import React, { useState, useCallback, useMemo } from 'react';

const PeopleManagement = React.memo(({ people, onAdd, onEdit, onDelete }) => {
  const [newPerson, setNewPerson] = useState({ name: '', type: 'family' });
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Memoize filtered lists to avoid recalculations on every render
  const familyMembers = useMemo(() => people.filter(p => p.type === 'family'), [people]);
  const friends = useMemo(() => people.filter(p => p.type === 'friend'), [people]);

  const handleAdd = useCallback(async (e) => {
    e.preventDefault();
    if (!newPerson.name.trim()) return;
    setIsAdding(true);
    try {
      await onAdd(newPerson);
      setNewPerson({ name: '', type: 'family' });
    } finally {
      setIsAdding(false);
    }
  }, [newPerson, onAdd]);

  const startEdit = useCallback((person) => {
    setEditingId(person._id);
    setEditingName(person.name);
  }, []);

  const saveEdit = useCallback(async (id) => {
    if (!editingName.trim()) return;
    setIsSavingEdit(true);
    try {
      await onEdit(id, editingName);
      setEditingId(null);
      setEditingName('');
    } finally {
      setIsSavingEdit(false);
    }
  }, [editingName, onEdit]);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditingName('');
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Delete this person? All time entries will also be deleted.')) return;
    await onDelete(id);
  }, [onDelete]);

  // Person row component to avoid re-rendering all rows when one is edited
  const PersonRow = useCallback(({ person, isFamily }) => {
    const isEditing = editingId === person._id;
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 rounded-xl gap-2">
        {isEditing ? (
          <div className="flex-1 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={editingName}
              onChange={e => setEditingName(e.target.value)}
              className="flex-1 bg-white border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-100 outline-none"
              autoFocus
              disabled={isSavingEdit}
            />
            <div className="flex gap-2">
              <button
                onClick={() => saveEdit(person._id)}
                disabled={isSavingEdit}
                className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-sm font-bold disabled:opacity-50 active:scale-95 touch-manipulation"
              >
                Save
              </button>
              <button
                onClick={cancelEdit}
                disabled={isSavingEdit}
                className="bg-gray-300 text-slate-700 px-3 py-1 rounded-lg text-sm font-bold active:scale-95 touch-manipulation"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <span className="text-slate-700 font-medium text-sm sm:text-base break-words">{person.name}</span>
            <div className="flex gap-2 ml-auto sm:ml-0">
              <button
                onClick={() => startEdit(person)}
                className="text-indigo-500 text-xs sm:text-sm font-bold px-2 py-1 rounded-lg hover:bg-indigo-50 transition active:scale-95 touch-manipulation"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(person._id)}
                className="text-rose-500 text-xs sm:text-sm font-bold px-2 py-1 rounded-lg hover:bg-rose-50 transition active:scale-95 touch-manipulation"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    );
  }, [editingId, editingName, isSavingEdit, saveEdit, cancelEdit, startEdit, handleDelete]);

  return (
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-0">
      {/* Add Form – responsive */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span>➕</span> Add Someone
        </h2>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Name"
            value={newPerson.name}
            onChange={e => setNewPerson(prev => ({ ...prev, name: e.target.value }))}
            className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm sm:text-base focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            required
            disabled={isAdding}
          />
          <select
            value={newPerson.type}
            onChange={e => setNewPerson(prev => ({ ...prev, type: e.target.value }))}
            className="bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            disabled={isAdding}
          >
            <option value="family">👨‍👩‍👧 Family</option>
            <option value="friend">👫 Friend</option>
          </select>
          <button
            type="submit"
            disabled={isAdding}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-100 touch-manipulation text-sm sm:text-base"
          >
            {isAdding ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Adding...
              </span>
            ) : (
              'Add'
            )}
          </button>
        </form>
      </div>

      {/* Two column grid – stacks on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Family Section */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
            <span>👨‍👩‍👧</span> Family ({familyMembers.length})
          </h3>
          <div className="space-y-3">
            {familyMembers.length === 0 ? (
              <p className="text-slate-400 italic text-sm text-center py-4">No family members yet.</p>
            ) : (
              familyMembers.map(person => <PersonRow key={person._id} person={person} isFamily />)
            )}
          </div>
        </div>

        {/* Friends Section */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
            <span>👫</span> Friends ({friends.length})
          </h3>
          <div className="space-y-3">
            {friends.length === 0 ? (
              <p className="text-slate-400 italic text-sm text-center py-4">No friends yet.</p>
            ) : (
              friends.map(person => <PersonRow key={person._id} person={person} isFamily={false} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

PeopleManagement.displayName = 'PeopleManagement';

export default PeopleManagement;