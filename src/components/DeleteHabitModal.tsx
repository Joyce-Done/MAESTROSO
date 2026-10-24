import { motion } from 'motion/react';
import { Trash2, AlertTriangle, X, Flame, Clock } from 'lucide-react';
import { Habit } from '../types';
import { soundService } from '../services/audio';

interface DeleteHabitModalProps {
  habit: Habit | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (habitId: string) => void;
}

export function DeleteHabitModal({
  habit,
  isOpen,
  onClose,
  onConfirmDelete,
}: DeleteHabitModalProps) {
  if (!isOpen || !habit) return null;

  const handleDelete = () => {
    soundService.playSlideClick();
    onConfirmDelete(habit.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 my-auto space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5 text-rose-400">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Delete Habit</h3>
              <p className="text-xs text-slate-400">This action cannot be undone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Habit Card Preview */}
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-teal-300">
                #{habit.order || 1}
              </span>
              <span className="text-sm font-semibold text-white">{habit.name}</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 capitalize">
              {habit.category}
            </span>
          </div>

          {habit.description && (
            <p className="text-xs text-slate-400 pl-1">{habit.description}</p>
          )}

          <div className="flex items-center gap-2 text-xs text-slate-400 pt-1 border-t border-slate-900">
            {habit.routineTime && (
              <span className="flex items-center gap-1 text-slate-400 capitalize">
                <Clock className="w-3 h-3 text-teal-400" />
                {habit.routineTime} routine
              </span>
            )}
          </div>
        </div>

        {/* Warning text */}
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          <span>
            Deleting <strong>{habit.name}</strong> will remove it from your daily checklist and recalculate your daily habit rankings.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            id="confirm-delete-habit-btn"
            type="button"
            onClick={handleDelete}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            Delete Habit
          </button>
        </div>
      </motion.div>
    </div>
  );
}
