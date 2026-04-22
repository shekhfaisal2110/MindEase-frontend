import React, { useState, useEffect } from 'react';
import api from '../services/api';
import PageLayout from '../components/PageLayout';
import TaskCard from '../components/TaskCard';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', dueDate: '' });
  const [loading, setLoading] = useState(true);
  const [mood, setMood] = useState('');
  const [todayRoutine, setTodayRoutine] = useState(null);

  // ✅ Global storage: page view recorded once per day via backend
  useEffect(() => {
    const recordPageView = async () => {
      try {
        const res = await api.post('/daily-activity/page-view', { pageName: 'dashboard' });
        if (!res.data.alreadyRecorded) {
          await api.post('/activity/add', { actionType: 'pageView', points: 1 });
        }
      } catch (err) { console.error(err); }
    };
    recordPageView();
    fetchTasks();
    fetchTodayRoutine();
  }, []);

  const fetchTasks = async () => { 
    try { const res = await api.get('/tasks'); setTasks(res.data); } 
    catch(err) { console.error(err); } 
    finally { setLoading(false); } 
  };

  const fetchTodayRoutine = async () => { 
    try { const res = await api.get(`/routine/${new Date().toISOString().split('T')[0]}`); setTodayRoutine(res.data); } 
    catch(err) { console.error(err); } 
  };

  const createTask = async (e) => { 
    e.preventDefault(); 
    if(!newTask.title.trim()) return; 
    try { 
      const res = await api.post('/tasks', newTask); 
      setTasks([res.data, ...tasks]); 
      setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' }); 
    } catch(err) { console.error(err); } 
  };

  // ✅ Global storage: task completion points awarded only once per day per task
  const updateTaskStatus = async (id, completed) => {
    const task = tasks.find(t => t._id === id);
    if (!task) return;
    const wasCompleted = task.completed;
    if (!wasCompleted && completed) {
      try {
        const checkRes = await api.post('/daily-activity/task-completion', { taskId: id });
        if (!checkRes.data.alreadyRecorded) {
          await api.post('/activity/add', { actionType: 'dailyTask', points: 3 });
        }
      } catch (err) { console.error(err); }
    }
    try {
      const res = await api.put(`/tasks/${id}`, { completed });
      setTasks(tasks.map(t => t._id === id ? res.data : t));
    } catch(err) { console.error(err); }
  };

  const deleteTask = async (id) => { 
    if(!window.confirm('Delete?')) return; 
    try { await api.delete(`/tasks/${id}`); setTasks(tasks.filter(t => t._id !== id)); } 
    catch(err) { console.error(err); } 
  };

  // ✅ Global storage: routine item completion points awarded only once per day per item
  const updateRoutineItem = async (idx, completed) => {
    const updated = [...todayRoutine.items];
    const wasCompleted = updated[idx].completed;
    updated[idx].completed = completed;
    if (!wasCompleted && completed) {
      try {
        const checkRes = await api.post('/daily-activity/routine-item', { itemName: updated[idx].name });
        if (!checkRes.data.alreadyRecorded) {
          await api.post('/activity/add', { actionType: 'dailyTask', points: 3 });
        }
      } catch (err) { console.error(err); }
    }
    try {
      const res = await api.put(`/routine/${new Date().toISOString().split('T')[0]}`, { items: updated, mood: todayRoutine.mood, notes: todayRoutine.notes });
      setTodayRoutine(res.data);
    } catch(err) { console.error(err); }
  };

  const updateMood = async () => { 
    if(!mood) return; 
    try { 
      const res = await api.put(`/routine/${new Date().toISOString().split('T')[0]}`, { items: todayRoutine.items, mood: parseInt(mood), notes: todayRoutine.notes }); 
      setTodayRoutine(res.data); 
      setMood(''); 
    } catch(err) { console.error(err); } 
  };

  const completedTasks = tasks.filter(t => t.completed).length;
  const progress = tasks.length === 0 ? 0 : (completedTasks/tasks.length)*100;
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const displayName = user?.username || 'User';

  return (
    <PageLayout 
      title={`${getGreeting()}, ${displayName}`} 
      subtitle="Here is what your day looks like."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Mood Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <span className="mr-2">🌙</span> Today's Mood
            </h2>
            <div className="flex space-x-2">
              <select value={mood} onChange={e=>setMood(e.target.value)} className="flex-1 bg-slate-50 border-none rounded-2xl p-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none">
                <option value="">Rate (1-10)</option>
                {[1,2,3,4,5,6,7,8,9,10].map(n=><option key={n} value={n}>{n}</option>)}
              </select>
              <button onClick={updateMood} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-2xl transition-all active:scale-95 text-sm">Save</button>
            </div>
            {todayRoutine?.mood && <div className="mt-4 flex items-center justify-between bg-indigo-50 p-3 rounded-xl"><span className="text-xs font-bold text-indigo-600 uppercase">Current Feeling</span><span className="text-lg font-black text-indigo-700">{todayRoutine.mood}/10</span></div>}
          </div>

          {/* Self-Care Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center"><span className="mr-2">✨</span> Rituals</h2>
              <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md">{todayRoutine?.items.filter(i=>i.completed).length || 0}/{todayRoutine?.items.length || 0}</span>
            </div>
            <div className="space-y-1">
              {todayRoutine?.items.map((item,idx)=>(
                <label key={idx} className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" checked={item.completed} onChange={e=>updateRoutineItem(idx, e.target.checked)} className="peer sr-only" />
                    <div className="w-5 h-5 border-2 border-slate-200 rounded-md peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-all flex items-center justify-center">
                      <svg className={`w-3 h-3 text-white ${item.completed ? 'scale-100' : 'scale-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${item.completed ? 'line-through text-slate-300': 'text-slate-600'}`}>{item.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Progress Overview */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <div className="flex justify-between items-end mb-4"><div><h2 className="text-lg font-bold text-slate-800">Task Momentum</h2><p className="text-xs text-slate-400 font-medium">{completedTasks} of {tasks.length} objectives reached</p></div><span className="text-2xl font-black text-indigo-600">{Math.round(progress)}%</span></div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden"><div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-1000 ease-out" style={{width:`${progress}%`}} /></div>
          </div>

          {/* New Task Form */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Focus on Something New</h2>
            <form onSubmit={createTask} className="space-y-4">
              <input type="text" placeholder="What's on your mind?" value={newTask.title} onChange={e=>setNewTask({...newTask, title:e.target.value})} required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-100 outline-none" />
              <textarea placeholder="Details (optional)" rows="2" value={newTask.description} onChange={e=>setNewTask({...newTask, description:e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-100 outline-none" />
              <div className="flex flex-col sm:flex-row gap-4">
                <select value={newTask.priority} onChange={e=>setNewTask({...newTask, priority:e.target.value})} className="flex-1 bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-100 outline-none font-medium"><option value="low">Low Priority</option><option value="medium">Medium Priority</option><option value="high">High Priority</option></select>
                <input type="date" value={newTask.dueDate} onChange={e=>setNewTask({...newTask, dueDate:e.target.value})} className="flex-1 bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-100 outline-none font-medium text-slate-500" />
                <button type="submit" className="bg-slate-900 hover:bg-indigo-600 text-white font-bold px-8 py-4 rounded-2xl transition-all active:scale-95 shadow-lg shadow-slate-200">Add Task</button>
              </div>
            </form>
          </div>

          {/* Task List */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 px-1">Your Focus List</h3>
            {loading ? <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div> : tasks.length === 0 ? <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200"><p className="text-slate-400 font-medium italic">No tasks yet. Take it slow.</p></div> : <div className="grid grid-cols-1 gap-4">{tasks.map(task => <TaskCard key={task._id} task={task} onToggleComplete={updateTaskStatus} onDelete={deleteTask} />)}</div>}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;