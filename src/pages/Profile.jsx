import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PageLayout from '../components/PageLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F', '#FFBB28', '#FF8042', '#a4de6c', '#d0ed57', '#8dd1e1'];

const Profile = () => {
  const { user, login, logout } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [breakdownData, setBreakdownData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [activeDays, setActiveDays] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Username editing
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  
  // Weekly Goal
  const [weeklyGoal, setWeeklyGoal] = useState(500);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState(500);
  
  // Leaderboard visibility (default hidden until server responds)
  const [hideFromLeaderboard, setHideFromLeaderboard] = useState(true);
  const [loadingVisibility, setLoadingVisibility] = useState(false);
  
  // Password change modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordStep, setPasswordStep] = useState('request');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Quote carousel
  const [quoteIndex, setQuoteIndex] = useState(0);
  const motivationalQuotes = [
    "🌟 Every small step counts. You're doing great!",
    "🌱 Progress, not perfection.",
    "💪 You are stronger than you think.",
    "🧘 Breathe. You've got this.",
    "🌸 Your journey is unique and beautiful.",
    "🔥 Keep going. You're making a difference.",
    "🌈 This too shall pass. Brighter days ahead.",
    "💖 You deserve peace and happiness.",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchAllData();
    loadWeeklyGoal();
    fetchActiveDays();
    fetchVisibility();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [progressRes, breakdownRes, recentRes] = await Promise.all([
        api.get('/user/progress'),
        api.get('/user/activity-breakdown'),
        api.get('/user/recent-activities')
      ]);
      setProfileData(progressRes.data);
      const breakdown = breakdownRes.data;
      const pieChartData = Object.entries(breakdown)
        .filter(([key, value]) => key !== '_id' && value > 0)
        .map(([name, value]) => ({ name: name.replace(/([A-Z])/g, ' $1').trim(), value }));
      setBreakdownData(pieChartData);
      setRecentActivities(recentRes.data);
      setNewUsername(progressRes.data.user.username);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveDays = async () => {
    try {
      const res = await api.get('/user/active-days');
      setActiveDays(res.data.activeDays);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchVisibility = async () => {
    try {
      const res = await api.get('/user/leaderboard-visibility');
      setHideFromLeaderboard(res.data.hideFromLeaderboard);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleLeaderboardVisibility = async () => {
    setLoadingVisibility(true);
    try {
      const newValue = !hideFromLeaderboard;
      await api.put('/user/leaderboard-visibility', { hide: newValue });
      setHideFromLeaderboard(newValue);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingVisibility(false);
    }
  };

  const loadWeeklyGoal = () => {
    const saved = localStorage.getItem('weeklyGoal');
    if (saved) setWeeklyGoal(parseInt(saved));
  };

  const saveWeeklyGoal = () => {
    if (newGoal < 10) {
      alert('Goal must be at least 10 points');
      return;
    }
    setWeeklyGoal(newGoal);
    localStorage.setItem('weeklyGoal', newGoal);
    setShowGoalModal(false);
  };

  const currentWeekPoints = profileData?.last7Days?.reduce((sum, day) => sum + day.points, 0) || 0;
  const goalProgress = Math.min(100, (currentWeekPoints / weeklyGoal) * 100);
  const totalActivities = profileData ? (profileData.metrics.gratitudeEntries + profileData.metrics.affirmations + profileData.metrics.therapyExercises + profileData.metrics.lettersToSelf) : 0;

  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    if (!newUsername.trim() || newUsername.trim().length < 3) {
      setUpdateError('Username must be at least 3 characters');
      return;
    }
    setUpdateError('');
    setUpdateSuccess('');
    try {
      const res = await api.put('/user/username', { username: newUsername.trim() });
      const updatedUser = { ...user, username: res.data.user.username };
      login(localStorage.getItem('token'), updatedUser);
      setProfileData(prev => ({ ...prev, user: { ...prev.user, username: res.data.user.username } }));
      setUpdateSuccess('Username updated successfully!');
      setEditingUsername(false);
    } catch (err) {
      setUpdateError(err.response?.data?.message || 'Failed to update username');
    }
  };

  // Password OTP flow
  const requestOTP = async () => {
    setPasswordLoading(true);
    setPasswordError('');
    try {
      await api.post('/user/request-password-change-otp');
      setPasswordStep('verify');
      setPasswordSuccess('OTP sent to your email');
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setPasswordLoading(false);
    }
  };

  const verifyOTP = async (otp) => {
    setPasswordLoading(true);
    setPasswordError('');
    try {
      await api.post('/user/verify-password-change-otp', { otp });
      setPasswordStep('new');
      setPasswordSuccess('OTP verified. Now set your new password.');
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setPasswordLoading(false);
    }
  };

  const changePassword = async (newPassword, confirm) => {
    if (newPassword !== confirm) {
      setPasswordError('Passwords do not match');
      return false;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordLoading(true);
    setPasswordError('');
    try {
      await api.post('/user/change-password-with-otp', { newPassword });
      setPasswordSuccess('Password changed successfully!');
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordStep('request');
        setPasswordSuccess('');
      }, 2000);
      return true;
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
      return false;
    } finally {
      setPasswordLoading(false);
    }
  };

  // Print summary
  const printSummary = () => {
    if (!profileData) return;
    const { user: userInfo, totalPoints, streak, metrics, last7Days } = profileData;
    const memberSince = new Date(userInfo.memberSince).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>MindEase - My Journey Summary</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 2rem; max-width: 800px; margin: 0 auto; }
          h1 { color: #4f46e5; }
          h2 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 0.25rem; }
          .stats { display: grid; grid-template-columns: repeat(2,1fr); gap: 1rem; margin: 1rem 0; }
          .card { background: #f3f4f6; padding: 1rem; border-radius: 1rem; text-align: center; }
          .value { font-size: 2rem; font-weight: bold; color: #4f46e5; }
          .label { color: #666; margin-top: 0.25rem; }
          table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
          th, td { padding: 0.5rem; text-align: left; border-bottom: 1px solid #ddd; }
          .footer { margin-top: 2rem; text-align: center; color: #888; font-size: 0.875rem; }
        </style>
      </head>
      <body>
        <h1>MindEase Journey Summary</h1>
        <p><strong>${userInfo.username}</strong> · Member since ${memberSince}</p>
        
        <div class="stats">
          <div class="card"><div class="value">${totalPoints}</div><div class="label">Total Points</div></div>
          <div class="card"><div class="value">${streak}</div><div class="label">Day Streak</div></div>
          <div class="card"><div class="value">${metrics.gratitudeEntries + metrics.affirmations + metrics.therapyExercises + metrics.lettersToSelf}</div><div class="label">Total Activities</div></div>
          <div class="card"><div class="value">${activeDays}</div><div class="label">Active Days</div></div>
        </div>

        <h2>Last 7 Days Points</h2>
        <table>
          <thead><tr><th>Day</th><th>Points</th></tr></thead>
          <tbody>
            ${last7Days.map(day => `<tr><td>${day.date}</td><td>${day.points}<tr></tr>`).join('')}
          </tbody>
        </table>

        <h2>Activity Breakdown</h2>
        <table>
          <thead><tr><th>Activity</th><th>Points</th></tr></thead>
          <tbody>
            ${breakdownData.map(item => `<tr><td>${item.name}</td><td>${item.value}</td></tr>`).join('')}
          </tbody>
        </table>

        <div class="footer">Generated by MindEase on ${new Date().toLocaleString()}</div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.onafterprint = () => printWindow.close();
  };

  if (loading) return <LoadingSpinner />;
  if (!profileData) return <div className="min-h-screen flex items-center justify-center">No data</div>;

  const { user: userInfo, totalPoints, streak, metrics, last7Days } = profileData;
  const memberSince = new Date(userInfo.memberSince).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <PageLayout title="My Journey" subtitle="Track your progress and manage your account.">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Quote Carousel */}
        <div className="print:hidden bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-6 text-center border border-indigo-100 transition-all duration-500">
          <p className="text-slate-700 text-lg md:text-xl italic">“{motivationalQuotes[quoteIndex]}”</p>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-indigo-600 text-3xl font-bold shadow-lg">
                {userInfo.username.charAt(0).toUpperCase()}
              </div>
              <div className="text-white text-center sm:text-left">
                {!editingUsername ? (
                  <>
                    <h2 className="text-2xl md:text-3xl font-bold">{userInfo.username}</h2>
                    <p className="text-indigo-100">{userInfo.email}</p>
                    <button onClick={() => setEditingUsername(true)} className="mt-2 text-sm text-indigo-200 hover:text-white underline transition print:hidden">Edit username</button>
                  </>
                ) : (
                  <form onSubmit={handleUpdateUsername} className="space-y-2 w-full sm:w-80">
                    <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} className="w-full bg-white rounded-xl px-4 py-2 text-slate-800 focus:ring-2 focus:ring-white outline-none" required minLength="3" />
                    {updateError && <p className="text-rose-200 text-sm">{updateError}</p>}
                    {updateSuccess && <p className="text-emerald-200 text-sm">{updateSuccess}</p>}
                    <div className="flex gap-2">
                      <button type="submit" className="bg-white text-indigo-600 px-3 py-1 rounded-lg text-sm font-bold">Save</button>
                      <button type="button" onClick={() => setEditingUsername(false)} className="bg-indigo-400 text-white px-3 py-1 rounded-lg text-sm">Cancel</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><p className="text-slate-500 text-sm">Member since</p><p className="font-semibold text-slate-800">{memberSince}</p></div>
            <div><p className="text-slate-500 text-sm">Email</p><p className="font-semibold text-slate-800">{userInfo.email}</p></div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl p-6 text-white"><div className="text-4xl mb-2">🏆</div><p className="text-3xl font-black">{totalPoints}</p><p className="text-sm opacity-90">Total Points</p></div>
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl p-6 text-white"><div className="text-4xl mb-2">🔥</div><p className="text-3xl font-black">{streak}</p><p className="text-sm opacity-90">Day Streak</p></div>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-6 text-white"><div className="text-4xl mb-2">📝</div><p className="text-3xl font-black">{totalActivities}</p><p className="text-sm opacity-90">Total Activities</p></div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-6 text-white"><div className="text-4xl mb-2">📅</div><p className="text-3xl font-black">{activeDays}</p><p className="text-sm opacity-90">Active Days</p></div>
        </div>

        {/* Weekly Goal Card */}
        <div className="bg-white rounded-3xl shadow-md border border-slate-100 p-6">
          <div className="flex justify-between items-center flex-wrap gap-2 mb-4">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><span>🎯</span> Weekly Points Goal</h3>
            <button onClick={() => { setNewGoal(weeklyGoal); setShowGoalModal(true); }} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium print:hidden">Edit Goal</button>
          </div>
          <p className="text-3xl font-black text-indigo-600">{currentWeekPoints} / {weeklyGoal}</p>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-700" style={{ width: `${goalProgress}%` }} />
          </div>
          {goalProgress >= 100 && <div className="mt-3 text-emerald-600 font-bold text-sm">🏆 Goal achieved this week! Great job!</div>}
        </div>

        {/* Leaderboard Visibility Toggle */}
        <div className="bg-white rounded-3xl shadow-md border border-slate-100 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Leaderboard Visibility</h3>
              <p className="text-sm text-slate-500 max-w-md">
                When hidden, your name and points won't appear on the global leaderboard.
              </p>
            </div>
            <button
              onClick={toggleLeaderboardVisibility}
              disabled={loadingVisibility}
              className={`px-5 py-2 rounded-xl font-bold transition ${
                hideFromLeaderboard
                  ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                  : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              }`}
            >
              {loadingVisibility ? 'Saving...' : (hideFromLeaderboard ? '🔒 Hidden from leaderboard' : '🌍 Visible on leaderboard')}
            </button>
          </div>
        </div>

        {/* Link to Badges Page */}
        <div className="bg-white rounded-3xl shadow-md border border-slate-100 p-6 text-center">
          <h3 className="text-xl font-bold text-slate-800 mb-2">🏆 Your Achievements</h3>
          <p className="text-slate-500 mb-4">You've earned badges for consistency, points, and activities.</p>
          <button onClick={() => window.location.href = '/badges'} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-md">View All Badges</button>
        </div>

        {/* Points Trend Chart */}
        <div className="bg-white rounded-3xl shadow-md border border-slate-100 p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4">📈 Points Trend (Last 7 Days)</h3>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last7Days}><XAxis dataKey="date" /><YAxis /><Tooltip /><Legend /><Line type="monotone" dataKey="points" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} /></LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Breakdown Pie Chart */}
        {breakdownData.length > 0 && (
          <div className="bg-white rounded-3xl shadow-md border border-slate-100 p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">🥧 Activity Breakdown</h3>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={breakdownData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>{breakdownData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Recent Activities */}
        <div className="bg-white rounded-3xl shadow-md border border-slate-100 p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4">🕒 Recent Activities</h3>
          {recentActivities.length === 0 ? <p className="text-slate-400 text-center py-8">No recent activities yet.</p> : (
            <div className="space-y-3">{recentActivities.map((act, idx) => (<div key={act._id || idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"><div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">{act.type === 'Daily points' ? '📊' : '⭐'}</div><div className="flex-1"><p className="font-medium text-slate-800">{act.description}</p><p className="text-xs text-slate-400">{new Date(act.date).toLocaleString()}</p></div><span className="text-sm font-bold text-indigo-600">+{act.points}</span></div>))}</div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="max-w-6xl mx-auto mt-8 flex flex-col sm:flex-row gap-4 print:hidden">
        <button onClick={() => setShowPasswordModal(true)} className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-2xl">Change Password</button>
        <button onClick={printSummary} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl">Print Summary</button>
        <button onClick={logout} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 rounded-2xl">Logout</button>
      </div>

      <div className="max-w-6xl mx-auto mt-8 mb-8 bg-slate-50 rounded-3xl p-6 text-center text-slate-600 text-sm print:hidden">
        <p>Every action you take is a step toward healing. Keep going — you’re not alone.</p>
      </div>

      {/* Modals */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowGoalModal(false)}>
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-slate-800 mb-4">Set Weekly Points Goal</h3>
            <input type="number" value={newGoal} onChange={e => setNewGoal(parseInt(e.target.value) || 0)} className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none" min="10" />
            <div className="flex gap-3 mt-6"><button onClick={saveWeeklyGoal} className="flex-1 bg-indigo-600 text-white py-2 rounded-xl font-bold">Save</button><button onClick={() => setShowGoalModal(false)} className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-xl font-bold">Cancel</button></div>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowPasswordModal(false)}>
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-slate-800 mb-4">Change Password</h3>
            {passwordStep === 'request' && ( <div className="space-y-4"><p className="text-slate-600 text-sm">OTP sent to <strong>{user?.email}</strong></p><button onClick={requestOTP} disabled={passwordLoading} className="w-full bg-indigo-600 text-white py-2 rounded-xl font-bold">Send OTP</button>{passwordError && <p className="text-rose-600 text-sm">{passwordError}</p>}</div>)}
            {passwordStep === 'verify' && ( <form onSubmit={(e) => { e.preventDefault(); verifyOTP(e.target.otp.value); }} className="space-y-4"><input name="otp" type="text" maxLength="6" placeholder="6-digit OTP" className="w-full bg-slate-50 rounded-xl p-3 text-sm text-center" required />{passwordError && <p className="text-rose-600 text-sm">{passwordError}</p>}{passwordSuccess && <p className="text-emerald-600 text-sm">{passwordSuccess}</p>}<div className="flex gap-3"><button type="submit" disabled={passwordLoading} className="flex-1 bg-indigo-600 text-white py-2 rounded-xl font-bold">Verify</button><button type="button" onClick={() => setPasswordStep('request')} className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-xl font-bold">Back</button></div></form>)}
            {passwordStep === 'new' && ( <form onSubmit={(e) => { e.preventDefault(); changePassword(e.target.newPassword.value, e.target.confirmPassword.value); }} className="space-y-4"><input name="newPassword" type="password" placeholder="New password" className="w-full bg-slate-50 rounded-xl p-3 text-sm" required /><input name="confirmPassword" type="password" placeholder="Confirm new password" className="w-full bg-slate-50 rounded-xl p-3 text-sm" required />{passwordError && <p className="text-rose-600 text-sm">{passwordError}</p>}{passwordSuccess && <p className="text-emerald-600 text-sm">{passwordSuccess}</p>}<div className="flex gap-3"><button type="submit" disabled={passwordLoading} className="flex-1 bg-indigo-600 text-white py-2 rounded-xl font-bold">Change Password</button><button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-xl font-bold">Cancel</button></div></form>)}
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default Profile;