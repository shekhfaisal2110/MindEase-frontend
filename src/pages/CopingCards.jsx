// src/pages/CopingCards.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../services/api';
import PageLayout from '../components/PageLayout';
import { FaBookmark, FaRegBookmark, FaCopy, FaSearch, FaTimes, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { mockCards } from '../data/mockCopingCards';
import CardDetailModal from '../components/CopingCards/CardDetailModal';
import CreateEditModal from '../components/CopingCards/CreateEditModal';

// ---------- Skeleton ----------
const CardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden animate-pulse">
    <div className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="h-5 bg-slate-200 rounded w-20" />
          <div className="h-6 bg-slate-200 rounded w-32 mt-2" />
        </div>
        <div className="w-6 h-6 bg-slate-200 rounded-full" />
      </div>
      <div className="h-10 bg-slate-100 rounded mt-3" />
      <div className="flex gap-2 mt-4">
        <div className="h-8 bg-slate-100 rounded-full w-20" />
        <div className="h-8 bg-slate-100 rounded-full w-20" />
      </div>
    </div>
  </div>
);

// ---------- Card component ----------
const CopingCard = React.memo(({ card, bookmarks, onToggleBookmark, onCopySteps, copiedId, onOpen, onEdit, onDelete }) => {
  const isBookmarked = bookmarks.has(card._id);
  const isCustom = card.isCustom || card.createdBy;
  const isShared = !!card.sharedByUsername;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden hover:shadow-lg transition">
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-1 mb-2">
              <span className="text-[10px] sm:text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{card.category}</span>
              {isCustom && <span className="text-[10px] sm:text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">✨ My Card</span>}
              {isShared && <span className="text-[10px] sm:text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">⭐ Community</span>}
            </div>
            <h3 className="font-bold text-base sm:text-lg text-slate-800 line-clamp-2">{card.title}</h3>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            {isCustom && (
              <>
                <button onClick={() => onEdit(card)} className="text-slate-400 hover:text-indigo-600 p-1 rounded-full touch-manipulation" aria-label="Edit"><FaEdit size={16} /></button>
                <button onClick={() => onDelete(card._id)} className="text-slate-400 hover:text-rose-500 p-1 rounded-full touch-manipulation" aria-label="Delete"><FaTrash size={16} /></button>
              </>
            )}
            <button onClick={() => onToggleBookmark(card._id)} className="text-slate-400 hover:text-indigo-600 p-1 rounded-full touch-manipulation" aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}>
              {isBookmarked ? <FaBookmark className="text-indigo-600" size={16} /> : <FaRegBookmark size={16} />}
            </button>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 line-clamp-2">{card.whenToUse}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={() => onOpen(card)} className="text-xs sm:text-sm bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition touch-manipulation">Read now</button>
          <button onClick={() => onCopySteps(card.steps, card._id)} className="text-xs sm:text-sm bg-slate-50 text-slate-600 hover:bg-slate-100 px-3 py-1.5 rounded-full flex items-center gap-1 transition touch-manipulation"><FaCopy size={12} /> {copiedId === card._id ? 'Copied!' : 'Copy'}</button>
        </div>
        {card.sharedByUsername && <p className="text-[10px] sm:text-xs text-slate-400 mt-3">Shared by {card.sharedByUsername}</p>}
      </div>
    </div>
  );
});

const CopingCards = () => {
  const [allCards, setAllCards] = useState([]);
  const [myCards, setMyCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [bookmarks, setBookmarks] = useState(() => new Set());
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [showMyCardsOnly, setShowMyCardsOnly] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [useFallback, setUseFallback] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [formData, setFormData] = useState({
    title: '', category: '', whenToUse: '', steps: [], whyItHelps: '', emergencyNote: '', sharePublic: false
  });
  const [stepInput, setStepInput] = useState('');

  const categories = ['low mood', 'overthinking', 'self-criticism', 'no energy', 'social withdrawal', 'sleep reset', 'grounding'];

  // Fetch public cards – use mock if API returns empty or fails
  const fetchPublicCards = useCallback(async () => {
    try {
      const res = await api.get('/coping-cards?limit=100');
      const cards = res.data.cards;
      if (cards && cards.length > 10) {
        setAllCards(cards);
        setUseFallback(false);
      } else {
        console.warn('API returned empty cards – using mock data');
        setAllCards(mockCards);
        setUseFallback(true);
      }
    } catch (err) {
      console.warn('API failed – using mock data', err);
      setAllCards(mockCards);
      setUseFallback(true);
    }
  }, []);

  const fetchMyCardsData = useCallback(async () => {
    if (useFallback) {
      setMyCards([]);
      return;
    }
    try {
      const res = await api.get('/coping-cards/my');
      setMyCards(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch my cards', err);
      setMyCards([]);
    }
  }, [useFallback]);

  const fetchBookmarksData = useCallback(async () => {
    if (useFallback) {
      const stored = localStorage.getItem('copingCardsBookmarks');
      if (stored) setBookmarks(new Set(JSON.parse(stored)));
      return;
    }
    try {
      const res = await api.get('/coping-cards/bookmarks/my');
      const ids = new Set(res.data.bookmarks?.map(b => b.card._id) || []);
      setBookmarks(ids);
    } catch (err) {
      const stored = localStorage.getItem('copingCardsBookmarks');
      if (stored) setBookmarks(new Set(JSON.parse(stored)));
    }
  }, [useFallback]);

  useEffect(() => {
    Promise.all([fetchPublicCards(), fetchMyCardsData()]).finally(() => setLoading(false));
  }, [fetchPublicCards, fetchMyCardsData]);

  useEffect(() => {
    if (!loading) fetchBookmarksData();
  }, [loading, fetchBookmarksData]);

  const combinedCards = useMemo(() => {
    const combined = [...allCards, ...myCards];
    const seen = new Set();
    return combined.filter(card => {
      if (!card || !card._id) return false;
      if (seen.has(card._id)) return false;
      seen.add(card._id);
      return true;
    });
  }, [allCards, myCards]);

  useEffect(() => {
    if (bookmarks.size > 0 || localStorage.getItem('copingCardsBookmarks')) {
      localStorage.setItem('copingCardsBookmarks', JSON.stringify([...bookmarks]));
    }
  }, [bookmarks]);

  const toggleBookmark = useCallback(async (cardId) => {
    const wasBookmarked = bookmarks.has(cardId);
    setBookmarks(prev => {
      const newSet = new Set(prev);
      wasBookmarked ? newSet.delete(cardId) : newSet.add(cardId);
      return newSet;
    });
    if (useFallback) return;
    try {
      if (wasBookmarked) await api.delete(`/coping-cards/bookmarks/${cardId}`);
      else await api.post(`/coping-cards/bookmarks/${cardId}`);
    } catch (err) {
      console.error('Bookmark sync failed', err);
      setUseFallback(true);
    }
  }, [bookmarks, useFallback]);

  const copyStepsToClipboard = useCallback((steps, cardId) => {
    navigator.clipboard.writeText(steps.join('\n'));
    setCopiedId(cardId);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const openCard = useCallback((card) => setSelectedCard(card), []);
  const closeModal = useCallback(() => setSelectedCard(null), []);

  const createOrUpdateCard = useCallback(async (payload) => {
    if (!payload.title || !payload.category || !payload.whenToUse || payload.steps.length === 0) {
      alert('Please fill all required fields');
      return;
    }
    try {
      if (editingCard) {
        await api.put(`/coping-cards/${editingCard._id}`, payload);
      } else {
        await api.post('/coping-cards', payload);
      }
      setShowCreateModal(false);
      setEditingCard(null);
      setFormData({ title: '', category: '', whenToUse: '', steps: [], whyItHelps: '', emergencyNote: '', sharePublic: false });
      await Promise.all([fetchMyCardsData(), fetchPublicCards()]);
    } catch (err) {
      alert('Failed to save card');
    }
  }, [editingCard, fetchMyCardsData, fetchPublicCards]);

  const deleteCustomCard = useCallback(async (cardId) => {
    if (!window.confirm('Delete this card permanently?')) return;
    try {
      await api.delete(`/coping-cards/${cardId}`);
      setMyCards(prev => prev.filter(c => c._id !== cardId));
      setBookmarks(prev => { const newSet = new Set(prev); newSet.delete(cardId); return newSet; });
    } catch (err) {
      alert('Failed to delete');
    }
  }, []);

  const editCustomCard = useCallback((card) => {
    setEditingCard(card);
    setFormData({
      title: card.title,
      category: card.category,
      whenToUse: card.whenToUse,
      steps: card.steps,
      whyItHelps: card.whyItHelps || '',
      emergencyNote: card.emergencyNote || '',
      sharePublic: card.sharePublic || false
    });
    setShowCreateModal(true);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('');
    setShowBookmarksOnly(false);
    setShowMyCardsOnly(false);
  }, []);

  const filteredCards = useMemo(() => {
    let filtered = combinedCards;
    if (showMyCardsOnly) {
      filtered = filtered.filter(c => c.createdBy || (myCards || []).some(mc => mc._id === c._id));
    }
    if (selectedCategory) {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => c.title?.toLowerCase().includes(term) || c.whenToUse?.toLowerCase().includes(term));
    }
    if (showBookmarksOnly) {
      filtered = filtered.filter(c => bookmarks.has(c._id));
    }
    return filtered;
  }, [combinedCards, showMyCardsOnly, selectedCategory, searchTerm, showBookmarksOnly, bookmarks, myCards]);

  if (loading) {
    return (
      <PageLayout title="Coping Cards" subtitle="Quick support for hard moments">
        <div className="space-y-6">
          <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="h-10 bg-slate-200 rounded-xl flex-1 animate-pulse" />
            <div className="h-10 w-20 bg-slate-200 rounded-xl animate-pulse" />
            <div className="h-10 w-24 bg-slate-200 rounded-xl animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Coping Cards" subtitle="Quick support for hard moments">
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6 text-sm text-indigo-800">
        <p className="font-medium mb-1">💡 These cards offer supportive self‑help steps and are not a substitute for emergency or professional care.</p>
        <p className="text-xs">If you're in crisis, please contact a mental health professional or emergency services immediately.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6 items-stretch sm:items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[180px]">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={14} />
            <input type="text" placeholder="Search cards..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-8 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-200 outline-none text-sm" />
            {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2"><FaTimes className="text-slate-400" size={12} /></button>}
          </div>
          <button onClick={() => setShowBookmarksOnly(prev => !prev)} className={`px-3 py-2 rounded-xl flex items-center gap-2 transition text-sm touch-manipulation ${showBookmarksOnly ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}>
            {showBookmarksOnly ? <FaBookmark size={14} /> : <FaRegBookmark size={14} />} Saved
          </button>
          <button onClick={() => setShowMyCardsOnly(prev => !prev)} className={`px-3 py-2 rounded-xl flex items-center gap-2 transition text-sm touch-manipulation ${showMyCardsOnly ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}>
            <FaPlus size={14} /> My Cards
          </button>
        </div>
        <button onClick={() => { setEditingCard(null); setFormData({ title: '', category: '', whenToUse: '', steps: [], whyItHelps: '', emergencyNote: '', sharePublic: false }); setShowCreateModal(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-bold shadow-md transition active:scale-95 touch-manipulation">
          <FaPlus size={14} /> Create new card
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map(cat => (
          <button key={cat} onClick={() => setSelectedCategory(cat === selectedCategory ? '' : cat)} className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition touch-manipulation ${selectedCategory === cat ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{cat}</button>
        ))}
        {(searchTerm || selectedCategory || showBookmarksOnly || showMyCardsOnly) && (
          <button onClick={clearFilters} className="px-3 py-1.5 rounded-full text-xs sm:text-sm bg-slate-100 text-slate-500 hover:bg-slate-200 transition touch-manipulation">Clear filters</button>
        )}
      </div>

      {filteredCards.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-slate-800">No cards found</h3>
          <p className="text-slate-500 mt-2">Try another feeling or category</p>
          <button onClick={clearFilters} className="mt-4 bg-indigo-600 text-white px-5 py-2 rounded-xl">View all cards</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredCards.map(card => (
            <CopingCard key={card._id} card={card} bookmarks={bookmarks} onToggleBookmark={toggleBookmark} onCopySteps={copyStepsToClipboard} copiedId={copiedId} onOpen={openCard} onEdit={editCustomCard} onDelete={deleteCustomCard} />
          ))}
        </div>
      )}

      {showCreateModal && <CreateEditModal editingCard={editingCard} formData={formData} setFormData={setFormData} stepInput={stepInput} setStepInput={setStepInput} categories={categories} onClose={() => setShowCreateModal(false)} onSave={createOrUpdateCard} />}
      {selectedCard && <CardDetailModal card={selectedCard} bookmarks={bookmarks} onToggleBookmark={toggleBookmark} onCopySteps={copyStepsToClipboard} copiedId={copiedId} onClose={closeModal} />}
    </PageLayout>
  );
};

export default CopingCards;