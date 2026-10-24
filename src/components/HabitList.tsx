import { useState, useMemo, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  Sparkles,
  Search,
  Filter,
  CheckCheck,
  RotateCcw,
  Target,
  Bookmark,
  Sun,
  Sunrise,
  Sunset,
  Clock,
  Compass,
  Trophy,
  Sliders,
  Check,
  Star,
  ArrowUpDown,
  Trash2,
} from 'lucide-react';
import { Habit, HabitCompletionRecord, HabitCategory, HabitFrequency, RoutineTime, HabitDifficulty } from '../types';
import { SlideHabitItem } from './SlideHabitItem';
import { RoutinePresetsModal } from './RoutinePresetsModal';
import { ReorderHabitsModal } from './ReorderHabitsModal';
import { DeleteHabitModal } from './DeleteHabitModal';
import { RoutinePreset, ROUTINE_PRESETS } from '../services/storage';
import { soundService } from '../services/audio';
import { fireSafeConfetti } from '../services/celebration';

interface HabitListProps {
  habits: Habit[];
  completions: HabitCompletionRecord[];
  selectedDate: string; // YYYY-MM-DD
  dailyHabitGoal: number;
  onUpdateDailyGoal: (goal: number) => void;
  onSelectDate: (date: string) => void;
  onToggleHabit: (habitId: string, completed: boolean, date: string) => void;
  onAddHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
  onDeleteHabit: (habitId: string) => void;
  onReorderHabits: (reorderedHabits: Habit[]) => void;
  onApplyRoutinePreset: (preset: RoutinePreset, mode: 'replace' | 'append') => void;
}

export function HabitList({
  habits,
  completions,
  selectedDate,
  dailyHabitGoal,
  onUpdateDailyGoal,
  onSelectDate,
  onToggleHabit,
  onAddHabit,
  onDeleteHabit,
  onReorderHabits,
  onApplyRoutinePreset,
}: HabitListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [routineFilter, setRoutineFilter] = useState<'all' | 'routine_only' | 'morning' | 'afternoon' | 'evening'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [isGoalEditorOpen, setIsGoalEditorOpen] = useState(false);

  // New Habit Form fields
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState<HabitCategory>('creativity');
  const [newHabitDescription, setNewHabitDescription] = useState('');
  const [newHabitFrequency, setNewHabitFrequency] = useState<HabitFrequency>('daily');
  const [newHabitTarget, setNewHabitTarget] = useState(1);
  const [newHabitUnit, setNewHabitUnit] = useState('session');
  const [newHabitColor, setNewHabitColor] = useState('#0d9488');
  const [newHabitOrder, setNewHabitOrder] = useState<number>(habits.length + 1);
  const [newHabitIsRoutine, setNewHabitIsRoutine] = useState(true);
  const [newHabitRoutineTime, setNewHabitRoutineTime] = useState<RoutineTime>('morning');
  const [newHabitDifficulty, setNewHabitDifficulty] = useState<HabitDifficulty>('beginner');

  // Date manipulation
  const handlePrevDay = () => {
    soundService.playSlideClick();
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    onSelectDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    soundService.playSlideClick();
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    onSelectDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    soundService.playSlideClick();
    onSelectDate(new Date().toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const formattedDate = useMemo(() => {
    const d = new Date(selectedDate + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  }, [selectedDate]);

  // Sort habits by order ascending
  const sortedHabits = useMemo(() => {
    return [...habits].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [habits]);

  // Filter habits based on category, routine filter, and search
  const filteredHabits = useMemo(() => {
    return sortedHabits.filter((h) => {
      if (h.archived) return false;
      if (selectedCategory !== 'all' && h.category !== selectedCategory) return false;

      if (routineFilter === 'routine_only' && !h.isRoutine) return false;
      if (routineFilter === 'morning' && h.routineTime !== 'morning') return false;
      if (routineFilter === 'afternoon' && h.routineTime !== 'afternoon') return false;
      if (routineFilter === 'evening' && h.routineTime !== 'evening') return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          h.name.toLowerCase().includes(q) ||
          (h.description && h.description.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [sortedHabits, selectedCategory, routineFilter, searchQuery]);

  // Compute streaks for each habit
  const habitStreaks = useMemo(() => {
    const streaks: Record<string, number> = {};
    const today = new Date();

    habits.forEach((habit) => {
      let streak = 0;
      for (let i = 0; i < 45; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const isDone = completions.some(
          (c) => c.habitId === habit.id && c.date === dateStr && c.completed
        );

        if (isDone) {
          streak++;
        } else if (i > 0) {
          break;
        }
      }
      streaks[habit.id] = streak;
    });

    return streaks;
  }, [habits, completions]);

  // Daily completion calculations
  const totalHabitsCount = habits.filter((h) => !h.archived).length || 1;
  const completedTodayCount = habits.filter((h) =>
    completions.some((c) => c.habitId === h.id && c.date === selectedDate && c.completed)
  ).length;

  const currentGoalTarget = Math.max(1, dailyHabitGoal || 5);
  const goalPercent = Math.min(100, Math.round((completedTodayCount / currentGoalTarget) * 100));
  const isGoalReached = completedTodayCount >= currentGoalTarget;

  // Manual Move Up / Move Down handler
  const handleMoveHabit = (habitId: string, direction: 'up' | 'down') => {
    const currentList = [...sortedHabits];
    const index = currentList.findIndex((h) => h.id === habitId);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      const temp = currentList[index];
      currentList[index] = currentList[index - 1];
      currentList[index - 1] = temp;
    } else if (direction === 'down' && index < currentList.length - 1) {
      const temp = currentList[index];
      currentList[index] = currentList[index + 1];
      currentList[index + 1] = temp;
    }

    // Reassign orders 1..N
    const reordered = currentList.map((h, i) => ({
      ...h,
      order: i + 1,
    }));

    onReorderHabits(reordered);
  };

  // Move directly to top (Position #1)
  const handleMoveToTop = (habitId: string) => {
    const currentList = [...sortedHabits];
    const index = currentList.findIndex((h) => h.id === habitId);
    if (index === -1 || index === 0) return;

    const [item] = currentList.splice(index, 1);
    currentList.unshift(item);

    const reordered = currentList.map((h, i) => ({
      ...h,
      order: i + 1,
    }));

    onReorderHabits(reordered);
  };

  // Move directly to bottom
  const handleMoveToBottom = (habitId: string) => {
    const currentList = [...sortedHabits];
    const index = currentList.findIndex((h) => h.id === habitId);
    if (index === -1 || index === currentList.length - 1) return;

    const [item] = currentList.splice(index, 1);
    currentList.push(item);

    const reordered = currentList.map((h, i) => ({
      ...h,
      order: i + 1,
    }));

    onReorderHabits(reordered);
  };

  // Set explicit 1 to 20 rank position
  const handleSetHabitOrder = (habitId: string, targetOrder: number) => {
    const currentList = [...sortedHabits];
    const itemIndex = currentList.findIndex((h) => h.id === habitId);
    if (itemIndex === -1) return;

    const [removed] = currentList.splice(itemIndex, 1);
    const insertIndex = Math.min(Math.max(0, targetOrder - 1), currentList.length);
    currentList.splice(insertIndex, 0, removed);

    // Re-normalize 1..N
    const reordered = currentList.map((h, i) => ({
      ...h,
      order: i + 1,
    }));

    onReorderHabits(reordered);
  };

  // Toggle routine status on a habit
  const handleToggleRoutine = (habitId: string) => {
    const updated = habits.map((h) => {
      if (h.id === habitId) {
        return { ...h, isRoutine: !h.isRoutine };
      }
      return h;
    });
    onReorderHabits(updated);
  };

  const handleSetRoutineTime = (habitId: string, time: RoutineTime) => {
    const updated = habits.map((h) => {
      if (h.id === habitId) {
        return { ...h, routineTime: time, isRoutine: true };
      }
      return h;
    });
    onReorderHabits(updated);
  };

  // Delete flow with confirmation
  const handleRequestDelete = (habit: Habit) => {
    soundService.playSlideClick();
    setHabitToDelete(habit);
  };

  const handleConfirmDelete = (habitId: string) => {
    onDeleteHabit(habitId);
    soundService.playSlideClick();
    setHabitToDelete(null);
  };

  // 1-Click Set For Beginners
  const handleQuickSetBeginners = () => {
    const beginnerPreset = ROUTINE_PRESETS.find((p) => p.id === 'beginner_starter');
    if (beginnerPreset) {
      onApplyRoutinePreset(beginnerPreset, 'replace');
      onUpdateDailyGoal(4);
      soundService.playHabitComplete();
      fireSafeConfetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#0d9488', '#2dd4bf', '#10b981', '#fbbf24'],
      });
    }
  };

  const handleCreateHabitSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    onAddHabit({
      name: newHabitName.trim(),
      category: newHabitCategory,
      description: newHabitDescription.trim() || undefined,
      frequency: newHabitFrequency,
      targetCount: newHabitTarget,
      unit: newHabitUnit.trim() || 'session',
      color: newHabitColor,
      order: newHabitOrder || habits.length + 1,
      isRoutine: newHabitIsRoutine,
      routineTime: newHabitRoutineTime,
      difficulty: newHabitDifficulty,
    });

    soundService.playHabitComplete();
    setIsAddModalOpen(false);
    setNewHabitName('');
    setNewHabitDescription('');
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Date Navigation & Daily Progress Goal Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
        {/* Date Selector Row */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              id="prev-date-btn"
              onClick={handlePrevDay}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="text-left px-1">
              <span className="text-base sm:text-lg font-bold text-white block">
                {formattedDate}
              </span>
              <span className="text-[11px] text-teal-400 font-medium">
                {isToday ? '• Today' : selectedDate}
              </span>
            </div>

            <button
              id="next-date-btn"
              onClick={handleNextDay}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Action buttons in header */}
          <div className="flex items-center gap-2 flex-wrap">
            {!isToday && (
              <button
                id="jump-today-btn"
                onClick={handleToday}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
              >
                Jump to Today
              </button>
            )}

            {/* Prominent Reorder Habits Button */}
            <button
              id="open-reorder-habits-btn"
              onClick={() => {
                soundService.playSlideClick();
                setIsReorderModalOpen(true);
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold rounded-xl border border-teal-500/40 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              title="Reorder and rearrange habit priorities (1-20)"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-teal-400" />
              <span>Reorder</span>
            </button>

            <button
              id="open-routine-presets-btn"
              onClick={() => {
                soundService.playSlideClick();
                setIsPresetsModalOpen(true);
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
              title="Routine Presets & Starter Packs"
            >
              <Compass className="w-3.5 h-3.5 text-teal-400" />
              <span>Packs</span>
            </button>

            <button
              id="add-new-habit-btn"
              onClick={() => {
                soundService.playSlideClick();
                setNewHabitOrder(habits.length + 1);
                setIsAddModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Habit
            </button>
          </div>
        </div>

        {/* Daily Habit Goal as Task & Progress Indicator */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs sm:text-sm flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-200 font-semibold flex items-center gap-1.5">
                <Target className="w-4 h-4 text-teal-400" />
                Daily Habit Goal:
              </span>
              <span className="font-bold text-teal-300">
                {completedTodayCount} of {currentGoalTarget} Tasks Done
              </span>

              {/* Goal Editor Trigger */}
              <button
                id="edit-daily-goal-btn"
                onClick={() => setIsGoalEditorOpen(!isGoalEditorOpen)}
                className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[11px] font-medium border border-slate-700 flex items-center gap-1 transition-colors"
                title="Adjust Daily Goal Target (1-20)"
              >
                <Sliders className="w-3 h-3 text-teal-400" />
                <span>Target: {currentGoalTarget}/day</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {isGoalReached && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1 animate-pulse">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  Goal Achieved!
                </span>
              )}
              <span className="font-mono font-bold text-teal-300">{goalPercent}%</span>
            </div>
          </div>

          {/* Goal Selector Popover */}
          {isGoalEditorOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-950/80 border border-slate-700/80 rounded-2xl p-3 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">Set Daily Habit Goal Target (1 - 20 tasks/day):</span>
                <button onClick={() => setIsGoalEditorOpen(false)} className="text-slate-400 hover:text-white text-xs">
                  Done ✕
                </button>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    id={`set-goal-${num}`}
                    onClick={() => {
                      soundService.playSlideClick();
                      onUpdateDailyGoal(num);
                    }}
                    className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all ${
                      num === currentGoalTarget
                        ? 'bg-teal-500 text-slate-950 shadow-md scale-105'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/50'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Progress Bar */}
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${goalPercent}%` }}
              transition={{ duration: 0.5 }}
              className={`h-full rounded-full transition-all ${
                isGoalReached
                  ? 'bg-gradient-to-r from-teal-500 via-emerald-400 to-amber-400 shadow-sm shadow-teal-500/30'
                  : 'bg-gradient-to-r from-teal-500 to-teal-300'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Routine Presets & Reorder Quick Bar */}
      <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-200 block">Manage &amp; Reorder Habits</span>
            <span className="text-[11px] text-slate-400">Rearrange cards (1–20), delete habits, or apply routine packs</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="reorder-bar-btn"
            onClick={() => {
              soundService.playSlideClick();
              setIsReorderModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold transition-all flex items-center gap-1.5"
            title="Open Habit Reorder Manager"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-teal-400" />
            <span>Reorder List</span>
          </button>

          <button
            id="quick-set-beginners-btn"
            onClick={handleQuickSetBeginners}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all flex items-center gap-1.5"
            title="Apply 5 foundational habits for beginners"
          >
            <Star className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
            <span>Beginner Pack</span>
          </button>
        </div>
      </div>

      {/* Routine Filter & Category Filter Tabs */}
      <div className="space-y-2">
        {/* Routine Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
          <span className="text-[11px] font-semibold text-slate-400 px-1 shrink-0 flex items-center gap-1">
            <Bookmark className="w-3 h-3 text-teal-400" />
            Routine:
          </span>
          {[
            { id: 'all', label: `All Habits (${habits.length})` },
            { id: 'routine_only', label: '🌟 Routine Only' },
            { id: 'morning', label: '🌅 Morning' },
            { id: 'afternoon', label: '☀️ Afternoon' },
            { id: 'evening', label: '🌙 Evening' },
          ].map((rf) => (
            <button
              key={rf.id}
              id={`routine-filter-${rf.id}`}
              onClick={() => {
                soundService.playSlideClick();
                setRoutineFilter(rf.id as typeof routineFilter);
              }}
              className={`px-3 py-1 text-xs rounded-xl whitespace-nowrap font-medium transition-all ${
                routineFilter === rf.id
                  ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {rf.label}
            </button>
          ))}
        </div>

        {/* Category Pills & Search */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full scrollbar-none">
            {[
              { id: 'all', label: 'All Categories' },
              { id: 'creativity', label: 'Piano & Music' },
              { id: 'faith', label: 'Faith & Devotion' },
              { id: 'health', label: 'Health' },
              { id: 'fitness', label: 'Fitness' },
              { id: 'productivity', label: 'Focus' },
              { id: 'mindset', label: 'Mindset' },
            ].map((cat) => (
              <button
                key={cat.id}
                id={`cat-filter-${cat.id}`}
                onClick={() => {
                  soundService.playSlideClick();
                  setSelectedCategory(cat.id);
                }}
                className={`px-2.5 py-1 text-xs rounded-xl whitespace-nowrap font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-slate-700 text-white font-bold border border-slate-600'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="habit-search-input"
              type="text"
              placeholder="Search habits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Slide-to-Check Habit Cards List with 1-20 Reorder & Delete Controls */}
      <div className="space-y-2.5">
        <AnimatePresence>
          {filteredHabits.map((habit, index) => {
            const isCompleted = completions.some(
              (c) => c.habitId === habit.id && c.date === selectedDate && c.completed
            );
            const streak = habitStreaks[habit.id] || 0;

            return (
              <SlideHabitItem
                key={habit.id}
                habit={habit}
                index={index}
                totalCount={filteredHabits.length}
                isCompleted={isCompleted}
                streakCount={streak}
                onToggle={(completed) => onToggleHabit(habit.id, completed, selectedDate)}
                onMoveUp={() => handleMoveHabit(habit.id, 'up')}
                onMoveDown={() => handleMoveHabit(habit.id, 'down')}
                onMoveToTop={() => handleMoveToTop(habit.id)}
                onMoveToBottom={() => handleMoveToBottom(habit.id)}
                onSetOrder={(newOrder) => handleSetHabitOrder(habit.id, newOrder)}
                onToggleRoutine={() => handleToggleRoutine(habit.id)}
                onSetRoutineTime={(time) => handleSetRoutineTime(habit.id, time)}
                onDelete={() => handleRequestDelete(habit)}
              />
            );
          })}
        </AnimatePresence>

        {filteredHabits.length === 0 && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-3">
            <p className="text-sm font-medium">No habits found in this filter.</p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={handleQuickSetBeginners}
                className="px-3.5 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-1.5"
              >
                <Star className="w-3.5 h-3.5" />
                Set Beginner Routine
              </button>
              <button
                onClick={() => {
                  setNewHabitOrder(habits.length + 1);
                  setIsAddModalOpen(true);
                }}
                className="px-3.5 py-1.5 bg-teal-500 text-slate-950 text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Create a habit
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Routine Presets Modal */}
      <RoutinePresetsModal
        isOpen={isPresetsModalOpen}
        onClose={() => setIsPresetsModalOpen(false)}
        onApplyPreset={onApplyRoutinePreset}
        currentHabitsCount={habits.length}
      />

      {/* Full Reorder & Manage Modal */}
      <ReorderHabitsModal
        isOpen={isReorderModalOpen}
        onClose={() => setIsReorderModalOpen(false)}
        habits={habits}
        onReorder={onReorderHabits}
        onDeleteRequest={(h) => {
          setIsReorderModalOpen(false);
          handleRequestDelete(h);
        }}
      />

      {/* Delete Habit Confirmation Dialog */}
      <DeleteHabitModal
        habit={habitToDelete}
        isOpen={!!habitToDelete}
        onClose={() => setHabitToDelete(null)}
        onConfirmDelete={handleConfirmDelete}
      />

      {/* Add Habit Modal with 1-20 Position, Difficulty and Routine Settings */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 my-auto space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Create New Habit / Task</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateHabitSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Habit Name *</label>
                <input
                  id="create-habit-name"
                  type="text"
                  required
                  placeholder="e.g. Read 1 Psalm, 20 Min Piano Practice..."
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                  <select
                    id="create-habit-cat"
                    value={newHabitCategory}
                    onChange={(e) => setNewHabitCategory(e.target.value as HabitCategory)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="creativity">Piano &amp; Music</option>
                    <option value="faith">Faith &amp; Devotion</option>
                    <option value="health">Health &amp; Wellness</option>
                    <option value="fitness">Fitness &amp; Movement</option>
                    <option value="productivity">Deep Productivity</option>
                    <option value="mindset">Mindset &amp; Reading</option>
                    <option value="other">Other Routine</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Priority Rank (1 - 20)</label>
                  <select
                    id="create-habit-order"
                    value={newHabitOrder}
                    onChange={(e) => setNewHabitOrder(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                  >
                    {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        Position #{n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Routine Time Slot</label>
                  <select
                    id="create-habit-routine-time"
                    value={newHabitRoutineTime}
                    onChange={(e) => setNewHabitRoutineTime(e.target.value as RoutineTime)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 capitalize"
                  >
                    <option value="morning">🌅 Morning Routine</option>
                    <option value="afternoon">☀️ Afternoon Focus</option>
                    <option value="evening">🌙 Evening Wind-down</option>
                    <option value="anytime">⚡ Anytime Routine</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Difficulty Level</label>
                  <select
                    id="create-habit-difficulty"
                    value={newHabitDifficulty}
                    onChange={(e) => setNewHabitDifficulty(e.target.value as HabitDifficulty)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 capitalize"
                  >
                    <option value="beginner">Beginner (Gentle)</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Description / Notes</label>
                <input
                  id="create-habit-desc"
                  type="text"
                  placeholder="e.g. 30 mins focused repertoire practice"
                  value={newHabitDescription}
                  onChange={(e) => setNewHabitDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="create-habit-is-routine"
                  checked={newHabitIsRoutine}
                  onChange={(e) => setNewHabitIsRoutine(e.target.checked)}
                  className="rounded border-slate-700 text-teal-500 focus:ring-teal-400 w-4 h-4 bg-slate-800"
                />
                <label htmlFor="create-habit-is-routine" className="text-xs text-slate-300 font-medium cursor-pointer">
                  Mark as Core Routine Habit (Appears in routine filter)
                </label>
              </div>

              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="create-habit-submit"
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-teal-400 transition-colors shadow-md"
                >
                  Create Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
