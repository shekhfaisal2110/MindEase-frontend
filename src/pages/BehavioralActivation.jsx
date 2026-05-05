// src/pages/BehavioralActivation.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaClock, FaHistory, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import api from '../services/api';
import PageLayout from '../components/PageLayout';
import { defaultSuggestions } from '../data/behavioralSuggestions';

const categories = ['self-care', 'movement', 'sleep', 'social', 'productivity', 'relaxation'];

// Memoized subcomponents (same as before, unchanged)
const TaskCard = React.memo(({ task, onComplete, onSkip }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 h-full flex flex-col">
    <div className="flex justify-between items-start">
      <div>
        <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full">
          {task.category}
        </span>
        <h3 className="font-bold text-lg text-slate-800 mt-2">{task.title}</h3>
      </div>
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${task.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
        {task.difficulty}
      </span>
    </div>
    <p className="flex items-center gap-1 text-sm text-slate-500 mt-2">
      <FaClock className="w-3 h-3" /> {task.estimatedMinutes} min
    </p>
    <div className="flex gap-2 mt-4">
      <button onClick={() => onComplete(task._id)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-sm transition active:scale-95 touch-manipulation">Complete</button>
      <button onClick={() => onSkip(task._id)} className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 py-2 rounded-xl text-sm transition active:scale-95 touch-manipulation">Skip</button>
    </div>
  </div>
));

const HistoryItem = React.memo(({ task }) => (
  <div className="bg-white rounded-xl border border-slate-100 p-4">
    <div className="flex justify-between items-start flex-wrap gap-2">
      <div>
        <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{task.category}</span>
        <h4 className="font-bold text-slate-800 mt-1">{task.title}</h4>
        <p className="text-xs text-slate-400 mt-1">{task.scheduledFor}</p>
      </div>
      <span className={`text-xs px-2 py-0.5 rounded-full ${task.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : task.status === 'skipped' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
        {task.status}
      </span>
    </div>
    {task.moodBefore && task.moodAfter && (
      <div className="mt-2 text-xs text-slate-500">Mood: {task.moodBefore} → {task.moodAfter}</div>
    )}
    {task.note && <p className="mt-1 text-sm text-slate-600 italic">“{task.note}”</p>}
  </div>
));

// Skeleton loaders
const TaskSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 animate-pulse">
    <div className="flex justify-between"><div className="h-5 bg-slate-200 rounded w-24" /><div className="h-5 bg-slate-200 rounded w-16" /></div>
    <div className="h-6 bg-slate-200 rounded w-3/4 mt-3" />
    <div className="h-4 bg-slate-200 rounded w-20 mt-2" />
    <div className="flex gap-2 mt-4"><div className="flex-1 h-10 bg-slate-200 rounded-xl" /><div className="flex-1 h-10 bg-slate-200 rounded-xl" /></div>
  </div>
);

const InsightSkeleton = () => (
  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm animate-pulse">
    <div className="h-4 bg-slate-200 rounded w-full" /><div className="h-4 bg-slate-200 rounded w-5/6 mt-2" />
  </div>
);

const BehavioralActivation = React.memo(() => {
  const [tasks, setTasks] = useState([]);
  const [historyTasks, setHistoryTasks] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    category: 'self-care',
    estimatedMinutes: 15,
    difficulty: 'easy',
    scheduledFor: new Date().toISOString().split('T')[0]
  });
  const [completingId, setCompletingId] = useState(null);
  const [moodModal, setMoodModal] = useState({ open: false, taskId: null });
  const [moodBefore, setMoodBefore] = useState(3);
  const [moodAfter, setMoodAfter] = useState(3);
  const [taskNote, setTaskNote] = useState('');
  const [insights, setInsights] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const currentMonth = today.slice(0, 7);

  // Memoized filtered task arrays – safe with fallback to empty arrays
  const plannedTasks = useMemo(() => (tasks || []).filter(t => t.status === 'planned'), [tasks]);
  const completedTasks = useMemo(() => (tasks || []).filter(t => t.status === 'completed'), [tasks]);
  const skippedTasks = useMemo(() => (tasks || []).filter(t => t.status === 'skipped'), [tasks]);
  const total = tasks?.length || 0;
  const completedCount = completedTasks.length;
  const progress = total === 0 ? 0 : (completedCount / total) * 100;
  const suggestedTasks = useMemo(() => plannedTasks.slice(0, 3), [plannedTasks]);

  // API calls (memoized)
  const fetchTasks = useCallback(async (date) => {
    try {
      const res = await api.get(`/behavioral/tasks?date=${date}`);
      setTasks(Array.isArray(res.data.tasks) ? res.data.tasks : []);
    } catch (err) {
      console.warn('Failed to fetch tasks, using empty array', err);
      setTasks([]);
    }
  }, []);

  const fetchHistory = useCallback(async (page = 1) => {
    setHistoryLoading(true);
    try {
      const res = await api.get(`/behavioral/history?month=${currentMonth}&page=${page}&limit=10`);
      setHistoryTasks(Array.isArray(res.data.tasks) ? res.data.tasks : []);
      setHistoryTotalPages(res.data.pagination?.pages || 1);
      setHistoryPage(page);
    } catch (err) {
      console.error('Failed to fetch history', err);
      setHistoryTasks([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [currentMonth]);

  const fetchInsights = useCallback(async () => {
    try {
      const res = await api.get('/behavioral/insights');
      setInsights(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setInsights([
        { text: "Showing up matters, even when it's hard." },
        { text: "Small progress is still progress." },
        { text: "Consistency beats intensity. Keep going." }
      ]);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTasks(today), fetchInsights()]);
      setLoading(false);
    };
    loadData();
  }, [fetchTasks, fetchInsights]);

  useEffect(() => {
    if (showHistory) fetchHistory(1);
  }, [showHistory, fetchHistory]);

  const addTask = useCallback(async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    const payload = { ...newTask, estimatedMinutes: parseInt(newTask.estimatedMinutes) || 5 };
    try {
      const res = await api.post('/behavioral/tasks', payload);
      setTasks(prev => [res.data, ...(prev || [])]);
      setNewTask({ title: '', category: 'self-care', estimatedMinutes: 15, difficulty: 'easy', scheduledFor: today });
      setShowAddForm(false);
    } catch (err) {
      alert('Failed to add task');
    }
  }, [newTask, today]);

  const addSuggestedTask = useCallback(async (suggestion) => {
    const payload = {
      title: suggestion.title,
      category: suggestion.category,
      estimatedMinutes: suggestion.estimatedMinutes,
      difficulty: suggestion.difficulty,
      scheduledFor: today
    };
    try {
      const res = await api.post('/behavioral/tasks', payload);
      setTasks(prev => [res.data, ...(prev || [])]);
    } catch (err) {
      alert('Failed to add task');
    }
  }, [today]);

  const skipTask = useCallback(async (id) => {
    try {
      await api.patch(`/behavioral/tasks/${id}/skip`);
      setTasks(prev => (prev || []).map(t => t._id === id ? { ...t, status: 'skipped' } : t));
    } catch (err) {
      alert('Failed to skip');
    }
  }, []);

  const openMoodModal = useCallback((id) => {
    setMoodModal({ open: true, taskId: id });
    setMoodBefore(3);
    setMoodAfter(3);
    setTaskNote('');
  }, []);

  const completeWithMood = useCallback(async () => {
    const { taskId } = moodModal;
    setCompletingId(taskId);
    try {
      await api.patch(`/behavioral/tasks/${taskId}/complete`, { moodBefore, moodAfter, note: taskNote });
      setTasks(prev => (prev || []).map(t => t._id === taskId ? { ...t, status: 'completed', moodBefore, moodAfter, note: taskNote } : t));
      setMoodModal({ open: false, taskId: null });
      if (showHistory) fetchHistory(historyPage);
    } catch (err) {
      alert('Failed to complete');
    } finally {
      setCompletingId(null);
    }
  }, [moodModal, moodBefore, moodAfter, taskNote, showHistory, fetchHistory, historyPage]);

  if (loading) {
    return (
      <PageLayout title="Tiny Wins" subtitle="Small actions that help you move forward, one step at a time.">
        <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 h-16 animate-pulse" />
          <div><div className="h-7 bg-slate-200 rounded w-40 mb-4" /><div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <TaskSkeleton key={i} />)}</div></div>
          <div className="bg-white rounded-2xl shadow-sm p-5 h-32 animate-pulse" />
          <div className="flex justify-end"><div className="w-32 h-10 bg-slate-200 rounded-xl" /></div>
          <div><div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <InsightSkeleton key={i} />)}</div></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Tiny Wins" subtitle="Small actions that help you move forward, one step at a time.">
      <div className="max-w-5xl mx-auto px-4 sm:px-0 space-y-6 sm:space-y-8">
        {/* Encouragement banner */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-indigo-800 text-sm">
          💡 You do not need to do everything today. Just one small step is enough.
        </div>

        {/* Today’s tasks */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4">✨ Today’s tiny wins</h2>
          {suggestedTasks.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 text-center">
              <p className="text-slate-500 mb-4">No tasks planned for today. Would you like to try one of these?</p>
              <div className="flex flex-wrap justify-center gap-2">
                {defaultSuggestions.map((sugg, idx) => (
                  <button key={idx} onClick={() => addSuggestedTask(sugg)} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm transition active:scale-95 touch-manipulation">
                    {sugg.title}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {suggestedTasks.map(task => (
                <TaskCard key={task._id} task={task} onComplete={openMoodModal} onSkip={skipTask} />
              ))}
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex justify-between items-end mb-2">
            <div>
              <h3 className="font-bold text-slate-800">Today’s progress</h3>
              <p className="text-sm text-slate-500">{completedCount} of {total} completed</p>
            </div>
            <span className="text-2xl font-black text-indigo-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-3">
            <span>✅ Completed: {completedCount}</span>
            <span>⏸️ Skipped: {skippedTasks.length}</span>
            <span>📋 Planned: {plannedTasks.length}</span>
          </div>
        </div>

        {/* Add custom task button + form */}
        <div className="flex justify-end">
          <button onClick={() => setShowAddForm(prev => !prev)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-bold shadow transition active:scale-95 touch-manipulation">
            + Add custom task
          </button>
        </div>
        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
            <h3 className="text-lg font-bold mb-4">Create a tiny win</h3>
            <form onSubmit={addTask} className="space-y-4">
              <input type="text" placeholder="Task title" value={newTask.title} onChange={e => setNewTask(prev => ({ ...prev, title: e.target.value }))} className="w-full border rounded-xl p-2 focus:ring-2 focus:ring-indigo-200 outline-none touch-manipulation" required />
              <select value={newTask.category} onChange={e => setNewTask(prev => ({ ...prev, category: e.target.value }))} className="w-full border rounded-xl p-2 focus:ring-2 focus:ring-indigo-200 outline-none touch-manipulation">
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
              <div className="flex flex-col sm:flex-row gap-3">
                <input type="number" placeholder="Minutes" value={newTask.estimatedMinutes} onChange={e => setNewTask(prev => ({ ...prev, estimatedMinutes: e.target.value === '' ? '' : parseInt(e.target.value) }))} className="flex-1 border rounded-xl p-2 touch-manipulation" />
                <select value={newTask.difficulty} onChange={e => setNewTask(prev => ({ ...prev, difficulty: e.target.value }))} className="flex-1 border rounded-xl p-2 touch-manipulation">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                </select>
              </div>
              <input type="date" value={newTask.scheduledFor} onChange={e => setNewTask(prev => ({ ...prev, scheduledFor: e.target.value }))} className="w-full border rounded-xl p-2 touch-manipulation" />
              <div className="flex gap-3">
                <button type="submit" className="bg-indigo-600 text-white px-5 py-2 rounded-xl active:scale-95">Save</button>
                <button type="button" onClick={() => setShowAddForm(false)} className="border border-slate-200 px-5 py-2 rounded-xl active:scale-95">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Weekly insights */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4">📊 Weekly insights</h2>
          {insights.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => <InsightSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {insights.map((insight, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                  <p className="text-slate-600 text-sm leading-relaxed">💡 {insight.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* History section */}
        <div className="border-t pt-6">
          <button onClick={() => setShowHistory(prev => !prev)} className="flex items-center gap-2 text-indigo-600 font-bold touch-manipulation">
            <FaHistory /> {showHistory ? 'Hide' : 'Show'} history for {currentMonth}
            {showHistory ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          {showHistory && (
            <div className="mt-4 space-y-3">
              {historyLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-100 p-4 animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-24" /><div className="h-5 bg-slate-200 rounded w-3/4 mt-2" />
                  </div>
                ))
              ) : historyTasks.length === 0 ? (
                <div className="text-center py-6 text-slate-400">No tasks found for this month.</div>
              ) : (
                <>
                  {historyTasks.map(task => <HistoryItem key={task._id} task={task} />)}
                  {historyTotalPages > 1 && (
                    <div className="flex justify-center gap-3 mt-4">
                      <button onClick={() => fetchHistory(historyPage - 1)} disabled={historyPage === 1} className="px-4 py-2 bg-slate-100 rounded-xl disabled:opacity-40 active:scale-95 touch-manipulation">Previous</button>
                      <span className="text-sm text-slate-600 self-center">Page {historyPage} of {historyTotalPages}</span>
                      <button onClick={() => fetchHistory(historyPage + 1)} disabled={historyPage === historyTotalPages} className="px-4 py-2 bg-slate-100 rounded-xl disabled:opacity-40 active:scale-95 touch-manipulation">Next</button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Gentle encouragement */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-5 text-center">
          <p className="text-indigo-800 font-medium">💖 Showing up matters. Each completed task is a step forward, no matter how small.</p>
        </div>

        {/* Mood Modal */}
        {moodModal.open && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setMoodModal({ open: false, taskId: null })}>
            <div className="bg-white rounded-3xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-4">How are you feeling?</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Before the task</label>
                  <div className="flex gap-2 flex-wrap">
                    {[1,2,3,4,5].map(v => (
                      <button key={v} onClick={() => setMoodBefore(v)} className={`px-3 py-1 rounded-full ${moodBefore === v ? 'bg-indigo-600 text-white' : 'bg-slate-100'} touch-manipulation`}>{v}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">After the task</label>
                  <div className="flex gap-2 flex-wrap">
                    {[1,2,3,4,5].map(v => (
                      <button key={v} onClick={() => setMoodAfter(v)} className={`px-3 py-1 rounded-full ${moodAfter === v ? 'bg-indigo-600 text-white' : 'bg-slate-100'} touch-manipulation`}>{v}</button>
                    ))}
                  </div>
                </div>
                <textarea placeholder="Any notes? (optional)" value={taskNote} onChange={e => setTaskNote(e.target.value)} rows="2" className="w-full border rounded-xl p-2 focus:ring-2 focus:ring-indigo-200 outline-none resize-none touch-manipulation" />
                <div className="flex gap-3">
                  <button onClick={completeWithMood} disabled={completingId !== null} className="bg-emerald-600 text-white px-5 py-2 rounded-xl active:scale-95 disabled:opacity-50">Complete</button>
                  <button onClick={() => setMoodModal({ open: false, taskId: null })} className="border border-slate-200 px-5 py-2 rounded-xl active:scale-95">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
});

BehavioralActivation.displayName = 'BehavioralActivation';
export default BehavioralActivation;