import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  ChevronsUp,
  ChevronsDown,
  Trash2,
  X,
  Sparkles,
  Check,
  RotateCcw,
  Sun,
  Sunrise,
  Sunset,
  Clock,
  Bookmark,
  GripVertical,
} from 'lucide-react';
import { Habit, RoutineTime } from '../types';
import { soundService } from '../services/audio';

interface ReorderHabitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  habits: Habit[];
  onReorder: (reorderedHabits: Habit[]) => void;
  onDeleteRequest: (habit: Habit) => void;
}

export function ReorderHabitsModal({
  isOpen,
  onClose,
  habits,
  onReorder,
  onDeleteRequest,
}: ReorderHabitsModalProps) {
  const [localHabits, setLocalHabits] = useState<Habit[]>(() => {
    return [...habits].sort((a, b) => (a.order || 0) - (b.order || 0));
  });

  if (!isOpen) return null;

  // Sync state if habits count changed externally
  const handleMove = (index: number, direction: 'up' | 'down' | 'top' | 'bottom') => {
    soundService.playSlideClick();
    const updated = [...localHabits];
    const item = updated[index];

    if (direction === 'up' && index > 0) {
      updated.splice(index, 1);
      updated.splice(index - 1, 0, item);
    } else if (direction === 'down' && index < updated.length - 1) {
      updated.splice(index, 1);
      updated.splice(index + 1, 0, item);
    } else if (direction === 'top' && index > 0) {
      updated.splice(index, 1);
      updated.unshift(item);
    } else if (direction === 'bottom' && index < updated.length - 1) {
      updated.splice(index, 1);
      updated.push(item);
    }

    const reindexed = updated.map((h, i) => ({ ...h, order: i + 1 }));
    setLocalHabits(reindexed);
    onReorder(reindexed);
  };

  const handleSetPosition = (index: number, targetPos: number) => {
    soundService.playSlideClick();
    const updated = [...localHabits];
    const [item] = updated.splice(index, 1);
    const insertIdx = Math.min(Math.max(0, targetPos - 1), updated.length);
    updated.splice(insertIdx, 0, item);

    const reindexed = updated.map((h, i) => ({ ...h, order: i + 1 }));
    setLocalHabits(reindexed);
    onReorder(reindexed);
  };

  const handleSortByRoutineTime = () => {
    soundService.playSlideClick();
    const orderMap: Record<RoutineTime, number> = {
      morning: 1,
      afternoon: 2,
      evening: 3,
      anytime: 4,
    };

    const sorted = [...localHabits].sort((a, b) => {
      const timeA = orderMap[a.routineTime || 'anytime'] || 4;
      const timeB = orderMap[b.routineTime || 'anytime'] || 4;
      return timeA - timeB;
    });

    const reindexed = sorted.map((h, i) => ({ ...h, order: i + 1 }));
    setLocalHabits(reindexed);
    onReorder(reindexed);
  };

  const handleSortAlphabetically = () => {
    soundService.playSlideClick();
    const sorted = [...localHabits].sort((a, b) => a.name.localeCompare(b.name));
    const reindexed = sorted.map((h, i) => ({ ...h, order: i + 1 }));
    setLocalHabits(reindexed);
    onReorder(reindexed);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl text-slate-100 my-auto space-y-4 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <ArrowUpDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Reorder &amp; Manage Habits</h3>
              <p className="text-xs text-slate-400">Arrange priority ranks (1 to {localHabits.length}) or delete</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Sort Tools Bar */}
        <div className="flex items-center justify-between gap-2 p-2 bg-slate-950/60 rounded-2xl border border-slate-800/80 flex-wrap text-xs shrink-0">
          <span className="text-slate-400 font-medium text-[11px] px-1">Quick Sort:</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleSortByRoutineTime}
              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1"
              title="Sort Morning -> Afternoon -> Evening"
            >
              <Sunrise className="w-3 h-3 text-amber-400" />
              <span>By Time of Day</span>
            </button>
            <button
              onClick={handleSortAlphabetically}
              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
            >
              A → Z
            </button>
          </div>
        </div>

        {/* Habit Reorder List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
          <AnimatePresence>
            {localHabits.map((habit, idx) => (
              <motion.div
                key={habit.id}
                layout
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="p-3 bg-slate-950/80 hover:bg-slate-950 border border-slate-800/90 rounded-2xl flex items-center justify-between gap-2.5 group"
              >
                {/* Left Side: Order & Title */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {/* Position Dropdown */}
                  <select
                    value={idx + 1}
                    onChange={(e) => handleSetPosition(idx, Number(e.target.value))}
                    className="w-11 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-teal-300 font-mono font-bold text-xs text-center focus:outline-none focus:border-teal-500 cursor-pointer shrink-0"
                    title="Change Rank Position"
                  >
                    {Array.from({ length: localHabits.length }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        #{n}
                      </option>
                    ))}
                  </select>

                  {/* Habit Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-semibold text-white truncate">
                        {habit.name}
                      </span>
                      {habit.routineTime && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-teal-300 border border-slate-700 capitalize">
                          {habit.routineTime}
                        </span>
                      )}
                    </div>
                    {habit.description && (
                      <p className="text-[11px] text-slate-400 truncate max-w-xs">{habit.description}</p>
                    )}
                  </div>
                </div>

                {/* Right Side: Reorder Arrows & Delete Button */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Move to Top */}
                  <button
                    onClick={() => handleMove(idx, 'top')}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-teal-300 disabled:opacity-20 disabled:pointer-events-none transition-colors"
                    title="Move to Top"
                  >
                    <ChevronsUp className="w-3.5 h-3.5" />
                  </button>

                  {/* Move Up */}
                  <button
                    onClick={() => handleMove(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors"
                    title="Move Up"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>

                  {/* Move Down */}
                  <button
                    onClick={() => handleMove(idx, 'down')}
                    disabled={idx === localHabits.length - 1}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors"
                    title="Move Down"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Move to Bottom */}
                  <button
                    onClick={() => handleMove(idx, 'bottom')}
                    disabled={idx === localHabits.length - 1}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-teal-300 disabled:opacity-20 disabled:pointer-events-none transition-colors"
                    title="Move to Bottom"
                  >
                    <ChevronsDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => {
                      onDeleteRequest(habit);
                    }}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 transition-colors ml-1"
                    title={`Delete ${habit.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Footer Done button */}
        <div className="pt-2 border-t border-slate-800 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            Done Reordering
          </button>
        </div>
      </motion.div>
    </div>
  );
}
