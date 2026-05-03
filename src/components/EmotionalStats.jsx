import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import api from '../services/api';

const EmotionalStats = () => {
  const [stats, setStats] = useState(null);
  const [allActivities, setAllActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [emotionIntensityTrend, setEmotionIntensityTrend] = useState([]);
  const [availableEmotions, setAvailableEmotions] = useState([]);
  const [avgIntensityByPeriod, setAvgIntensityByPeriod] = useState([]);

  useEffect(() => {
    fetchStatsAndActivities();
  }, []);

  useEffect(() => {
    if (selectedEmotion && allActivities.length) {
      computeEmotionTrend(selectedEmotion);
    }
  }, [selectedEmotion, allActivities]);

  const fetchStatsAndActivities = async () => {
    try {
      const [statsRes, activitiesRes] = await Promise.all([
        api.get('/emotional/stats'),
        api.get('/emotional')
      ]);
      setStats(statsRes.data);
      setAllActivities(activitiesRes.data);

      // Extract unique emotions from all activities
      const emotions = [...new Set(activitiesRes.data.map(a => a.emotion))].sort();
      setAvailableEmotions(emotions);
      if (emotions.length > 0) setSelectedEmotion(emotions[0]);

      // Compute average intensity per emotion for each time period
      computeIntensityByPeriod(activitiesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const computeIntensityByPeriod = (activities) => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    // Helper to get average intensity for a given date filter
    const getAvgIntensityForPeriod = (emotion, startDate) => {
      const filtered = activities.filter(a => 
        a.emotion === emotion && new Date(a.date) >= startDate
      );
      if (filtered.length === 0) return 0;
      const sum = filtered.reduce((acc, a) => acc + a.intensity, 0);
      return Number((sum / filtered.length).toFixed(1));
    };

    // Get unique emotions
    const uniqueEmotions = [...new Set(activities.map(a => a.emotion))];

    // Build data for each emotion
    const chartData = uniqueEmotions.map(emotion => ({
      emotion,
      last1Day: getAvgIntensityForPeriod(emotion, oneDayAgo),
      last30Days: getAvgIntensityForPeriod(emotion, thirtyDaysAgo),
      last1Year: getAvgIntensityForPeriod(emotion, oneYearAgo),
      lifetime: getAvgIntensityForPeriod(emotion, new Date(0)) // all-time
    })).sort((a, b) => b.lifetime - a.lifetime); // sort by lifetime intensity

    setAvgIntensityByPeriod(chartData);
  };

  const computeEmotionTrend = (emotion) => {
    const filtered = allActivities.filter(a => a.emotion === emotion);
    if (filtered.length === 0) {
      setEmotionIntensityTrend([]);
      return;
    }

    const dailyData = {};
    filtered.forEach(act => {
      const date = new Date(act.date).toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { totalIntensity: 0, count: 0 };
      }
      dailyData[date].totalIntensity += act.intensity;
      dailyData[date].count += 1;
    });

    const trendData = Object.entries(dailyData).map(([date, data]) => ({
      date,
      avgIntensity: Number((data.totalIntensity / data.count).toFixed(1))
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    setEmotionIntensityTrend(trendData.slice(-30));
  };

  const getOverallAvgIntensity = () => {
    if (!selectedEmotion || !allActivities.length) return 0;
    const filtered = allActivities.filter(a => a.emotion === selectedEmotion);
    if (filtered.length === 0) return 0;
    const sum = filtered.reduce((acc, a) => acc + a.intensity, 0);
    return (sum / filtered.length).toFixed(1);
  };

  if (loading) return <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  const recentEmotionData = stats ? Object.entries(stats.recent.emotionCounts).map(([name, count]) => ({ name, count })) : [];
  const allTimeEmotionData = stats ? Object.entries(stats.allTime.emotionCounts).map(([name, count]) => ({ name, count })) : [];
  const dailyTrendData = stats ? Object.entries(stats.dailyTrend).map(([date, data]) => ({
    date,
    avgIntensity: parseFloat(data.avgIntensity),
    count: data.count
  })).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-30) : [];

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last 30 Days</p>
            <p className="text-3xl font-black text-indigo-600 mt-2">{stats.recent.total}</p>
            <p className="text-sm text-slate-500 mt-1">check-ins</p>
          </div>
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">All Time</p>
            <p className="text-3xl font-black text-indigo-600 mt-2">{stats.allTime.total}</p>
            <p className="text-sm text-slate-500 mt-1">check-ins</p>
          </div>
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Intensity</p>
            <p className="text-3xl font-black text-indigo-600 mt-2">{stats.recent.avgIntensity}</p>
            <p className="text-sm text-slate-500 mt-1">/10 (last 30 days)</p>
          </div>
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Most Frequent</p>
            <p className="text-2xl font-black text-indigo-600 mt-2 capitalize">{stats.recent.mostFrequent || '—'}</p>
            <p className="text-sm text-slate-500 mt-1">in last 30 days</p>
          </div>
        </div>
      )}

      {/* NEW: Average Intensity by Emotion (Grouped Bar: 1 Day, 30 Days, 1 Year, Lifetime) */}
      {avgIntensityByPeriod.length > 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">🎯 Average Intensity by Emotion (1 Day, 30 Days, 1 Year, Lifetime)</h3>
          <p className="text-sm text-slate-500 mb-4">How intense each emotion feels on average across different time periods (scale 1-10).</p>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={avgIntensityByPeriod} margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="emotion" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} label={{ value: 'Intensity (1–10)', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
              <Tooltip contentStyle={{ fontSize: 12 }} formatter={(value, name) => {
                const periodName = {
                  last1Day: 'Last 1 Day',
                  last30Days: 'Last 30 Days',
                  last1Year: 'Last 1 Year',
                  lifetime: 'Lifetime'
                }[name];
                return [`${value} / 10`, periodName];
              }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="last1Day" fill="#3b82f6" name="Last 1 Day" radius={[4, 4, 0, 0]} />
              <Bar dataKey="last30Days" fill="#10b981" name="Last 30 Days" radius={[4, 4, 0, 0]} />
              <Bar dataKey="last1Year" fill="#f59e0b" name="Last 1 Year" radius={[4, 4, 0, 0]} />
              <Bar dataKey="lifetime" fill="#ef4444" name="Lifetime" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-400 mt-3 text-center">Each bar group shows how your intensity for that emotion changes over time.</p>
        </div>
      )}

      

      {/* Specific Emotion Intensity Trend – Line + Bar per selected emotion */}
      {availableEmotions.length > 0 && (
        <div className="space-y-8">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h3 className="text-lg font-bold text-slate-800">🎯 Specific Emotion Intensity Trend (over time)</h3>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-slate-600">Select emotion:</label>
                <select
                  value={selectedEmotion}
                  onChange={(e) => setSelectedEmotion(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-200 outline-none"
                >
                  {availableEmotions.map(emotion => (
                    <option key={emotion} value={emotion}>{emotion}</option>
                  ))}
                </select>
              </div>
            </div>

            {selectedEmotion && (
              <div className="mb-4 p-4 bg-indigo-50 rounded-xl inline-block">
                <span className="text-sm text-indigo-700 font-medium">Average intensity for </span>
                <span className="text-lg font-black text-indigo-800 capitalize">{selectedEmotion}</span>
                <span className="text-sm text-indigo-700 font-medium"> : </span>
                <span className="text-2xl font-black text-indigo-600">{getOverallAvgIntensity()}</span>
                <span className="text-sm text-indigo-700"> / 10</span>
              </div>
            )}

            <h4 className="text-md font-semibold text-slate-700 mb-3">Line Chart (Intensity over time)</h4>
            {emotionIntensityTrend.length === 0 ? (
              <p className="text-slate-400 text-center py-6">No intensity data for {selectedEmotion}.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={emotionIntensityTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 10 }} />
                  <YAxis domain={[1, 10]} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => [`${value} / 10`, 'Avg Intensity']} contentStyle={{ fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="avgIntensity" stroke="#f97316" strokeWidth={2} dot={{ r: 4, fill: '#f97316' }} name={`${selectedEmotion} intensity`} />
                </LineChart>
              </ResponsiveContainer>
            )}

            <h4 className="text-md font-semibold text-slate-700 mt-8 mb-3">Bar Chart (Intensity per day)</h4>
            {emotionIntensityTrend.length === 0 ? (
              <p className="text-slate-400 text-center py-6">No intensity data for {selectedEmotion}.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={emotionIntensityTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 10 }} />
                  <YAxis domain={[1, 10]} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => [`${value} / 10`, 'Avg Intensity']} contentStyle={{ fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="avgIntensity" fill="#3b82f6" name={`${selectedEmotion} intensity`} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
            <p className="text-xs text-slate-400 mt-4 text-center">Both charts show average intensity per day for the selected emotion (last 30 days).</p>
          </div>
        </div>
      )}

      {/* Charts Row 1: Emotion Frequency (Last 30 days & All time) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Emotion Frequency */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">📊 Emotions (Last 30 days)</h3>
          {recentEmotionData.length === 0 ? (
            <p className="text-slate-400 text-center py-10">No data in the last 30 days.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={recentEmotionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* All-Time Emotion Frequency */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">📊 Emotions (All time)</h3>
          {allTimeEmotionData.length === 0 ? (
            <p className="text-slate-400 text-center py-10">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={allTimeEmotionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      {/* Row 2: Overall Average Intensity Trend (All emotions combined) */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">📈 Average Intensity Trend (Last 30 days – All emotions)</h3>
        {dailyTrendData.length === 0 ? (
          <p className="text-slate-400 text-center py-10">No data.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 10 }} />
              <YAxis domain={[1, 10]} tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="avgIntensity" stroke="#8884d8" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  );
};

export default EmotionalStats;