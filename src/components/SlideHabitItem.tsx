import { useState, useRef, MouseEvent } from 'react';
import { motion, useMotionValue } from 'motion/react';
import {
  Check,
  Flame,
  Music,
  BookOpen,
  Droplets,
  Activity,
  Zap,
  Book,
  Moon,
  Sparkles,
  ChevronUp,
  ChevronDown,
  ChevronsUp,
  ChevronsDown,
  Sun,
  Sunrise,
  Sunset,
  Clock,
  MoreVertical,
  Trash2,
  Bookmark,
  GripVertical,
} from 'lucide-react';
import { Habit, RoutineTime } from '../types';
import { soundService } from '../services/audio';
import { fireSafeConfetti } from '../services/celebration';

interface SlideHabitItemProps {
  key?: string;
  habit: Habit;
  index: number;
  totalCount: number;
  isCompleted: boolean;
  streakCount: number;
  onToggle: (completed: boolean) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onMoveToTop?: () => void;
  onMoveToBottom?: () => void;
  onSetOrder?: (newOrder: number) => void;
  onToggleRoutine?: () => void;
  onSetRoutineTime?: (time: RoutineTime) => void;
  onDelete?: () => void;
}

export function SlideHabitItem({
  habit,
  index,
  totalCount,
  isCompleted,
  streakCount,
  onToggle,
  onMoveUp,
  onMoveDown,
  onMoveToTop,
  onMoveToBottom,
  onSetOrder,
  onToggleRoutine,
  onSetRoutineTime,
  onDelete,
}: SlideHabitItemProps) {
  const [showOrderMenu, setShowOrderMenu] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  const currentOrder = habit.order || index + 1;

  // Trigger celebration
  const triggerCelebration = () => {
    soundService.playHabitComplete();
    fireSafeConfetti({
      particleCount: 28,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#0d9488', '#14b8a6', '#2dd4bf', '#fbbf24', '#6366f1'],
      disableForReducedMotion: true,
    });
  };

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (!isCompleted && info.offset.x > 70) {
      triggerCelebration();
      onToggle(true);
    } else if (isCompleted && info.offset.x < -60) {
      soundService.playSlideClick();
      onToggle(false);
    }
  };

  const handleDirectClickToggle = (e: MouseEvent) => {
    e.stopPropagation();
    if (!isCompleted) {
      triggerCelebration();
      onToggle(true);
    } else {
      soundService.playSlideClick();
      onToggle(false);
    }
  };

  // Dynamic icon
  const renderIcon = () => {
    const props = { className: 'w-4 h-4 sm:w-5 sm:h-5' };
    switch (habit.iconName) {
      case 'Music':
        return <Music {...props} />;
      case 'BookOpen':
        return <BookOpen {...props} />;
      case 'Droplets':
        return <Droplets {...props} />;
      case 'Activity':
        return <Activity {...props} />;
      case 'Zap':
        return <Zap {...props} />;
      case 'Book':
        return <Book {...props} />;
      case 'Moon':
        return <Moon {...props} />;
      default:
        return <Sparkles {...props} />;
    }
  };

  // Time routine badge icon
  const renderRoutineTimeIcon = () => {
    switch (habit.routineTime) {
      case 'morning':
        return <Sunrise className="w-3 h-3 text-amber-400" />;
      case 'afternoon':
        return <Sun className="w-3 h-3 text-amber-300" />;
      case 'evening':
        return <Sunset className="w-3 h-3 text-indigo-300" />;
      default:
        return <Clock className="w-3 h-3 text-teal-400" />;
    }
  };

  const categoryColor = habit.color || '#0d9488';

  return (
    <motion.div
      id={`habit-card-${habit.id}`}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`relative overflow-visible rounded-2xl border transition-all duration-200 select-none ${
        isCompleted
          ? 'bg-teal-950/20 border-teal-500/40 shadow-sm shadow-teal-500/5'
          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-md'
      }`}
    >
      <div className="p-3.5 sm:p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        {/* Left Side: Order Controls, Icon, Details & Delete */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 flex-1 min-w-0 w-full sm:w-auto">
          {/* Manual Reordering Controls (1 - 20 & Up/Down) */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Rank / Order Pill Button (Click to choose 1-20 & options) */}
            <div className="relative">
              <button
                id={`habit-rank-btn-${habit.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOrderMenu(!showOrderMenu);
                }}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1 border transition-all active:scale-95 ${
                  isCompleted
                    ? 'bg-teal-900/40 border-teal-500/40 text-teal-300 hover:bg-teal-900/60'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200 shadow-sm'
                }`}
                title="Tap to change position (1-20) or options"
              >
                <span className="text-[10px] text-teal-400">#</span>
                <span>{currentOrder}</span>
              </button>

              {/* Quick 1 - 20 Position Selector Popover */}
              {showOrderMenu && (
                <div
                  className="absolute left-0 top-full mt-1.5 z-40 w-48 bg-slate-900 border border-slate-700 rounded-2xl p-3 shadow-2xl space-y-2.5 text-slate-200 backdrop-blur-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 px-0.5">
                    <span className="text-[11px] font-bold text-teal-300 flex items-center gap-1">
                      <span>Move to Rank (1-{Math.max(20, totalCount)})</span>
                    </span>
                    <button
                      onClick={() => setShowOrderMenu(false)}
                      className="text-[11px] text-slate-400 hover:text-white p-0.5"
                    >
                      ✕
                    </button>
                  </div>

                  {/* 1-20 Number Grid */}
                  <div className="grid grid-cols-5 gap-1 max-h-36 overflow-y-auto pr-0.5 scrollbar-thin">
                    {Array.from({ length: Math.max(20, totalCount) }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        id={`set-order-${habit.id}-${num}`}
                        onClick={() => {
                          soundService.playSlideClick();
                          onSetOrder?.(num);
                          setShowOrderMenu(false);
                        }}
                        className={`py-1.5 text-xs rounded-lg font-mono font-bold transition-all ${
                          num === currentOrder
                            ? 'bg-teal-500 text-slate-950 shadow-md'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  {/* Move Top / Bottom Quick Actions */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-800">
                    <button
                      onClick={() => {
                        soundService.playSlideClick();
                        onMoveToTop ? onMoveToTop() : onSetOrder?.(1);
                        setShowOrderMenu(false);
                      }}
                      disabled={currentOrder === 1}
                      className="px-2 py-1 text-[11px] font-medium rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-300 flex items-center justify-center gap-1"
                    >
                      <ChevronsUp className="w-3 h-3 text-teal-400" />
                      <span>Top #1</span>
                    </button>

                    <button
                      onClick={() => {
                        soundService.playSlideClick();
                        onMoveToBottom ? onMoveToBottom() : onSetOrder?.(totalCount);
                        setShowOrderMenu(false);
                      }}
                      disabled={currentOrder === totalCount}
                      className="px-2 py-1 text-[11px] font-medium rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-300 flex items-center justify-center gap-1"
                    >
                      <ChevronsDown className="w-3 h-3 text-teal-400" />
                      <span>Bottom</span>
                    </button>
                  </div>

                  {/* Routine & Delete Quick Actions */}
                  <div className="border-t border-slate-800 pt-1.5 space-y-1">
                    <button
                      onClick={() => {
                        soundService.playSlideClick();
                        onToggleRoutine?.();
                        setShowOrderMenu(false);
                      }}
                      className="w-full text-left px-2 py-1.5 text-xs rounded-lg bg-slate-800/80 hover:bg-slate-700 flex items-center justify-between text-slate-300 transition-colors"
                    >
                      <span>{habit.isRoutine ? '✓ Routine Habit' : '+ Set as Routine'}</span>
                      <Bookmark className={`w-3.5 h-3.5 ${habit.isRoutine ? 'text-teal-400 fill-teal-400' : 'text-slate-500'}`} />
                    </button>

                    {onDelete && (
                      <button
                        id={`menu-delete-habit-${habit.id}`}
                        onClick={() => {
                          setShowOrderMenu(false);
                          onDelete();
                        }}
                        className="w-full text-left px-2 py-1.5 text-xs rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-300 font-semibold flex items-center justify-between transition-colors"
                      >
                        <span>Delete Habit</span>
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Up / Down Arrows (Optimized for Mobile Touch) */}
            <div className="flex flex-col gap-1">
              <button
                id={`move-up-${habit.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  soundService.playSlideClick();
                  onMoveUp?.();
                }}
                disabled={index === 0 && currentOrder === 1}
                className="w-6 h-5 rounded-md bg-slate-800 hover:bg-slate-700 active:bg-slate-600 disabled:opacity-20 disabled:pointer-events-none text-slate-300 hover:text-white flex items-center justify-center transition-all border border-slate-700/50"
                title="Move Habit Up"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                id={`move-down-${habit.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  soundService.playSlideClick();
                  onMoveDown?.();
                }}
                disabled={index === totalCount - 1}
                className="w-6 h-5 rounded-md bg-slate-800 hover:bg-slate-700 active:bg-slate-600 disabled:opacity-20 disabled:pointer-events-none text-slate-300 hover:text-white flex items-center justify-center transition-all border border-slate-700/50"
                title="Move Habit Down"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Icon Box */}
          <div
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform active:scale-90"
            style={{
              backgroundColor: isCompleted ? '#0d948825' : `${categoryColor}15`,
              color: isCompleted ? '#2dd4bf' : categoryColor,
              border: `1px solid ${isCompleted ? '#0d948860' : `${categoryColor}35`}`,
            }}
          >
            {renderIcon()}
          </div>

          {/* Title, Badges & Notes */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h3
                className={`text-xs sm:text-sm font-medium truncate transition-all ${
                  isCompleted ? 'text-slate-300 line-through decoration-teal-400/50' : 'text-slate-100 font-semibold'
                }`}
              >
                {habit.name}
              </h3>

              {/* Routine Habit Badge */}
              {habit.isRoutine && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleRoutine?.();
                  }}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1 font-medium transition-colors"
                  title="Routine Habit (Click to toggle)"
                >
                  {renderRoutineTimeIcon()}
                  <span className="capitalize">{habit.routineTime || 'Routine'}</span>
                </button>
              )}

              {/* Beginner Badge */}
              {habit.difficulty === 'beginner' && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                  Beginner
                </span>
              )}

              {/* Category Badge */}
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 capitalize font-medium border border-slate-700/60 hidden sm:inline-block">
                {habit.category}
              </span>
            </div>

            {habit.description && (
              <p className="text-[11px] sm:text-xs text-slate-400 truncate mt-0.5 max-w-md">
                {habit.description}
              </p>
            )}
          </div>

          {/* Direct Card Delete Button (Visible & Accessible) */}
          {onDelete && (
            <button
              id={`card-delete-btn-${habit.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 active:bg-rose-500/20 transition-colors shrink-0"
              title={`Delete ${habit.name}`}
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>

        {/* Right Side: Streak & Slider Track */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
          {/* Streak Badge */}
          <div
            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
              streakCount > 0
                ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                : 'bg-slate-800/70 text-slate-500 border border-slate-700/50'
            }`}
            title={`${streakCount} day active streak`}
          >
            <Flame className={`w-3.5 h-3.5 ${streakCount > 0 ? 'text-amber-400 fill-amber-400' : ''}`} />
            <span>{streakCount}d</span>
          </div>

          {/* Interactive Slide Track */}
          <div
            ref={containerRef}
            id={`slide-track-${habit.id}`}
            className={`relative w-40 sm:w-48 h-9 sm:h-10 rounded-full flex items-center p-1 cursor-pointer transition-all ${
              isCompleted
                ? 'bg-teal-900/60 border border-teal-500/50'
                : 'bg-slate-800 border border-slate-700/80'
            }`}
            onClick={handleDirectClickToggle}
          >
            {/* Guide label */}
            <span
              className={`absolute inset-0 flex items-center text-[10px] sm:text-[11px] font-medium tracking-wide pointer-events-none transition-all px-3 ${
                isCompleted
                  ? 'justify-start text-teal-300 pl-3.5'
                  : 'justify-end text-slate-400 pr-2.5'
              }`}
            >
              {isCompleted ? '✓ Completed' : 'Slide to check →'}
            </span>

            {/* Draggable Slider Thumb */}
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 120 }}
              dragElastic={0.15}
              dragSnapToOrigin={true}
              onDragEnd={handleDragEnd}
              style={{ x }}
              whileTap={{ scale: 0.94 }}
              className={`relative z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-md cursor-grab active:cursor-grabbing transition-colors ${
                isCompleted
                  ? 'ml-auto bg-teal-400 text-slate-950 font-bold shadow-teal-500/40'
                  : 'bg-slate-200 text-slate-900 hover:bg-white shadow-black/40'
              }`}
            >
              {isCompleted ? (
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
              ) : (
                <span className="text-xs font-bold leading-none">››</span>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
