import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  Flame,
  Calendar,
  CheckCircle2,
  Music,
  BarChart3,
  Layers,
} from 'lucide-react';
import { Habit, HabitCompletionRecord, PianoSong, PianoPracticeLog } from '../types';

interface VisualDashboardProps {
  habits: Habit[];
  completions: HabitCompletionRecord[];
  songs: PianoSong[];
  pianoLogs: PianoPracticeLog[];
}

export function VisualDashboard({
  habits,
  completions,
  songs,
  pianoLogs,
}: VisualDashboardProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');
  const [selectedHabitFilter] = useState<string>('all');

  // Compute 30 days dates
  const past30Days = useMemo(() => {
    const days: string[] = [];
    const today = new Date();
    const count = timeRange === '7d' ? 7 : 30;
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  }, [timeRange]);

  // Compute daily completion rates
  const dailyStats = useMemo(() => {
    return past30Days.map((dateStr) => {
      const activeHabitsCount = habits.filter((h) => !h.archived).length || 1;
      const completedOnDate = completions.filter(
        (c) => c.date === dateStr && c.completed && (selectedHabitFilter === 'all' || c.habitId === selectedHabitFilter)
      ).length;

      const totalTarget = selectedHabitFilter === 'all' ? activeHabitsCount : 1;
      const percentage = Math.min(100, Math.round((completedOnDate / totalTarget) * 100));

      const d = new Date(dateStr + 'T00:00:00');
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'narrow' });
      const dateFormatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      return {
        date: dateStr,
        dayLabel,
        dateFormatted,
        percentage,
        completedCount: completedOnDate,
        totalTarget,
      };
    });
  }, [past30Days, habits, completions, selectedHabitFilter]);

  // Summary Metrics
  const overallStats = useMemo(() => {
    const totalPossible = past30Days.length * (habits.filter((h) => !h.archived).length || 1);
    const totalCompleted = completions.filter((c) => past30Days.includes(c.date) && c.completed).length;
    const avgRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

    const totalPianoMins = pianoLogs.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
    const pianoHours = (totalPianoMins / 60).toFixed(1);

    const bestCurrentStreak = habits.reduce((max, h) => {
      let streak = 0;
      for (const d of past30Days) {
        const isComp = completions.some((c) => c.habitId === h.id && c.date === d && c.completed);
        if (isComp) streak++;
        else break;
      }
      return Math.max(max, streak);
    }, 0);

    return {
      avgRate,
      totalCompleted,
      pianoHours,
      bestCurrentStreak,
    };
  }, [past30Days, habits, completions, pianoLogs]);

  // Category rates
  const categoryStats = useMemo(() => {
    const cats: Record<string, { total: number; completed: number; color: string }> = {
      piano: { total: 0, completed: 0, color: '#DE72B5' },
      health: { total: 0, completed: 0, color: '#C8A2DA' },
      learning: { total: 0, completed: 0, color: '#C7A252' },
      mindset: { total: 0, completed: 0, color: '#E5C478' },
      productivity: { total: 0, completed: 0, color: '#B63E88' },
    };

    habits.forEach((h) => {
      const cat = h.category || 'piano';
      if (!cats[cat]) {
        cats[cat] = { total: 0, completed: 0, color: '#DE72B5' };
      }
      past30Days.forEach((date) => {
        cats[cat].total += 1;
        if (completions.some((c) => c.habitId === h.id && c.date === date && c.completed)) {
          cats[cat].completed += 1;
        }
      });
    });

    return Object.entries(cats)
      .map(([category, data]) => ({
        category,
        rate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
        color: data.color,
      }))
      .filter((c) => c.rate > 0 || c.category === 'piano');
  }, [habits, completions, past30Days]);

  // Piano songs breakdown
  const masteryStats = useMemo(() => {
    const counts = {
      mastered: songs.filter((s) => s.status === 'mastered').length,
      polishing: songs.filter((s) => s.status === 'polishing').length,
      practicing: songs.filter((s) => s.status === 'practicing').length,
      learning: songs.filter((s) => s.status === 'learning').length,
    };
    return counts;
  }, [songs]);

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="majestic-card rounded-2xl p-4 shadow-md flex flex-col justify-between border border-[#DE72B5]/20">
          <div className="flex items-center justify-between text-[#DDD8E2]">
            <span className="text-xs font-semibold">Average Consistency</span>
            <div className="p-1.5 rounded-xl bg-[#40234D] text-[#DE72B5] border border-[#DE72B5]/30">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-white">
              {overallStats.avgRate}%
            </span>
            <p className="text-[11px] text-[#DE72B5] mt-0.5 font-bold">Across {past30Days.length} days</p>
          </div>
        </div>

        <div className="majestic-card rounded-2xl p-4 shadow-md flex flex-col justify-between border border-[#DE72B5]/20">
          <div className="flex items-center justify-between text-[#DDD8E2]">
            <span className="text-xs font-semibold">Best Active Streak</span>
            <div className="p-1.5 rounded-xl bg-[#40234D] text-amber-300 border border-amber-500/30">
              <Flame className="w-4 h-4 fill-amber-300" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-white">
              {overallStats.bestCurrentStreak} <span className="text-sm text-[#DDD8E2]">days</span>
            </span>
            <p className="text-[11px] text-amber-300 mt-0.5 font-bold">Continuous momentum</p>
          </div>
        </div>

        <div className="majestic-card rounded-2xl p-4 shadow-md flex flex-col justify-between border border-[#DE72B5]/20">
          <div className="flex items-center justify-between text-[#DDD8E2]">
            <span className="text-xs font-semibold">Piano Practice Time</span>
            <div className="p-1.5 rounded-xl bg-[#40234D] text-[#FFBBE2] border border-[#DE72B5]/30">
              <Music className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-white">
              {overallStats.pianoHours} <span className="text-sm text-[#DDD8E2]">hrs</span>
            </span>
            <p className="text-[11px] text-[#DE72B5] mt-0.5 font-bold">{pianoLogs.length} total sessions logged</p>
          </div>
        </div>

        <div className="majestic-card rounded-2xl p-4 shadow-md flex flex-col justify-between border border-[#DE72B5]/20">
          <div className="flex items-center justify-between text-[#DDD8E2]">
            <span className="text-xs font-semibold">Check-offs Logged</span>
            <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-white">
              {overallStats.totalCompleted}
            </span>
            <p className="text-[11px] text-emerald-300 mt-0.5 font-bold">Syncs with Google Sheets</p>
          </div>
        </div>
      </div>

      {/* Main Interactive Daily Trend Chart */}
      <div className="majestic-card rounded-3xl p-5 sm:p-6 shadow-xl border border-[#DE72B5]/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#DE72B5]/20">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 font-serif uppercase tracking-wider">
              <BarChart3 className="w-4 h-4 text-[#DE72B5]" />
              Daily Habit Completion Trends
            </h3>
            <p className="text-xs text-[#DDD8E2]">Interactive visual log of daily achievement rates</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 p-1 bg-[#1D0F22] rounded-xl border border-[#4D2B5B] text-xs">
              <button
                id="range-7d-btn"
                onClick={() => setTimeRange('7d')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  timeRange === '7d' ? 'majestic-btn-primary' : 'text-[#B8A9C2] hover:text-white'
                }`}
              >
                7 Days
              </button>
              <button
                id="range-30d-btn"
                onClick={() => setTimeRange('30d')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  timeRange === '30d' ? 'majestic-btn-primary' : 'text-[#B8A9C2] hover:text-white'
                }`}
              >
                30 Days
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Visual Bar Chart */}
        <div className="mt-6">
          <div className="h-44 sm:h-52 flex items-end gap-1 sm:gap-2 pb-2">
            {dailyStats.map((item, idx) => {
              const heightPct = Math.max(8, item.percentage);
              const isHigh = item.percentage >= 80;
              const isMid = item.percentage >= 50 && item.percentage < 80;

              return (
                <div
                  key={item.date}
                  className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-12 z-20 hidden group-hover:flex flex-col items-center bg-[#100713] border border-[#DE72B5]/40 rounded-xl py-1 px-2.5 text-[10px] text-white shadow-2xl pointer-events-none whitespace-nowrap">
                    <span className="font-bold text-[#FFBBE2] font-mono">{item.percentage}% Done</span>
                    <span className="text-[#DDD8E2]">{item.dateFormatted}</span>
                  </div>

                  {/* Visual Bar */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPct}%` }}
                    transition={{ duration: 0.4, delay: idx * 0.015 }}
                    className={`w-full max-w-[28px] rounded-t-lg transition-all ${
                      isHigh
                        ? 'bg-gradient-to-t from-[#B63E88] to-[#DE72B5] group-hover:brightness-110 shadow-md shadow-[#DE72B5]/30'
                        : isMid
                        ? 'bg-[#9D6EB0] group-hover:bg-[#DE72B5]'
                        : 'bg-[#2D1A36] group-hover:bg-[#40234D] border border-[#4D2B5B]'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Date baseline labels */}
          <div className="flex justify-between items-center text-[10px] sm:text-xs text-[#DDD8E2] pt-2 border-t border-[#DE72B5]/20">
            <span>{dailyStats[0]?.dateFormatted}</span>
            <span className="hidden sm:inline">Mid Period</span>
            <span>{dailyStats[dailyStats.length - 1]?.dateFormatted}</span>
          </div>
        </div>
      </div>

      {/* 30-Day Activity Heatmap Grid */}
      <div className="majestic-card rounded-3xl p-5 sm:p-6 shadow-xl border border-[#DE72B5]/20">
        <div className="flex items-center justify-between pb-3 border-b border-[#DE72B5]/20">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 font-serif uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-[#DE72B5]" />
              Consistency Heatmap Matrix
            </h3>
            <p className="text-xs text-[#DDD8E2]">Daily habit fulfillment grid</p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-[#DDD8E2]">
            <span>Less</span>
            <div className="w-3 h-3 rounded bg-[#2D1A36] border border-[#4D2B5B]" />
            <div className="w-3 h-3 rounded bg-[#4A1037]" />
            <div className="w-3 h-3 rounded bg-[#8C2666]" />
            <div className="w-3 h-3 rounded bg-[#DE72B5]" />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Squares */}
        <div className="grid grid-cols-7 sm:grid-cols-10 gap-2 sm:gap-2.5 mt-5">
          {dailyStats.map((item) => {
            let bg = 'bg-[#2D1A36] border-[#4D2B5B] text-[#B8A9C2]';
            if (item.percentage >= 90) bg = 'bg-gradient-to-br from-[#B63E88] to-[#DE72B5] text-white font-bold border-[#FFBBE2]/50 shadow-md';
            else if (item.percentage >= 60) bg = 'bg-[#8C2666] text-white border-[#DE72B5]/40';
            else if (item.percentage > 0) bg = 'bg-[#4A1037] text-[#FFBBE2] border-[#8C2666]/50';

            return (
              <div
                key={item.date}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-transform hover:scale-105 cursor-pointer ${bg}`}
                title={`${item.dateFormatted}: ${item.percentage}% (${item.completedCount}/${item.totalTarget})`}
              >
                <span className="text-[10px] opacity-80">{item.dayLabel}</span>
                <span className="text-xs font-mono font-bold mt-0.5">{item.date.split('-')[2]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Breakdown & Piano Repertoire Mastery */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category Breakdown */}
        <div className="majestic-card rounded-3xl p-5 shadow-xl border border-[#DE72B5]/20">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1 font-serif uppercase tracking-wider">
            <Layers className="w-4 h-4 text-[#DE72B5]" />
            Life Balance &amp; Category Breakdown
          </h3>
          <p className="text-xs text-[#DDD8E2] mb-4">Fulfillment distribution across domains</p>

          <div className="space-y-3.5">
            {categoryStats.map((cat) => (
              <div key={cat.category}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="capitalize font-semibold text-white flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    {cat.category}
                  </span>
                  <span className="font-mono text-[#FFBBE2] font-bold">{cat.rate}%</span>
                </div>
                <div className="w-full h-2 bg-[#2D1A36] rounded-full overflow-hidden border border-[#4D2B5B]/40">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.rate}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Piano Repertoire Mastery Status */}
        <div className="majestic-card rounded-3xl p-5 shadow-xl border border-[#DE72B5]/20">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1 font-serif uppercase tracking-wider">
            <Music className="w-4 h-4 text-[#DE72B5]" />
            Piano Repertoire Mastery Portfolio
          </h3>
          <p className="text-xs text-[#DDD8E2] mb-4">
            {songs.length} total curated classical pieces, hymns, and communion songs
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-[#40234D]/80 border border-[#DE72B5]/30 rounded-2xl p-3.5 text-center shadow-sm">
              <span className="text-2xl font-mono font-bold text-[#FFBBE2]">{masteryStats.mastered}</span>
              <p className="text-xs text-[#DDD8E2] font-bold mt-0.5">Mastered &amp; Polished</p>
            </div>
            <div className="bg-[#40234D]/80 border border-[#DE72B5]/30 rounded-2xl p-3.5 text-center shadow-sm">
              <span className="text-2xl font-mono font-bold text-[#DE72B5]">{masteryStats.polishing}</span>
              <p className="text-xs text-[#DDD8E2] font-bold mt-0.5">In Active Polishing</p>
            </div>
            <div className="bg-[#2D1A36] border border-[#4D2B5B] rounded-2xl p-3.5 text-center shadow-sm">
              <span className="text-2xl font-mono font-bold text-amber-300">{masteryStats.practicing}</span>
              <p className="text-xs text-[#DDD8E2] font-semibold mt-0.5">Hands Together Drills</p>
            </div>
            <div className="bg-[#2D1A36] border border-[#4D2B5B] rounded-2xl p-3.5 text-center shadow-sm">
              <span className="text-2xl font-mono font-bold text-[#DDD8E2]">{masteryStats.learning}</span>
              <p className="text-xs text-[#DDD8E2] font-semibold mt-0.5">Learning Initial Notes</p>
            </div>
          </div>

          <div className="bg-[#1D0F22] rounded-2xl p-3 border border-[#4D2B5B] flex items-center justify-between text-xs text-[#DDD8E2]">
            <span>Recent Practice Routine:</span>
            <span className="font-bold text-[#FFBBE2]">
              {pianoLogs[0]?.songTitle || 'Clair de Lune'} ({pianoLogs[0]?.date || 'Today'})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
