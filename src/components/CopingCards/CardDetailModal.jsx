// src/components/CopingCards/CardDetailModal.jsx
import React, { useCallback } from 'react';
import { FaTimes, FaCopy } from 'react-icons/fa';

const CardDetailModal = ({ card, bookmarks, onToggleBookmark, onCopySteps, copiedId, onClose }) => {
  const isBookmarked = bookmarks.has(card._id);
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl sm:text-2xl font-bold break-words">{card.title}</h2>
          <button onClick={onClose} className="p-1 touch-manipulation"><FaTimes size={24} /></button>
        </div>
        <div className="mb-2"><span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">{card.category}</span></div>
        <p className="text-slate-600 mb-4 text-sm"><strong>When to use:</strong> {card.whenToUse}</p>
        <ol className="list-decimal list-inside space-y-2 text-slate-700 mb-4 text-sm">{card.steps.map((step, i) => <li key={i}>{step}</li>)}</ol>
        {card.whyItHelps && <p className="mb-4 p-3 bg-indigo-50 rounded-xl text-indigo-800 italic text-sm">✨ {card.whyItHelps}</p>}
        {card.emergencyNote && <p className="mb-4 p-3 bg-rose-50 rounded-xl text-rose-700 text-sm">⚠️ {card.emergencyNote}</p>}
        {card.sharedByUsername && <p className="mb-4 text-xs text-slate-500">Shared by {card.sharedByUsername}</p>}
        <div className="flex flex-wrap gap-3">
          <button onClick={() => onCopySteps(card.steps, card._id)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2 active:scale-95">
            <FaCopy size={14} /> {copiedId === card._id ? 'Copied!' : 'Copy steps'}
          </button>
          <button onClick={() => onToggleBookmark(card._id)} className="border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm active:scale-95">
            {isBookmarked ? 'Remove from saved' : 'Save card'}
          </button>
        </div>
      </div>
    </div>
  );
};

CardDetailModal.displayName = 'CardDetailModal';
export default CardDetailModal;