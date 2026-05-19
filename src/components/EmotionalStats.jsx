import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import api from '../services/api';

// Lazy load Recharts to reduce initial bundle size
const ResponsiveContainer = lazy(() => import('recharts').then(mod => ({ default: mod.ResponsiveContainer })));
const BarChart = lazy(() => import('recharts').then(mod => ({ default: mod.BarChart })));
const Bar = lazy(() => import('recharts').then(mod => ({ default: mod.Bar })));
const LineChart = lazy(() => import('recharts').then(mod => ({ default: mod.LineChart })));
const Line = lazy(() => import('recharts').then(mod => ({ default: mod.Line })));
const XAxis = lazy(() => import('recharts').then(mod => ({ default: mod.XAxis })));
const YAxis = lazy(() => import('recharts').then(mod => ({ default: mod.YAxis })));
const CartesianGrid = lazy(() => import('recharts').then(mod => ({ default: mod.CartesianGrid })));
const Tooltip = lazy(() => import('recharts').then(mod => ({ default: mod.Tooltip })));
const Legend = lazy(() => import('recharts').then(mod => ({ default: mod.Legend })));

// Skeleton components for instant perceived loading
const SummaryCardSkeleton = () => (
  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 text-center animate-pulse">
    <div className="h-4 bg-slate-200 rounded w-24 mx-auto mb-3"></div>
    <div className="h-8 bg-slate-200 rounded w-16 mx-auto mb-2"></div>
    <div className="h-3 bg-slate-200 rounded w-20 mx-auto"></div>
  </div>
);

const ChartSkeleton = ({ height = 300 }) => (
  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 animate-pulse">
    <div className="h-6 bg-slate-200 rounded w-40 mb-4"></div>
    <div className="bg-slate-100 rounded-xl" style={{ height }}></div>
  </div>
);

const EmotionalStats = React.memo(() => {
  const [stats, setStats] = useState(null);
  const [allActivities, setAllActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [emotionIntensityTrend, setEmotionIntensityTrend] = useState([]);
  const [availableEmotions, setAvailableEmotions] = useState([]);
  const [avgIntensityByPeriod, setAvgIntensityByPeriod] = useState([]);
  const [chartsReady, setChartsReady] = useState(false);

  // Memoized derived data
  const recentEmotionData = useMemo(() => 
    stats ? Object.entries(stats.recent.emotionCounts).map(([name, count]) => ({ name, count })) : [],
    [stats]
  );

  const allTimeEmotionData = useMemo(() => 
    stats ? Object.entries(stats.allTime.emotionCounts).map(([name, count]) => ({ name, count })) : [],
    [stats]
  );

  const dailyTrendData = useMemo(() => 
    stats ? Object.entries(stats.dailyTrend)
      .map(([date, data]) => ({ date, avgIntensity: parseFloat(data.avgIntensity), count: data.count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-30) : [],
    [stats]
  );

  const computeIntensityByPeriod = useCallback((activities) => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    const getAvgIntensityForPeriod = (emotion, startDate) => {
      const filtered = activities.filter(a => a.emotion === emotion && new Date(a.date) >= startDate);
      if (filtered.length === 0) return 0;
      const sum = filtered.reduce((acc, a) => acc + a.intensity, 0);
      return Number((sum / filtered.length).toFixed(1));
    };

    const uniqueEmotions = [...new Set(activities.map(a => a.emotion))];
    const chartData = uniqueEmotions.map(emotion => ({
      emotion,
      last1Day: getAvgIntensityForPeriod(emotion, oneDayAgo),
      last30Days: getAvgIntensityForPeriod(emotion, thirtyDaysAgo),
      last1Year: getAvgIntensityForPeriod(emotion, oneYearAgo),
      lifetime: getAvgIntensityForPeriod(emotion, new Date(0))
    })).sort((a, b) => b.lifetime - a.lifetime);

    setAvgIntensityByPeriod(chartData);
  }, []);

  const computeEmotionTrend = useCallback((emotion) => {
    const filtered = allActivities.filter(a => a.emotion === emotion);
    if (filtered.length === 0) {
      setEmotionIntensityTrend([]);
      return;
    }

    const dailyData = {};
    filtered.forEach(act => {
      const date = new Date(act.date).toISOString().split('T')[0];
      if (!dailyData[date]) dailyData[date] = { totalIntensity: 0, count: 0 };
      dailyData[date].totalIntensity += act.intensity;
      dailyData[date].count += 1;
    });

    const trendData = Object.entries(dailyData)
      .map(([date, data]) => ({ date, avgIntensity: Number((data.totalIntensity / data.count).toFixed(1)) }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-30);

    setEmotionIntensityTrend(trendData);
  }, [allActivities]);

  useEffect(() => {
    const fetchStatsAndActivities = async () => {
      try {
        const [statsRes, activitiesRes] = await Promise.all([
          api.get('/emotional/stats'),
          api.get('/emotional')
        ]);
        setStats(statsRes.data);
        setAllActivities(activitiesRes.data);

        const emotions = [...new Set(activitiesRes.data.map(a => a.emotion))].sort();
        setAvailableEmotions(emotions);
        if (emotions.length > 0) setSelectedEmotion(emotions[0]);

        computeIntensityByPeriod(activitiesRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        // Allow charts to render after a short delay to avoid layout thrash
        setTimeout(() => setChartsReady(true), 100);
      }
    };
    fetchStatsAndActivities();
  }, [computeIntensityByPeriod]);

  useEffect(() => {
    if (selectedEmotion && allActivities.length) {
      computeEmotionTrend(selectedEmotion);
    }
  }, [selectedEmotion, allActivities, computeEmotionTrend]);

  const getOverallAvgIntensity = useCallback(() => {
    if (!selectedEmotion || !allActivities.length) return 0;
    const filtered = allActivities.filter(a => a.emotion === selectedEmotion);
    if (filtered.length === 0) return 0;
    const sum = filtered.reduce((acc, a) => acc + a.intensity, 0);
    return (sum / filtered.length).toFixed(1);
  }, [selectedEmotion, allActivities]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SummaryCardSkeleton key={i} />)}
        </div>
        <ChartSkeleton height={400} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton height={300} />
          <ChartSkeleton height={300} />
        </div>
        <ChartSkeleton height={300} />
      </div>
    );
  }

  // Show charts only after data is ready and Recharts is loaded
  const renderChart = (children) => (
    <Suspense fallback={<ChartSkeleton height={300} />}>
      {chartsReady && children}
    </Suspense>
  );

  return (
    <div className="space-y-6 md:space-y-8 px-2 sm:px-0">
      {/* Summary Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6 text-center">
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Last 30 Days</p>
            <p className="text-2xl sm:text-3xl font-black text-indigo-600 mt-1 sm:mt-2">{stats.recent.total}</p>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">check-ins</p>
          </div>
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6 text-center">
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">All Time</p>
            <p className="text-2xl sm:text-3xl font-black text-indigo-600 mt-1 sm:mt-2">{stats.allTime.total}</p>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">check-ins</p>
          </div>
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6 text-center">
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Intensity</p>
            <p className="text-2xl sm:text-3xl font-black text-indigo-600 mt-1 sm:mt-2">{stats.recent.avgIntensity}</p>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">/10 (30d)</p>
          </div>
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6 text-center">
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Most Frequent</p>
            <p className="text-lg sm:text-2xl font-black text-indigo-600 mt-1 sm:mt-2 capitalize truncate">{stats.recent.mostFrequent || '—'}</p>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">last 30 days</p>
          </div>
        </div>
      )}

      {/* Average Intensity by Emotion - Grouped Bar Chart */}
      {avgIntensityByPeriod.length > 0 && renderChart(
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-2">🎯 Average Intensity by Emotion</h3>
          <p className="text-xs sm:text-sm text-slate-500 mb-4">How intense each emotion feels across different time periods (1‑10)</p>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={avgIntensityByPeriod} margin={{ left: 10, right: 10, top: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="emotion" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 10 }} interval={0} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} width={30} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} verticalAlign="top" height={36} />
              <Bar dataKey="last1Day" fill="#3b82f6" name="Last 1 Day" radius={[4, 4, 0, 0]} />
              <Bar dataKey="last30Days" fill="#10b981" name="Last 30 Days" radius={[4, 4, 0, 0]} />
              <Bar dataKey="last1Year" fill="#f59e0b" name="Last 1 Year" radius={[4, 4, 0, 0]} />
              <Bar dataKey="lifetime" fill="#ef4444" name="Lifetime" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-400 mt-3 text-center">Each bar group shows intensity changes for that emotion over time.</p>
        </div>
      )}

      {/* Specific Emotion Intensity Trend */}
      {availableEmotions.length > 0 && renderChart(
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h3 className="text-base sm:text-lg font-bold text-slate-800">🎯 Specific Emotion Trend</h3>
            <div className="flex items-center gap-2">
              <label className="text-xs sm:text-sm font-medium text-slate-600">Emotion:</label>
              <select
                value={selectedEmotion}
                onChange={(e) => setSelectedEmotion(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-200 outline-none"
              >
                {availableEmotions.map(emotion => (
                  <option key={emotion} value={emotion}>{emotion}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedEmotion && (
            <div className="mb-4 p-3 bg-indigo-50 rounded-xl inline-block w-full sm:w-auto text-center sm:text-left">
              <span className="text-sm text-indigo-700">Average intensity for </span>
              <span className="text-base sm:text-lg font-black text-indigo-800 capitalize">{selectedEmotion}</span>
              <span className="text-sm text-indigo-700"> : </span>
              <span className="text-xl sm:text-2xl font-black text-indigo-600">{getOverallAvgIntensity()}</span>
              <span className="text-sm text-indigo-700"> / 10</span>
            </div>
          )}

          {emotionIntensityTrend.length === 0 ? (
            <p className="text-slate-400 text-center py-6 text-sm">No intensity data for {selectedEmotion}.</p>
          ) : (
            <>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Line Chart (Intensity over time)</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={emotionIntensityTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 9 }} interval={Math.ceil(emotionIntensityTrend.length / 10)} />
                  <YAxis domain={[1, 10]} tick={{ fontSize: 10 }} width={30} />
                  <Tooltip formatter={(value) => [`${value} / 10`, 'Avg Intensity']} contentStyle={{ fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="avgIntensity" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} name={`${selectedEmotion} intensity`} />
                </LineChart>
              </ResponsiveContainer>

              <h4 className="text-sm font-semibold text-slate-700 mt-6 mb-2">Bar Chart (Intensity per day)</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={emotionIntensityTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 9 }} interval={Math.ceil(emotionIntensityTrend.length / 10)} />
                  <YAxis domain={[1, 10]} tick={{ fontSize: 10 }} width={30} />
                  <Tooltip formatter={(value) => [`${value} / 10`, 'Avg Intensity']} contentStyle={{ fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="avgIntensity" fill="#3b82f6" name={`${selectedEmotion} intensity`} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
          <p className="text-xs text-slate-400 mt-4 text-center">Both charts show average intensity per day (last 30 days).</p>
        </div>
      )}

      {/* Emotion Frequency Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderChart(
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-4">📊 Emotions (Last 30 days)</h3>
            {recentEmotionData.length === 0 ? (
              <p className="text-slate-400 text-center py-10 text-sm">No data in the last 30 days.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={recentEmotionData} margin={{ left: 10, right: 10, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 10 }} interval={0} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={30} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {renderChart(
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-4">📊 Emotions (All time)</h3>
            {allTimeEmotionData.length === 0 ? (
              <p className="text-slate-400 text-center py-10 text-sm">No data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={allTimeEmotionData} margin={{ left: 10, right: 10, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 10 }} interval={0} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={30} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Bar dataKey="count" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </div>

      {/* Overall Average Intensity Trend */}
      {renderChart(
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-4">📈 Average Intensity Trend (Last 30 days – All emotions)</h3>
          {dailyTrendData.length === 0 ? (
            <p className="text-slate-400 text-center py-10 text-sm">No data.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 9 }} interval={Math.ceil(dailyTrendData.length / 10)} />
                <YAxis domain={[1, 10]} tick={{ fontSize: 10 }} width={30} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="avgIntensity" stroke="#8884d8" strokeWidth={2} dot={{ r: 3 }} name="Avg Intensity" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  );
});

EmotionalStats.displayName = 'EmotionalStats';
export default EmotionalStats;