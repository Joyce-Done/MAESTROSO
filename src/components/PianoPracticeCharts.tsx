import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Layers,
  Clock,
  Music,
  CheckCircle2,
  Award,
  Sparkles,
  Zap,
  Target,
  PieChart as PieIcon,
  Filter,
  Play,
  Activity,
} from 'lucide-react';
import { PianoSong, PianoPracticeLog, PianoCategory, RepertoireCategory } from '../types';

interface PianoPracticeChartsProps {
  songs: PianoSong[];
  logs: PianoPracticeLog[];
  categories?: RepertoireCategory[];
  onOpenTimer?: (songId?: string) => void;
}

// Brand-coherent color palette matching Maestroso Magenta & Plum
const DEFAULT_CATEGORY_COLORS: Record<string, { base: string; light: string; border: string; name: string }> = {
  prelude: { base: '#B63E88', light: '#DE72B5', border: '#FFBBE2', name: 'Preludes' },
  repertoire: { base: '#B63E88', light: '#DE72B5', border: '#FFBBE2', name: 'Preludes' },
  hymn: { base: '#7B4D8A', light: '#9D6EB0', border: '#C8A2DA', name: 'Hymns' },
  lords_supper: { base: '#C7A252', light: '#E5C478', border: '#FDF0CD', name: "Lord's Supper" },
  choir_song: { base: '#9B51E0', light: '#BB6BD9', border: '#E0B0FF', name: 'Choir Songs' },
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function PianoPracticeCharts({ songs, logs, categories = [], onOpenTimer }: PianoPracticeChartsProps) {
  const [selectedSubTab, setSelectedSubTab] = useState<'tempo_progress' | 'by_song' | 'daily' | 'weekly' | 'overall'>('tempo_progress');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<'7d' | '14d' | '30d' | 'all'>('30d');
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);

  // Dynamic category color and label resolution
  const categoryColorLookup = useMemo(() => {
    const lookup: Record<string, { base: string; light: string; border: string; name: string }> = {
      ...DEFAULT_CATEGORY_COLORS,
    };
    categories.forEach((cat) => {
      lookup[cat.id] = {
        base: cat.color || '#B63E88',
        light: cat.color || '#DE72B5',
        border: '#FFBBE2',
        name: cat.name,
      };
    });
    return lookup;
  }, [categories]);

  // ----------------------------------------------------
  // 0. Tempo Progress & Mastery Data (Current BPM vs Target BPM)
  // ----------------------------------------------------
  const tempoProgressChartData = useMemo(() => {
    return songs
      .filter((s) => {
        if (categoryFilter === 'all') return true;
        if (categoryFilter === 'prelude') return s.category === 'prelude' || (s.category as string) === 'repertoire';
        return s.category === categoryFilter;
      })
      .map((song) => {
        const cur = song.currentBpm || 60;
        const tgt = song.targetBpm || 80;
        const pct = Math.min(100, Math.round((cur / tgt) * 100));
        const gap = Math.max(0, tgt - cur);
        const catInfo = categoryColorLookup[song.category] || { base: '#B63E88', light: '#DE72B5', border: '#FFBBE2', name: song.category };
        return {
          id: song.id,
          title: song.title,
          shortTitle: song.title.length > 20 ? `${song.title.substring(0, 18)}…` : song.title,
          composer: song.composerOrArtist,
          category: song.category,
          categoryLabel: catInfo.name,
          status: song.status,
          currentBpm: cur,
          targetBpm: tgt,
          tempoGap: gap,
          masteryPercent: pct,
          color: catInfo.base,
          totalPracticeMinutes: song.totalPracticeMinutes || 0,
        };
      })
      .sort((a, b) => b.masteryPercent - a.masteryPercent);
  }, [songs, categoryFilter, categoryColorLookup]);

  // ----------------------------------------------------
  // 1. Practice Time by Song Data
  // ----------------------------------------------------
  const songPracticeData = useMemo(() => {
    return songs
      .filter((s) => {
        if (categoryFilter === 'all') return true;
        if (categoryFilter === 'prelude') return s.category === 'prelude' || (s.category as string) === 'repertoire';
        return s.category === categoryFilter;
      })
      .map((song) => {
        const songLogs = logs.filter((l) => l.songId === song.id || l.songTitle.toLowerCase() === song.title.toLowerCase());
        const loggedMins = songLogs.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
        const totalMinutes = Math.max(song.totalPracticeMinutes || 0, loggedMins);
        const totalHours = Number((totalMinutes / 60).toFixed(1));
        const totalSessions = Math.max(song.timesPracticed || 0, songLogs.length);
        const catInfo = categoryColorLookup[song.category] || { base: '#B63E88', light: '#DE72B5', border: '#FFBBE2', name: song.category };

        return {
          id: song.id,
          title: song.title,
          shortTitle: song.title.length > 22 ? `${song.title.substring(0, 20)}…` : song.title,
          composer: song.composerOrArtist,
          category: song.category,
          categoryLabel: catInfo.name,
          color: catInfo.base,
          status: song.status,
          totalMinutes,
          totalHours,
          totalSessions,
          currentBpm: song.currentBpm || 60,
          targetBpm: song.targetBpm || 80,
          lastPracticedAt: song.lastPracticedAt,
          hymnNo: song.pageNumberOrHymnNumber,
        };
      })
      .sort((a, b) => b.totalMinutes - a.totalMinutes);
  }, [songs, logs, categoryFilter, categoryColorLookup]);

  const topSongsChartData = useMemo(() => {
    return songPracticeData.slice(0, 10);
  }, [songPracticeData]);

  // ----------------------------------------------------
  // 2. Daily Practice Minutes Data (Past 7, 14, or 30 days)
  // ----------------------------------------------------
  const dailyPracticeData = useMemo(() => {
    const dayCount = dateRangeFilter === '7d' ? 7 : dateRangeFilter === '14d' ? 14 : dateRangeFilter === '30d' ? 30 : 60;
    const result: Array<{
      date: string;
      formattedDate: string;
      dayOfWeek: string;
      minutes: number;
      hours: number;
      sessions: number;
      preludeMins: number;
      hymnMins: number;
      lordsSupperMins: number;
      choirMins: number;
    }> = [];

    const now = new Date();
    for (let i = dayCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = DAY_NAMES[d.getDay()];
      const shortFormat = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Find all logs for this date
      const dayLogs = logs.filter((l) => l.date === dateStr);
      const minutes = dayLogs.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
      const hours = Number((minutes / 60).toFixed(1));
      const sessions = dayLogs.length;

      const preludeMins = dayLogs
        .filter((l) => l.category === 'prelude' || (l.category as string) === 'repertoire')
        .reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
      const hymnMins = dayLogs
        .filter((l) => l.category === 'hymn')
        .reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
      const lordsSupperMins = dayLogs
        .filter((l) => l.category === 'lords_supper')
        .reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
      const choirMins = dayLogs
        .filter((l) => l.category === 'choir_song')
        .reduce((sum, l) => sum + (l.durationMinutes || 0), 0);

      result.push({
        date: dateStr,
        formattedDate: shortFormat,
        dayOfWeek: dayName,
        minutes,
        hours,
        sessions,
        preludeMins,
        hymnMins,
        lordsSupperMins,
        choirMins,
      });
    }

    return result;
  }, [logs, dateRangeFilter]);

  // ----------------------------------------------------
  // 3. Weekly Practice Totals (Last 8 Weeks)
  // ----------------------------------------------------
  const weeklyPracticeData = useMemo(() => {
    const weeksMap: Record<
      string,
      {
        weekLabel: string;
        totalMinutes: number;
        preludeMins: number;
        hymnMins: number;
        lordsSupperMins: number;
        choirMins: number;
        sessions: number;
      }
    > = {};

    const now = new Date();
    for (let w = 7; w >= 0; w--) {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() - w * 7);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);

      const label = `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      weeksMap[`week_${w}`] = {
        weekLabel: w === 0 ? 'This Week' : w === 1 ? 'Last Week' : label,
        totalMinutes: 0,
        preludeMins: 0,
        hymnMins: 0,
        lordsSupperMins: 0,
        choirMins: 0,
        sessions: 0,
      };

      logs.forEach((log) => {
        const logDate = new Date(log.date + 'T00:00:00');
        if (logDate >= startOfWeek && logDate <= endOfWeek) {
          weeksMap[`week_${w}`].totalMinutes += log.durationMinutes;
          weeksMap[`week_${w}`].sessions += 1;
          if (log.category === 'prelude' || (log.category as string) === 'repertoire') weeksMap[`week_${w}`].preludeMins += log.durationMinutes;
          else if (log.category === 'hymn') weeksMap[`week_${w}`].hymnMins += log.durationMinutes;
          else if (log.category === 'lords_supper') weeksMap[`week_${w}`].lordsSupperMins += log.durationMinutes;
          else if (log.category === 'choir_song') weeksMap[`week_${w}`].choirMins += log.durationMinutes;
        }
      });
    }

    return Object.values(weeksMap);
  }, [logs]);

  // Day of Week Distribution (Sun - Sat)
  const dayOfWeekDistribution = useMemo(() => {
    const days = [
      { day: 'Sun', name: 'Sunday', minutes: 0, sessions: 0 },
      { day: 'Mon', name: 'Monday', minutes: 0, sessions: 0 },
      { day: 'Tue', name: 'Tuesday', minutes: 0, sessions: 0 },
      { day: 'Wed', name: 'Wednesday', minutes: 0, sessions: 0 },
      { day: 'Thu', name: 'Thursday', minutes: 0, sessions: 0 },
      { day: 'Fri', name: 'Friday', minutes: 0, sessions: 0 },
      { day: 'Sat', name: 'Saturday', minutes: 0, sessions: 0 },
    ];

    logs.forEach((log) => {
      const d = new Date(log.date + 'T00:00:00');
      const dayIdx = d.getDay();
      days[dayIdx].minutes += log.durationMinutes;
      days[dayIdx].sessions += 1;
    });

    const maxMins = Math.max(1, ...days.map((d) => d.minutes));

    return days.map((d) => ({
      ...d,
      percentOfMax: Math.round((d.minutes / maxMins) * 100),
    }));
  }, [logs]);

  // ----------------------------------------------------
  // 4. Overall Practice Time & Cumulative Growth Data
  // ----------------------------------------------------
  const overallCumulativeData = useMemo(() => {
    const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let cumulativeMins = 0;
    const dateMap: Record<string, number> = {};

    sortedLogs.forEach((l) => {
      cumulativeMins += l.durationMinutes || 0;
      dateMap[l.date] = cumulativeMins;
    });

    return Object.entries(dateMap).map(([date, mins]) => ({
      date,
      formattedDate: new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      cumulativeMinutes: mins,
      cumulativeHours: Number((mins / 60).toFixed(1)),
    }));
  }, [logs]);

  // Dynamic Category Breakdown Pie Chart Data
  const categoryPieData = useMemo(() => {
    const catMinsMap: Record<string, number> = {};

    // Initialize all categories in map
    categories.forEach((c) => {
      catMinsMap[c.id] = 0;
    });
    if (!catMinsMap['prelude']) catMinsMap['prelude'] = 0;
    if (!catMinsMap['hymn']) catMinsMap['hymn'] = 0;
    if (!catMinsMap['lords_supper']) catMinsMap['lords_supper'] = 0;
    if (!catMinsMap['choir_song']) catMinsMap['choir_song'] = 0;

    songs.forEach((s) => {
      const catKey = (s.category as string) === 'repertoire' ? 'prelude' : s.category;
      catMinsMap[catKey] = (catMinsMap[catKey] || 0) + (s.totalPracticeMinutes || 0);
    });

    logs.forEach((l) => {
      if (!songs.some((s) => s.id === l.songId)) {
        const catKey = (l.category as string) === 'repertoire' ? 'prelude' : l.category;
        catMinsMap[catKey] = (catMinsMap[catKey] || 0) + (l.durationMinutes || 0);
      }
    });

    const total = Object.values(catMinsMap).reduce((sum, val) => sum + val, 0) || 1;

    const list = Object.entries(catMinsMap).map(([catId, mins]) => {
      const catObj = categories.find((c) => c.id === catId);
      const name = catObj ? catObj.name : categoryColorLookup[catId]?.name || catId;
      const color = catObj ? catObj.color : categoryColorLookup[catId]?.base || '#B63E88';
      return {
        name,
        category: catId,
        minutes: mins,
        hours: (mins / 60).toFixed(1),
        percentage: Math.round((mins / total) * 100),
        color,
      };
    });

    return list.filter((item) => item.minutes > 0 || total === 1);
  }, [songs, logs, categories, categoryColorLookup]);

  // Overall Totals
  const totalLifetimeMinutes = useMemo(() => {
    const fromSongs = songs.reduce((sum, s) => sum + (s.totalPracticeMinutes || 0), 0);
    const fromLogs = logs.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
    return Math.max(fromSongs, fromLogs);
  }, [songs, logs]);

  const totalLifetimeHours = (totalLifetimeMinutes / 60).toFixed(1);
  const totalSessionsCount = logs.length;
  const avgSessionLength = totalSessionsCount > 0 ? Math.round(totalLifetimeMinutes / totalSessionsCount) : 0;

  // Selected song details for drilldown
  const activeDrilldownSong = songPracticeData.find((s) => s.id === selectedSongId) || songPracticeData[0];

  return (
    <div className="space-y-6">
      {/* Top Analytics Hero Header */}
      <div className="majestic-card rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#B63E88] to-[#4A1037] border border-[#DE72B5]/40 flex items-center justify-center text-white shadow-md">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-serif text-white uppercase tracking-wider">
                Piano Practice Analytics
              </h2>
              <p className="text-xs text-[#DDD8E2]">
                Visualizing practice volume across repertoire, daily trends, weekly totals, and mastery
              </p>
            </div>
          </div>

          {/* Quick Summary Metrics Pill */}
          <div className="flex items-center gap-3 bg-[#1D0F22]/90 border border-[#B63E88]/30 rounded-2xl px-4 py-2 text-xs shadow-inner">
            <div>
              <span className="text-[#DDD8E2] block text-[10px] uppercase font-semibold">Total Time</span>
              <span className="font-mono font-bold text-[#FFBBE2] text-sm">{totalLifetimeHours} hrs</span>
            </div>
            <div className="w-px h-6 bg-[#4D2B5B]" />
            <div>
              <span className="text-[#DDD8E2] block text-[10px] uppercase font-semibold">Sessions</span>
              <span className="font-mono font-bold text-white text-sm">{totalSessionsCount}</span>
            </div>
            <div className="w-px h-6 bg-[#4D2B5B]" />
            <div>
              <span className="text-[#DDD8E2] block text-[10px] uppercase font-semibold">Avg Length</span>
              <span className="font-mono font-bold text-[#DE72B5] text-sm">{avgSessionLength}m</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs for 5 Chart Views */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-[#DE72B5]/20">
          <button
            id="chart-tab-tempo"
            onClick={() => setSelectedSubTab('tempo_progress')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              selectedSubTab === 'tempo_progress'
                ? 'majestic-btn-primary font-bold shadow-md ring-1 ring-[#DE72B5]/50'
                : 'majestic-btn-secondary text-[#B8A9C2] hover:text-white'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-[#DE72B5]" />
            <span>Tempo &amp; BPM</span>
          </button>

          <button
            id="chart-tab-song"
            onClick={() => setSelectedSubTab('by_song')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              selectedSubTab === 'by_song'
                ? 'majestic-btn-primary font-bold shadow-md ring-1 ring-[#DE72B5]/50'
                : 'majestic-btn-secondary text-[#B8A9C2] hover:text-white'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Time by Piece</span>
          </button>

          <button
            id="chart-tab-daily"
            onClick={() => setSelectedSubTab('daily')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              selectedSubTab === 'daily'
                ? 'majestic-btn-primary font-bold shadow-md ring-1 ring-[#DE72B5]/50'
                : 'majestic-btn-secondary text-[#B8A9C2] hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Daily Volume</span>
          </button>

          <button
            id="chart-tab-weekly"
            onClick={() => setSelectedSubTab('weekly')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              selectedSubTab === 'weekly'
                ? 'majestic-btn-primary font-bold shadow-md ring-1 ring-[#DE72B5]/50'
                : 'majestic-btn-secondary text-[#B8A9C2] hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Weekly Trends</span>
          </button>

          <button
            id="chart-tab-overall"
            onClick={() => setSelectedSubTab('overall')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all col-span-2 sm:col-span-1 ${
              selectedSubTab === 'overall'
                ? 'majestic-btn-primary font-bold shadow-md ring-1 ring-[#DE72B5]/50'
                : 'majestic-btn-secondary text-[#B8A9C2] hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Growth Log</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* 0. VIEW: TEMPO & MASTERY PROGRESS CHART */}
      {/* ---------------------------------------------------------------------- */}
      {selectedSubTab === 'tempo_progress' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="majestic-card rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#DE72B5]" />
              <span className="text-xs font-bold text-white">Filter Category:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                <button
                  id="filter-tempo-cat-all"
                  onClick={() => setCategoryFilter('all')}
                  className={`px-2.5 py-1 text-xs rounded-xl font-medium transition-all whitespace-nowrap ${
                    categoryFilter === 'all'
                      ? 'majestic-btn-primary font-bold shadow-sm'
                      : 'bg-[#2D1A36] text-[#B8A9C2] hover:text-white border border-[#4D2B5B]'
                  }`}
                >
                  All Pieces ({songs.length})
                </button>
                {categories.map((c) => {
                  const count = songs.filter(
                    (s) => s.category === c.id || (c.id === 'prelude' && (s.category as string) === 'repertoire')
                  ).length;
                  return (
                    <button
                      key={c.id}
                      id={`filter-tempo-cat-${c.id}`}
                      onClick={() => setCategoryFilter(c.id)}
                      className={`px-2.5 py-1 text-xs rounded-xl font-medium transition-all whitespace-nowrap ${
                        categoryFilter === c.id
                          ? 'majestic-btn-primary font-bold shadow-sm'
                          : 'bg-[#2D1A36] text-[#B8A9C2] hover:text-white border border-[#4D2B5B]'
                      }`}
                    >
                      {c.name} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            <span className="text-xs text-[#DDD8E2]">
              Tracking Current BPM vs Target Tempo Goal for Repertoire
            </span>
          </div>

          {/* Tempo Progress Bar Chart */}
          <div className="majestic-card rounded-3xl p-5 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2 font-serif">
                  <Target className="w-4 h-4 text-[#DE72B5]" />
                  Tempo Progress (Current vs Target BPM)
                </h3>
                <p className="text-xs text-[#DDD8E2]">
                  Side-by-side comparison of current playing speed and final target tempo
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#DE72B5] inline-block" />
                  <span className="text-white font-medium">Current BPM</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#7B4D8A] border border-[#DE72B5]/40 inline-block" />
                  <span className="text-[#DDD8E2]">Target BPM</span>
                </div>
              </div>
            </div>

            {tempoProgressChartData.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <Target className="w-10 h-10 mx-auto text-[#DE72B5]/40" />
                <h4 className="text-base font-bold text-white font-serif">No Tempo Progress Data</h4>
                <p className="text-xs text-[#DDD8E2] max-w-md mx-auto">
                  {songs.length === 0
                    ? "Your repertoire is currently empty. Add pieces in your Repertoire tab to set metronome tempo goals and track your speed progression."
                    : "No pieces match the selected category filter."}
                </p>
              </div>
            ) : (
              <div className="h-80 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart
                    data={tempoProgressChartData}
                    margin={{ top: 15, right: 20, left: -10, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#4D2B5B" opacity={0.4} />
                    <XAxis
                      dataKey="shortTitle"
                      stroke="#B8A9C2"
                      fontSize={11}
                      interval={0}
                      angle={-30}
                      textAnchor="end"
                    />
                    <YAxis
                      stroke="#B8A9C2"
                      fontSize={11}
                      unit=" bpm"
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-[#1D0F22]/95 border border-[#DE72B5]/60 rounded-2xl p-3 shadow-2xl backdrop-blur-md text-xs space-y-1">
                              <p className="font-bold text-white">{data.title}</p>
                              {data.composer && <p className="text-[#DE72B5]">{data.composer}</p>}
                              <div className="border-t border-[#DE72B5]/20 pt-1.5 mt-1 space-y-1">
                                <p className="text-[#FFBBE2]">
                                  Current Speed: <strong className="text-white">{data.currentBpm} BPM</strong>
                                </p>
                                <p className="text-[#B8A9C2]">
                                  Target Goal: <strong className="text-white">{data.targetBpm} BPM</strong>
                                </p>
                                <p className="text-[#C7A252] font-semibold">
                                  Goal Progress: {data.masteryPercent}%
                                </p>
                                <p className="text-[11px] text-[#DDD8E2] capitalize">
                                  Status: {data.status.replace('_', ' ')}
                                </p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="currentBpm" name="Current BPM" fill="#DE72B5" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="targetBpm" name="Target BPM" fill="#552F66" stroke="#DE72B5" strokeWidth={1} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Detailed Mastery & Tempo Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tempoProgressChartData.map((item) => (
              <div
                key={item.id}
                className="majestic-card rounded-2xl p-4 border border-[#DE72B5]/20 shadow-md space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white truncate" title={item.title}>
                      {item.title}
                    </h4>
                    {item.composer && (
                      <p className="text-xs text-[#DDD8E2] truncate">{item.composer}</p>
                    )}
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      item.status === 'mastered'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : item.status === 'polishing'
                        ? 'bg-[#C7A252]/20 text-[#C7A252] border border-[#C7A252]/30'
                        : item.status === 'practicing'
                        ? 'bg-[#DE72B5]/20 text-[#FFBBE2] border border-[#DE72B5]/30'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}
                  >
                    {item.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Tempo Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#DDD8E2]">
                      Speed: <strong className="text-white">{item.currentBpm}</strong> / {item.targetBpm} BPM
                    </span>
                    <span className="font-bold text-[#FFBBE2]">{item.masteryPercent}%</span>
                  </div>
                  <div className="w-full bg-[#1D0F22] h-2.5 rounded-full overflow-hidden border border-[#4D2B5B]">
                    <div
                      className="h-full bg-gradient-to-r from-[#B63E88] to-[#DE72B5] rounded-full transition-all duration-500"
                      style={{ width: `${item.masteryPercent}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#DE72B5]/15 text-xs text-[#DDD8E2]">
                  <span>{item.categoryLabel}</span>
                  {onOpenTimer && (
                    <button
                      onClick={() => onOpenTimer(item.id)}
                      className="text-[#FFBBE2] hover:text-white font-semibold flex items-center gap-1 text-xs"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Practice
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* 1. VIEW: TOTAL PRACTICE TIME BY SONG */}
      {/* ---------------------------------------------------------------------- */}
      {selectedSubTab === 'by_song' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="majestic-card rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#DE72B5]" />
              <span className="text-xs font-bold text-white">Filter Pieces:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                <button
                  id="filter-cat-all"
                  onClick={() => setCategoryFilter('all')}
                  className={`px-2.5 py-1 text-xs rounded-xl font-medium transition-all whitespace-nowrap ${
                    categoryFilter === 'all'
                      ? 'majestic-btn-primary font-bold shadow-sm'
                      : 'bg-[#2D1A36] text-[#B8A9C2] hover:text-white border border-[#4D2B5B]'
                  }`}
                >
                  All Pieces ({songs.length})
                </button>
                {categories.map((c) => {
                  const count = songs.filter(
                    (s) => s.category === c.id || (c.id === 'prelude' && (s.category as string) === 'repertoire')
                  ).length;
                  return (
                    <button
                      key={c.id}
                      id={`filter-cat-${c.id}`}
                      onClick={() => setCategoryFilter(c.id)}
                      className={`px-2.5 py-1 text-xs rounded-xl font-medium transition-all whitespace-nowrap ${
                        categoryFilter === c.id
                          ? 'majestic-btn-primary font-bold shadow-sm'
                          : 'bg-[#2D1A36] text-[#B8A9C2] hover:text-white border border-[#4D2B5B]'
                      }`}
                    >
                      {c.name} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            <span className="text-xs text-[#DDD8E2]">
              Showing top practiced pieces ranked by total minutes logged
            </span>
          </div>

          {/* Main Bar Chart & Song Details Card Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Horizontal Bar Chart (2 Cols) */}
            <div className="lg:col-span-2 majestic-card rounded-3xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2 font-serif">
                    <BarChart3 className="w-4 h-4 text-[#DE72B5]" />
                    Top Practiced Pieces (Minutes)
                  </h3>
                  <p className="text-xs text-[#DDD8E2]">Click any bar to inspect piece metrics</p>
                </div>
              </div>

              {/* Recharts Bar Chart or Empty State */}
              {topSongsChartData.length === 0 ? (
                <div className="py-16 text-center space-y-3 border border-dashed border-[#DE72B5]/20 rounded-2xl bg-[#1D0F22]/40">
                  <Clock className="w-10 h-10 mx-auto text-[#DE72B5]/40" />
                  <h4 className="text-base font-bold text-white font-serif">No Practice Time Logged Yet</h4>
                  <p className="text-xs text-[#DDD8E2] max-w-md mx-auto">
                    Start a timer or log a practice session to see pieces ranked by total practice time.
                  </p>
                </div>
              ) : (
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topSongsChartData}
                      layout="vertical"
                      margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
                      onClick={(data: any) => {
                        if (data && data.activePayload && data.activePayload[0]) {
                          setSelectedSongId(data.activePayload[0].payload.id);
                        }
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#4D2B5B" horizontal={false} opacity={0.4} />
                      <XAxis
                        type="number"
                        stroke="#B8A9C2"
                        tick={{ fill: '#B8A9C2', fontSize: 11 }}
                        unit="m"
                      />
                      <YAxis
                        dataKey="shortTitle"
                        type="category"
                        width={120}
                        stroke="#B8A9C2"
                        tick={{ fill: '#DDD8E2', fontSize: 11, fontWeight: 500 }}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-[#1D0F22]/95 border border-[#DE72B5]/40 rounded-xl p-3 shadow-2xl text-xs space-y-1.5 max-w-xs backdrop-blur-md">
                                <p className="font-bold text-white text-sm font-serif">{data.title}</p>
                                <p className="text-[#DDD8E2]">{data.composer} {data.hymnNo ? `• ${data.hymnNo}` : ''}</p>
                                <div className="pt-1 border-t border-[#4D2B5B] flex items-center justify-between text-[#FFBBE2] font-mono">
                                  <span>Practice Time:</span>
                                  <strong>{data.totalMinutes} mins ({data.totalHours} hrs)</strong>
                                </div>
                                <div className="flex items-center justify-between text-[#DDD8E2]">
                                  <span>Total Sessions:</span>
                                  <span>{data.totalSessions} sessions</span>
                                </div>
                                <div className="flex items-center justify-between text-[#DDD8E2]">
                                  <span>Tempo:</span>
                                  <span>{data.currentBpm} / {data.targetBpm} BPM</span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="totalMinutes" radius={[0, 8, 8, 0]}>
                        {topSongsChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.id === (selectedSongId || topSongsChartData[0]?.id) ? '#DE72B5' : entry.color}
                            stroke={entry.id === (selectedSongId || topSongsChartData[0]?.id) ? '#ffffff' : 'transparent'}
                            strokeWidth={1.5}
                            className="cursor-pointer transition-all hover:opacity-80"
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Selected Song Deep Dive Card */}
            {activeDrilldownSong && (
              <div className="majestic-card rounded-3xl p-5 shadow-lg space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#40234D] text-[#DE72B5] border border-[#DE72B5]/30 capitalize font-bold">
                      {activeDrilldownSong.categoryLabel}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#FFBBE2]">
                      Rank #
                      {songPracticeData.findIndex((s) => s.id === activeDrilldownSong.id) + 1}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white font-serif">{activeDrilldownSong.title}</h4>
                    <p className="text-xs text-[#DDD8E2] mt-0.5">{activeDrilldownSong.composer}</p>
                    {activeDrilldownSong.hymnNo && (
                      <span className="inline-block text-[11px] px-2 py-0.5 mt-1 rounded-lg bg-[#40234D] text-[#DE72B5] border border-[#DE72B5]/30 font-mono font-bold">
                        {activeDrilldownSong.hymnNo}
                      </span>
                    )}
                  </div>

                  {/* Practice Stats Box */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="p-3 bg-[#1D0F22]/80 rounded-2xl border border-[#4D2B5B]">
                      <span className="text-[10px] text-[#DDD8E2] uppercase font-semibold block">Total Time</span>
                      <span className="text-lg font-mono font-bold text-white">
                        {activeDrilldownSong.totalMinutes} <span className="text-xs text-[#DDD8E2]">mins</span>
                      </span>
                      <span className="text-[10px] text-[#DE72B5] block mt-0.5 font-bold">({activeDrilldownSong.totalHours} hrs)</span>
                    </div>

                    <div className="p-3 bg-[#1D0F22]/80 rounded-2xl border border-[#4D2B5B]">
                      <span className="text-[10px] text-[#DDD8E2] uppercase font-semibold block">Sessions</span>
                      <span className="text-lg font-mono font-bold text-white">{activeDrilldownSong.totalSessions}</span>
                      <span className="text-[10px] text-[#DDD8E2] block mt-0.5">Logged in Studio</span>
                    </div>
                  </div>

                  {/* Metronome Tempo Goal Progress */}
                  <div className="p-3 bg-[#1D0F22]/80 rounded-2xl border border-[#4D2B5B] space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#DDD8E2] font-semibold">Metronome Progress:</span>
                      <span className="font-mono text-white font-bold">
                        {activeDrilldownSong.currentBpm} / {activeDrilldownSong.targetBpm} BPM
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#2D1A36] rounded-full overflow-hidden border border-[#4D2B5B]/50 p-0.5">
                      <div
                        className="h-full bg-gradient-to-r from-[#B63E88] via-[#DE72B5] to-[#FFFFFF] rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round((activeDrilldownSong.currentBpm / activeDrilldownSong.targetBpm) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Direct Action: Start Practice Timer for this piece */}
                <button
                  onClick={() => onOpenTimer?.(activeDrilldownSong.id)}
                  className="w-full py-2.5 majestic-btn-primary rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md active:scale-95"
                >
                  <Clock className="w-4 h-4" />
                  Launch Practice Timer for this Song
                </button>
              </div>
            )}
          </div>

          {/* Full Table of All Repertoire Practice Volume */}
          <div className="majestic-card rounded-3xl p-5 shadow-lg space-y-4">
            <h3 className="text-base font-bold text-white font-serif">All Pieces by Practice Time</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#DDD8E2]">
                <thead className="text-[11px] text-[#DDD8E2] uppercase border-b border-[#DE72B5]/20 bg-[#1D0F22]/60">
                  <tr>
                    <th className="py-2.5 px-3">Rank</th>
                    <th className="py-2.5 px-3">Piece / Hymn</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Total Time</th>
                    <th className="py-2.5 px-3">Sessions</th>
                    <th className="py-2.5 px-3">Current Tempo</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#4D2B5B]/60">
                  {songPracticeData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-xs text-[#DDD8E2]">
                        No pieces in your repertoire yet. Add pieces to see them ranked by practice volume.
                      </td>
                    </tr>
                  ) : (
                    songPracticeData.map((song, idx) => (
                      <tr
                        key={song.id}
                        onClick={() => setSelectedSongId(song.id)}
                        className={`hover:bg-[#40234D]/50 cursor-pointer transition-colors ${
                          song.id === (selectedSongId || topSongsChartData[0]?.id) ? 'bg-[#40234D]/40' : ''
                        }`}
                      >
                        <td className="py-3 px-3 font-mono font-bold text-[#DE72B5]">#{idx + 1}</td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-white">{song.title}</div>
                          <div className="text-[11px] text-[#B8A9C2]">
                            {song.composer} {song.hymnNo ? `• Hymn #${song.hymnNo}` : ''}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2D1A36] text-[#DE72B5] border border-[#DE72B5]/30 capitalize font-medium">
                            {song.categoryLabel}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono">
                          <strong className="text-white">{song.totalMinutes}m</strong>{' '}
                          <span className="text-[#DDD8E2]">({song.totalHours}h)</span>
                        </td>
                        <td className="py-3 px-3 font-mono text-white">{song.totalSessions}</td>
                        <td className="py-3 px-3 font-mono">
                          <span className="text-white font-bold">{song.currentBpm}</span> / {song.targetBpm} BPM
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenTimer?.(song.id);
                            }}
                            className="px-2.5 py-1 majestic-btn-primary rounded-lg text-[11px] font-bold inline-flex items-center gap-1 shadow-sm"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            Practice
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* 2. VIEW: DAILY PRACTICE TRENDS */}
      {/* ---------------------------------------------------------------------- */}
      {selectedSubTab === 'daily' && (
        <div className="space-y-6">
          {/* Daily Date Range Filter Controls */}
          <div className="majestic-card rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#DE72B5]" />
              <span className="text-xs font-bold text-white">Daily Range:</span>
              <div className="flex items-center gap-1.5">
                {[
                  { id: '7d', label: 'Last 7 Days' },
                  { id: '14d', label: 'Last 14 Days' },
                  { id: '30d', label: 'Last 30 Days' },
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setDateRangeFilter(r.id as typeof dateRangeFilter)}
                    className={`px-3 py-1 text-xs rounded-xl font-semibold transition-all ${
                      dateRangeFilter === r.id
                        ? 'majestic-btn-primary font-bold'
                        : 'bg-[#2D1A36] text-[#B8A9C2] hover:text-white border border-[#4D2B5B]'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <span className="text-xs text-[#DDD8E2]">
              Track consistency and daily practice duration over time
            </span>
          </div>

          {/* Daily Bar & Area Chart */}
          <div className="majestic-card rounded-3xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2 font-serif">
                  <Activity className="w-4 h-4 text-[#DE72B5]" />
                  Daily Practice Time (Minutes)
                </h3>
                <p className="text-xs text-[#DDD8E2]">Daily time spent on piano repertoire drills</p>
              </div>
            </div>

            {logs.length === 0 ? (
              <div className="py-12 text-center space-y-2 border border-dashed border-[#DE72B5]/20 rounded-2xl bg-[#1D0F22]/40">
                <Activity className="w-8 h-8 mx-auto text-[#DE72B5]/40" />
                <p className="text-sm font-semibold text-white font-serif">No daily practice sessions recorded yet</p>
                <p className="text-xs text-[#DDD8E2]">Complete a practice session to start seeing your daily volume trends.</p>
              </div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyPracticeData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4D2B5B" vertical={false} opacity={0.4} />
                    <XAxis dataKey="formattedDate" stroke="#B8A9C2" tick={{ fill: '#B8A9C2', fontSize: 11 }} />
                    <YAxis stroke="#B8A9C2" tick={{ fill: '#B8A9C2', fontSize: 11 }} unit="m" />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-[#1D0F22]/95 border border-[#DE72B5]/40 rounded-xl p-3 shadow-2xl text-xs space-y-1.5 max-w-xs backdrop-blur-md">
                              <p className="font-bold text-white text-sm font-serif">
                                {data.dayOfWeek}, {data.formattedDate}
                              </p>
                              <div className="pt-1 border-t border-[#4D2B5B] flex items-center justify-between text-[#FFBBE2] font-mono">
                                <span>Total Time:</span>
                                <strong>{data.minutes} mins ({data.hours} hrs)</strong>
                              </div>
                              <div className="text-[11px] text-[#DDD8E2] space-y-0.5 pt-1">
                                {data.preludeMins > 0 && <div>Preludes: {data.preludeMins}m</div>}
                                {data.hymnMins > 0 && <div>Hymns: {data.hymnMins}m</div>}
                                {data.lordsSupperMins > 0 && <div>Lord's Supper: {data.lordsSupperMins}m</div>}
                                {data.choirMins > 0 && <div>Choir: {data.choirMins}m</div>}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="preludeMins" stackId="a" fill={categoryColorLookup['prelude']?.base || '#B63E88'} name="Preludes" />
                    <Bar dataKey="hymnMins" stackId="a" fill={categoryColorLookup['hymn']?.base || '#7B4D8A'} name="Hymns" />
                    <Bar dataKey="lordsSupperMins" stackId="a" fill={categoryColorLookup['lords_supper']?.base || '#C7A252'} name="Lord's Supper" />
                    <Bar dataKey="choirMins" stackId="a" fill={categoryColorLookup['choir_song']?.base || '#9B51E0'} name="Choir Songs" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Legend for Categories */}
            <div className="flex items-center justify-center gap-4 flex-wrap pt-2 border-t border-[#DE72B5]/20 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColorLookup['prelude']?.base || '#B63E88' }} />
                <span className="text-[#DDD8E2]">Preludes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColorLookup['hymn']?.base || '#7B4D8A' }} />
                <span className="text-[#DDD8E2]">Hymns</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColorLookup['lords_supper']?.base || '#C7A252' }} />
                <span className="text-[#DDD8E2]">Lord's Supper</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColorLookup['choir_song']?.base || '#9B51E0' }} />
                <span className="text-[#DDD8E2]">Choir Songs</span>
              </div>
            </div>
          </div>

          {/* Day of Week Distribution Card */}
          <div className="majestic-card rounded-3xl p-5 shadow-lg space-y-4">
            <h3 className="text-base font-bold text-white font-serif">Day of Week Practice Distribution</h3>
            <p className="text-xs text-[#DDD8E2]">See which days of the week you tend to practice most</p>

            <div className="grid grid-cols-7 gap-2 pt-2">
              {dayOfWeekDistribution.map((d) => (
                <div key={d.day} className="flex flex-col items-center gap-2">
                  <div className="w-full bg-[#1D0F22] h-28 rounded-2xl p-1 flex flex-col justify-end border border-[#4D2B5B]">
                    <div
                      className="w-full bg-gradient-to-t from-[#B63E88] to-[#DE72B5] rounded-xl transition-all duration-500 shadow-sm"
                      style={{ height: `${Math.max(8, d.percentOfMax)}%` }}
                    />
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-bold text-white block">{d.day}</span>
                    <span className="text-[10px] font-mono text-[#FFBBE2]">{d.minutes}m</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* 3. VIEW: WEEKLY PRACTICE TOTALS */}
      {/* ---------------------------------------------------------------------- */}
      {selectedSubTab === 'weekly' && (
        <div className="space-y-6">
          <div className="majestic-card rounded-3xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2 font-serif">
                  <BarChart3 className="w-4 h-4 text-[#DE72B5]" />
                  Weekly Practice Volume (Past 8 Weeks)
                </h3>
                <p className="text-xs text-[#DDD8E2]">Aggregate practice hours logged per week</p>
              </div>
            </div>

            {logs.length === 0 ? (
              <div className="py-16 text-center space-y-2 border border-dashed border-[#DE72B5]/20 rounded-2xl bg-[#1D0F22]/40">
                <BarChart3 className="w-8 h-8 mx-auto text-[#DE72B5]/40" />
                <p className="text-sm font-semibold text-white font-serif">No weekly practice data yet</p>
                <p className="text-xs text-[#DDD8E2]">Your practice totals for the past 8 weeks will appear here once you log sessions.</p>
              </div>
            ) : (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyPracticeData} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4D2B5B" vertical={false} opacity={0.4} />
                    <XAxis dataKey="weekLabel" stroke="#B8A9C2" tick={{ fill: '#B8A9C2', fontSize: 11 }} />
                    <YAxis stroke="#B8A9C2" tick={{ fill: '#B8A9C2', fontSize: 11 }} unit="m" />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-[#1D0F22]/95 border border-[#DE72B5]/40 rounded-xl p-3 shadow-2xl text-xs space-y-1 max-w-xs backdrop-blur-md">
                              <p className="font-bold text-white text-sm font-serif">{data.weekLabel}</p>
                              <div className="pt-1 border-t border-[#4D2B5B] flex items-center justify-between text-[#FFBBE2] font-mono">
                                <span>Weekly Time:</span>
                                <strong>{data.totalMinutes} mins ({(data.totalMinutes / 60).toFixed(1)} hrs)</strong>
                              </div>
                              <div className="flex items-center justify-between text-[#DDD8E2]">
                                <span>Sessions Logged:</span>
                                <span>{data.sessions} sessions</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="preludeMins" stackId="a" fill={categoryColorLookup['prelude']?.base || '#B63E88'} name="Preludes" />
                    <Bar dataKey="hymnMins" stackId="a" fill={categoryColorLookup['hymn']?.base || '#7B4D8A'} name="Hymns" />
                    <Bar dataKey="lordsSupperMins" stackId="a" fill={categoryColorLookup['lords_supper']?.base || '#C7A252'} name="Lord's Supper" />
                    <Bar dataKey="choirMins" stackId="a" fill={categoryColorLookup['choir_song']?.base || '#9B51E0'} name="Choir Songs" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* 4. VIEW: OVERALL PRACTICE GROWTH & MILESTONES */}
      {/* ---------------------------------------------------------------------- */}
      {selectedSubTab === 'overall' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cumulative Lifetime Practice Time Area Chart */}
            <div className="lg:col-span-2 majestic-card rounded-3xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2 font-serif">
                    <TrendingUp className="w-4 h-4 text-[#DE72B5]" />
                    Cumulative Lifetime Growth Curve (Hours)
                  </h3>
                  <p className="text-xs text-[#DDD8E2]">Continuous trajectory of lifetime practice hours</p>
                </div>
              </div>

              {logs.length === 0 ? (
                <div className="py-16 text-center space-y-2 border border-dashed border-[#DE72B5]/20 rounded-2xl bg-[#1D0F22]/40">
                  <TrendingUp className="w-8 h-8 mx-auto text-[#DE72B5]/40" />
                  <p className="text-sm font-semibold text-white font-serif">Cumulative Growth Curve</p>
                  <p className="text-xs text-[#DDD8E2]">Cumulative practice hours will graph your trajectory here once you log sessions.</p>
                </div>
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={overallCumulativeData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#DE72B5" stopOpacity={0.5} />
                          <stop offset="95%" stopColor="#B63E88" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#4D2B5B" vertical={false} opacity={0.4} />
                      <XAxis dataKey="formattedDate" stroke="#B8A9C2" tick={{ fill: '#B8A9C2', fontSize: 11 }} />
                      <YAxis stroke="#B8A9C2" tick={{ fill: '#B8A9C2', fontSize: 11 }} unit="h" />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-[#1D0F22]/95 border border-[#DE72B5]/40 rounded-xl p-3 shadow-2xl text-xs space-y-1 max-w-xs backdrop-blur-md">
                                <p className="font-bold text-white text-sm font-serif">{data.formattedDate}</p>
                                <div className="pt-1 border-t border-[#4D2B5B] flex items-center justify-between text-[#FFBBE2] font-mono">
                                  <span>Total Cumulative Time:</span>
                                  <strong>{data.cumulativeHours} hours ({data.cumulativeMinutes} mins)</strong>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="cumulativeHours"
                        stroke="#DE72B5"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#growthGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Category Pie Distribution */}
            <div className="majestic-card rounded-3xl p-5 shadow-lg space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2 font-serif">
                  <PieIcon className="w-4 h-4 text-[#DE72B5]" />
                  Category Breakdown
                </h3>
                <p className="text-xs text-[#DDD8E2]">Share of lifetime practice across genres</p>

                {/* Donut Pie Chart */}
                {logs.length === 0 ? (
                  <div className="py-12 text-center space-y-2 border border-dashed border-[#DE72B5]/20 rounded-2xl bg-[#1D0F22]/40 mt-2">
                    <PieIcon className="w-8 h-8 mx-auto text-[#DE72B5]/40" />
                    <p className="text-sm font-semibold text-white font-serif">No Category Data</p>
                    <p className="text-xs text-[#DDD8E2]">Practice time across genres will appear here.</p>
                  </div>
                ) : (
                  <div className="h-44 w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={4}
                          dataKey="minutes"
                        >
                          {categoryPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="#1D0F22" strokeWidth={2} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-[#1D0F22] border border-[#DE72B5]/40 rounded-xl p-2.5 shadow-xl text-xs space-y-1">
                                  <p className="font-bold text-white font-serif">{data.name}</p>
                                  <p className="text-[#FFBBE2] font-mono">
                                    {data.minutes} mins ({data.hours} hrs) • {data.percentage}%
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Legend List */}
              {logs.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#DE72B5]/20">
                  {categoryPieData.map((cat) => (
                    <div key={cat.category} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-[#DDD8E2] font-medium">{cat.name}</span>
                      </div>
                      <span className="font-mono text-[#DDD8E2]">
                        <strong className="text-white font-bold">{cat.percentage}%</strong> ({cat.hours}h)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Practice Log Timeline */}
          <div className="majestic-card rounded-3xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-serif">Practice Log History Timeline</h3>
                <p className="text-xs text-[#DDD8E2]">Chronological history of recorded practice drills</p>
              </div>
              <span className="text-xs font-mono font-bold text-[#DE72B5]">{logs.length} Recorded Entries</span>
            </div>

            {logs.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#DDD8E2]">
                No practice entries logged yet. Click 'Log Practice Session' or launch the Practice Timer to record your first entry.
              </div>
            ) : (
              <div className="divide-y divide-[#4D2B5B]/60">
                {logs.map((log) => (
                  <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#40234D] border border-[#DE72B5]/30 flex items-center justify-center text-[#DE72B5] shrink-0 mt-0.5 shadow-sm">
                        <Music className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white">{log.songTitle}</h4>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#2D1A36] text-[#DE72B5] uppercase font-bold border border-[#DE72B5]/20">
                            {log.category.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[#DDD8E2] mt-0.5">
                          <span>{log.date}</span>
                          <span>•</span>
                          <span className="text-[#DE72B5] font-bold">{log.durationMinutes} mins</span>
                          {log.tempoAchievedBpm && <span>• {log.tempoAchievedBpm} BPM</span>}
                          {log.measuresFocused && <span>• {log.measuresFocused}</span>}
                        </div>
                        {log.notes && <p className="text-[11px] text-[#FFBBE2]/90 mt-1 italic">"{log.notes}"</p>}
                      </div>
                    </div>

                    {log.rating && (
                      <div className="text-xs text-[#DE72B5] font-semibold shrink-0">
                        {'★'.repeat(log.rating)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
